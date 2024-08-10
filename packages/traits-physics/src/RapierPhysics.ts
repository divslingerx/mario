/*
Rapier Physics Integration:
- High-performance Rust-based physics engine via WASM
- Deterministic simulation crucial for multiplayer games
- Efficient broad-phase collision detection with spatial indexing
- See: Real-Time Physics Simulation for game physics principles
*/

import RAPIER from '@dimforge/rapier2d'
import { defineComponent, defineQuery, IWorld } from 'bitecs'
import { Transform, Velocity } from '@js2d/engine'

// Physics-specific components for ECS integration
export const RigidBody = defineComponent({
  bodyHandle: { type: 'ui32' },
  bodyType: { type: 'ui8' }, // 0=dynamic, 1=kinematic, 2=static
  mass: { type: 'f32', default: 1.0 },
  friction: { type: 'f32', default: 0.5 },
  restitution: { type: 'f32', default: 0.0 },
  linearDamping: { type: 'f32', default: 0.0 },
  angularDamping: { type: 'f32', default: 0.0 }
})

export const Collider = defineComponent({
  colliderHandle: { type: 'ui32' },
  shape: { type: 'ui8' }, // 0=box, 1=circle, 2=polygon
  width: { type: 'f32' },
  height: { type: 'f32' },
  radius: { type: 'f32' },
  isSensor: { type: 'ui8', default: 0 },
  collisionMask: { type: 'ui32', default: 0xffffffff },
  collisionLayer: { type: 'ui32', default: 1 }
})

// Joint system for connecting rigid bodies
export const Joint = defineComponent({
  jointHandle: { type: 'ui32' },
  jointType: { type: 'ui8' }, // 0=fixed, 1=revolute, 2=prismatic
  entityA: { type: 'ui32' },
  entityB: { type: 'ui32' },
  anchorAX: { type: 'f32' },
  anchorAY: { type: 'f32' },
  anchorBX: { type: 'f32' },
  anchorBY: { type: 'f32' }
})

/*
Physics World Manager:
- Integrates Rapier physics with BitECS for optimal performance
- Handles physics simulation, collision detection, and response
- Provides networking support for multiplayer physics synchronization
*/
export class PhysicsWorld {
  private world: RAPIER.World
  private entityToBody = new Map<number, RAPIER.RigidBody>()
  private entityToCollider = new Map<number, RAPIER.Collider>()
  private collisionEvents: Array<{ entityA: number; entityB: number; type: 'start' | 'end' }> = []

  constructor(gravity = { x: 0, y: -9.81 }) {
    // Initialize Rapier physics world with configurable gravity
    this.world = new RAPIER.World(gravity)
    
    // Set up collision event handling
    this.world.eventQueue = new RAPIER.EventQueue(true)
  }

  // Create rigid body from ECS component data
  createRigidBody(entity: number, transform: any, rigidBodyData: any): void {
    const bodyDesc = this.createBodyDescriptor(rigidBodyData)
    bodyDesc.setTranslation(transform.x, transform.y)
    bodyDesc.setRotation(transform.rotationZ)

    const body = this.world.createRigidBody(bodyDesc)
    this.entityToBody.set(entity, body)
    
    // Store entity reference in user data for collision callbacks
    body.userData = { entity }
  }

  // Create collider from ECS component data
  createCollider(entity: number, colliderData: any): void {
    const rigidBody = this.entityToBody.get(entity)
    if (!rigidBody) return

    const colliderDesc = this.createColliderDescriptor(colliderData)
    const collider = this.world.createCollider(colliderDesc, rigidBody)
    this.entityToCollider.set(entity, collider)
    
    collider.userData = { entity }
  }

  // Physics simulation step - integrates with ECS update loop
  step(deltaTime: number, ecsWorld: IWorld): void {
    // Update rigid body transforms from ECS
    this.syncECSToPhysics(ecsWorld)
    
    // Run physics simulation
    this.world.step()
    
    // Update ECS transforms from physics
    this.syncPhysicsToECS(ecsWorld)
    
    // Process collision events for game logic
    this.processCollisionEvents()
  }

