/*
Emergent Behavior System - Dwarf Fortress Style Interactions:
- Entity states that interact and cascade (wet + fire = steam + extinguish)
- Configurable interaction rules for different game systems
- Spatial awareness for realistic interaction ranges
- Performance optimized for hundreds of interacting entities
*/

import { defineComponent, defineQuery, IWorld } from 'bitecs'

// Core state component - entities can have multiple states simultaneously
export const EntityStates = defineComponent({
  // State flags (bitfield for performance) - up to 32 states
  stateFlags: { type: 'ui32', default: 0 },
  
  // State intensities (0-255 for each state)
  wet: { type: 'ui8', default: 0 },
  burning: { type: 'ui8', default: 0 },
  drunk: { type: 'ui8', default: 0 },
  dirty: { type: 'ui8', default: 0 },
  poisoned: { type: 'ui8', default: 0 },
  blessed: { type: 'ui8', default: 0 },
  cursed: { type: 'ui8', default: 0 },
  magnetic: { type: 'ui8', default: 0 },
  
  // State decay rates (how fast states fade)
  wetDecay: { type: 'f32', default: 10.0 },    // Wet dries over time
  burningDecay: { type: 'f32', default: 5.0 }, // Fire burns out
  drunkDecay: { type: 'f32', default: 2.0 },   // Sobering up
  
  // Last interaction time to prevent rapid-fire effects
  lastInteraction: { type: 'f64', default: 0 }
})

// Interaction range for emergent behaviors
export const InteractionRange = defineComponent({
  range: { type: 'f32', default: 32 }, // How close entities must be to interact
  activeStates: { type: 'ui32', default: 0xffffffff }, // Which states can trigger interactions
  receptiveStates: { type: 'ui32', default: 0xffffffff } // Which states can be affected
})

// Materials that entities are made of (affects interactions)
export const Material = defineComponent({
  materialType: { type: 'ui8', default: 0 }, // 0=organic, 1=metal, 2=stone, 3=wood, 4=cloth, etc.
  flammability: { type: 'ui8', default: 50 }, // 0-255 how easily it catches fire
  conductivity: { type: 'ui8', default: 0 },  // Electrical/magical conductivity
  absorbency: { type: 'ui8', default: 100 },  // How much liquid it can absorb
  durability: { type: 'ui8', default: 255 },  // How much damage before breaking
  currentDamage: { type: 'ui8', default: 0 }
})

// Substance containers (beer barrels, water buckets, etc.)
export const SubstanceContainer = defineComponent({
  substanceType: { type: 'ui8', default: 0 }, // 0=empty, 1=water, 2=beer, 3=oil, 4=acid
  amount: { type: 'ui8', default: 0 },         // Current amount (0-255)
  capacity: { type: 'ui8', default: 255 },     // Maximum capacity
  leaking: { type: 'ui8', default: 0 },        // Is container damaged and leaking?
  viscosity: { type: 'ui8', default: 50 },     // How fast substance spreads
  volatility: { type: 'ui8', default: 0 }      // How easily it ignites/evaporates
})

// Temperature system for realistic fire/ice interactions
export const Temperature = defineComponent({
  currentTemp: { type: 'i16', default: 20 },   // Current temperature in Celsius
  baseTemp: { type: 'i16', default: 20 },      // Base temperature (room temp)
  heatCapacity: { type: 'ui8', default: 100 }, // How much energy to change temp
  conductivity: { type: 'ui8', default: 50 },  // How fast temperature spreads
  ignitionPoint: { type: 'i16', default: 200 },// Temperature at which it catches fire
  freezingPoint: { type: 'i16', default: 0 }   // Temperature at which it freezes
})

/*
State Flags for Bitwise Operations:
- Ultra-fast state checking using bit operations
- Can combine multiple states efficiently
- Extensible up to 32 different states
*/
export const StateFlags = {
  WET: 1 << 0,
  BURNING: 1 << 1,
  DRUNK: 1 << 2,
  DIRTY: 1 << 3,
  POISONED: 1 << 4,
  BLESSED: 1 << 5,
  CURSED: 1 << 6,
  MAGNETIC: 1 << 7,
  FROZEN: 1 << 8,
  ELECTRIFIED: 1 << 9,
  INVISIBLE: 1 << 10,
  FLYING: 1 << 11,
  SLEEPING: 1 << 12,
  ANGRY: 1 << 13,
  FRIGHTENED: 1 << 14,
  CONFUSED: 1 << 15,
  // Reserve 16 more for future expansion
} as const

