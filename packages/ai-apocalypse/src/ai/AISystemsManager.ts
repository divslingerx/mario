import { PathfindingSystem, Level } from '@js2d/engine'

/**
 * Manages all AI systems for the game
 * Currently stubbed out until AI packages are created
 */
export class AISystemsManager {
  private pathfindingSystem: PathfindingSystem
  
  // TODO: Add these when packages are created
  // private memorySystem: MemorySystem
  // private goapSystem: GOAPSystem
  // private emergentSystem: EmergentBehaviorSystem

  constructor() {
    this.pathfindingSystem = new PathfindingSystem()
  }

  /**
   * Initialize AI systems with the level
   */
  initialize(level: Level) {
    // Build navigation grid for pathfinding
    this.pathfindingSystem.buildNavigationGrid(level)
    
    // TODO: Initialize other systems when packages are created
    // this.memorySystem = new MemorySystem(new InMemoryStore())
    // this.goapSystem = new GOAPSystem()
    // this.emergentSystem = new EmergentBehaviorSystem()
  }

  /**
   * Update all AI systems
   */
  update(level: Level, deltaTime: number) {
    // Update pathfinding
    // Note: PathfindingSystem updates are handled by individual entities
    
    // TODO: Update other systems when packages are created
    // this.memorySystem.update(level.entities, deltaTime)
    // this.goapSystem.update(level.entities, deltaTime)
    // this.emergentSystem.update(level.entities, deltaTime)
  }

  getPathfindingSystem(): PathfindingSystem {
    return this.pathfindingSystem
  }
}