import { EventEmitter } from '../EventEmitter'

/**
 * Gamepad input handler with configurable mapping
 * Supports Xbox 360, Xbox One, PlayStation, and generic controllers
 */
export class GamepadInput extends EventEmitter {
  private gamepads: (Gamepad | null)[] = []
  private deadzone = 0.15
  private previousStates = new Map<number, GamepadState>()
  private connected = false
  
  // Button mappings for different controller types
  static readonly BUTTON_MAPS = {
    xbox: {
      // Face buttons
      A: 0,
      B: 1,
      X: 2,
      Y: 3,
      // Shoulders
      LB: 4,
      RB: 5,
      // Triggers (as buttons)
      LT: 6,
      RT: 7,
      // Special
      BACK: 8,
      START: 9,
      // Stick clicks
      LS: 10,
      RS: 11,
      // D-Pad
      UP: 12,
      DOWN: 13,
      LEFT: 14,
      RIGHT: 15,
      // Guide button
      GUIDE: 16
    },
    playstation: {
      // Face buttons
      CROSS: 0,
      CIRCLE: 1,
      SQUARE: 2,
      TRIANGLE: 3,
      // Shoulders
      L1: 4,
      R1: 5,
      // Triggers
      L2: 6,
      R2: 7,
      // Special
      SHARE: 8,
      OPTIONS: 9,
      // Stick clicks
      L3: 10,
      R3: 11,
      // D-Pad
      UP: 12,
      DOWN: 13,
      LEFT: 14,
      RIGHT: 15,
      // PS button
      PS: 16
    }
  }
  
  // Axis indices
  static readonly AXES = {
    LEFT_STICK_X: 0,
    LEFT_STICK_Y: 1,
    RIGHT_STICK_X: 2,
    RIGHT_STICK_Y: 3,
    LEFT_TRIGGER: 4,  // Some controllers
    RIGHT_TRIGGER: 5  // Some controllers
  }
  
  constructor() {
    super()
    this.setupEventListeners()
  }
  
  private setupEventListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log(`Gamepad connected: ${e.gamepad.id}`)
      this.connected = true
      this.emit('connected', { gamepad: e.gamepad })
    })
    
    window.addEventListener('gamepaddisconnected', (e) => {
      console.log(`Gamepad disconnected: ${e.gamepad.id}`)
      this.connected = false
      this.emit('disconnected', { gamepad: e.gamepad })
    })
  }
  
  /**
   * Poll gamepad state - should be called each frame
   */
  update() {
    if (!this.connected) return
    
    // Get current gamepad states
    this.gamepads = navigator.getGamepads()
    
    for (let i = 0; i < this.gamepads.length; i++) {
      const gamepad = this.gamepads[i]
      if (!gamepad) continue
      
      const currentState = this.getGamepadState(gamepad)
      const previousState = this.previousStates.get(i) || this.createEmptyState()
      
      // Check button changes
      for (let b = 0; b < currentState.buttons.length; b++) {
        const current = currentState.buttons[b]
        const previous = previousState.buttons[b]
        
        if (current.pressed && !previous.pressed) {
          this.emit('buttondown', {
            gamepadIndex: i,
            button: b,
            value: current.value
          })
        } else if (!current.pressed && previous.pressed) {
          this.emit('buttonup', {
            gamepadIndex: i,
            button: b
          })
        }
        
        // Emit analog button values for triggers
        if (current.value !== previous.value) {
          this.emit('buttonchange', {
            gamepadIndex: i,
            button: b,
            value: current.value
          })
        }
      }
      
      // Check axis changes
      for (let a = 0; a < currentState.axes.length; a++) {
        const current = this.applyDeadzone(currentState.axes[a])
        const previous = this.applyDeadzone(previousState.axes[a])
        
        if (current !== previous) {
          this.emit('axischange', {
            gamepadIndex: i,
            axis: a,
            value: current
          })
        }
      }
      
      // Store state for next frame
      this.previousStates.set(i, currentState)
    }
  }
  
  /**
   * Get specific button state
   */
  getButton(gamepadIndex: number, buttonIndex: number): GamepadButton | null {
    const gamepad = this.gamepads[gamepadIndex]
    if (!gamepad || buttonIndex >= gamepad.buttons.length) return null
    return gamepad.buttons[buttonIndex]
  }
  
  /**
   * Get specific axis value with deadzone applied
   */
  getAxis(gamepadIndex: number, axisIndex: number): number {
    const gamepad = this.gamepads[gamepadIndex]
    if (!gamepad || axisIndex >= gamepad.axes.length) return 0
    return this.applyDeadzone(gamepad.axes[axisIndex])
  }
  
  /**
   * Get left stick values as {x, y}
   */
  getLeftStick(gamepadIndex = 0): { x: number; y: number } {
    return {
      x: this.getAxis(gamepadIndex, GamepadInput.AXES.LEFT_STICK_X),
      y: this.getAxis(gamepadIndex, GamepadInput.AXES.LEFT_STICK_Y)
    }
  }
  
  /**
   * Get right stick values as {x, y}
   */
  getRightStick(gamepadIndex = 0): { x: number; y: number } {
    return {
      x: this.getAxis(gamepadIndex, GamepadInput.AXES.RIGHT_STICK_X),
      y: this.getAxis(gamepadIndex, GamepadInput.AXES.RIGHT_STICK_Y)
    }
  }
  
  /**
   * Set deadzone threshold
   */
  setDeadzone(value: number) {
    this.deadzone = Math.max(0, Math.min(1, value))
  }
  
  /**
   * Apply deadzone to axis value
   */
  private applyDeadzone(value: number): number {
    if (Math.abs(value) < this.deadzone) return 0
    
    // Scale the value to maintain full range outside deadzone
    const sign = Math.sign(value)
    const magnitude = Math.abs(value)
    const scaled = (magnitude - this.deadzone) / (1 - this.deadzone)
    
    return sign * scaled
  }
  
  /**
   * Get current state snapshot
   */
  private getGamepadState(gamepad: Gamepad): GamepadState {
    return {
      buttons: gamepad.buttons.map(b => ({
        pressed: b.pressed,
        touched: b.touched || false,
        value: b.value
      })),
      axes: [...gamepad.axes],
      timestamp: gamepad.timestamp
    }
  }
  
  /**
   * Create empty state for initialization
   */
  private createEmptyState(): GamepadState {
    return {
      buttons: Array(17).fill(null).map(() => ({
        pressed: false,
        touched: false,
        value: 0
      })),
      axes: [0, 0, 0, 0],
      timestamp: 0
    }
  }
  
  /**
   * Check if any gamepad is connected
   */
  isConnected(): boolean {
    return this.connected
  }
  
  /**
   * Get all connected gamepads
   */
  getGamepads(): (Gamepad | null)[] {
    return this.gamepads
  }
}

interface GamepadState {
  buttons: Array<{
    pressed: boolean
    touched: boolean
    value: number
  }>
  axes: number[]
  timestamp: number
}