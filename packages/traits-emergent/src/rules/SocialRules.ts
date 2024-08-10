/*
Social Interaction Rules:
- NPCs react to emergencies and events
- Emotional state spreading
- Group behaviors
*/

import { InteractionRule } from '../types/InteractionTypes'
import { StateFlags } from '../types/StateFlags'

export const SocialRules: InteractionRule[] = [
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
  },

  {
    id: 'fear_spreading',
    name: 'Fear Spreads Between NPCs',
    triggerStates: StateFlags.FRIGHTENED,
    targetStates: 0,
    range: 50,
    probability: 0.3,
    cooldown: 2000,
    repeatable: true,
    priority: 40,
    effects: [
      {
        type: 'addState',
        target: 'receiver',
        stateChange: { state: 'frightened', intensity: 120, duration: 8000 }
      },
      {
        chainReactions: [
          {
            probability: 0.4,
            delay: 1000,
            rule: 'panic_flee'
          }
        ]
      }
    ]
  },

  {
    id: 'crowd_gathering',
    name: 'NPCs Gather Around Interesting Events',
    triggerStates: StateFlags.BURNING | StateFlags.MAGNETIC, // Any interesting state
    targetStates: 0,
    range: 80,
    probability: 0.2,
    cooldown: 15000,
    repeatable: false,
    priority: 25,
    effects: [
      {
        type: 'addState',
        target: 'receiver',
        stateChange: { state: 'curious', intensity: 150, duration: 10000 }
      },
      {
        type: 'triggerSound',
        target: 'receiver'
      }
    ]
  },

  {
    id: 'anger_contagion',
    name: 'Anger Spreads in Crowds',
    triggerStates: StateFlags.ANGRY,
    targetStates: 0,
    range: 30,
    probability: 0.4,
    cooldown: 3000,
    repeatable: true,
    priority: 60,
    effects: [
      {
        type: 'addState',
        target: 'receiver',
        stateChange: { state: 'angry', intensity: 180, duration: 12000 }
      },
      {
        chainReactions: [
          {
            probability: 0.3,
            delay: 2000,
            rule: 'aggressive_behavior'
          }
        ]
      }
    ]
  }
]