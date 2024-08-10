/*
Food Acquisition Actions:
- Different moral/immoral ways to get food
- Your apple stealing scenario implemented here
*/

import { GOAPAction } from '../types/GOAPTypes'
import { NPCPersonality } from '../components/NPCPersonality'
import { NPCKnowledge } from '../components/NPCKnowledge'

export const FoodActions: GOAPAction[] = [
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
      { type: 'stat', state: 'strength', comparison: '>', value: 80 }
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