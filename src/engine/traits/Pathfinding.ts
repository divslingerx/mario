import { Trait } from '../Trait'
import { Entity } from '../Entity'
import { Vec2 } from '../math'

/**
 * A* pathfinding implementation for entity navigation
 */
export class Pathfinding extends Trait {
  static componentName = 'pathfinding'
  
  // Current path
  private path: Vec2[] = []
  private currentWaypointIndex = 0
  
  // Movement settings
  arrivalThreshold = 16    // Distance to consider waypoint reached
  stuckThreshold = 2000    // ms before considering stuck
  lastProgressTime = 0
  lastPosition = new Vec2(0, 0)
  
  // Path following
  isFollowingPath = false
  targetPosition: Vec2 | null = null
  
  // Callbacks
  onPathComplete?: () => void
  onPathFailed?: () => void
  
  constructor() {
    super()
  }
  
  /**
   * Set a new path to follow
   */
  setPath(path: Vec2[]): void {
    this.path = [...path]
    this.currentWaypointIndex = 0
    this.isFollowingPath = path.length > 0
    this.lastProgressTime = Date.now()
    
    if (path.length > 0) {
      this.targetPosition = path[path.length - 1]
    }
  }
  
  /**
   * Get current target waypoint
   */
  getCurrentWaypoint(): Vec2 | null {
    if (this.currentWaypointIndex < this.path.length) {
      return this.path[this.currentWaypointIndex]
    }
    return null
  }
  
  /**
   * Update pathfinding and entity movement
   */
  update(entity: Entity, deltaTime: number): void {
    if (!this.isFollowingPath || this.path.length === 0) return
    
    const currentWaypoint = this.getCurrentWaypoint()
    if (!currentWaypoint) {
      this.completePathing()
      return
    }
    
    // Check if reached current waypoint
    const dx = currentWaypoint.x - entity.pos.x
    const dy = currentWaypoint.y - entity.pos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance <= this.arrivalThreshold) {
      // Move to next waypoint
      this.currentWaypointIndex++
      this.lastProgressTime = Date.now()
      
      if (this.currentWaypointIndex >= this.path.length) {
        this.completePathing()
        return
      }
    }
    
    // Check if stuck
    const positionDelta = Math.sqrt(
      (entity.pos.x - this.lastPosition.x) ** 2 +
      (entity.pos.y - this.lastPosition.y) ** 2
    )
    
    if (positionDelta > 1) {
      this.lastProgressTime = Date.now()
      this.lastPosition.set(entity.pos.x, entity.pos.y)
    } else if (Date.now() - this.lastProgressTime > this.stuckThreshold) {
      this.failPathing()
      return
    }
    
    // Move towards current waypoint
    const go = entity.getTrait('go')
    if (go) {
      // Calculate direction
      const dirX = dx / distance
      const dirY = dy / distance
      
      // Set movement direction (assuming top-down game)
      // For platformer, you'd only set horizontal direction
      go.dir = dirX
      
      // For top-down movement, you'd also need a vertical component
      // This would require extending the Go trait or using velocity directly
      const speed = 100
      entity.vel.x = dirX * speed
      entity.vel.y = dirY * speed
    }
  }
  
  /**
   * Stop following current path
   */
  stopPathing(): void {
    this.isFollowingPath = false
    this.path = []
    this.currentWaypointIndex = 0
    this.targetPosition = null
    
    // Stop movement
    const go = this.entity?.getTrait('go')
    if (go) {
      go.dir = 0
    }
  }
  
  /**
   * Called when path is completed successfully
   */
  private completePathing(): void {
    this.stopPathing()
    this.onPathComplete?.()
  }
  
  /**
   * Called when pathfinding fails (stuck, blocked, etc)
   */
  private failPathing(): void {
    this.stopPathing()
    this.onPathFailed?.()
  }
  
  /**
   * Check if currently following a path
   */
  hasPath(): boolean {
    return this.isFollowingPath && this.path.length > 0
  }
  
  /**
   * Get remaining path distance
   */
  getRemainingDistance(): number {
    if (!this.entity || !this.hasPath()) return 0
    
    let totalDistance = 0
    let prevX = this.entity.pos.x
    let prevY = this.entity.pos.y
    
    for (let i = this.currentWaypointIndex; i < this.path.length; i++) {
      const waypoint = this.path[i]
      const dx = waypoint.x - prevX
      const dy = waypoint.y - prevY
      totalDistance += Math.sqrt(dx * dx + dy * dy)
      prevX = waypoint.x
      prevY = waypoint.y
    }
    
    return totalDistance
  }
  
  /**
   * Draw path for debugging
   */
  drawDebug(context: CanvasRenderingContext2D, entity: Entity): void {
    if (!this.hasPath()) return
    
    context.save()
    context.strokeStyle = '#10b981'
    context.lineWidth = 2
    context.globalAlpha = 0.6
    
    // Draw path line
    context.beginPath()
    context.moveTo(entity.pos.x, entity.pos.y)
    
    for (let i = this.currentWaypointIndex; i < this.path.length; i++) {
      const waypoint = this.path[i]
      context.lineTo(waypoint.x, waypoint.y)
    }
    
    context.stroke()
    
    // Draw waypoints
    context.fillStyle = '#10b981'
    for (let i = this.currentWaypointIndex; i < this.path.length; i++) {
      const waypoint = this.path[i]
      context.beginPath()
      context.arc(waypoint.x, waypoint.y, 4, 0, Math.PI * 2)
      context.fill()
    }
    
    // Highlight current waypoint
    const current = this.getCurrentWaypoint()
    if (current) {
      context.fillStyle = '#f59e0b'
      context.beginPath()
      context.arc(current.x, current.y, 6, 0, Math.PI * 2)
      context.fill()
    }
    
    context.restore()
  }
}

/**
 * Simple path request for use with pathfinding system
 */
export interface PathRequest {
  startX: number
  startY: number
  endX: number
  endY: number
  entitySize?: number
  maxDistance?: number
}