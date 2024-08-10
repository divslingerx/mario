/*
GOAP Execution System:
- Executes planned action sequences
- Handles interruptions and replanning
- Manages action timing and success/failure
*/

import { IWorld } from 'bitecs'
import { GOAPAction } from '../types/GOAPTypes'
import { GOAPPlanner } from '../components/GOAPPlanner'

interface ActionExecution {
  npc: number
  action: GOAPAction
  target: number
  startTime: number
  expectedDuration: number
}

export class GOAPExecutor {
  private activeExecutions = new Map<number, ActionExecution>()
  private completedActions = new Map<number, GOAPAction[]>()

  /**
   * Start executing an action for an NPC
   */
  startExecution(npc: number, action: GOAPAction, target: number, world: IWorld): boolean {
    // Check if NPC is already executing an action
    if (this.activeExecutions.has(npc)) {
      const current = this.activeExecutions.get(npc)!
      if (!current.action.interruptible) {
        return false // Can't interrupt current action
      }
      this.cancelExecution(npc)
    }

    // Verify action can still be performed
    if (!this.canExecuteAction(npc, action, target, world)) {
      return false
    }

    const execution: ActionExecution = {
      npc,
      action,
      target,
      startTime: Date.now(),
      expectedDuration: action.duration
    }

    this.activeExecutions.set(npc, execution)
    return true
  }

  /**
   * Update all active executions
   */
  update(world: IWorld): void {
    const now = Date.now()
    const completed: number[] = []

    for (const [npc, execution] of this.activeExecutions) {
      const elapsed = now - execution.startTime

      // Check if action should be completed
      if (elapsed >= execution.expectedDuration) {
        if (this.executeAction(execution, world)) {
          this.completeExecution(npc, execution.action)
        } else {
          this.failExecution(npc)
        }
        completed.push(npc)
      }
      // Check for interruption conditions
      else if (this.shouldInterrupt(execution, world)) {
        this.cancelExecution(npc)
        completed.push(npc)
      }
    }

    // Remove completed executions
    for (const npc of completed) {
      this.activeExecutions.delete(npc)
    }
  }

  /**
   * Cancel execution for an NPC
   */
  cancelExecution(npc: number): void {
    this.activeExecutions.delete(npc)
    
    // Clear current plan from planner
    const planner = GOAPPlanner[npc]
    if (planner) {
      planner.currentPlan = []
      planner.currentActionIndex = 0
    }
  }

  /**
   * Check if an NPC is currently executing an action
   */
  isExecuting(npc: number): boolean {
    return this.activeExecutions.has(npc)
  }

  /**
   * Get the current action being executed by an NPC
   */
  getCurrentAction(npc: number): GOAPAction | null {
    const execution = this.activeExecutions.get(npc)
    return execution ? execution.action : null
  }

  /**
   * Get execution progress (0-1)
   */
  getProgress(npc: number): number {
    const execution = this.activeExecutions.get(npc)
    if (!execution) return 0

    const elapsed = Date.now() - execution.startTime
    return Math.min(1, elapsed / execution.expectedDuration)
  }

  private canExecuteAction(npc: number, action: GOAPAction, target: number, world: IWorld): boolean {
    // Check preconditions are still valid
    // This would need to be integrated with actual world state checking
    
    // Check if target is still valid and in range
    if (target !== 0 && action.range > 0) {
      // TODO: Check distance to target
    }

    // Check required items are still available
    if (action.requiredItems) {
      // TODO: Check inventory
    }

    return true
  }

  private executeAction(execution: ActionExecution, world: IWorld): boolean {
    const { npc, action, target } = execution

    // Calculate success chance
    const successChance = action.successChance(npc, target, world)
    const success = Math.random() < successChance

    if (success) {
      // Apply action effects
      if (action.execute) {
        return action.execute(npc, target, world)
      } else {
        this.applyActionEffects(action, npc, target, world)
        return true
      }
    }

    return false
  }

  private applyActionEffects(action: GOAPAction, npc: number, target: number, world: IWorld): void {
    for (const effect of action.effects) {
      switch (effect.type) {
        case 'addItem':
          // TODO: Add item to inventory
          break
        case 'removeItem':
          // TODO: Remove item from inventory
          break
        case 'changeState':
          // TODO: Modify entity state
          break
        case 'changeRelationship':
          // TODO: Modify relationship values
          break
        case 'createEntity':
          // TODO: Spawn new entity
          break
        case 'destroyEntity':
          // TODO: Remove entity
          break
      }
    }
  }

  private shouldInterrupt(execution: ActionExecution, world: IWorld): boolean {
    const { npc, action } = execution

    if (!action.interruptible) return false

    // Check for high-priority interruptions
    // TODO: Check for danger, urgent needs, etc.

    return false
  }

  private completeExecution(npc: number, action: GOAPAction): void {
    // Track completed actions
    if (!this.completedActions.has(npc)) {
      this.completedActions.set(npc, [])
    }
    this.completedActions.get(npc)!.push(action)

    // Advance planner to next action
    const planner = GOAPPlanner[npc]
    if (planner) {
      planner.currentActionIndex++
    }
  }

  private failExecution(npc: number): void {
    // Action failed - planner should replan
    const planner = GOAPPlanner[npc]
    if (planner) {
      planner.currentPlan = []
      planner.currentActionIndex = 0
      planner.planningCooldown = 5000 // Wait 5 seconds before replanning
    }
  }
}