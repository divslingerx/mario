/*
Interaction Rule and Effect Type Definitions:
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
    state: string
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