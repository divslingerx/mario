import { defineQuery, IWorld } from 'bitecs'
import { GOAPPlanner, NPCNeeds, NPCPersonality, NPCKnowledge } from '../components'
import { NPCGoal, GOAPAction } from '../types/GOAPTypes'

/**
 * Handles GOAP planning logic - finding goals and creating action sequences
 */
export class PlanningSystem {
  private actions = new Map<number, GOAPAction>()
  private goals = new Map<number, NPCGoal>()
  
  // Performance optimization
  private planningBudget = 50 // Max actions to consider per frame
  private maxPlanDepth = 10   // Prevent infinite planning
  
  constructor(actions: GOAPAction[] = [], goals: NPCGoal[] = []) {
    for (const action of actions) {
      this.actions.set(action.id, action)
    }
    for (const goal of goals) {
      this.goals.set(goal.id, goal)
    }
  }

  /**
   * Plan new actions for NPCs that need them
   */
  updatePlanning(world: IWorld): void {
    const plannerQuery = defineQuery([GOAPPlanner, NPCNeeds, NPCPersonality])
    const entities = plannerQuery(world)
    
    for (const entity of entities) {
      const planner = GOAPPlanner[entity]
      
      // Skip if currently executing a valid plan
      if (planner.planValid && planner.currentStep < planner.planLength) continue
      
      // Find highest priority goal
      const goal = this.findBestGoal(entity, world)
      if (!goal) continue
      
      // Plan actions to achieve goal
      const plan = this.planActionsForGoal(entity, goal, world)
      if (plan.length > 0) {
        // Store new plan
        planner.currentGoal = goal.id
        planner.planLength = Math.min(16, plan.length)
        planner.currentStep = 0
        planner.planValid = 1
        planner.lastPlanTime = performance.now()
        
        // Copy plan into component
        for (let i = 0; i < planner.planLength; i++) {
          planner.planSteps[i] = plan[i]
        }
        
        console.log(`NPC ${entity} planned ${plan.length} steps for goal: ${goal.name}`)
      }
    }
  }

  /**
   * Find the best goal for an NPC based on needs and personality
   */
  findBestGoal(entity: number, world: IWorld): NPCGoal | null {
    const needs = NPCNeeds[entity]
    const personality = NPCPersonality[entity]
    
    let bestGoal: NPCGoal | null = null
    let bestPriority = 0
    
    for (const goal of this.goals.values()) {
      let priority = goal.basePriority
      
      // Apply need multipliers
      if (goal.priorityFactors.needMultiplier) {
        for (const factor of goal.priorityFactors.needMultiplier) {
          const needValue = (needs as any)[factor.need] || 0
          priority *= (needValue / 128) * factor.factor
        }
      }
      
      // Apply personality multipliers
      if (goal.priorityFactors.personalityMultiplier) {
        for (const factor of goal.priorityFactors.personalityMultiplier) {
          const traitValue = (personality as any)[factor.trait] || 128
          priority *= (traitValue / 128) * factor.factor
        }
      }
      
      if (priority > bestPriority) {
        bestPriority = priority
        bestGoal = goal
      }
    }
    
    return bestGoal
  }

  /**
   * Plan a sequence of actions to achieve a goal using A* search
   */
  planActionsForGoal(entity: number, goal: NPCGoal, world: IWorld): number[] {
    // Simplified planning - in reality this would be A* search through action space
    const plan: number[] = []
    const needs = NPCNeeds[entity]
    const personality = NPCPersonality[entity]
    
    // Example planning for hunger goal
    if (goal.id === 2001) { // Satisfy Hunger
      // Check what options NPC has based on personality and situation
      
      // Option 1: Buy food (if has money and moral)
      if (this.hasGold(entity, world) && personality.honesty > 100) {
        plan.push(1005) // Buy Food from Merchant
      }
      // Option 2: Pick fruit (if available and not too immoral)
      else if (this.nearFruitTree(entity, world) && personality.honesty > 80) {
        plan.push(1001) // Pick Fruit from Tree
      }
      // Option 3: Steal fruit (if desperate or immoral)
      else if (this.nearFruitTree(entity, world) && (needs.hunger > 200 || personality.honesty < 80)) {
        plan.push(1002) // Steal Fruit from Tree
      }
      // Option 4: Get axe and chop tree (if very desperate)
      else if (needs.hunger > needs.hungerCritical && personality.honesty < 60) {
        if (!this.hasAxe(entity, world)) {
          plan.push(1004) // Find/Steal Axe
        }
        plan.push(1003) // Chop Down Tree
      }
      // Option 5: Beg (if desperate and high charisma)
      else if (needs.hunger > 180 && personality.charisma > 100) {
        plan.push(1006) // Beg for Food
      }
    }
    
    return plan
  }

  // Helper methods for world state checking
  private hasGold(entity: number, world: IWorld): boolean {
    // Would check inventory for gold
    return Math.random() > 0.5
  }

  private nearFruitTree(entity: number, world: IWorld): boolean {
    // Would check for nearby fruit trees
    return Math.random() > 0.3
  }

  private hasAxe(entity: number, world: IWorld): boolean {
    // Would check inventory for axe
    return Math.random() > 0.8
  }

  /**
   * Add custom action to the system
   */
  addAction(action: GOAPAction): void {
    this.actions.set(action.id, action)
  }

  /**
   * Add custom goal to the system
   */
  addGoal(goal: NPCGoal): void {
    this.goals.set(goal.id, goal)
  }

  /**
   * Get planning statistics
   */
  getStats() {
    return {
      actionsAvailable: this.actions.size,
      goalsAvailable: this.goals.size,
      planningBudgetUsed: 0 // Would track actual usage
    }
  }
}