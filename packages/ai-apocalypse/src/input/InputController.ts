import { 
  InputManager,
  KeyboardInputSource,
  GamepadInputSource,
  GamepadInput,
  Keyboard,
  Entity,
  Go,
  Jump
} from '@js2d/engine'

export class InputController {
  private inputManager: InputManager
  private keyboard: Keyboard
  private gamepad: GamepadInput

  constructor() {
    this.inputManager = new InputManager()
    this.keyboard = new Keyboard()
    this.gamepad = new GamepadInput()
    
    this.setupInputSources()
  }

  private setupInputSources() {
    // Setup keyboard
    this.keyboard.listenTo(window)
    this.inputManager.addSource('keyboard', new KeyboardInputSource(this.keyboard))
    
    // Setup gamepad
    this.inputManager.addSource('gamepad', new GamepadInputSource(this.gamepad))
  }

  update(deltaTime: number) {
    this.inputManager.update(deltaTime)
  }

  getState() {
    return this.inputManager.getState()
  }

  /**
   * Apply input to control a player entity
   */
  controlPlayer(player: Entity, inputState: any) {
    // Handle movement
    const playerGo = player.getTrait(Go)
    if (playerGo) {
      playerGo.dir = inputState.moveX
    }
    
    // Handle jumping
    const playerJump = player.getTrait(Jump)
    if (playerJump) {
      if (inputState.primary) {
        playerJump.start()
      } else {
        playerJump.cancel()
      }
    }
    
    // Handle weapon switching
    const weapon = player.getTrait('weapon')
    if (weapon && inputState.secondary) {
      // TODO: Implement weapon switching
    }
  }
}