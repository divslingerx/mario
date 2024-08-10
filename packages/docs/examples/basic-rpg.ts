/**
 * @fileoverview Basic RPG Example - Living Documentation
 * 
 * This example demonstrates:
 * - Character creation with RPG stats
 * - Top-down movement system
 * - Physics integration for collision
 * - Basic inventory management
 * 
 * This file serves as both documentation and integration test.
 * It's compiled and tested automatically to ensure APIs remain functional.
 */

import { 
  JS2DWorld, 
  Transform, 
  Sprite,
  PixiRenderer,
  PerformanceBenchmark,
  PERFORMANCE_TARGETS
} from '@js2d/engine'
import { 
  RPGStats, 
  TopDownMovement, 
  Inventory,
  DialogNPC,
  Interactable
} from '@js2d/traits-topdown'
import { 
  RigidBody, 
  Collider, 
  PhysicsWorld 
} from '@js2d/traits-physics'

/**
 * Performance target for this example
 */
const EXAMPLE_TARGET = PERFORMANCE_TARGETS.DESKTOP_MEDIUM

/**
 * Basic RPG Game Class
 * 
 * Demonstrates core RPG functionality:
 * - Player character with SPECIAL stats
 * - NPCs with dialog and trading
 * - Interactive world objects
 * - Performance monitoring
 */
export class BasicRPGExample {
  private world: JS2DWorld
  private physics: PhysicsWorld
  private renderer: PixiRenderer
  private benchmark = new PerformanceBenchmark()
  
  // Entity references for easy access
  private player: number = 0
  private npcs: number[] = []
  private interactables: number[] = []

  constructor() {
    this.world = new JS2DWorld()
    this.physics = new PhysicsWorld({ x: 0, y: 0 }) // Top-down = no gravity
    this.renderer = new PixiRenderer()
  }

  /**
   * Initialize the game example
   * 
   * @param canvas - HTML canvas element for rendering
   * @returns Promise that resolves when game is ready
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    // Initialize renderer with performance settings
    await this.renderer.initialize(canvas)
    this.renderer.enableBatching(true)
    
    // Create game world
    await this.createWorld()
    
    // Setup input handling
    this.setupInput()
    
    // Start performance monitoring
    this.benchmark.start()
  }

  /**
   * Create the game world with player, NPCs, and objects
   * 
   * Performance: Creates 10 entities efficiently using batch operations
   */
  private async createWorld(): Promise<void> {
    // Create player character
    this.player = this.createPlayer(100, 100)
    
    // Create NPCs for interaction testing
    this.npcs.push(
      this.createMerchant(250, 150, 'Shopkeeper Sarah'),
      this.createGuard(400, 200, 'Town Guard'),
      this.createVillager(150, 300, 'Farmer John')
    )
    
    // Create interactive objects
    this.interactables.push(
      this.createTreasureChest(350, 100),
      this.createDoor(200, 50),
      this.createCampfire(300, 250)
    )
    
    // Load sprites (would be real textures in actual game)
    const playerTexture = await this.renderer.loadTexture('/sprites/player.png', 'player')
    const npcTexture = await this.renderer.loadTexture('/sprites/npc.png', 'npc')
    
    console.log(`World created: ${this.world.getStats().entityCount} entities`)
  }

  /**
   * Create player character with full RPG stats
   * 
   * @param x - Starting X position
   * @param y - Starting Y position
   * @returns Player entity ID
   */
  private createPlayer(x: number, y: number): number {
    const player = this.world.createEntity()
    
    // Position in world
    this.world.addComponent(player, Transform, { x, y, scaleX: 1, scaleY: 1 })
    
    // SPECIAL attribute system (Fallout-inspired)
    this.world.addComponent(player, RPGStats, {
      // Core attributes (1-10 scale)
      strength: 7,     // Carry capacity, melee damage
      perception: 6,   // Sight range, accuracy
      endurance: 8,    // Health points, stamina
      charisma: 5,     // Dialog options, trade prices
      intelligence: 8, // Skill points per level
      agility: 6,      // Action points, movement speed
      luck: 4,         // Critical hit chance, random events
      
      // Derived statistics
      hitPoints: 95,   // (endurance * 10) + 25
      maxHitPoints: 95,
      actionPoints: 8, // agility + 2
      maxActionPoints: 8,
      
      // Progression
      level: 1,
      experience: 0,
      skillPoints: 16  // intelligence * 2
    })
    
    // 8-directional movement system
    this.world.addComponent(player, TopDownMovement, {
      moveSpeed: 120,  // Base walking speed
      runSpeed: 200,   // Running speed (shift key)
      facing: 2,       // Initial facing direction (0-7)
      canMove: 1
    })
    
    // Inventory with weight-based encumbrance
    this.world.addComponent(player, Inventory, {
      maxSlots: 25,              // Inventory size
      maxWeight: 175,            // strength * 25
      weightCarried: 8.5,        // Starting equipment weight
      weaponSlot: 0,             // No weapon equipped
      armorSlot: 0,              // No armor equipped
      // Starting items: some gold and basic supplies
      slots: [1001, 1002, 0, 0, 0], // Item IDs
      quantities: [25, 3, 0, 0, 0]   // Gold coins, stimpaks
    })
    
    // Physics body for collision detection
    this.world.addComponent(player, RigidBody, {
      bodyType: 1,          // Kinematic body (input-controlled)
      mass: 70,             // Character weight
      linearDamping: 5.0,   // Stops quickly when input stops
      angularDamping: 10.0  // Prevent spinning
    })
    
    // Collision shape
    this.world.addComponent(player, Collider, {
      shape: 0,        // Box collider
      width: 24,       // Character width
      height: 32,      // Character height
      isSensor: false  // Solid collision
    })
    
    return player
  }

