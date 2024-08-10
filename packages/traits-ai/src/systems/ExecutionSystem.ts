import { defineQuery, IWorld } from 'bitecs'
import { GOAPPlanner, NPCPersonality } from '../components'
import { GOAPAction, WorldEffect } from '../types/GOAPTypes'

/**
 * Handles GOAP action execution and effect application
 */
export class ExecutionSystem {
  private actions = new Map<number, GOAPAction>()
  
  constructor(actions: GOAPAction[] = []) {
    for (const action of actions) {
      this.actions.set(action.id, action)
    }
  }

  /**
   * Execute current actions for all NPCs
   */
  executeActions(world: IWorld, deltaTime: number): void {
    const plannerQuery = defineQuery([GOAPPlanner])
    const entities = plannerQuery(world)
    
    for (const entity of entities) {
      const planner = GOAPPlanner[entity]
      
      if (!planner.planValid || planner.currentStep >= planner.planLength) continue
      
      const actionId = planner.planSteps[planner.currentStep]
      const action = this.actions.get(actionId)
      
      if (!action) continue
      
      // Check if action is complete
      const currentTime = performance.now()
      if (currentTime - planner.actionStartTime >= action.duration) {
        // Action completed successfully
        this.completeAction(entity, action, world)
        planner.currentStep++
        planner.actionStartTime = currentTime
        
        // If plan is complete, mark as invalid so we can plan again
        if (planner.currentStep >= planner.planLength) {
          planner.planValid = 0
        }
      }
    }
  }

  /**
   * Complete an action and apply its effects
   */
  private completeAction(entity: number, action: GOAPAction, world: IWorld): void {
    console.log(`NPC ${entity} completed action: ${action.name}`)
    
    // Apply action effects
    for (const effect of action.effects) {
      this.applyEffect(entity, effect, world)
    }
    
    // Apply moral and social consequences
    const personality = NPCPersonality[entity]
    if (action.moralCost > 0) {
      // Reduce honesty slightly for immoral actions
      personality.honesty = Math.max(0, personality.honesty - Math.floor(action.moralCost / 10))
    }
  }

  /**
   * Apply an effect from an action
   */
  private applyEffect(entity: number, effect: WorldEffect, world: IWorld): void {
    // Simplified effect application
    switch (effect.type) {
      case 'addItem':
        console.log(`NPC ${entity} gained item ${effect.item}`)
        // Would integrate with inventory system
        break
        
      case 'changeState':
        console.log(`NPC ${entity} changed state ${effect.state}`)
        // Would integrate with emergent behavior states
        break
        
      case 'removeItem':
        console.log(`NPC ${entity} lost item ${effect.item}`)
        break
        
      case 'destroyEntity':
        console.log(`Entity destroyed by NPC ${entity}`)
        // Would remove entity from world
        break
        
      case 'createEntity':
        console.log(`New entity created by NPC ${entity}`)
        // Would spawn new entity
        break
        
      case 'changeRelationship':
        console.log(`NPC ${entity} relationship changed`)
        // Would modify reputation/relationship values
        break
    }
  }

  /**
   * Add custom action to the execution system
   */
  addAction(action: GOAPAction): void {
    this.actions.set(action.id, action)
  }

  /**
   * Check if an NPC can execute a specific action
   */
  canExecuteAction(entity: number, action: GOAPAction, world: IWorld): boolean {
    // Check preconditions
    for (const condition of action.preconditions) {
      if (!this.checkCondition(entity, condition, world)) {
        return false
      }
    }
    
    // Check required items
    if (action.requiredItems) {
      for (const itemId of action.requiredItems) {
        if (!this.hasItem(entity, itemId, world)) {
          return false
        }
      }
    }
    
    // Check required stats
    if (action.requiredStats) {
      for (const statReq of action.requiredStats) {
        if (!this.hasStatRequirement(entity, statReq, world)) {
          return false
        }
      }
    }
    
    return true
  }

  private checkCondition(entity: number, condition: any, world: IWorld): boolean {
    // Simplified condition checking
    return Math.random() > 0.3
  }

  private hasItem(entity: number, itemId: number, world: IWorld): boolean {
    // Would check entity's inventory
    return Math.random() > 0.5
  }

  private hasStatRequirement(entity: number, statReq: any, world: IWorld): boolean {
    // Would check entity's stats
    return Math.random() > 0.4
  }
}