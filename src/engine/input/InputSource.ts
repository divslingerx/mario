/**
 * Unified input system that supports keyboard, gamepad, and AI control
 * Uses a command pattern to decouple input sources from game logic
 */

export interface InputCommand {
  type: string
  value: number
  timestamp: number
}

export interface InputState {
  // Movement
  moveX: number        // -1 to 1
  moveY: number        // -1 to 1
  
  // Actions
  primary: boolean     // Main action (jump, interact, etc)
  secondary: boolean   // Secondary action (run, shoot, etc)
  interact: boolean    // Context-sensitive interaction
  
  // UI
  menu: boolean
  inventory: boolean
  map: boolean
  
  // Raw inputs for special handling
  raw: Map<string, number>
}

/**
 * Base interface for all input sources
 */
export interface InputSource {
  /**
   * Update input state
   */
  update(deltaTime: number): void
  
  /**
   * Get current input state
   */
  getState(): InputState
  
  /**
   * Check if this input source is active
   */
  isActive(): boolean
  
  /**
   * Enable/disable this input source
   */
  setActive(active: boolean): void
  
  /**
   * Get input source type for debugging
   */
  getType(): string
}

/**
 * Input mapping configuration
 */
export interface InputMapping {
  // Keyboard mappings
  keyboard?: {
    moveLeft?: string[]
    moveRight?: string[]
    moveUp?: string[]
    moveDown?: string[]
    primary?: string[]
    secondary?: string[]
    interact?: string[]
    menu?: string[]
    inventory?: string[]
    map?: string[]
  }
  
  // Gamepad mappings
  gamepad?: {
    moveXAxis?: number
    moveYAxis?: number
    primary?: number[]
    secondary?: number[]
    interact?: number[]
    menu?: number[]
    inventory?: number[]
    map?: number[]
  }
}

/**
 * Default input mappings
 */
export const DefaultInputMappings: InputMapping = {
  keyboard: {
    moveLeft: ['ArrowLeft', 'KeyA'],
    moveRight: ['ArrowRight', 'KeyD'],
    moveUp: ['ArrowUp', 'KeyW'],
    moveDown: ['ArrowDown', 'KeyS'],
    primary: ['Space', 'KeyZ'],
    secondary: ['ShiftLeft', 'KeyX'],
    interact: ['KeyE', 'Enter'],
    menu: ['Escape'],
    inventory: ['KeyI', 'Tab'],
    map: ['KeyM']
  },
  gamepad: {
    moveXAxis: 0,  // Left stick X
    moveYAxis: 1,  // Left stick Y
    primary: [0],  // A/Cross button
    secondary: [2], // X/Square button
    interact: [3], // Y/Triangle button
    menu: [9],     // Start/Options button
    inventory: [8], // Select/Share button
    map: [4]       // Left bumper
  }
}

/**
 * Input manager that combines multiple input sources
 */
export class InputManager {
  private sources: Map<string, InputSource> = new Map()
  private combinedState: InputState = this.createEmptyState()
  
  /**
   * Add an input source
   */
  addSource(id: string, source: InputSource): void {
    this.sources.set(id, source)
  }
  
  /**
   * Remove an input source
   */
  removeSource(id: string): void {
    this.sources.delete(id)
  }
  
  /**
   * Update all input sources
   */
  update(deltaTime: number): void {
    // Reset combined state
    this.combinedState = this.createEmptyState()
    
    // Update each source and combine states
    for (const source of this.sources.values()) {
      if (!source.isActive()) continue
      
      source.update(deltaTime)
      const state = source.getState()
      
      // Combine movement (take strongest input)
      if (Math.abs(state.moveX) > Math.abs(this.combinedState.moveX)) {
        this.combinedState.moveX = state.moveX
      }
      if (Math.abs(state.moveY) > Math.abs(this.combinedState.moveY)) {
        this.combinedState.moveY = state.moveY
      }
      
      // Combine actions (OR operation)
      this.combinedState.primary = this.combinedState.primary || state.primary
      this.combinedState.secondary = this.combinedState.secondary || state.secondary
      this.combinedState.interact = this.combinedState.interact || state.interact
      this.combinedState.menu = this.combinedState.menu || state.menu
      this.combinedState.inventory = this.combinedState.inventory || state.inventory
      this.combinedState.map = this.combinedState.map || state.map
      
      // Merge raw inputs
      for (const [key, value] of state.raw) {
        this.combinedState.raw.set(key, value)
      }
    }
  }
  
  /**
   * Get combined input state
   */
  getState(): InputState {
    return this.combinedState
  }
  
  /**
   * Get a specific input source
   */
  getSource(id: string): InputSource | undefined {
    return this.sources.get(id)
  }
  
  /**
   * Create empty input state
   */
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