  /**
   * Create merchant NPC with trading capabilities
   */
  private createMerchant(x: number, y: number, name: string): number {
    const merchant = this.world.createEntity()
    
    this.world.addComponent(merchant, Transform, { x, y })
    
    // Merchant stats optimized for trading
    this.world.addComponent(merchant, RPGStats, {
      strength: 4,
      perception: 7,
      endurance: 5,
      charisma: 9,     // High charisma for better prices
      intelligence: 6,
      agility: 4,
      luck: 6,
      hitPoints: 40,
      level: 3
    })
    
    // Dialog and trading behavior
    this.world.addComponent(merchant, DialogNPC, {
      dialogId: 1001,        // Links to dialog tree
      trader: 1,             // Can buy/sell items
      disposition: 10,       // Friendly toward player
      faction: 2             // Merchant's Guild
    })
    
    // Large inventory for trading
    this.world.addComponent(merchant, Inventory, {
      maxSlots: 40,
      maxWeight: 400,
      // Pre-stocked with trade goods
      slots: [2001, 2002, 2003, 2004], // Weapons, armor, supplies
      quantities: [5, 3, 20, 15]
    })
    
    return merchant
  }

  /**
   * Create guard NPC with law enforcement behavior
   */
  private createGuard(x: number, y: number, name: string): number {
    const guard = this.world.createEntity()
    
    this.world.addComponent(guard, Transform, { x, y })
    
    // Combat-focused stats
    this.world.addComponent(guard, RPGStats, {
      strength: 8,     // High combat effectiveness
      perception: 8,   // Alert and observant
      endurance: 7,
      charisma: 5,
      intelligence: 5,
      agility: 6,
      luck: 5,
      hitPoints: 80,
      level: 4
    })
    
    this.world.addComponent(guard, DialogNPC, {
      dialogId: 1002,
      trader: 0,           // Not a trader
      disposition: 0,      // Neutral unless provoked
      faction: 1           // Town Guard
    })
    
    return guard
  }

  /**
   * Create villager NPC with quest potential
   */
  private createVillager(x: number, y: number, name: string): number {
    const villager = this.world.createEntity()
    
    this.world.addComponent(villager, Transform, { x, y })
    
    // Average civilian stats
    this.world.addComponent(villager, RPGStats, {
      strength: 5,
      perception: 5,
      endurance: 6,
      charisma: 7,
      intelligence: 6,
      agility: 5,
      luck: 5,
      hitPoints: 50,
      level: 2
    })
    
    this.world.addComponent(villager, DialogNPC, {
      dialogId: 1003,
      disposition: 5,      // Slightly friendly
      faction: 0           // Civilian
    })
    
    return villager
  }

  /**
   * Create treasure chest with loot
   */
  private createTreasureChest(x: number, y: number): number {
    const chest = this.world.createEntity()
    
    this.world.addComponent(chest, Transform, { x, y })
    
    this.world.addComponent(chest, Interactable, {
      interactionType: 3,    // Loot container
      interactionRange: 45,  // Must be close to interact
      skillCheck: 0,         // No skill requirement
      skillLevel: 0,
      usesRemaining: 1       // Single-use container
    })
    
    // Treasure contents
    this.world.addComponent(chest, Inventory, {
      maxSlots: 6,
      slots: [1001, 3001, 3002], // Gold, rare weapon, armor piece
      quantities: [100, 1, 1]
    })
    
    return chest
  }

  /**
   * Create interactive door
   */
  private createDoor(x: number, y: number): number {
    const door = this.world.createEntity()
    
    this.world.addComponent(door, Transform, { x, y })
    
    this.world.addComponent(door, Interactable, {
      interactionType: 1,    // Use/activate
      interactionRange: 35,
      skillCheck: 4,         // Lockpick skill required
      skillLevel: 25,        // 25% lockpick skill needed
      usesRemaining: 255     // Unlimited uses
    })
    
    return door
  }

