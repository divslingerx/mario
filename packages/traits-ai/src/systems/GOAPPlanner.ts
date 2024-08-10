/*
GOAP Planning System:
- A* pathfinding through action space
- Finds optimal sequence of actions to achieve goals
- Considers costs, risks, and personality factors
*/

import { IWorld } from 'bitecs'
import { GOAPAction, NPCGoal, WorldCondition } from '../types/GOAPTypes'
import { NPCPersonality } from '../components/NPCPersonality'
import { NPCNeeds } from '../components/NPCNeeds'

interface PlanNode {
  action: GOAPAction | null
  parent: PlanNode | null
  worldState: Map<string, number>
  cost: number
  heuristic: number
  depth: number
}

export class GOAPPlanner {
  private actions: GOAPAction[]
  private maxDepth: number = 15
  private maxNodes: number = 1000

  constructor(actions: GOAPAction[]) {
    this.actions = actions
  }

  /**
   * Plans a sequence of actions to achieve the given goal
   */
  planPath(npc: number, goal: NPCGoal, world: IWorld): GOAPAction[] | null {
    const startState = this.getCurrentWorldState(npc, world)
    const startNode: PlanNode = {
      action: null,
      parent: null,
      worldState: startState,
      cost: 0,
      heuristic: this.calculateHeuristic(startState, goal),
      depth: 0
    }

    const openSet: PlanNode[] = [startNode]
    const closedSet = new Set<string>()
    let nodesExplored = 0

    while (openSet.length > 0 && nodesExplored < this.maxNodes) {
      // Get node with lowest f-score (cost + heuristic)
      openSet.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic))
      const currentNode = openSet.shift()!
      nodesExplored++

      const stateKey = this.worldStateToKey(currentNode.worldState)
      if (closedSet.has(stateKey)) continue
      closedSet.add(stateKey)

      // Check if we've achieved the goal
      if (this.satisfiesGoal(currentNode.worldState, goal)) {
        return this.reconstructPath(currentNode)
      }

      // Explore all possible actions
      if (currentNode.depth < this.maxDepth) {
        for (const action of this.actions) {
          if (this.canPerformAction(npc, action, currentNode.worldState, world)) {
            const newState = this.applyAction(action, currentNode.worldState)
            const actionCost = this.calculateActionCost(npc, action, world)
            
            const childNode: PlanNode = {
              action,
              parent: currentNode,
              worldState: newState,
              cost: currentNode.cost + actionCost,
              heuristic: this.calculateHeuristic(newState, goal),
              depth: currentNode.depth + 1
            }

            openSet.push(childNode)
          }
        }
      }
    }

    return null // No path found
  }

  private getCurrentWorldState(npc: number, world: IWorld): Map<string, number> {
    const state = new Map<string, number>()
    const needs = NPCNeeds[npc]
    const personality = NPCPersonality[npc]

    // Add current needs to state
    state.set('hunger', needs.hunger)
    state.set('thirst', needs.thirst)
    state.set('sleep', needs.sleep)
    state.set('safety', needs.safety)

    // Add personality traits that affect decisions
    state.set('morality', personality.honesty)
    state.set('risk-tolerance', personality.courage)

    // TODO: Add inventory, location, relationships, etc.
    // This would need to be integrated with the actual game systems

    return state
  }

  private canPerformAction(
    npc: number, 
    action: GOAPAction, 
    worldState: Map<string, number>, 
    world: IWorld
  ): boolean {
    for (const condition of action.preconditions) {
      if (!this.evaluateCondition(condition, worldState)) {
        return false
      }
    }

    // Check personality constraints
    const personality = NPCPersonality[npc]
    if (action.moralCost > personality.honesty && Math.random() > 0.3) {
      return false // Too immoral for this NPC
    }

    if (action.riskLevel > personality.courage && Math.random() > 0.5) {
      return false // Too risky for this NPC
    }

    return true
  }

  private evaluateCondition(condition: WorldCondition, worldState: Map<string, number>): boolean {
    const key = this.conditionToKey(condition)
    const currentValue = worldState.get(key) || 0
    const targetValue = condition.value || 0

    switch (condition.comparison) {
      case '<': return currentValue < targetValue
      case '>': return currentValue > targetValue
      case '=': return currentValue === targetValue
      case '<=': return currentValue <= targetValue
      case '>=': return currentValue >= targetValue
      default: return false
    }
  }

  private applyAction(action: GOAPAction, worldState: Map<string, number>): Map<string, number> {
    const newState = new Map(worldState)

    for (const effect of action.effects) {
      const key = this.effectToKey(effect)
      const currentValue = newState.get(key) || 0

      switch (effect.type) {
        case 'addItem':
          newState.set(`item_${effect.item}`, currentValue + (effect.value || 1))
          break
        case 'removeItem':
          newState.set(`item_${effect.item}`, Math.max(0, currentValue - (effect.value || 1)))
          break
        case 'changeState':
          newState.set(key, currentValue + (effect.delta || 0))
          break
      }
    }

    return newState
  }

  private calculateActionCost(npc: number, action: GOAPAction, world: IWorld): number {
    const personality = NPCPersonality[npc]
    let cost = action.duration / 1000 // Base time cost

    // Add moral cost based on personality
    cost += (action.moralCost * (255 - personality.honesty)) / 255

    // Add risk cost based on personality
    cost += (action.riskLevel * (255 - personality.courage)) / 255

    // Add social cost
    cost += action.socialCost

    return cost
  }

  private calculateHeuristic(worldState: Map<string, number>, goal: NPCGoal): number {
    let distance = 0

    for (const condition of goal.desiredConditions) {
      const key = this.conditionToKey(condition)
      const currentValue = worldState.get(key) || 0
      const targetValue = condition.value || 0

      // Simple Manhattan distance heuristic
      distance += Math.abs(currentValue - targetValue)
    }

    return distance
  }

  private satisfiesGoal(worldState: Map<string, number>, goal: NPCGoal): boolean {
    for (const condition of goal.desiredConditions) {
      if (!this.evaluateCondition(condition, worldState)) {
        return false
      }
    }
    return true
  }

  private reconstructPath(node: PlanNode): GOAPAction[] {
    const path: GOAPAction[] = []
    let current = node

    while (current.parent && current.action) {
      path.unshift(current.action)
      current = current.parent
    }

    return path
  }

  private worldStateToKey(worldState: Map<string, number>): string {
    return Array.from(worldState.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|')
  }

  private conditionToKey(condition: WorldCondition): string {
    if (condition.type === 'hasItem') return `item_${condition.item}`
    if (condition.type === 'need') return condition.state || 'unknown'
    if (condition.type === 'stat') return condition.state || 'unknown'
    return `${condition.type}_${condition.entity || 0}`
  }

  private effectToKey(effect: any): string {
    if (effect.type === 'addItem' || effect.type === 'removeItem') {
      return `item_${effect.item}`
    }
    return effect.state || 'unknown'
  }
}