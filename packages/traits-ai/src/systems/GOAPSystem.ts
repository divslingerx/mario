import { IWorld } from 'bitecs'
import { PlanningSystem } from './PlanningSystem'
import { ExecutionSystem } from './ExecutionSystem'
import { KnowledgeSystem } from './KnowledgeSystem'
import { NeedsSystem } from './NeedsSystem'
import { GOAPAction, NPCGoal } from '../types/GOAPTypes'

/**
 * Main GOAP system that orchestrates planning, execution, knowledge, and needs
 * This is the high-level coordinator for all AI behavior
 */
export class GOAPSystem {
  private planningSystem: PlanningSystem
  private executionSystem: ExecutionSystem
  private knowledgeSystem: KnowledgeSystem
  private needsSystem: NeedsSystem

  constructor(actions: GOAPAction[] = [], goals: NPCGoal[] = []) {
    this.planningSystem = new PlanningSystem(actions, goals)
    this.executionSystem = new ExecutionSystem(actions)
    this.knowledgeSystem = new KnowledgeSystem()
    this.needsSystem = new NeedsSystem()
  }

  /**
   * Main update loop - coordinates all subsystems
   */
  update(world: IWorld, deltaTime: number): void {
    // Update NPC needs over time
    this.needsSystem.updateNeeds(world, deltaTime)
    
    // Update knowledge and perception
    this.knowledgeSystem.updateKnowledge(world)
    
    // Plan actions for NPCs that need new plans
    this.planningSystem.updatePlanning(world)
    
    // Execute current actions
    this.executionSystem.executeActions(world, deltaTime)
  }

  /**
   * Add custom action to all relevant systems
   */
  addAction(action: GOAPAction): void {
    this.planningSystem.addAction(action)
    this.executionSystem.addAction(action)
  }

  /**
   * Add custom goal to the planning system
   */
  addGoal(goal: NPCGoal): void {
    this.planningSystem.addGoal(goal)
  }

  /**
   * Get comprehensive AI system statistics
   */
  getStats() {
    return {
      planning: this.planningSystem.getStats(),
      // Could add stats from other systems
    }
  }

  // Expose subsystem APIs for advanced usage
  get planning(): PlanningSystem {
    return this.planningSystem
  }

  get execution(): ExecutionSystem {
    return this.executionSystem
  }

  get knowledge(): KnowledgeSystem {
    return this.knowledgeSystem
  }

  get needs(): NeedsSystem {
    return this.needsSystem
  }
}