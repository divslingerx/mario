/*
GOAP Type Definitions:
- Action and goal interfaces
- World conditions and effects
- Success chance calculations
*/

import { IWorld } from 'bitecs'

export interface WorldCondition {
  type: 'hasItem' | 'nearEntity' | 'entityState' | 'relationship' | 'environmental' | 'need' | 'stat'
  
  // Condition parameters
  entity?: number           // Which entity (if applicable)
  item?: number            // Which item (if applicable)
  state?: string           // Which state to check
  value?: number           // Required value
  comparison?: '<' | '>' | '=' | '<=' | '>='
  
  // Environmental conditions
  timeOfDay?: 'day' | 'night' | 'dawn' | 'dusk'
  weatherCondition?: string
  locationSafe?: boolean
  guardsPresent?: boolean
  witnessCount?: number
}

export interface WorldEffect {
  type: 'addItem' | 'removeItem' | 'changeState' | 'moveEntity' | 'createEntity' | 'destroyEntity' | 'changeRelationship'
  
  target: 'self' | 'target' | 'world' | number
  item?: number
  state?: string
  value?: number
  delta?: number
}

export interface GOAPAction {
  id: number
  name: string
  
  // Preconditions that must be true to perform this action
  preconditions: WorldCondition[]
  
  // Effects that this action has on the world
  effects: WorldEffect[]
  
  // Resource requirements
  requiredItems?: number[]    // Item IDs needed
  requiredSkills?: { skill: string; level: number }[]
  requiredStats?: { stat: string; minimum: number }[]
  
  // Execution parameters
  duration: number           // How long action takes (ms)
  range: number             // How close to target we need to be
  interruptible: boolean    // Can this action be interrupted?
  
  // Moral and social considerations
  moralCost: number         // How "bad" is this action? (0-255)
  socialCost: number        // Social reputation damage
  riskLevel: number         // Chance of negative consequences (0-255)
  
  // Success conditions
  successChance: (npc: number, target: number, world: IWorld) => number
  
  // Custom execution logic
  execute?: (npc: number, target: number, world: IWorld) => boolean
}

export interface NPCGoal {
  id: number
  name: string
  
  // Goal conditions (what we want to achieve)
  desiredConditions: WorldCondition[]
  
  // Priority calculation
  basePriority: number
  priorityFactors: {
    needMultiplier?: { need: string; factor: number }[]
    personalityMultiplier?: { trait: string; factor: number }[]
    situationalMultiplier?: { condition: string; factor: number }[]
  }
  
  // Goal constraints
  maxPlanLength: number     // Maximum steps to achieve goal
  timeout: number          // Give up after this long (ms)
  exclusiveWith?: number[] // Can't pursue these goals simultaneously
}