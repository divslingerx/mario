/*
Survival Goals:
- Basic needs that drive NPC behavior
- Hunger, thirst, safety, shelter
*/

import { NPCGoal } from '../types/GOAPTypes'

export const SurvivalGoals: NPCGoal[] = [
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
    name: 'Find Water',
    desiredConditions: [
      { type: 'need', comparison: '<', value: 70 } // Reduce thirst
    ],
    basePriority: 120, // Higher than hunger - thirst kills faster
    priorityFactors: {
      needMultiplier: [
        { need: 'thirst', factor: 2.5 }
      ]
    },
    maxPlanLength: 6,
    timeout: 180000 // 3 minutes - more urgent
  },

  {
    id: 2003,
    name: 'Find Safe Shelter',
    desiredConditions: [
      { type: 'need', comparison: '<', value: 60 },
      { type: 'environmental', locationSafe: true }
    ],
    basePriority: 80,
    priorityFactors: {
      needMultiplier: [
        { need: 'safety', factor: 1.8 }
      ],
      personalityMultiplier: [
        { trait: 'paranoia', factor: 1.5 },
        { trait: 'courage', factor: -0.3 } // Brave NPCs care less about safety
      ]
    },
    maxPlanLength: 10,
    timeout: 600000 // 10 minutes
  },

  {
    id: 2004,
    name: 'Get Rest',
    desiredConditions: [
      { type: 'need', comparison: '<', value: 50 } // Reduce tiredness
    ],
    basePriority: 60,
    priorityFactors: {
      needMultiplier: [
        { need: 'sleep', factor: 1.5 }
      ],
      situationalMultiplier: [
        { condition: 'timeOfDay', factor: 2.0 } // Higher priority at night
      ]
    },
    maxPlanLength: 4,
    timeout: 480000 // 8 minutes
  }
]