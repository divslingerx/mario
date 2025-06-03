import { InputSource, InputState, InputMapping, DefaultInputMappings } from './InputSource'
import { Keyboard } from '../Keyboard'

/**
 * Keyboard implementation of InputSource
 */
export class KeyboardInputSource implements InputSource {
  private keyboard: Keyboard
  private mapping: InputMapping['keyboard']
  private state: InputState
  private active = true
  
  constructor(keyboard: Keyboard, mapping?: InputMapping['keyboard']) {
    this.keyboard = keyboard
    this.mapping = mapping || DefaultInputMappings.keyboard!
    this.state = this.createEmptyState()
  }
  
  update(deltaTime: number): void {
    if (!this.active) return
    
    // Update movement
    let moveX = 0
    let moveY = 0
    
    if (this.isAnyKeyPressed(this.mapping.moveLeft)) moveX -= 1
    if (this.isAnyKeyPressed(this.mapping.moveRight)) moveX += 1
    if (this.isAnyKeyPressed(this.mapping.moveUp)) moveY -= 1
    if (this.isAnyKeyPressed(this.mapping.moveDown)) moveY += 1
    
    this.state.moveX = moveX
    this.state.moveY = moveY
    
    // Update actions
    this.state.primary = this.isAnyKeyPressed(this.mapping.primary)
    this.state.secondary = this.isAnyKeyPressed(this.mapping.secondary)
    this.state.interact = this.isAnyKeyPressed(this.mapping.interact)
    this.state.menu = this.isAnyKeyPressed(this.mapping.menu)
    this.state.inventory = this.isAnyKeyPressed(this.mapping.inventory)
    this.state.map = this.isAnyKeyPressed(this.mapping.map)
    
    // Update raw state
    this.state.raw.clear()
    for (const [key, state] of this.keyboard.keyStates) {
      this.state.raw.set(`key_${key}`, state)
    }
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
    return 'keyboard'
  }
  
  /**
   * Set custom key mapping
   */
  setMapping(mapping: InputMapping['keyboard']): void {
    this.mapping = mapping
  }
  
  private isAnyKeyPressed(keys?: string[]): boolean {
    if (!keys) return false
    return keys.some(key => this.keyboard.keyStates.get(key) === 1)
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