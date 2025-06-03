import { InputSource, InputState } from './InputSource'

/**
 * AI-controlled input source for NPCs
 * This allows AI systems to control entities using the same interface as players
 */
export class AIInputSource implements InputSource {
  private state: InputState
  private active = true
  private entityId: number
  
  constructor(entityId: number) {
    this.entityId = entityId
    this.state = this.createEmptyState()
  }
  
  update(deltaTime: number): void {
    // AI updates are handled externally by AI systems
    // This just maintains the current state
  }
  
  getState(): InputState {
    return this.state
  }
  
  isActive(): boolean {
    return this.active
  }
  
  setActive(active: boolean): void {
    this.active = active
  }
  
  getType(): string {
    return 'ai'
  }
  
  /**
   * Set movement input
   */
  setMovement(x: number, y: number): void {
    this.state.moveX = Math.max(-1, Math.min(1, x))
    this.state.moveY = Math.max(-1, Math.min(1, y))
  }
  
  /**
   * Set action states
   */
  setActions(actions: Partial<{
    primary: boolean
    secondary: boolean
    interact: boolean
    menu: boolean
    inventory: boolean
    map: boolean
  }>): void {
    Object.assign(this.state, actions)
  }
  
  /**
   * Clear all inputs
   */
  clear(): void {
    this.state = this.createEmptyState()
  }
  
  /**
   * Set a raw input value
   */
  setRaw(key: string, value: number): void {
    this.state.raw.set(key, value)
  }
  
  /**
   * Get the entity this AI controls
   */
  getEntityId(): number {
    return this.entityId
  }
  
  private createEmptyState(): InputState {
    return {
      moveX: 0,
      moveY: 0,
      primary: false,
      secondary: false,
      interact: false,
      menu: false,
      inventory: false,
      map: false,
      raw: new Map()
    }
  }
}

/**
 * Simple AI behaviors that can be used with AIInputSource
 */
export class SimpleAIBehaviors {
  /**
   * Move towards a target position
   */
  static moveTowards(
    ai: AIInputSource,
    currentX: number,
    currentY: number,
    targetX: number,
    targetY: number,
    speed = 1
  ): void {
    const dx = targetX - currentX
    const dy = targetY - currentY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 0) {
      ai.setMovement((dx / distance) * speed, (dy / distance) * speed)
    } else {
      ai.setMovement(0, 0)
    }
  }
  
  /**
   * Patrol between waypoints
   */
  static patrol(
    ai: AIInputSource,
    currentX: number,
    currentY: number,
    waypoints: Array<{ x: number; y: number }>,
    currentWaypointIndex: number,
    threshold = 10
  ): number {
    if (waypoints.length === 0) {
      ai.setMovement(0, 0)
      return 0
    }
    
    const target = waypoints[currentWaypointIndex]
    const dx = target.x - currentX
    const dy = target.y - currentY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < threshold) {
      // Reached waypoint, move to next
      currentWaypointIndex = (currentWaypointIndex + 1) % waypoints.length
    }
    
    this.moveTowards(ai, currentX, currentY, target.x, target.y)
    return currentWaypointIndex
  }
  
  /**
   * Flee from a position
   */
  static fleeFrom(
    ai: AIInputSource,
    currentX: number,
    currentY: number,
    dangerX: number,
    dangerY: number,
    speed = 1
  ): void {
    const dx = currentX - dangerX
    const dy = currentY - dangerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 0) {
      ai.setMovement((dx / distance) * speed, (dy / distance) * speed)
    } else {
      // If at exact same position, move randomly
      const angle = Math.random() * Math.PI * 2
      ai.setMovement(Math.cos(angle) * speed, Math.sin(angle) * speed)
    }
  }
  
  /**
   * Wander randomly
   */
  static wander(ai: AIInputSource, changeDirectionChance = 0.02): void {
    if (Math.random() < changeDirectionChance) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 0.5 + 0.5
      ai.setMovement(Math.cos(angle) * speed, Math.sin(angle) * speed)
    }
  }
}