  /**
   * Create campfire for atmosphere
   */
  private createCampfire(x: number, y: number): number {
    const campfire = this.world.createEntity()
    
    this.world.addComponent(campfire, Transform, { x, y })
    
    this.world.addComponent(campfire, Interactable, {
      interactionType: 0,    // Examine only
      interactionRange: 50,
      usesRemaining: 255
    })
    
    return campfire
  }

  /**
   * Setup keyboard input for player movement
   * 
   * Supports WASD and arrow keys for 8-directional movement
   */
  private setupInput(): void {
    const keys = new Set<string>()
    
    window.addEventListener('keydown', (e) => {
      keys.add(e.code)
      e.preventDefault()
    })
    
    window.addEventListener('keyup', (e) => {
      keys.delete(e.code)
      e.preventDefault()
    })
    
    // Update movement based on input
    const updateInput = () => {
      const movement = TopDownMovement[this.player]
      if (!movement) return
      
      // Calculate movement vector
      let inputX = 0
      let inputY = 0
      
      if (keys.has('KeyA') || keys.has('ArrowLeft')) inputX -= 1
      if (keys.has('KeyD') || keys.has('ArrowRight')) inputX += 1
      if (keys.has('KeyW') || keys.has('ArrowUp')) inputY -= 1
      if (keys.has('KeyS') || keys.has('ArrowDown')) inputY += 1
      
      // Normalize diagonal movement to prevent speed boost
      if (inputX !== 0 && inputY !== 0) {
        const magnitude = Math.sqrt(inputX * inputX + inputY * inputY)
        inputX /= magnitude
        inputY /= magnitude
      }
      
      movement.inputX = inputX
      movement.inputY = inputY
      movement.inputRun = keys.has('ShiftLeft') ? 1 : 0
      
      // Update facing direction when moving
      if (inputX !== 0 || inputY !== 0) {
        movement.facing = this.calculateFacing(inputX, inputY)
      }
      
      requestAnimationFrame(updateInput)
    }
    
    updateInput()
  }

  /**
   * Convert input vector to 8-directional facing
   */
  private calculateFacing(x: number, y: number): number {
    const angle = Math.atan2(y, x)
    const direction = Math.round((angle + Math.PI) / (Math.PI / 4)) % 8
    return direction
  }

  /**
   * Main game update loop
   * 
   * @param deltaTime - Time since last frame in milliseconds
   */
  update(deltaTime: number): void {
    this.benchmark.markFrameStart()
    
    // Update game systems
    this.benchmark.markSystemStart('ecs')
    this.world.update(deltaTime)
    this.benchmark.markSystemEnd('ecs')
    
    // Update physics simulation
    this.benchmark.markSystemStart('physics')
    this.physics.step(deltaTime, this.world.getBitECSWorld())
    this.benchmark.markSystemEnd('physics')
    
    // Handle interactions (example implementation)
    this.benchmark.markSystemStart('interactions')
    this.updateInteractions()
    this.benchmark.markSystemEnd('interactions')
  }

  /**
   * Simple interaction system example
   */
  private updateInteractions(): void {
    // In a real implementation, this would check distance between
    // player and interactable objects, handle dialog triggers, etc.
    
    // This is just a placeholder to demonstrate system timing
    for (const interactable of this.interactables) {
      const transform = Transform[interactable]
      const playerTransform = Transform[this.player]
      
      if (transform && playerTransform) {
        const dx = transform.x - playerTransform.x
        const dy = transform.y - playerTransform.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Interaction logic would go here
        if (distance < 50) {
          // Player is close enough to interact
        }
      }
    }
  }

  /**
   * Render the game world
   */
  render(): void {
    this.benchmark.markSystemStart('render')
    
    this.renderer.clear(0x2d5a27) // Forest green background
    
    // In a real implementation, this would render all sprites
    // based on Transform and Sprite components
    
    this.renderer.render()
    this.benchmark.markSystemEnd('render')
  }

  /**
   * Get performance statistics for monitoring
   */
  getPerformanceStats() {
    const result = this.benchmark.stop()
    const worldStats = this.world.getStats()
    const physicsStats = this.physics.getStats()
    
    return {
      ...result,
      entityCount: worldStats.entityCount,
      physicsEntities: physicsStats.rigidBodies,
      targetMet: PerformanceBenchmark.validatePerformance(result, EXAMPLE_TARGET)
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.physics.destroy()
    this.renderer.destroy()
  }
}

/**
 * Integration test function - verifies the example works correctly
 */
export async function testBasicRPGExample(): Promise<boolean> {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  
  const game = new BasicRPGExample()
  
  try {
    await game.initialize(canvas)
    
    // Run for a few frames to test stability
    for (let i = 0; i < 60; i++) {
      game.update(16.67) // 60 FPS
      game.render()
    }
    
    const stats = game.getPerformanceStats()
    console.log('Basic RPG Example Performance:', stats)
    
    game.destroy()
    
    return stats.targetMet
  } catch (error) {
    console.error('Basic RPG Example failed:', error)
    game.destroy()
    return false
  }
}

// Export for use in documentation examples
export default BasicRPGExample