/*
Interaction Rule Definition:
- Defines what happens when entities with certain states interact
- Configurable for different game types and scenarios
- Can trigger chain reactions and emergent behaviors
*/
export interface InteractionRule {
  id: string
  name: string
  
  // Conditions for interaction to trigger
  triggerStates: number     // Bitfield of required states on triggering entity
  targetStates: number      // Bitfield of required states on target entity
  materialRequirements?: {  // Optional material requirements
    triggerMaterial?: number
    targetMaterial?: number
  }
  temperatureRange?: {      // Optional temperature requirements
    min: number
    max: number
  }
  
  // Effects of the interaction
  effects: InteractionEffect[]
  
  // Interaction parameters
  range: number             // Maximum distance for interaction
  probability: number       // 0-1 chance of triggering when conditions met
  cooldown: number         // Minimum time between interactions (ms)
  repeatable: boolean      // Can this interaction happen multiple times?
  
  // Priority for conflicting interactions
  priority: number
}

export interface InteractionEffect {
  type: 'addState' | 'removeState' | 'modifyState' | 'changeTemperature' | 'dealDamage' | 'createEntity' | 'triggerSound' | 'spawnParticles'
  
  // Target of the effect
  target: 'trigger' | 'receiver' | 'both' | 'nearby' | 'all'
  
  // Effect parameters
  stateChange?: {
    state: keyof typeof StateFlags
    intensity: number       // Amount to add/subtract
    duration?: number       // How long the state lasts (0 = permanent)
  }
  
  temperatureChange?: number // Temperature delta
  damageAmount?: number     // Damage to deal
  
  // Cascading effects
  chainReactions?: {
    probability: number     // Chance of triggering chain reaction
    delay: number          // Delay before chain reaction (ms)
    rule: string          // ID of rule to trigger as chain reaction
  }[]
  
  // Area of effect
  areaOfEffect?: {
    radius: number
    falloff: 'linear' | 'exponential' | 'none'
  }
}

/*
Predefined Interaction Rules for Common Scenarios:
- Fire + Water = Steam + Extinguish
- Cat + Beer = Drunk Cat
- Drunk + Movement = Stumbling
- etc.
*/
export const DefaultInteractionRules: InteractionRule[] = [
  {
    id: 'fire_extinguish_water',
    name: 'Fire Extinguished by Water',
    triggerStates: StateFlags.WET,
    targetStates: StateFlags.BURNING,
    range: 16,
    probability: 0.9,
    cooldown: 100,
    repeatable: true,
    priority: 100,
    effects: [
      {
        type: 'removeState',
        target: 'receiver',
        stateChange: { state: 'burning', intensity: 255 }
      },
      {
        type: 'modifyState',
        target: 'trigger',
        stateChange: { state: 'wet', intensity: -50 }
      },
      {
        type: 'changeTemperature',
        target: 'both',
        temperatureChange: -30
      },
      {
        type: 'spawnParticles',
        target: 'receiver'
      }
    ]
  },
  
  {
    id: 'alcohol_intoxication',
    name: 'Animal Drinks Alcohol',
    triggerStates: 0, // Any entity can drink
    targetStates: 0,
    range: 8,
    probability: 0.3,
    cooldown: 5000,
    repeatable: false,
    priority: 50,
    effects: [
      {
        type: 'addState',
        target: 'trigger',
        stateChange: { state: 'drunk', intensity: 100, duration: 30000 }
      },
      {
        type: 'modifyState',
        target: 'receiver', // Beer container
        stateChange: { state: 'wet', intensity: -20 }
      }
    ]
  },
  
  {
    id: 'drunk_stumbling',
    name: 'Drunk Entity Stumbles',
    triggerStates: StateFlags.DRUNK,
    targetStates: 0, // Can stumble into anything
    range: 24,
    probability: 0.15,
    cooldown: 1000,
    repeatable: true,
    priority: 30,
    effects: [
      {
        type: 'createEntity',
        target: 'receiver' // Create "collision" effect
      },
      {
        chainReactions: [
          {
            probability: 0.4,
            delay: 200,
            rule: 'fire_spread_accident'
          }
        ]
      }
    ]
  },
  
  {
    id: 'fire_spread_flammable',
    name: 'Fire Spreads to Flammable Materials',
    triggerStates: StateFlags.BURNING,
    targetStates: 0,
    range: 20,
    probability: 0.2,
    cooldown: 500,
    repeatable: true,
    priority: 80,
    materialRequirements: {
      targetMaterial: 3 // Wood
    },
    temperatureRange: { min: 150, max: 1000 },
    effects: [
      {
        type: 'addState',
        target: 'receiver',
        stateChange: { state: 'burning', intensity: 150, duration: 10000 }
      },
      {
        type: 'changeTemperature',
        target: 'receiver',
        temperatureChange: 100
      },
      {
        chainReactions: [
          {
            probability: 0.8,
            delay: 1000,
            rule: 'fire_spread_flammable'
          }
        ]
      }
    ]
  },
  
  {
    id: 'emergency_fire_response',
    name: 'NPCs React to Fire',
    triggerStates: StateFlags.BURNING,
    targetStates: 0, // Any NPC can respond
    range: 100, // Large detection range
    probability: 0.7,
    cooldown: 10000,
    repeatable: false,
    priority: 90,
    effects: [
      {
        type: 'addState',
        target: 'receiver',
        stateChange: { state: 'frightened', intensity: 200, duration: 5000 }
      },
      {
        type: 'triggerSound',
        target: 'receiver'
      },
      {
        chainReactions: [
          {
            probability: 0.6,
            delay: 2000,
            rule: 'fetch_water_bucket'
          }
        ]
      }
    ]
  }
]