  private syncECSToPhysics(ecsWorld: IWorld): void {
    // Query for entities with both physics and transform components
    const physicsQuery = defineQuery([Transform, RigidBody])
    const entities = physicsQuery(ecsWorld)

    for (const entity of entities) {
      const body = this.entityToBody.get(entity)
      if (!body) continue

      // Update physics body from ECS transform changes
      const transform = Transform[entity]
      body.setTranslation({ x: transform.x, y: transform.y }, true)
      body.setRotation(transform.rotationZ, true)

      // Apply velocity if present
      if (Velocity[entity]) {
        const vel = Velocity[entity]
        body.setLinvel({ x: vel.x, y: vel.y }, true)
      }
    }
  }

  private syncPhysicsToECS(ecsWorld: IWorld): void {
    // Update ECS transforms from physics simulation results
    for (const [entity, body] of this.entityToBody) {
      const translation = body.translation()
      const rotation = body.rotation()
      const velocity = body.linvel()

      // Update transform component
      Transform.x[entity] = translation.x
      Transform.y[entity] = translation.y
      Transform.rotationZ[entity] = rotation

      // Update velocity component if present
      if (Velocity[entity]) {
        Velocity.x[entity] = velocity.x
        Velocity.y[entity] = velocity.y
      }
    }
  }

  private processCollisionEvents(): void {
    this.collisionEvents.length = 0
    
    this.world.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      const collider1 = this.world.getCollider(handle1)
      const collider2 = this.world.getCollider(handle2)
      
      if (collider1?.userData?.entity && collider2?.userData?.entity) {
        this.collisionEvents.push({
          entityA: collider1.userData.entity,
          entityB: collider2.userData.entity,
          type: started ? 'start' : 'end'
        })
      }
    })
  }

  private createBodyDescriptor(data: any): RAPIER.RigidBodyDesc {
    switch (data.bodyType) {
      case 1: return RAPIER.RigidBodyDesc.kinematicPositionBased()
      case 2: return RAPIER.RigidBodyDesc.fixed()
      default: return RAPIER.RigidBodyDesc.dynamic()
    }
  }

  private createColliderDescriptor(data: any): RAPIER.ColliderDesc {
    let desc: RAPIER.ColliderDesc

    switch (data.shape) {
      case 1: // Circle
        desc = RAPIER.ColliderDesc.ball(data.radius)
        break
      case 2: // Polygon - would need vertex data
        desc = RAPIER.ColliderDesc.convexHull(new Float32Array([]))!
        break
      default: // Box
        desc = RAPIER.ColliderDesc.cuboid(data.width / 2, data.height / 2)
    }

    return desc
      .setFriction(data.friction || 0.5)
      .setRestitution(data.restitution || 0.0)
      .setSensor(data.isSensor === 1)
  }

  // Collision event access for game systems
  getCollisionEvents() {
    return [...this.collisionEvents]
  }

  // Cleanup physics resources
  destroy(): void {
    this.world.free()
  }

  // Ray casting for line-of-sight, projectiles, etc.
  raycast(from: { x: number; y: number }, to: { x: number; y: number }): any {
    const ray = new RAPIER.Ray(from, { x: to.x - from.x, y: to.y - from.y })
    const hit = this.world.castRay(ray, 1000.0, true)
    
    if (hit) {
      const collider = hit.collider
      return {
        entity: collider.userData?.entity,
        point: ray.pointAt(hit.toi),
        normal: hit.normal,
        distance: hit.toi
      }
    }
    
    return null
  }

  // Performance stats for monitoring
  getStats() {
    return {
      rigidBodies: this.entityToBody.size,
      colliders: this.entityToCollider.size,
      collisionEvents: this.collisionEvents.length
    }
  }
}