# Getting Started

Create your first top-down RPG with JS2D in under 10 minutes.

## Installation

```bash
# Create new project
mkdir my-rpg-game && cd my-rpg-game
pnpm init

# Install JS2D packages
pnpm add @js2d/engine @js2d/traits-topdown @js2d/traits-physics
pnpm add -D vite typescript
```

## Basic Setup

Create a minimal HTML file:

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>My RPG Game</title>
  <style>
    body { margin: 0; background: #000; }
    #game { display: block; margin: auto; }
  </style>
</head>
<body>
  <canvas id="game" width="800" height="600"></canvas>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

## Your First RPG Character

```typescript
// src/main.ts
import { 
  JS2DWorld, 
  Transform, 
  Sprite, 
  PixiRenderer 
} from '@js2d/engine'
import { 
  RPGStats, 
  TopDownMovement, 
  Inventory 
} from '@js2d/traits-topdown'
import { 
  RigidBody, 
  Collider, 
  PhysicsWorld 
} from '@js2d/traits-physics'

async function createGame() {
  // Initialize renderer
  const canvas = document.getElementById('game') as HTMLCanvasElement
  const renderer = new PixiRenderer()
  await renderer.initialize(canvas)
  
  // Create game world and physics
  const world = new JS2DWorld()
  const physics = new PhysicsWorld({ x: 0, y: 0 }) // No gravity for top-down
  
  // Create player character
  const player = createPlayer(world)
  
  // Create some NPCs and world objects
  const merchant = createMerchant(world, 200, 150)
  const treasure = createTreasureChest(world, 300, 200)
  
  // Game loop
  let lastTime = 0
  function gameLoop(currentTime: number) {
    const deltaTime = currentTime - lastTime
    lastTime = currentTime
    
    // Update game systems
    world.update(deltaTime)
    physics.step(deltaTime, world.getBitECSWorld())
    
    // Render
    renderer.clear(0x2d5a27) // Forest green background
    // Render entities with sprites here
    renderer.render()
    
    requestAnimationFrame(gameLoop)
  }
  
  requestAnimationFrame(gameLoop)
}

function createPlayer(world: JS2DWorld): number {
  const player = world.createEntity()
  
  // Position and appearance
  world.addComponent(player, Transform, { 
    x: 100, 
    y: 100,
    scaleX: 1, 
    scaleY: 1 
  })
  
  // RPG character stats (Fallout SPECIAL system)
  world.addComponent(player, RPGStats, {
    // Attributes (1-10)
    strength: 6,     // Carry weight, melee damage
    perception: 7,   // Sight range, critical chance
    endurance: 8,    // Health, stamina
    charisma: 5,     // Dialog options, prices
    intelligence: 7, // Skill points, dialog
    agility: 6,      // Action points, dodge
    luck: 4,         // Random events, criticals
    
    // Derived stats
    hitPoints: 80,
    maxHitPoints: 80,
    actionPoints: 8,
    level: 1,
    experience: 0
  })
  
  // Movement system
  world.addComponent(player, TopDownMovement, {
    moveSpeed: 120,  // Walking speed
    runSpeed: 200,   // Running speed  
    facing: 2        // Starting direction (south)
  })
  
  // Inventory system
  world.addComponent(player, Inventory, {
    maxSlots: 20,
    maxWeight: 150,  // Based on strength
    weightCarried: 5
  })
  
  // Physics for collision detection
  world.addComponent(player, RigidBody, {
    bodyType: 1,     // Kinematic (controlled by input)
    mass: 70
  })
  
  world.addComponent(player, Collider, {
    shape: 0,        // Box shape
    width: 24,
    height: 32,
    isSensor: false  // Solid collision
  })
  
  return player
}

function createMerchant(world: JS2DWorld, x: number, y: number): number {
  const merchant = world.createEntity()
  
  world.addComponent(merchant, Transform, { x, y })
  
  // Basic NPC stats
  world.addComponent(merchant, RPGStats, {
    strength: 4,
    charisma: 8,     // High charisma for better prices
    hitPoints: 50,
    level: 5
  })
  
  // Merchant-specific traits
  world.addComponent(merchant, DialogNPC, {
    dialogId: 'merchant_01',
    trader: 1,       // Can buy/sell items
    disposition: 0,  // Neutral
    faction: 1       // Merchant guild
  })
  
  world.addComponent(merchant, Inventory, {
    maxSlots: 50,    // Large inventory for trading
    maxWeight: 500
  })
  
  return merchant
}

function createTreasureChest(world: JS2DWorld, x: number, y: number): number {
  const chest = world.createEntity()
  
  world.addComponent(chest, Transform, { x, y })
  
  world.addComponent(chest, Interactable, {
    interactionType: 3,    // Loot container
    interactionRange: 40,  // Close interaction needed
    skillCheck: 0,         // No skill required
    usesRemaining: 1       // Single use
  })
  
  world.addComponent(chest, Inventory, {
    maxSlots: 5,
    // Pre-populate with treasure
    slots: [101, 102, 0, 0, 0], // Item IDs
    quantities: [50, 1, 0, 0, 0] // Gold coins + rare item
  })
  
  return chest
}

// Start the game
createGame().catch(console.error)
```

## Input Handling

Add player input to make your character move:

```typescript
// Add to your game setup
function setupInput(world: JS2DWorld, player: number) {
  const movement = TopDownMovement[player]
  const keys = new Set<string>()
  
  window.addEventListener('keydown', (e) => keys.add(e.code))
  window.addEventListener('keyup', (e) => keys.delete(e.code))
  
  function updateMovement() {
    // 8-directional movement
    let inputX = 0
    let inputY = 0
    
    if (keys.has('KeyA') || keys.has('ArrowLeft')) inputX -= 1
    if (keys.has('KeyD') || keys.has('ArrowRight')) inputX += 1
    if (keys.has('KeyW') || keys.has('ArrowUp')) inputY -= 1
    if (keys.has('KeyS') || keys.has('ArrowDown')) inputY += 1
    
    // Normalize diagonal movement
    if (inputX !== 0 && inputY !== 0) {
      inputX *= 0.707 // sqrt(2)/2
      inputY *= 0.707
    }
    
    movement.inputX = inputX
    movement.inputY = inputY
    movement.inputRun = keys.has('ShiftLeft') ? 1 : 0
    
    // Update facing direction
    if (inputX !== 0 || inputY !== 0) {
      movement.facing = calculateFacing(inputX, inputY)
    }
    
    requestAnimationFrame(updateMovement)
  }
  
  updateMovement()
}

function calculateFacing(x: number, y: number): number {
  // Convert input to 8-directional facing (0-7)
  const angle = Math.atan2(y, x)
  return Math.round((angle + Math.PI) / (Math.PI / 4)) % 8
}
```

## What's Next?

🎮 **[Add More Features](/guide/rpg)** - Dialog system, combat, quests  
🌍 **[Procedural World](/guide/procedural)** - Infinite terrain generation  
⚡ **[Optimize Performance](/guide/performance)** - Handle 1000+ entities  
🌐 **[Add Multiplayer](/guide/multiplayer)** - Network synchronization

## Performance Tips

- Use **object pooling** for frequently created/destroyed entities
- **Batch rendering** for multiple sprites with same texture
- **Spatial indexing** for efficient collision detection with many entities
- **Component queries** instead of iterating all entities

Your RPG character now has stats, inventory, movement, and collision detection - all the foundations for a complex game!