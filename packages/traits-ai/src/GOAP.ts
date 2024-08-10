/*
Goal-Oriented Action Planning (GOAP) System:
- NPCs plan complex multi-step actions to achieve goals
- Dynamic decision making based on personality, morality, and environment
- Integration with emergent behavior system for reactive responses
- Handles resource requirements, tool needs, and social consequences
*/

import { defineComponent, defineQuery, IWorld } from 'bitecs'

// NPC needs and drives that motivate behavior
export const NPCNeeds = defineComponent({
  // Basic survival needs (0-255, higher = more urgent)
  hunger: { type: 'ui8', default: 100 },
  thirst: { type: 'ui8', default: 100 },
  sleep: { type: 'ui8', default: 100 },
  safety: { type: 'ui8', default: 100 },
  
  // Social needs
  companionship: { type: 'ui8', default: 50 },
  respect: { type: 'ui8', default: 50 },
  
  // Economic needs
  wealth: { type: 'ui8', default: 30 },
  shelter: { type: 'ui8', default: 80 },
  
  // Decay rates (how fast needs increase over time)
  hungerRate: { type: 'f32', default: 2.0 },   // per minute
  thirstRate: { type: 'f32', default: 3.0 },
  sleepRate: { type: 'f32', default: 1.0 },
  
  // Critical thresholds (when NPC becomes desperate)
  hungerCritical: { type: 'ui8', default: 200 },
  thirstCritical: { type: 'ui8', default: 180 },
  sleepCritical: { type: 'ui8', default: 220 }
})

// Personality traits that affect decision making
export const NPCPersonality = defineComponent({
  // Moral compass (0-255)
  honesty: { type: 'ui8', default: 128 },      // Willingness to steal/lie
  courage: { type: 'ui8', default: 128 },      // Risk tolerance
  compassion: { type: 'ui8', default: 128 },   // Care for others
  greed: { type: 'ui8', default: 128 },        // Desire for wealth
  
  // Intelligence and wisdom
  intelligence: { type: 'ui8', default: 100 }, // Problem-solving ability
  wisdom: { type: 'ui8', default: 100 },       // Learning from experience
  perception: { type: 'ui8', default: 100 },   // Environmental awareness
  
  // Social traits
  charisma: { type: 'ui8', default: 100 },     // Social manipulation
  intimidation: { type: 'ui8', default: 100 }, // Ability to threaten
  
  // Personality modifiers
  impulsiveness: { type: 'ui8', default: 128 }, // Think before acting?
  paranoia: { type: 'ui8', default: 50 },       // Trust others?
  ambition: { type: 'ui8', default: 100 }       // Long-term planning
})

// Current goal and action planning state
export const GOAPPlanner = defineComponent({
  // Current active goal
  currentGoal: { type: 'ui32', default: 0 },   // Goal ID
  goalPriority: { type: 'ui8', default: 0 },   // How important (0-255)
  
  // Action plan to achieve goal
  planSteps: { type: 'ui32', array: 16 },      // Action IDs in sequence
  planLength: { type: 'ui8', default: 0 },     // Number of steps
  currentStep: { type: 'ui8', default: 0 },    // Which step we're on
  
  // Planning state
  isPlanning: { type: 'ui8', default: 0 },     // Currently thinking?
  planValid: { type: 'ui8', default: 0 },      // Is current plan still good?
  lastPlanTime: { type: 'f64', default: 0 },   // When we last planned
  
  // Execution state
  actionStartTime: { type: 'f64', default: 0 },// When current action started
  actionTarget: { type: 'ui32', default: 0 },  // Entity we're acting on
  interrupted: { type: 'ui8', default: 0 }     // Was action interrupted?
})

