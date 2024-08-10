/*
Tool Acquisition Actions:
- Getting tools needed for other actions
- Part of multi-step planning (get axe → chop tree → get fruit)
*/

import { GOAPAction } from '../types/GOAPTypes'

export const ToolActions: GOAPAction[] = [
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
    id: 1007,
    name: 'Buy Axe from Merchant',
    preconditions: [
      { type: 'nearEntity', comparison: '<', value: 32 },
      { type: 'hasItem', item: 1001 }, // Gold
      { type: 'relationship', comparison: '>', value: 0 }
    ],
    effects: [
      { type: 'removeItem', target: 'self', item: 1001 },
      { type: 'addItem', target: 'self', item: 3001 }
    ],
    requiredItems: [1001],
    duration: 6000,
    range: 32,
    interruptible: true,
    moralCost: 0,
    socialCost: 0,
    riskLevel: 5,
    successChance: (npc, target, world) => 0.95
  },

  {
    id: 1008,
    name: 'Craft Simple Tool',
    preconditions: [
      { type: 'hasItem', item: 4001 }, // Raw materials
      { type: 'stat', state: 'intelligence', comparison: '>', value: 120 }
    ],
    effects: [
      { type: 'removeItem', target: 'self', item: 4001 },
      { type: 'addItem', target: 'self', item: 3001 }
    ],
    requiredItems: [4001],
    requiredStats: [{ stat: 'intelligence', minimum: 120 }],
    duration: 20000,       // Takes a long time
    range: 0,              // Self-action
    interruptible: true,
    moralCost: 0,
    socialCost: 0,
    riskLevel: 10,
    successChance: (npc, target, world) => 0.8
  }
]