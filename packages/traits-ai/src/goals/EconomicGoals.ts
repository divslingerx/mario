import { NPCGoal } from '../types/GOAPTypes'

/**
 * Economic goals focused on wealth, resources, and trade
 */
export const EconomicGoals: NPCGoal[] = [
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
    id: 2007,
    name: 'Establish Trade Route',
    desiredConditions: [
      { type: 'tradeRoute', comparison: '>', value: 1 } // Have active trade
    ],
    basePriority: 45,
    priorityFactors: {
      personalityMultiplier: [
        { trait: 'intelligence', factor: 1.4 },
        { trait: 'patience', factor: 1.3 },
        { trait: 'charisma', factor: 1.2 }
      ]
    },
    maxPlanLength: 15,
    timeout: 2400000 // 40 minutes
  },
  
  {
    id: 2008,
    name: 'Build Business Empire',
    desiredConditions: [
      { type: 'ownedBusinesses', comparison: '>', value: 3 }
    ],
    basePriority: 60,
    priorityFactors: {
      personalityMultiplier: [
        { trait: 'ambition', factor: 2.0 },
        { trait: 'intelligence', factor: 1.6 },
        { trait: 'leadership', factor: 1.4 }
      ]
    },
    maxPlanLength: 20,
    timeout: 3600000 // 60 minutes
  },
  
  {
    id: 2009,
    name: 'Secure Resources',
    desiredConditions: [
      { type: 'resourceSecurity', comparison: '>', value: 80 } // 80% resource security
    ],
    basePriority: 40,
    priorityFactors: {
      personalityMultiplier: [
        { trait: 'paranoia', factor: 1.8 },
        { trait: 'intelligence', factor: 1.3 },
        { trait: 'prudence', factor: 1.5 }
      ]
    },
    maxPlanLength: 10,
    timeout: 1800000 // 30 minutes
  }
]