// Knowledge about the world and other entities
export const NPCKnowledge = defineComponent({
  // Known resource locations (entity IDs)
  knownFood: { type: 'ui32', array: 32 },      // Food sources
  knownWater: { type: 'ui32', array: 16 },     // Water sources
  knownShelter: { type: 'ui32', array: 8 },    // Shelter locations
  knownTools: { type: 'ui32', array: 16 },     // Tool locations
  knownDangers: { type: 'ui32', array: 16 },   // Dangerous entities/areas
  
  // Social knowledge
  knownAllies: { type: 'ui32', array: 16 },    // Friendly entities
  knownEnemies: { type: 'ui32', array: 16 },   // Hostile entities
  knownTraders: { type: 'ui32', array: 8 },    // NPCs who trade
  
  // Environmental awareness
  guardsNearby: { type: 'ui8', default: 0 },   // Are guards watching?
  witnessCount: { type: 'ui8', default: 0 },   // How many NPCs can see us?
  lastSeenGuard: { type: 'f64', default: 0 },  // When did we last see a guard?
  
  // Memory decay
  memoryDecayRate: { type: 'f32', default: 0.1 } // How fast we forget things
})

// Available actions that NPCs can perform
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

// World conditions for action preconditions and goal states
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

// Predefined goals that NPCs can pursue
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

/*
Predefined Actions for Common NPC Behaviors:
*/
export const CommonActions: GOAPAction[] = [
  {
    id: 1001,
    name: 'Pick Fruit from Tree',
    preconditions: [
      { type: 'nearEntity', comparison: '<', value: 32 }, // Near tree
      { type: 'entityState', state: 'hasFruit', comparison: '>', value: 0 }
    ],
    effects: [
      { type: 'addItem', target: 'self', item: 2001 }, // Apple
      { type: 'changeState', target: 'target', state: 'hasFruit', delta: -1 }
    ],
    duration: 3000,
    range: 32,
    interruptible: true,
    moralCost: 0,          // Picking fruit is morally neutral
    socialCost: 0,
    riskLevel: 10,         // Low risk
    successChance: (npc, target, world) => 0.9 // Usually succeeds
  },
  
  {
    id: 1002,
    name: 'Steal Fruit from Tree',
    preconditions: [
      { type: 'nearEntity', comparison: '<', value: 32 },
      { type: 'entityState', state: 'hasFruit', comparison: '>', value: 0 },
      { type: 'entityState', state: 'owned', comparison: '>', value: 0 } // Tree is owned
    ],
    effects: [
      { type: 'addItem', target: 'self', item: 2001 },
      { type: 'changeState', target: 'target', state: 'hasFruit', delta: -1 },
      { type: 'changeRelationship', target: 'world' } // Reputation damage
    ],
    duration: 2000,        // Faster because sneaky
    range: 32,
    interruptible: true,
    moralCost: 150,        // Stealing is bad
    socialCost: 100,       // Social consequences
    riskLevel: 180,        // High risk if caught
    successChance: (npc, target, world) => {
      const knowledge = NPCKnowledge[npc]
      const personality = NPCPersonality[npc]
      
      // Success depends on stealth situation
      let chance = 0.7
      if (knowledge.guardsNearby) chance -= 0.4
      if (knowledge.witnessCount > 2) chance -= 0.3
      if (personality.perception > 150) chance += 0.2
      
      return Math.max(0.1, Math.min(0.95, chance))
    }
  },
  
  {
    id: 1003,
    name: 'Chop Down Tree',
    preconditions: [
      { type: 'nearEntity', comparison: '<', value: 48 },
      { type: 'hasItem', item: 3001 }, // Axe required
      { type: 'stat', stat: 'strength', comparison: '>', value: 80 }
    ],
    effects: [
      { type: 'destroyEntity', target: 'target' },
      { type: 'createEntity', target: 'world' }, // Wood logs
      { type: 'addItem', target: 'self', item: 2001 } // Any fruit that was on tree
    ],
    requiredItems: [3001], // Axe
    requiredStats: [{ stat: 'strength', minimum: 80 }],
    duration: 15000,       // Takes a while
    range: 48,
    interruptible: false,  // Can't stop mid-chop
    moralCost: 200,        // Destroying property is very bad
    socialCost: 200,
    riskLevel: 220,        // Very risky - loud and obvious
    successChance: (npc, target, world) => {
      const personality = NPCPersonality[npc]
      const strength = personality.intelligence // Using as proxy for strength
      return Math.min(0.95, strength / 255 * 0.8 + 0.2)
    }
  },
  
  {
    id: 1004,
    name: 'Find/Steal Axe',
    preconditions: [
      { type: 'nearEntity', comparison: '<', value: 64 } // Near tool location
    ],
    effects: [
      { type: 'addItem', target: 'self', item: 3001 }
    ],
    duration: 5000,
    range: 64,
    interruptible: true,
    moralCost: 120,        // Tool "borrowing"
    socialCost: 80,
    riskLevel: 140,
    successChance: (npc, target, world) => 0.8
  },
  
  {
    id: 1005,
    name: 'Buy Food from Merchant',
    preconditions: [
      { type: 'nearEntity', comparison: '<', value: 32 },
      { type: 'hasItem', item: 1001 }, // Gold
      { type: 'relationship', comparison: '>', value: -50 } // Not hated
    ],
    effects: [
      { type: 'removeItem', target: 'self', item: 1001 }, // Spend gold
      { type: 'addItem', target: 'self', item: 2001 }     // Get food
    ],
    requiredItems: [1001],
    duration: 8000,        // Haggling takes time
    range: 32,
    interruptible: true,
    moralCost: 0,          // Buying is morally good
    socialCost: -10,       // Slight reputation boost
    riskLevel: 5,          // Very safe
    successChance: (npc, target, world) => {
      const personality = NPCPersonality[npc]
      const charisma = personality.charisma
      return Math.min(0.98, charisma / 255 * 0.3 + 0.7) // Charisma helps haggling
    }
  },
  
  {
    id: 1006,
    name: 'Beg for Food',
    preconditions: [
      { type: 'nearEntity', comparison: '<', value: 32 },
      { type: 'need', comparison: '>', value: 180 } // Desperate
    ],
    effects: [
      { type: 'addItem', target: 'self', item: 2001 }
    ],
    duration: 12000,       // Takes time to convince
    range: 32,
    interruptible: true,
    moralCost: 50,         // Slight shame
    socialCost: 30,        // Some reputation loss
    riskLevel: 40,         // Might be rejected rudely
    successChance: (npc, target, world) => {
      const personality = NPCPersonality[npc]
      const charisma = personality.charisma
      const compassion = NPCPersonality[target]?.compassion || 128
      
      // Success depends on both NPC charisma and target compassion
      return Math.min(0.7, (charisma + compassion) / 512 * 0.6 + 0.1)
    }
  }
]

