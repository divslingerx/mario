/*
Alcohol-Related Interaction Rules:
- Animals get drunk from consuming alcohol
- Drunk entities stumble and cause accidents
*/

import { InteractionRule } from '../types/InteractionTypes'
import { StateFlags } from '../types/StateFlags'

export const AlcoholRules: InteractionRule[] = [
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
    id: 'drunk_confusion',
    name: 'Drunk Entity Gets Confused',
    triggerStates: StateFlags.DRUNK,
    targetStates: 0,
    range: 0, // Self-effect
    probability: 0.1,
    cooldown: 3000,
    repeatable: true,
    priority: 20,
    effects: [
      {
        type: 'addState',
        target: 'trigger',
        stateChange: { state: 'confused', intensity: 80, duration: 5000 }
      }
    ]
  }
]