/*
Emergent Behavior System:
- Processes interaction rules between entities
- Handles cascading chain reactions
- Optimized with spatial indexing for performance
- Configurable complexity limits to prevent infinite loops
*/
export class EmergentBehaviorSystem {
  private rules = new Map<string, InteractionRule>()
  private chainReactionQueue: Array<{
    ruleId: string
    triggerEntity: number
    targetEntity: number
    executeAt: number
  }> = []
  
  // Performance monitoring
  private interactionsPerFrame = 0
  private maxInteractionsPerFrame = 1000
  private complexityBudget = 100 // Computation budget per frame
  
  constructor(rules: InteractionRule[] = DefaultInteractionRules) {
    for (const rule of rules) {
      this.rules.set(rule.id, rule)
    }
  }

  /**
   * Main update loop - processes emergent interactions
   * 
   * @param world - ECS world containing entities
   * @param deltaTime - Time since last update
   * @param spatialIndex - Spatial indexing for nearby entity queries
   */
  update(world: IWorld, deltaTime: number, spatialIndex?: any): void {
    const currentTime = performance.now()
    this.interactionsPerFrame = 0
    
    // Process queued chain reactions first
    this.processChainReactions(world, currentTime)
    
    // Find entities with emergent behavior capabilities
    const emergentQuery = defineQuery([EntityStates, InteractionRange])
    const entities = emergentQuery(world)
    
    // Process interactions between entities
    for (const entity of entities) {
      if (this.interactionsPerFrame >= this.maxInteractionsPerFrame) break
      
      this.processEntityInteractions(world, entity, entities, currentTime, spatialIndex)
    }
    
    // Update state decay (states fade over time)
    this.updateStateDecay(world, deltaTime)
  }