/*
Common Goals for NPCs:
*/
export const CommonGoals: NPCGoal[] = [
  {
    id: 2001,
    name: 'Satisfy Hunger',
    desiredConditions: [
      { type: 'need', comparison: '<', value: 80 } // Reduce hunger below 80
    ],
    basePriority: 100,
    priorityFactors: {
      needMultiplier: [
        { need: 'hunger', factor: 2.0 } // Priority doubles as hunger increases
      ],
      personalityMultiplier: [
        { trait: 'impulsiveness', factor: 0.5 } // Impulsive NPCs prioritize immediate needs
      ]
    },
    maxPlanLength: 8,
    timeout: 300000 // 5 minutes
  },
  
  {
    id: 2002,
    name: 'Acquire Wealth',
    desiredConditions: [
      { type: 'hasItem', item: 1001, comparison: '>', value: 100 } // Have >100 gold
    ],
    basePriority: 30,
    priorityFactors: {
      personalityMultiplier: [
        { trait: 'greed', factor: 1.5 },
        { trait: 'ambition', factor: 1.2 }
      ]
    },
    maxPlanLength: 12,
    timeout: 1800000 // 30 minutes
  },
  
  {
    id: 2003,
    name: 'Maintain Social Standing',
    desiredConditions: [
      { type: 'relationship', comparison: '>', value: 50 } // Good reputation
    ],
    basePriority: 50,
    priorityFactors: {
      personalityMultiplier: [
        { trait: 'charisma', factor: 1.3 },
        { trait: 'honesty', factor: 0.8 } // Honest people care more about reputation
      ]
    },
    maxPlanLength: 6,
    timeout: 600000 // 10 minutes
  }
]

