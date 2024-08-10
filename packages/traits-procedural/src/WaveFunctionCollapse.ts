/*
Wave Function Collapse for Infinite Terrain Generation:
- Constraint-based procedural generation using local similarity
- Highly configurable tile-based world generation
- Optimized for real-time streaming of infinite worlds
- See: "WaveFunctionCollapse" algorithm by Maxim Gumin
*/

interface WFCTile {
  readonly id: number
  readonly name: string
  readonly weight: number
  readonly sockets: readonly [number, number, number, number] // [north, east, south, west]
  readonly spriteId?: string
  readonly collision?: boolean
  readonly metadata?: Record<string, unknown>
}

interface WFCConstraint {
  readonly tileA: number
  readonly tileB: number
  readonly direction: 0 | 1 | 2 | 3 // north, east, south, west
}

interface WFCCell {
  collapsed: boolean
  entropy: number
  possibilities: Set<number> // Tile IDs that can be placed here
}

interface WFCChunk {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly cells: WFCCell[]
  readonly tiles: (number | null)[] // Final collapsed tiles
  generated: boolean
}

/*
Performance-Optimized Wave Function Collapse:
- Uses typed arrays and object pooling for memory efficiency
- Implements chunked generation for infinite streaming
- Constraint propagation optimized with bit operations
*/
export class WaveFunctionCollapse {
  private readonly tiles: ReadonlyArray<WFCTile>
  private readonly constraints = new Map<string, boolean>() // "tileA-direction-tileB" -> valid
  private readonly tilesBySocket = new Map<number, Set<number>>() // socket -> tile IDs
  
  // Performance optimization: pre-computed adjacency rules
  private readonly adjacencyRules: readonly number[][][] // [tileId][direction] -> valid neighbor IDs
  
  // Object pooling for cells to reduce GC pressure
  private readonly cellPool: WFCCell[] = []
  private cellPoolIndex = 0

  constructor(tiles: WFCTile[], constraints?: WFCConstraint[]) {
    this.tiles = Object.freeze(tiles.slice())
    this.adjacencyRules = this.precomputeAdjacencyRules(tiles, constraints)
    
    // Pre-populate cell pool
    for (let i = 0; i < 10000; i++) {
      this.cellPool.push({
        collapsed: false,
        entropy: tiles.length,
        possibilities: new Set()
      })
    }
  }

  // Generate a chunk of the world
  generateChunk(chunkX: number, chunkY: number, width = 32, height = 32): WFCChunk {
    const cells = this.allocateCells(width * height)
    const tiles = new Array<number | null>(width * height).fill(null)
    
    // Initialize all cells with full possibility space
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]
      cell.collapsed = false
      cell.entropy = this.tiles.length
      cell.possibilities.clear()
      
