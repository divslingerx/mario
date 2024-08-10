import { NPCGoal } from '../types/GOAPTypes'

/**
 * Social goals focused on relationships, reputation, and community standing
 */
export const SocialGoals: NPCGoal[] = [
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
  },
  
  {
    id: 2004,
    name: 'Build Friendships',
    desiredConditions: [
      { type: 'friendship', comparison: '>', value: 3 } // Have 3+ friends
    ],
    basePriority: 40,
    priorityFactors: {
      personalityMultiplier: [
        { trait: 'charisma', factor: 1.5 },
        { trait: 'empathy', factor: 1.2 },
        { trait: 'loneliness', factor: 2.0 }
      ]
    },
    maxPlanLength: 8,
    timeout: 1200000 // 20 minutes
  },
  
  {
    id: 2005,
    name: 'Gain Respect',
    desiredConditions: [
      { type: 'respect', comparison: '>', value: 75 }
    ],
    basePriority: 35,
    priorityFactors: {
      personalityMultiplier: [
        { trait: 'pride', factor: 1.8 },
        { trait: 'ambition', factor: 1.4 },
        { trait: 'courage', factor: 1.1 }
      ]
    },
    maxPlanLength: 10,
    timeout: 1800000 // 30 minutes
  },
  
  {
    id: 2006,
    name: 'Avoid Social Conflict',
    desiredConditions: [
      { type: 'enemies', comparison: '<', value: 2 } // Minimize enemies
    ],
    basePriority: 25,
    priorityFactors: {
      personalityMultiplier: [
        { trait: 'cowardice', factor: 1.6 },
        { trait: 'pacifism', factor: 1.4 },
        { trait: 'diplomacy', factor: 1.2 }
      ]
    },
    maxPlanLength: 5,
    timeout: 900000 // 15 minutes
  }
]