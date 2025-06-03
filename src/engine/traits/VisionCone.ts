import { Trait } from '../Trait'
import { Entity } from '../Entity'

/**
 * Provides directional vision in a cone shape
 * Entities can only see what they're facing
 */
export class VisionCone extends Trait {
  static componentName = 'visionCone'
  
  // Vision parameters
  range = 300              // How far can see
  angle = Math.PI / 3      // 60 degree cone (total)
  facing = 0               // Direction facing in radians
  
  // Vision quality
  clarity = 100            // 0-100, affects what details can be seen
  nightVisionLevel = 0     // 0-100, ability to see in dark
  peripheralVision = 0.5   // Multiplier for edge of vision
  
  // What can be seen
  visibleEntities = new Set<number>()
  
  // Performance optimization
  updateInterval = 100     // ms between vision updates
  lastUpdate = 0
  
  constructor(range = 300, angle = Math.PI / 3) {
    super()
    this.range = range
    this.angle = angle
  }
  
  /**
   * Set the direction the entity is facing
   */
  setFacing(angle: number): void {
    this.facing = angle
  }
  
  /**
   * Set facing based on movement direction
   */
  faceMovementDirection(entity: Entity): void {
    if (entity.vel.x !== 0 || entity.vel.y !== 0) {
      this.facing = Math.atan2(entity.vel.y, entity.vel.x)
    }
  }
  
  /**
   * Check if a point is within the vision cone
   */
  canSeePoint(
    observerX: number, 
    observerY: number, 
    targetX: number, 
    targetY: number
  ): boolean {
    // Calculate distance
    const dx = targetX - observerX
    const dy = targetY - observerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Check if within range
    if (distance > this.range) return false
    
    // Calculate angle to target
    const angleToTarget = Math.atan2(dy, dx)
    
    // Calculate angular difference
    let angleDiff = Math.abs(angleToTarget - this.facing)
    
    // Normalize angle difference to -PI to PI
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff
    }
    
    // Check if within cone
    return angleDiff <= this.angle / 2
  }
  
  /**
   * Check if can see an entity
   */
  canSeeEntity(observer: Entity, target: Entity): boolean {
    // Check basic visibility
    if (!this.canSeePoint(
      observer.pos.x,
      observer.pos.y,
      target.pos.x,
      target.pos.y
    )) {
      return false
    }
    
    // Check if target has stealth
    const targetStealth = target.getTrait(Stealth)
    if (targetStealth) {
      const distance = Math.sqrt(
        (target.pos.x - observer.pos.x) ** 2 +
        (target.pos.y - observer.pos.y) ** 2
      )
      
      // Use clarity as perception
      return targetStealth.canBeDetectedVisually(distance, this.clarity)
    }
    
    return true
  }
  
  /**
   * Get vision clarity at a specific angle (for peripheral vision)
   */
  getClarityAtAngle(observer: Entity, targetX: number, targetY: number): number {
    const dx = targetX - observer.pos.x
    const dy = targetY - observer.pos.y
    const angleToTarget = Math.atan2(dy, dx)
    
    let angleDiff = Math.abs(angleToTarget - this.facing)
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff
    }
    
    // Calculate clarity based on angle from center
    const angleRatio = angleDiff / (this.angle / 2)
    
    // Full clarity in center, reduced at edges
    const clarityMultiplier = 1 - (angleRatio * (1 - this.peripheralVision))
    
    return this.clarity * clarityMultiplier
  }
  
  /**
   * Update vision calculations
   */
  update(entity: Entity, deltaTime: number): void {
    // Throttle updates for performance
    const now = Date.now()
    if (now - this.lastUpdate < this.updateInterval) return
    this.lastUpdate = now
    
    // Update facing based on movement if configured
    // (This could be controlled by a setting)
    
    // Clear previous visible entities
    this.visibleEntities.clear()
    
    // Vision update would be handled by a vision system
    // that queries all entities and updates this set
  }
  
  /**
   * Adjust vision for lighting conditions
   */
  adjustForLighting(lightLevel: number): void {
    // Reduce range in darkness unless have night vision
    const darknessEffect = Math.max(0, 100 - lightLevel)
    const nightVisionCompensation = (this.nightVisionLevel / 100) * darknessEffect
    
    const effectiveLightLevel = lightLevel + nightVisionCompensation
    
    // Adjust clarity based on lighting
    this.clarity = Math.min(100, effectiveLightLevel)
  }
  
  /**
   * Draw vision cone for debugging
   */
  drawDebug(context: CanvasRenderingContext2D, entity: Entity): void {
    context.save()
    context.globalAlpha = 0.2
    context.fillStyle = '#fbbf24'
    
    context.beginPath()
    context.moveTo(entity.pos.x, entity.pos.y)
    
    // Draw cone arc
    const leftAngle = this.facing - this.angle / 2
    const rightAngle = this.facing + this.angle / 2
    
    context.lineTo(
      entity.pos.x + Math.cos(leftAngle) * this.range,
      entity.pos.y + Math.sin(leftAngle) * this.range
    )
    
    context.arc(
      entity.pos.x,
      entity.pos.y,
      this.range,
      leftAngle,
      rightAngle,
      false
    )
    
    context.closePath()
    context.fill()
    
    context.restore()
  }
}

// Re-export Stealth for convenience since they work together
export { Stealth } from './Stealth'