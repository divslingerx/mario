/*
ECS World Management with BitECS:
- High-performance entity-component-system architecture
- Cache-friendly memory layout for optimal performance
- Efficient queries for systems processing entity subsets
- See: Data-Oriented Design for performance principles
*/

import { 
  createWorld, 
  addEntity, 
  removeEntity, 
  addComponent, 
  removeComponent, 
  hasComponent,
  defineComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  Changed,
  Not,
  World as BitECSWorld,
  IWorld
} from 'bitecs'

// Base transform component - every entity needs position/rotation/scale
export const Transform = defineComponent({
  x: { type: 'f32' },
  y: { type: 'f32' },
  z: { type: 'f32' },
  rotationX: { type: 'f32' },
  rotationY: { type: 'f32' },
  rotationZ: { type: 'f32' },
  scaleX: { type: 'f32', default: 1 },
  scaleY: { type: 'f32', default: 1 },
  scaleZ: { type: 'f32', default: 1 }
})

// Velocity for physics-enabled entities
export const Velocity = defineComponent({
  x: { type: 'f32' },
  y: { type: 'f32' },
  z: { type: 'f32' }
})

// Sprite rendering component
export const Sprite = defineComponent({
  textureId: { type: 'ui32' },
  width: { type: 'f32' },
  height: { type: 'f32' },
  tint: { type: 'ui32', default: 0xffffff },
  alpha: { type: 'f32', default: 1.0 },
  visible: { type: 'ui8', default: 1 }
})

// Network synchronization for multiplayer
export const Networked = defineComponent({
  playerId: { type: 'ui32' },
  lastSync: { type: 'f64' },
  dirty: { type: 'ui8', default: 0 }
})

// Lifetime management
export const Lifetime = defineComponent({
  remaining: { type: 'f32' },
  maxLifetime: { type: 'f32' }
})

/**
 * High-performance ECS world for game development
 * 
 * Wraps BitECS with game-specific functionality while maintaining performance.
 * Provides entity management, component systems, and networking integration.
 * 
 * @example
 * ```typescript
 * // Create game world
 * const world = new JS2DWorld()
 * 
 * // Create player entity
 * const player = world.createEntity()
 * world.addComponent(player, Transform, { x: 100, y: 100 })
 * world.addComponent(player, Velocity, { x: 0, y: 0 })
 * 
 * // Game loop
 * function update(deltaTime: number) {
 *   world.update(deltaTime)
 * }
 * ```
 * 
 * @see {@link Transform} for positioning entities
 * @see {@link Velocity} for physics movement
 * @see {@link https://github.com/NateTheGreatt/bitECS} for underlying ECS
 */
export class JS2DWorld {
  private world: IWorld
  private entities = new Set<number>()
  private systems: ((world: IWorld, delta: number) => void)[] = []
  private networkBuffer: { entity: number; component: string; data: unknown }[] = []

  constructor() {
    this.world = createWorld()
  }

  // Entity management with automatic ID tracking
  createEntity(): number {
    const entity = addEntity(this.world)
    this.entities.add(entity)
    
    // Every entity gets a transform by default
    addComponent(this.world, Transform, entity)
    
    return entity
  }

  destroyEntity(entity: number): void {
    if (this.entities.has(entity)) {
      removeEntity(this.world, entity)
      this.entities.delete(entity)
    }
  }

  // Component management with type safety and performance optimization
  addComponent<T extends Record<string, unknown>>(
    entity: number, 
    component: T, 
    data?: Partial<T[keyof T]>
  ): void {
    addComponent(this.world, component, entity)
    
    // Direct property assignment is faster than Object.assign for small objects
    if (data) {
      const componentData = component[entity]
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          componentData[key] = data[key]
        }
      }
    }

    // Track networked components for multiplayer sync
    if (hasComponent(this.world, Networked, entity)) {
      this.networkBuffer.push({ 
        entity, 
        component: (component as { name?: string }).name ?? 'unknown', 
        data 
      })
    }
  }

  removeComponent<T>(entity: number, component: T): void {
    removeComponent(this.world, component, entity)
  }

  hasComponent<T>(entity: number, component: T): boolean {
    return hasComponent(this.world, component, entity)
  }

  // System management for game logic
  addSystem(system: (world: IWorld, delta: number) => void): void {
    this.systems.push(system)
  }

  removeSystem(system: (world: IWorld, delta: number) => void): void {
    this.systems = this.systems.filter(s => s !== system)
  }

  // World update - runs all systems
  update(deltaTime: number): void {
    for (const system of this.systems) {
      system(this.world, deltaTime)
    }
  }

  // Query helpers for common patterns
  createQuery(...components: any[]) {
    return defineQuery(components)
  }

  // Networking support for multiplayer - avoid spread operator for performance
  getNetworkUpdates(): { entity: number; component: string; data: unknown }[] {
    const updates = this.networkBuffer.slice() // slice() is faster than spread for arrays
    this.networkBuffer.length = 0 // Clear array efficiently
    return updates
  }

  applyNetworkUpdate(entity: number, componentName: string, data: any): void {
    // Apply network updates from server
    // Component lookup would need to be implemented based on name
  }

  // Serialization for save games
  serialize(): string {
    const data = {
      entities: Array.from(this.entities),
      components: {} // Component data would be serialized here
    }
    return JSON.stringify(data)
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data)
    // Restore world state from serialized data
  }

  // Performance monitoring
  getStats() {
    return {
      entityCount: this.entities.size,
      systemCount: this.systems.length,
      networkUpdates: this.networkBuffer.length
    }
  }

  // Access to underlying BitECS world for advanced usage
  getBitECSWorld(): IWorld {
    return this.world
  }
}

// Common query patterns for systems
export const MovingEntities = defineQuery([Transform, Velocity])
export const RenderableEntities = defineQuery([Transform, Sprite])
export const NetworkedEntities = defineQuery([Transform, Networked])
export const ExpiringEntities = defineQuery([Lifetime])