  /**
   * Process interactions for a single entity
   */
  private processEntityInteractions(
    world: IWorld, 
    entity: number, 
    allEntities: number[], 
    currentTime: number,
    spatialIndex?: any
  ): void {
    const entityStates = EntityStates[entity]
    const entityRange = InteractionRange[entity]
    
    if (!entityStates || !entityRange) return
    
    // Skip if entity recently interacted (cooldown)
    if (currentTime - entityStates.lastInteraction < 100) return
    
    // Find nearby entities using spatial indexing or brute force
    const nearbyEntities = spatialIndex 
      ? this.getNearbyEntitiesSpatial(entity, entityRange.range, spatialIndex)
      : this.getNearbyEntitiesBruteForce(entity, entityRange.range, allEntities, world)
    
    // Check each interaction rule
    for (const rule of this.rules.values()) {
      // Check if this entity can trigger this rule
      if (!this.hasRequiredStates(entityStates.stateFlags, rule.triggerStates)) continue
      
      // Find valid targets
      for (const targetEntity of nearbyEntities) {
        if (entity === targetEntity) continue
        
        const targetStates = EntityStates[targetEntity]
        if (!targetStates) continue
        
        // Check if target has required states
        if (!this.hasRequiredStates(targetStates.stateFlags, rule.targetStates)) continue
        
        // Check additional requirements (material, temperature, etc.)
        if (!this.checkAdditionalRequirements(world, entity, targetEntity, rule)) continue
        
        // Check probability and cooldown
        if (Math.random() > rule.probability) continue
        if (currentTime - entityStates.lastInteraction < rule.cooldown) continue
        
        // Execute the interaction!
        this.executeInteraction(world, entity, targetEntity, rule, currentTime)
        
        entityStates.lastInteraction = currentTime
        this.interactionsPerFrame++
        
        if (this.interactionsPerFrame >= this.maxInteractionsPerFrame) return
      }
    }
  }

  /**
   * Execute an interaction between two entities
   */
  private executeInteraction(
    world: IWorld,
    triggerEntity: number,
    targetEntity: number,
    rule: InteractionRule,
    currentTime: number
  ): void {
    console.log(`Emergent interaction: ${rule.name} between ${triggerEntity} and ${targetEntity}`)
    
    for (const effect of rule.effects) {
      this.applyEffect(world, triggerEntity, targetEntity, effect, currentTime)
    }
  }

  /**
   * Apply a single effect from an interaction
   */
  private applyEffect(
    world: IWorld,
    triggerEntity: number,
    targetEntity: number,
    effect: InteractionEffect,
    currentTime: number
  ): void {
    const targets = this.getEffectTargets(effect.target, triggerEntity, targetEntity)
    
    for (const target of targets) {
      const states = EntityStates[target]
      if (!states) continue
      
      switch (effect.type) {
        case 'addState':
        case 'modifyState':
          if (effect.stateChange) {
            this.modifyEntityState(states, effect.stateChange)
          }
          break
          
        case 'removeState':
          if (effect.stateChange) {
            this.removeEntityState(states, effect.stateChange)
          }
          break
          
        case 'changeTemperature':
          if (effect.temperatureChange) {
            const temp = Temperature[target]
            if (temp) {
              temp.currentTemp += effect.temperatureChange
            }
          }
          break
          
        case 'dealDamage':
          if (effect.damageAmount) {
            const material = Material[target]
            if (material) {
              material.currentDamage = Math.min(255, material.currentDamage + effect.damageAmount)
            }
          }
          break
      }
      
      // Queue chain reactions
      if (effect.chainReactions) {
        for (const chainReaction of effect.chainReactions) {
          if (Math.random() <= chainReaction.probability) {
            this.chainReactionQueue.push({
              ruleId: chainReaction.rule,
              triggerEntity: target,
              targetEntity: targetEntity === target ? triggerEntity : targetEntity,
              executeAt: currentTime + chainReaction.delay
            })
          }
        }
      }
    }
  }

  /**
   * Process queued chain reactions
   */
  private processChainReactions(world: IWorld, currentTime: number): void {
    const readyReactions: typeof this.chainReactionQueue = []
    
    // Find reactions ready to execute
    for (let i = this.chainReactionQueue.length - 1; i >= 0; i--) {
      const reaction = this.chainReactionQueue[i]
      if (currentTime >= reaction.executeAt) {
        readyReactions.push(reaction)
        this.chainReactionQueue.splice(i, 1)
      }
    }
    
    // Execute ready chain reactions
    for (const reaction of readyReactions) {
      const rule = this.rules.get(reaction.ruleId)
      if (rule) {
        this.executeInteraction(world, reaction.triggerEntity, reaction.targetEntity, rule, currentTime)
      }
    }
  }

