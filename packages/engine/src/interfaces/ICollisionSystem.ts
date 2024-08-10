/*
Collision System Interfaces - Decoupled Architecture:
- Separates collision detection algorithm from game-specific implementations
- Enables spatial partitioning strategies (quadtree, grid, etc.)
- Supports different collision response patterns
- See: Real-Time Collision Detection (Ericson) for algorithms
*/

import { ITraitEntity } from './ITrait'

// Spatial bounds for collision queries - engine agnostic
export interface IBounds {
  x: number
  y: number  
  width: number
  height: number
}

// Collision query result - minimal data without tight coupling
export interface ICollisionCandidate<T = ITraitEntity> {
  entity: T
  bounds: IBounds
}

/*
ISpatialIndex Interface:
- Abstracts spatial partitioning implementation details
- Enables swapping between quadtree, grid, broad-phase algorithms
- Performance optimization opportunity from O(n²) to O(n log n)
*/
export interface ISpatialIndex<T = ITraitEntity> {
  // Spatial data management
  insert(entity: T, bounds: IBounds): void
  remove(entity: T): void
  update(entity: T, bounds: IBounds): void
  clear(): void
  
  // Collision queries - returns only potential collision candidates  
  query(bounds: IBounds): ICollisionCandidate<T>[]
  queryPoint(x: number, y: number): ICollisionCandidate<T>[]
  
  // Debug/visualization support
  getStats?(): { nodeCount: number; maxDepth: number; entityCount: number }
}

/*
ICollisionDetector Interface:
- Handles narrow-phase collision detection (AABB, SAT, etc.)
- Decoupled from spatial indexing concerns
- Supports different collision shapes and algorithms
*/
export interface ICollisionDetector {
  // Basic collision tests
  intersectAABB(a: IBounds, b: IBounds): boolean
  intersectPoint(point: { x: number; y: number }, bounds: IBounds): boolean
  
  // Advanced collision detection for future expansion
  intersectCircle?(center: { x: number; y: number }, radius: number, bounds: IBounds): boolean
}

/*
ICollisionHandler Interface:
- Processes collision responses without coupling to specific game logic
- Enables trait-based collision handling
- Supports collision filtering and priority systems
*/
export interface ICollisionHandler<T = ITraitEntity> {
  // Collision response processing
  handleCollision(entityA: T, entityB: T): void
  shouldCollide?(entityA: T, entityB: T): boolean
  
  // Collision filtering by type/layer
  getCollisionMask?(entity: T): number
  getCollisionLayer?(entity: T): number
}

/*
ICollisionSystem Interface:
- Orchestrates the complete collision detection pipeline
- Composable architecture allows swapping implementations
- Supports both entity-entity and entity-world collision
*/
export interface ICollisionSystem<T = ITraitEntity> {
  // System lifecycle
  addEntity(entity: T, bounds: IBounds): void
  removeEntity(entity: T): void
  updateEntity(entity: T, bounds: IBounds): void
  
  // Collision detection execution
  detectCollisions(): void
  
  // Configuration and optimization
  setSpatialIndex(index: ISpatialIndex<T>): void
  setCollisionDetector(detector: ICollisionDetector): void
  addCollisionHandler(handler: ICollisionHandler<T>): void
  
  // Performance monitoring
  getPerformanceStats?(): {
    broadPhaseChecks: number
    narrowPhaseChecks: number  
    collisionsDetected: number
    executionTime: number
  }
}