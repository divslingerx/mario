/*
Fire-Related Interaction Rules:
- Fire spreads to flammable materials
- Water extinguishes fire
- Temperature-based ignition
*/

import { InteractionRule } from '../types/InteractionTypes'
import { StateFlags } from '../types/StateFlags'
import { MaterialTypes } from '../components/Material'

export const FireRules: InteractionRule[] = [
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
      targetMaterial: MaterialTypes.WOOD
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
    id: 'fire_ignite_oil',
    name: 'Fire Ignites Oil',
    triggerStates: StateFlags.BURNING,
    targetStates: StateFlags.WET, // Oil-covered surfaces
    range: 12,
    probability: 0.95,
    cooldown: 50,
    repeatable: false,
    priority: 120,
    effects: [
      {
        type: 'addState',
        target: 'receiver',
        stateChange: { state: 'burning', intensity: 255, duration: 20000 }
      },
      {
        type: 'changeTemperature',
        target: 'receiver',
        temperatureChange: 200
      },
      {
        type: 'spawnParticles',
        target: 'receiver'
      },
      {
        chainReactions: [
          {
            probability: 0.9,
            delay: 200,
            rule: 'oil_explosion'
          }
        ]
      }
    ]
  }
]