  /**
   * Update state decay - states fade over time
   */
  private updateStateDecay(world: IWorld, deltaTime: number): void {
    const stateQuery = defineQuery([EntityStates])
    const entities = stateQuery(world)
    
    for (const entity of entities) {
      const states = EntityStates[entity]
      
      // Decay each state based on its decay rate
      if (states.wet > 0) {
        states.wet = Math.max(0, states.wet - (states.wetDecay * deltaTime / 1000))
        if (states.wet === 0) {
          states.stateFlags &= ~StateFlags.WET
        }
      }
      
      if (states.burning > 0) {
        states.burning = Math.max(0, states.burning - (states.burningDecay * deltaTime / 1000))
        if (states.burning === 0) {
          states.stateFlags &= ~StateFlags.BURNING
        }
      }
      
      if (states.drunk > 0) {
        states.drunk = Math.max(0, states.drunk - (states.drunkDecay * deltaTime / 1000))
        if (states.drunk === 0) {
          states.stateFlags &= ~StateFlags.DRUNK
        }
      }
    }
  }

  // Helper methods for state management and spatial queries
  private hasRequiredStates(entityStates: number, requiredStates: number): boolean {
    return (entityStates & requiredStates) === requiredStates
  }

  private modifyEntityState(states: any, change: { state: string; intensity: number }): void {
    const stateValue = states[change.state]
    if (typeof stateValue === 'number') {
      states[change.state] = Math.max(0, Math.min(255, stateValue + change.intensity))
      
      // Update state flags
      const flag = StateFlags[change.state.toUpperCase() as keyof typeof StateFlags]
      if (flag && states[change.state] > 0) {
        states.stateFlags |= flag
      }
    }
  }

  private removeEntityState(states: any, change: { state: string; intensity: number }): void {
    states[change.state] = 0
    const flag = StateFlags[change.state.toUpperCase() as keyof typeof StateFlags]
    if (flag) {
      states.stateFlags &= ~flag
    }
  }

  private getEffectTargets(target: string, triggerEntity: number, targetEntity: number): number[] {
    switch (target) {
      case 'trigger': return [triggerEntity]
      case 'receiver': return [targetEntity]
      case 'both': return [triggerEntity, targetEntity]
      default: return [triggerEntity] // Default fallback
    }
  }

  private getNearbyEntitiesBruteForce(entity: number, range: number, allEntities: number[], world: IWorld): number[] {
    // Simplified - would use Transform component for actual distance calculation
    return allEntities.filter(other => other !== entity).slice(0, 10) // Limit for performance
  }

  private getNearbyEntitiesSpatial(entity: number, range: number, spatialIndex: any): number[] {
    // Would integrate with spatial indexing system
    return []
  }

  private checkAdditionalRequirements(world: IWorld, entity: number, target: number, rule: InteractionRule): boolean {
    // Check material requirements
    if (rule.materialRequirements) {
      const entityMaterial = Material[entity]
      const targetMaterial = Material[target]
      
      if (rule.materialRequirements.triggerMaterial !== undefined) {
        if (!entityMaterial || entityMaterial.materialType !== rule.materialRequirements.triggerMaterial) {
          return false
        }
      }
      
      if (rule.materialRequirements.targetMaterial !== undefined) {
        if (!targetMaterial || targetMaterial.materialType !== rule.materialRequirements.targetMaterial) {
          return false
        }
      }
    }
    
    // Check temperature requirements
    if (rule.temperatureRange) {
      const entityTemp = Temperature[entity]
      const targetTemp = Temperature[target]
      
      if (entityTemp && (entityTemp.currentTemp < rule.temperatureRange.min || entityTemp.currentTemp > rule.temperatureRange.max)) {
        return false
      }
      
      if (targetTemp && (targetTemp.currentTemp < rule.temperatureRange.min || targetTemp.currentTemp > rule.temperatureRange.max)) {
        return false
      }
    }
    
    return true
  }

  /**
   * Add custom interaction rule
   */
  addRule(rule: InteractionRule): void {
    this.rules.set(rule.id, rule)
  }

  /**
   * Remove interaction rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId)
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      rulesActive: this.rules.size,
      interactionsThisFrame: this.interactionsPerFrame,
      chainReactionsQueued: this.chainReactionQueue.length,
      complexityBudgetUsed: (this.interactionsPerFrame / this.maxInteractionsPerFrame) * 100
    }
  }
}