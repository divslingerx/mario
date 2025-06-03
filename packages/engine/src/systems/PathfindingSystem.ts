import { Vec2 } from '../math'
import { Level } from '../Level'
import { PathRequest } from '../traits/Pathfinding'

/**
 * A* pathfinding system that calculates paths through the game world
 * Works with tile-based or navigation mesh approaches
 */
export class PathfindingSystem {
  private gridSize = 16         // Size of pathfinding grid cells
  private maxPathLength = 1000  // Maximum path length to prevent infinite searches
  
  // Cache for performance
  private navigationGrid: Uint8Array | null = null
  private gridWidth = 0
  private gridHeight = 0
  
  constructor(gridSize = 16) {
    this.gridSize = gridSize
  }
  
  /**
   * Build navigation grid from level collision data
   */
  buildNavigationGrid(level: Level): void {
    // Calculate grid dimensions
    this.gridWidth = Math.ceil(level.tiles.width * level.tiles.tileSize / this.gridSize)
    this.gridHeight = Math.ceil(level.tiles.height * level.tiles.tileSize / this.gridSize)
    
    // Create grid (0 = walkable, 1 = blocked)
    this.navigationGrid = new Uint8Array(this.gridWidth * this.gridHeight)
    
    // Mark blocked cells based on solid tiles
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const worldX = x * this.gridSize + this.gridSize / 2
        const worldY = y * this.gridSize + this.gridSize / 2
        
        // Check if tile at this position is solid
        const tile = level.tiles.getByPos(worldX, worldY)
        if (tile && tile.type === 'solid') {
          this.navigationGrid[y * this.gridWidth + x] = 1
        }
      }
    }
  }
  
  /**
   * Find path using A* algorithm
   */
  findPath(request: PathRequest): Vec2[] {
    if (!this.navigationGrid) {
      console.warn('Navigation grid not built')
      return []
    }
    
    // Convert world coordinates to grid coordinates
    const startX = Math.floor(request.startX / this.gridSize)
    const startY = Math.floor(request.startY / this.gridSize)
    const endX = Math.floor(request.endX / this.gridSize)
    const endY = Math.floor(request.endY / this.gridSize)
    
    // Validate coordinates
    if (!this.isValidCell(startX, startY) || !this.isValidCell(endX, endY)) {
      return []
    }
    
    // Check if start or end is blocked
    if (this.isBlocked(startX, startY) || this.isBlocked(endX, endY)) {
      return []
    }
    
    // A* implementation
    const openSet = new Set<number>()
    const closedSet = new Set<number>()
    const cameFrom = new Map<number, number>()
    const gScore = new Map<number, number>()
    const fScore = new Map<number, number>()
    
    const startNode = this.cellToNode(startX, startY)
    const endNode = this.cellToNode(endX, endY)
    
    openSet.add(startNode)
    gScore.set(startNode, 0)
    fScore.set(startNode, this.heuristic(startX, startY, endX, endY))
    
    while (openSet.size > 0) {
      // Find node with lowest fScore
      let current = -1
      let lowestF = Infinity
      
      for (const node of openSet) {
        const f = fScore.get(node) || Infinity
        if (f < lowestF) {
          lowestF = f
          current = node
        }
      }
      
      if (current === endNode) {
        // Reconstruct path
        return this.reconstructPath(cameFrom, current, request)
      }
      
      openSet.delete(current)
      closedSet.add(current)
      
      // Check path length limit
      if (closedSet.size > this.maxPathLength) {
        console.warn('Path too long, aborting search')
        return []
      }
      
      // Check neighbors
      const [cx, cy] = this.nodeToCell(current)
      const neighbors = this.getNeighbors(cx, cy)
      
      for (const [nx, ny] of neighbors) {
        const neighbor = this.cellToNode(nx, ny)
        
        if (closedSet.has(neighbor)) continue
        
        const tentativeG = (gScore.get(current) || 0) + this.distance(cx, cy, nx, ny)
        
        if (!openSet.has(neighbor)) {
          openSet.add(neighbor)
        } else if (tentativeG >= (gScore.get(neighbor) || Infinity)) {
          continue
        }
        
        cameFrom.set(neighbor, current)
        gScore.set(neighbor, tentativeG)
        fScore.set(neighbor, tentativeG + this.heuristic(nx, ny, endX, endY))
      }
    }
    
    // No path found
    return []
  }
  
  /**
   * Get valid neighbors for a cell
   */
  private getNeighbors(x: number, y: number): Array<[number, number]> {
    const neighbors: Array<[number, number]> = []
    
    // 8-directional movement
    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1,  0],          [1,  0],
      [-1,  1], [0,  1], [1,  1]
    ]
    
    for (const [dx, dy] of directions) {
      const nx = x + dx
      const ny = y + dy
      
      if (this.isValidCell(nx, ny) && !this.isBlocked(nx, ny)) {
        // For diagonal movement, check if path is clear
        if (dx !== 0 && dy !== 0) {
          if (!this.isBlocked(x + dx, y) && !this.isBlocked(x, y + dy)) {
            neighbors.push([nx, ny])
          }
        } else {
          neighbors.push([nx, ny])
        }
      }
    }
    
    return neighbors
  }
  
  /**
   * Reconstruct path from A* result
   */
  private reconstructPath(
    cameFrom: Map<number, number>,
    current: number,
    request: PathRequest
  ): Vec2[] {
    const path: Vec2[] = []
    
    while (cameFrom.has(current)) {
      const [x, y] = this.nodeToCell(current)
      // Convert back to world coordinates (center of cell)
      path.unshift(new Vec2(
        x * this.gridSize + this.gridSize / 2,
        y * this.gridSize + this.gridSize / 2
      ))
      current = cameFrom.get(current)!
    }
    
    // Add final position (exact target)
    if (path.length > 0) {
      path.push(new Vec2(request.endX, request.endY))
    }
    
    // Smooth path
    return this.smoothPath(path)
  }
  
  /**
   * Smooth path by removing unnecessary waypoints
   */
  private smoothPath(path: Vec2[]): Vec2[] {
    if (path.length <= 2) return path
    
    const smoothed: Vec2[] = [path[0]]
    let current = 0
    
    while (current < path.length - 1) {
      let farthest = current + 1
      
      // Find farthest visible point
      for (let i = current + 2; i < path.length; i++) {
        if (this.hasLineOfSight(path[current], path[i])) {
          farthest = i
        } else {
          break
        }
      }
      
      smoothed.push(path[farthest])
      current = farthest
    }
    
    return smoothed
  }
  
  /**
   * Check if there's a clear line of sight between two points
   */
  private hasLineOfSight(start: Vec2, end: Vec2): boolean {
    // Bresenham's line algorithm to check for obstacles
    const x0 = Math.floor(start.x / this.gridSize)
    const y0 = Math.floor(start.y / this.gridSize)
    const x1 = Math.floor(end.x / this.gridSize)
    const y1 = Math.floor(end.y / this.gridSize)
    
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy
    
    let x = x0
    let y = y0
    
    while (true) {
      if (this.isBlocked(x, y)) return false
      
      if (x === x1 && y === y1) break
      
      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x += sx
      }
      if (e2 < dx) {
        err += dx
        y += sy
      }
    }
    
    return true
  }
  
  // Helper methods
  private isValidCell(x: number, y: number): boolean {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight
  }
  
  private isBlocked(x: number, y: number): boolean {
    if (!this.navigationGrid) return true
    return this.navigationGrid[y * this.gridWidth + x] === 1
  }
  
  private cellToNode(x: number, y: number): number {
    return y * this.gridWidth + x
  }
  
  private nodeToCell(node: number): [number, number] {
    return [node % this.gridWidth, Math.floor(node / this.gridWidth)]
  }
  
  private distance(x1: number, y1: number, x2: number, y2: number): number {
    // Use diagonal distance (Chebyshev) for 8-directional movement
    const dx = Math.abs(x2 - x1)
    const dy = Math.abs(y2 - y1)
    return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy)
  }
  
  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    // Use diagonal distance heuristic
    return this.distance(x1, y1, x2, y2)
  }
}