import { Trait } from '../Trait'
import { Entity } from '../Entity'

/**
 * Generic stealth trait for entities that can hide/sneak
 * Works with vision systems to determine detection
 */
export class Stealth extends Trait {
  static componentName = 'stealth'
  
  // Base stealth values
  visibility = 100      // 0 = invisible, 100 = fully visible
  noiseLevel = 0       // 0 = silent, 100 = very loud
  
  // Modifiers
  movementPenalty = 50  // Added to visibility when moving
  runningPenalty = 30   // Additional penalty when running
  crouchBonus = 40     // Reduced from visibility when crouching
  
  // States
  isCrouching = false
  isInShadow = false   // Set by lighting system
  isInCover = false    // Set by level geometry
  
  // Environmental factors (set by game systems)
  lightLevel = 100     // 0 = pitch black, 100 = bright daylight
  terrainNoise = 0     // 0 = soft ground, 100 = very noisy surface
  
  constructor() {
    super()
  }
  
  /**
   * Start crouching
   */
  crouch(): void {
    this.isCrouching = true
  }
  
  /**
   * Stop crouching
   */
  stand(): void {
    this.isCrouching = false
  }
  
  /**
   * Update stealth calculations
   */
  update(entity: Entity, deltaTime: number): void {
    // Calculate base visibility
    let visibility = 100
    
    // Apply crouch bonus
    if (this.isCrouching) {
      visibility -= this.crouchBonus
    }
    
    // Apply movement penalties
    const speed = Math.sqrt(entity.vel.x ** 2 + entity.vel.y ** 2)
    if (speed > 0) {
      visibility += this.movementPenalty
      
      // Extra penalty for fast movement
      if (speed > 100) {
        visibility += this.runningPenalty
      }
    }
    
    // Apply environmental factors
    visibility *= (this.lightLevel / 100)
    
    // Apply cover bonuses
    if (this.isInShadow) {
      visibility *= 0.5
    }
    if (this.isInCover) {
      visibility *= 0.3
    }
    
    // Clamp final visibility
    this.visibility = Math.max(0, Math.min(100, visibility))
    
    // Calculate noise level
    let noise = 0
    
    // Movement noise
    if (speed > 0) {
      noise = (speed / 200) * 50 // Up to 50 noise from movement
      
      // Terrain affects noise
      noise += this.terrainNoise * 0.5
      
      // Crouching reduces noise
      if (this.isCrouching) {
        noise *= 0.5
      }
    }
    
    // Clamp noise
    this.noiseLevel = Math.max(0, Math.min(100, noise))
  }
  
  /**
   * Check if entity can be detected at a given distance
   */
  canBeDetectedVisually(distance: number, observerPerception = 100): boolean {
    // Base detection range based on visibility
    const baseRange = this.visibility * 3 // 300 units at full visibility
    
    // Modify by observer perception
    const effectiveRange = baseRange * (observerPerception / 100)
    
    return distance <= effectiveRange
  }
  
  /**
   * Check if entity can be heard at a given distance
   */
  canBeHeard(distance: number, observerHearing = 100): boolean {
    // Base hearing range based on noise level
    const baseRange = this.noiseLevel * 2 // 200 units at max noise
    
    // Modify by observer hearing
    const effectiveRange = baseRange * (observerHearing / 100)
    
    return distance <= effectiveRange
  }
  
  /**
   * Get stealth effectiveness as percentage
   */
  getStealthEffectiveness(): number {
    return 100 - this.visibility
  }
}