/*
GOAP Planning System:
- A* pathfinding through action space to achieve goals
- Considers personality, morality, and environmental factors
- Integrates with emergent behavior for dynamic responses
*/
export class GOAPSystem {
  private actions = new Map<number, GOAPAction>()
  private goals = new Map<number, NPCGoal>()
  private worldState = new Map<string, any>()
  
  // Performance optimization
  private planningBudget = 50 // Max actions to consider per frame
  private maxPlanDepth = 10   // Prevent infinite planning
  
  constructor(actions: GOAPAction[] = CommonActions, goals: NPCGoal[] = CommonGoals) {
    for (const action of actions) {
      this.actions.set(action.id, action)
    }
    for (const goal of goals) {
      this.goals.set(goal.id, goal)
    }
  }

  /**
   * Main update loop - plans and executes actions for all NPCs
   */
  update(world: IWorld, deltaTime: number): void {
    // Update NPC needs over time
    this.updateNeeds(world, deltaTime)
    
    // Plan actions for NPCs that need new plans
    this.updatePlanning(world)
    
    // Execute current actions
    this.executeActions(world, deltaTime)
    
    // Update knowledge and perception
    this.updateKnowledge(world)
  }

  /**
   * Update NPC needs - they increase over time
   */
  private updateNeeds(world: IWorld, deltaTime: number): void {
    const needsQuery = defineQuery([NPCNeeds])
    const entities = needsQuery(world)
    
    for (const entity of entities) {
      const needs = NPCNeeds[entity]
      const minutesPassed = deltaTime / 60000
      
      // Increase needs over time
      needs.hunger = Math.min(255, needs.hunger + needs.hungerRate * minutesPassed)
      needs.thirst = Math.min(255, needs.thirst + needs.thirstRate * minutesPassed)
      needs.sleep = Math.min(255, needs.sleep + needs.sleepRate * minutesPassed)
    }
  }

  /**
   * Plan new actions for NPCs that need them
   */
  private updatePlanning(world: IWorld): void {
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
  private findBestGoal(entity: number, world: IWorld): NPCGoal | null {
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
  private planActionsForGoal(entity: number, goal: NPCGoal, world: IWorld): number[] {
    // Simplified planning - in reality this would be A* search through action space
    const plan: number[] = []
    const needs = NPCNeeds[entity]
    const personality = NPCPersonality[entity]
    const knowledge = NPCKnowledge[entity]
    
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

  /**
   * Execute current actions for all NPCs
   */
  private executeActions(world: IWorld, deltaTime: number): void {
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
    }
  }

  /**
   * Update NPC knowledge about the world
   */
  private updateKnowledge(world: IWorld): void {
    const knowledgeQuery = defineQuery([NPCKnowledge, NPCPersonality])
    const entities = knowledgeQuery(world)
    
    for (const entity of entities) {
      const knowledge = NPCKnowledge[entity]
      const personality = NPCPersonality[entity]
      
      // Update environmental awareness
      knowledge.guardsNearby = this.detectGuards(entity, world) ? 1 : 0
      knowledge.witnessCount = this.countWitnesses(entity, world)
      
      // High perception NPCs notice more
      if (personality.perception > 150) {
        // Enhanced detection range and accuracy
      }
    }
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

  private detectGuards(entity: number, world: IWorld): boolean {
    // Would check for guard entities in range
    return Math.random() > 0.7
  }

  private countWitnesses(entity: number, world: IWorld): number {
    // Would count nearby NPCs that can see this entity
    return Math.floor(Math.random() * 5)
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
   * Get performance statistics
   */
  getStats() {
    return {
      actionsAvailable: this.actions.size,
      goalsAvailable: this.goals.size,
      planningBudgetUsed: 0 // Would track actual usage
    }
  }
}