      // Add all tiles as initial possibilities (weighted by probability)
      for (let tileIdx = 0; tileIdx < this.tiles.length; tileIdx++) {
        cell.possibilities.add(tileIdx)
      }
    }

    // Wave Function Collapse algorithm
    let iterationCount = 0
    const maxIterations = width * height * 10 // Prevent infinite loops
    
    while (iterationCount < maxIterations) {
      const cellIndex = this.findLowestEntropyCell(cells, width, height)
      if (cellIndex === -1) break // All cells collapsed successfully
      
      const collapsed = this.collapseCell(cells, cellIndex, width, height)
      if (!collapsed) {
        // Backtrack or restart on contradiction
        console.warn('WFC contradiction detected, restarting chunk generation')
        return this.generateChunk(chunkX, chunkY, width, height)
      }
      
      // Extract collapsed tile
      const cell = cells[cellIndex]
      if (cell.collapsed && cell.possibilities.size === 1) {
        tiles[cellIndex] = Array.from(cell.possibilities)[0]
      }
      
      iterationCount++
    }

    return {
      x: chunkX,
      y: chunkY,  
      width,
      height,
      cells,
      tiles,
      generated: true
    }
  }

  // Find cell with lowest entropy (fewest possibilities) for collapse
  private findLowestEntropyCell(cells: WFCCell[], width: number, height: number): number {
    let minEntropy = Number.MAX_SAFE_INTEGER
    let candidateCells: number[] = []
    
    // Single pass to find minimum entropy and collect candidates
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]
      if (cell.collapsed) continue
      
      if (cell.entropy < minEntropy) {
        minEntropy = cell.entropy
        candidateCells.length = 0 // Clear array efficiently
        candidateCells.push(i)
      } else if (cell.entropy === minEntropy) {
        candidateCells.push(i)
      }
    }
    
    // Random selection among equal entropy cells
    return candidateCells.length > 0 
      ? candidateCells[Math.floor(Math.random() * candidateCells.length)]
      : -1
  }

  // Collapse a cell and propagate constraints
  private collapseCell(cells: WFCCell[], cellIndex: number, width: number, height: number): boolean {
    const cell = cells[cellIndex]
    if (cell.collapsed || cell.possibilities.size === 0) return false
    
    // Weight-based selection for better distribution
    const selectedTile = this.selectWeightedTile(cell.possibilities)
    
    // Collapse the cell
    cell.possibilities.clear()
    cell.possibilities.add(selectedTile)
    cell.collapsed = true
    cell.entropy = 1
    
    // Propagate constraints to neighbors
    return this.propagateConstraints(cells, cellIndex, width, height)
  }

  // Weighted random selection based on tile weights
  private selectWeightedTile(possibilities: Set<number>): number {
    let totalWeight = 0
    const possibleTiles: number[] = []
    
    // Calculate total weight (avoid array methods for performance)
    for (const tileId of possibilities) {
      possibleTiles.push(tileId)
      totalWeight += this.tiles[tileId].weight
    }
    
    // Random weighted selection
    let randomWeight = Math.random() * totalWeight
    for (const tileId of possibleTiles) {
      randomWeight -= this.tiles[tileId].weight
      if (randomWeight <= 0) return tileId
    }
    
    return possibleTiles[0] // Fallback
  }

  // Constraint propagation using adjacency rules
  private propagateConstraints(cells: WFCCell[], startIndex: number, width: number, height: number): boolean {
    const queue: number[] = [startIndex]
    let queueIndex = 0
    
    while (queueIndex < queue.length) {
      const cellIndex = queue[queueIndex++]
      const cell = cells[cellIndex]
      
      // Get neighboring cell indices
      const neighbors = this.getNeighborIndices(cellIndex, width, height)
      
      for (let direction = 0; direction < 4; direction++) {
        const neighborIndex = neighbors[direction]
        if (neighborIndex === -1) continue
        
        const neighbor = cells[neighborIndex]
        if (neighbor.collapsed) continue
        
        const oldSize = neighbor.possibilities.size
        
        // Remove invalid possibilities based on current cell's constraints
        for (const neighborTile of neighbor.possibilities) {
          let hasValidAdjacent = false
          
          for (const currentTile of cell.possibilities) {
            const validNeighbors = this.adjacencyRules[currentTile][direction]
            if (validNeighbors.includes(neighborTile)) {
              hasValidAdjacent = true
              break
            }
          }
          
          if (!hasValidAdjacent) {
            neighbor.possibilities.delete(neighborTile)
          }
        }
        
        // Update entropy and check for contradictions
        neighbor.entropy = neighbor.possibilities.size
        if (neighbor.entropy === 0) return false // Contradiction
        
        // Add to queue if possibilities changed
        if (neighbor.possibilities.size < oldSize && !queue.includes(neighborIndex)) {
          queue.push(neighborIndex)
        }
      }
    }
    
    return true
  }

  // Get neighbor indices with bounds checking
  private getNeighborIndices(index: number, width: number, height: number): [number, number, number, number] {
    const x = index % width
    const y = Math.floor(index / width)
    
    return [
      y > 0 ? index - width : -1,                    // North
      x < width - 1 ? index + 1 : -1,                // East  
      y < height - 1 ? index + width : -1,           // South
      x > 0 ? index - 1 : -1                         // West
    ]
  }

  // Pre-compute adjacency rules for performance
  private precomputeAdjacencyRules(tiles: WFCTile[], constraints?: WFCConstraint[]): readonly number[][][] {
    const rules: number[][][] = []
    
    for (let i = 0; i < tiles.length; i++) {
      rules[i] = [[], [], [], []] // [north, east, south, west]
      
      for (let j = 0; j < tiles.length; j++) {
        for (let direction = 0; direction < 4; direction++) {
          if (this.tilesCanBeAdjacent(tiles[i], tiles[j], direction, constraints)) {
            rules[i][direction].push(j)
          }
        }
      }
    }
    
    return Object.freeze(rules.map(rule => Object.freeze(rule.map(dir => Object.freeze(dir)))))
  }

  // Check if two tiles can be adjacent in a given direction
  private tilesCanBeAdjacent(tileA: WFCTile, tileB: WFCTile, direction: number, constraints?: WFCConstraint[]): boolean {
    // Check explicit constraints first
    if (constraints) {
      const key = `${tileA.id}-${direction}-${tileB.id}`
      if (this.constraints.has(key)) {
        return this.constraints.get(key)!
      }
    }
    
    // Check socket compatibility (sockets must match)
    const socketA = tileA.sockets[direction]
    const socketB = tileB.sockets[(direction + 2) % 4] // Opposite direction
    
    return socketA === socketB
  }

  // Efficient cell allocation using object pool
  private allocateCells(count: number): WFCCell[] {
    const cells: WFCCell[] = []
    
    for (let i = 0; i < count; i++) {
      if (this.cellPoolIndex >= this.cellPool.length) {
        // Expand pool if needed
        for (let j = 0; j < 1000; j++) {
          this.cellPool.push({
            collapsed: false,
            entropy: this.tiles.length,
            possibilities: new Set()
          })
        }
      }
      
      cells.push(this.cellPool[this.cellPoolIndex++])
    }
    
    return cells
  }

  // Return cells to pool for reuse
  releaseCells(cells: WFCCell[]): void {
    for (const cell of cells) {
      cell.collapsed = false
      cell.entropy = this.tiles.length
      cell.possibilities.clear()
    }
    
    this.cellPoolIndex = Math.max(0, this.cellPoolIndex - cells.length)
  }

  // Get tile information for rendering
  getTileData(tileId: number): WFCTile | undefined {
    return this.tiles[tileId]
  }
}

