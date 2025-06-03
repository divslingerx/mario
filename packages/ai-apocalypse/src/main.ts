import { 
  Timer, 
  Camera,
  createColorLayer,
  createSpriteLayer
} from '@js2d/engine'

import { LevelSetup } from './setup/LevelSetup'
import { InputController } from './input/InputController'
import { AISystemsManager } from './ai/AISystemsManager'
import { GameUI } from './ui/GameUI'

/**
 * Main game setup for AI Apocalypse demo
 */
export function setupGame(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')!
  
  // Create and setup level
  const level = LevelSetup.createGameLevel()
  
  // Add background layer
  level.comp.layers.push(createColorLayer('#1a1a2e')) // Dark blue-gray
  
  // Add sprite layer for entities
  const spriteLayer = createSpriteLayer(level.entities)
  level.comp.layers.push(spriteLayer)
  
  // Setup camera
  const camera = new Camera()
  camera.size.set(canvas.width, canvas.height)
  
  // Setup input controller
  const inputController = new InputController()
  
  // Create player
  const player = LevelSetup.spawnPlayer(level, 400, 300)
  
  // Create pawns (colonists)
  LevelSetup.spawnPawns(level, 3, 300, 350)
  
  // Build base structures
  LevelSetup.buildBase(level)
  
  // Spawn enemies
  LevelSetup.spawnEnemies(level)
  
  // Setup AI systems
  const aiSystems = new AISystemsManager()
  aiSystems.initialize(level)
  
  // Setup UI
  const gameUI = new GameUI()
  
  // Setup game timer
  const timer = new Timer(1/60)
  
  timer.update = function update(deltaTime: number) {
    // Create game context
    const gameContext = {
      deltaTime,
      audioContext: null,
      videoContext: context,
      entityFactory: null
    }
    // Update input
    inputController.update(deltaTime)
    const inputState = inputController.getState()
    
    // Control player
    inputController.controlPlayer(player, inputState)
    
    // Update AI systems
    aiSystems.update(level, deltaTime)
    
    // Update level
    level.update(gameContext)
    
    // Center camera on player
    if (player.pos.x > camera.size.x / 2 && 
        player.pos.x < level.tiles.width * level.tiles.tileSize - camera.size.x / 2) {
      camera.pos.x = player.pos.x - camera.size.x / 2
    }
    
    if (player.pos.y > camera.size.y / 2 && 
        player.pos.y < level.tiles.height * level.tiles.tileSize - camera.size.y / 2) {
      camera.pos.y = player.pos.y - camera.size.y / 2
    }
    
    // Draw everything
    level.comp.draw(context, camera)
    
    // Debug: draw entity count
    context.fillStyle = '#fff'
    context.font = '12px monospace'
    context.fillText(`Entities: ${level.entities.size}`, 10, 560)
    
    // Draw UI
    gameUI.draw(context, player, inputState)
  }
  
  timer.start()
  
  return {
    timer,
    level,
    player
  }
}


// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const canvas = document.getElementById('game') as HTMLCanvasElement
      if (canvas) {
        setupGame(canvas)
      } else {
        console.error('Canvas element not found!')
      }
    } catch (error) {
      console.error('Error starting game:', error)
    }
  })
} else {
  try {
    const canvas = document.getElementById('game') as HTMLCanvasElement
    if (canvas) {
      setupGame(canvas)
    } else {
      console.error('Canvas element not found!')
    }
  } catch (error) {
    console.error('Error starting game:', error)
  }
}