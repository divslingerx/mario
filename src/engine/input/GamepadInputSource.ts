import { InputSource, InputState, InputMapping, DefaultInputMappings } from './InputSource'
import { GamepadInput } from './GamepadInput'

/**
 * Gamepad implementation of InputSource
 */
export class GamepadInputSource implements InputSource {
  private gamepad: GamepadInput
  private mapping: InputMapping['gamepad']
  private state: InputState
  private active = true
  private gamepadIndex: number
  
  constructor(gamepad: GamepadInput, gamepadIndex = 0, mapping?: InputMapping['gamepad']) {
    this.gamepad = gamepad
    this.gamepadIndex = gamepadIndex
    this.mapping = mapping || DefaultInputMappings.gamepad!
    this.state = this.createEmptyState()
  }
  
  update(deltaTime: number): void {
    if (!this.active || !this.gamepad.isConnected()) return
    
    // Update gamepad state
    this.gamepad.update()
    
    // Update movement from analog sticks
    this.state.moveX = this.gamepad.getAxis(this.gamepadIndex, this.mapping.moveXAxis!)
    this.state.moveY = this.gamepad.getAxis(this.gamepadIndex, this.mapping.moveYAxis!)
    
    // Update actions from buttons
    this.state.primary = this.isAnyButtonPressed(this.mapping.primary)
    this.state.secondary = this.isAnyButtonPressed(this.mapping.secondary)
    this.state.interact = this.isAnyButtonPressed(this.mapping.interact)
    this.state.menu = this.isAnyButtonPressed(this.mapping.menu)
    this.state.inventory = this.isAnyButtonPressed(this.mapping.inventory)
    this.state.map = this.isAnyButtonPressed(this.mapping.map)
    
    // Update raw state
    this.state.raw.clear()
    
    // Add all button states
    const gamepadState = this.gamepad.getGamepads()[this.gamepadIndex]
    if (gamepadState) {
      for (let i = 0; i < gamepadState.buttons.length; i++) {
        this.state.raw.set(`button_${i}`, gamepadState.buttons[i].value)
      }
      
      // Add all axis states
      for (let i = 0; i < gamepadState.axes.length; i++) {
        this.state.raw.set(`axis_${i}`, gamepadState.axes[i])
      }
    }
  }
  
  getState(): InputState {
    return this.state
  }
  
  isActive(): boolean {
    return this.active && this.gamepad.isConnected()
  }
  
  setActive(active: boolean): void {
    this.active = active
  }
  
  getType(): string {
    return 'gamepad'
  }
  
  /**
   * Set custom button mapping
   */
  setMapping(mapping: InputMapping['gamepad']): void {
    this.mapping = mapping
  }
  
  /**
   * Set which gamepad to use (for multiple controllers)
   */
  setGamepadIndex(index: number): void {
    this.gamepadIndex = index
  }
  
  private isAnyButtonPressed(buttons?: number[]): boolean {
    if (!buttons) return false
    return buttons.some(button => {
      const btn = this.gamepad.getButton(this.gamepadIndex, button)
      return btn ? btn.pressed : false
    })
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