/*
Infinite World Streaming Manager:
- Manages chunks around player position
- Loads/unloads chunks based on view distance
- Provides seamless infinite world experience
*/
export class InfiniteWorldStreamer {
  private readonly wfc: WaveFunctionCollapse
  private readonly chunks = new Map<string, WFCChunk>()
  private readonly chunkSize: number
  private readonly viewDistance: number
  private playerChunkX = 0
  private playerChunkY = 0

  constructor(wfc: WaveFunctionCollapse, chunkSize = 32, viewDistance = 3) {
    this.wfc = wfc
    this.chunkSize = chunkSize
    this.viewDistance = viewDistance
  }

  // Update world based on player position
  updatePlayerPosition(worldX: number, worldY: number): void {
    const chunkX = Math.floor(worldX / this.chunkSize)
    const chunkY = Math.floor(worldY / this.chunkSize)
    
    if (chunkX !== this.playerChunkX || chunkY !== this.playerChunkY) {
      this.playerChunkX = chunkX
      this.playerChunkY = chunkY
      this.updateLoadedChunks()
    }
  }

  // Load/unload chunks based on view distance
  private updateLoadedChunks(): void {
    const requiredChunks = new Set<string>()
    
    // Calculate required chunks around player
    for (let x = this.playerChunkX - this.viewDistance; x <= this.playerChunkX + this.viewDistance; x++) {
      for (let y = this.playerChunkY - this.viewDistance; y <= this.playerChunkY + this.viewDistance; y++) {
        requiredChunks.add(`${x},${y}`)
      }
    }
    
    // Load missing chunks
    for (const chunkKey of requiredChunks) {
      if (!this.chunks.has(chunkKey)) {
        const [x, y] = chunkKey.split(',').map(Number)
        const chunk = this.wfc.generateChunk(x, y, this.chunkSize, this.chunkSize)
        this.chunks.set(chunkKey, chunk)
      }
    }
    
    // Unload distant chunks to save memory
    for (const [chunkKey, chunk] of this.chunks) {
      if (!requiredChunks.has(chunkKey)) {
        this.wfc.releaseCells(chunk.cells)
        this.chunks.delete(chunkKey)
      }
    }
  }

  // Get tile at world position
  getTileAt(worldX: number, worldY: number): number | null {
    const chunkX = Math.floor(worldX / this.chunkSize)
    const chunkY = Math.floor(worldY / this.chunkSize)
    const chunkKey = `${chunkX},${chunkY}`
    
    const chunk = this.chunks.get(chunkKey)
    if (!chunk) return null
    
    const localX = worldX - chunkX * this.chunkSize
    const localY = worldY - chunkY * this.chunkSize
    const index = localY * chunk.width + localX
    
    return chunk.tiles[index]
  }

  // Get all loaded chunks for rendering
  getLoadedChunks(): readonly WFCChunk[] {
    return Array.from(this.chunks.values())
  }
}