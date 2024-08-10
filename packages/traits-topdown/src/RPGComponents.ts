/*
Top-Down RPG Component System:
- Classic Fallout-style RPG mechanics with modern performance
- Configurable stats system supporting different RPG progression models
- Inventory system with item stacking and equipment slots
- Dialog system for rich NPC interactions and quest delivery
*/

import { defineComponent } from 'bitecs'

// Character progression and stats
export const RPGStats = defineComponent({
  // Core SPECIAL-style attributes (Fallout inspired)
  strength: { type: 'ui8', default: 5 },
  perception: { type: 'ui8', default: 5 },
  endurance: { type: 'ui8', default: 5 },
  charisma: { type: 'ui8', default: 5 },
  intelligence: { type: 'ui8', default: 5 },
  agility: { type: 'ui8', default: 5 },
  luck: { type: 'ui8', default: 5 },
  
  // Derived stats
  hitPoints: { type: 'ui16', default: 100 },
  maxHitPoints: { type: 'ui16', default: 100 },
  actionPoints: { type: 'ui8', default: 10 },
  maxActionPoints: { type: 'ui8', default: 10 },
  
  // Experience and progression
  experience: { type: 'ui32', default: 0 },
  level: { type: 'ui8', default: 1 },
  skillPoints: { type: 'ui16', default: 0 }
})

// Skill system for character specialization
export const RPGSkills = defineComponent({
  // Combat skills
  smallGuns: { type: 'ui8', default: 25 },
  bigGuns: { type: 'ui8', default: 10 },
  energyWeapons: { type: 'ui8', default: 10 },
  unarmed: { type: 'ui8', default: 30 },
  melee: { type: 'ui8', default: 20 },
  
  // Utility skills
  lockpick: { type: 'ui8', default: 10 },
  steal: { type: 'ui8', default: 5 },
  speech: { type: 'ui8', default: 25 },
  barter: { type: 'ui8', default: 20 },
  medicine: { type: 'ui8', default: 15 },
  science: { type: 'ui8', default: 10 },
  repair: { type: 'ui8', default: 15 }
})

// Inventory system with item management
export const Inventory = defineComponent({
  // Slot-based inventory (could be expanded to grid-based)
  slots: { type: 'ui32', array: 50 }, // Item IDs
  quantities: { type: 'ui16', array: 50 }, // Stack sizes
  maxSlots: { type: 'ui8', default: 50 },
  weightCarried: { type: 'f32', default: 0 },
  maxWeight: { type: 'f32', default: 100 },
  
  // Equipment slots
  weaponSlot: { type: 'ui32', default: 0 },
  armorSlot: { type: 'ui32', default: 0 },
  accessorySlots: { type: 'ui32', array: 4 }
})

// Item definition component
export const Item = defineComponent({
  itemId: { type: 'ui32' },
  name: { type: 'ui32' }, // String ID for localization
  description: { type: 'ui32' }, // String ID
  weight: { type: 'f32', default: 1 },
  value: { type: 'ui32', default: 1 },
  stackSize: { type: 'ui16', default: 1 },
  itemType: { type: 'ui8' }, // 0=misc, 1=weapon, 2=armor, 3=consumable
  
  // Weapon properties
  damage: { type: 'ui16', default: 0 },
  range: { type: 'ui16', default: 1 },
  actionPointCost: { type: 'ui8', default: 4 },
  
  // Armor properties
  damageResistance: { type: 'ui8', default: 0 },
  damageThreshold: { type: 'ui8', default: 0 },
  
  // Consumable properties
  healAmount: { type: 'ui16', default: 0 },
  statModifier: { type: 'i8', default: 0 },
  statType: { type: 'ui8', default: 0 }
})

// Dialog system for NPC interactions
export const DialogNPC = defineComponent({
  dialogId: { type: 'ui32' },
  currentNode: { type: 'ui32', default: 0 },
  questGiver: { type: 'ui8', default: 0 },
  trader: { type: 'ui8', default: 0 },
  faction: { type: 'ui8', default: 0 },
  disposition: { type: 'i8', default: 0 } // -100 to 100 reputation
})

// Quest system components
export const QuestGiver = defineComponent({
  availableQuests: { type: 'ui32', array: 10 },
  questCount: { type: 'ui8', default: 0 }
})

export const QuestTracker = defineComponent({
  activeQuests: { type: 'ui32', array: 20 },
  questProgress: { type: 'ui16', array: 20 }, // Progress values
  questStates: { type: 'ui8', array: 20 }, // 0=inactive, 1=active, 2=complete, 3=failed
  questCount: { type: 'ui8', default: 0 }
})

// Combat system for turn-based/real-time combat
export const CombatActor = defineComponent({
  actionPointsRemaining: { type: 'ui8', default: 10 },
  isInCombat: { type: 'ui8', default: 0 },
  initiative: { type: 'ui8', default: 10 },
  combatTurn: { type: 'ui8', default: 0 },
  
  // Combat state
  lastAttacker: { type: 'ui32', default: 0 },
  damageDealt: { type: 'ui16', default: 0 },
  damageTaken: { type: 'ui16', default: 0 }
})

// Line of sight for stealth and detection
export const LineOfSight = defineComponent({
  viewRange: { type: 'f32', default: 10 },
  viewAngle: { type: 'f32', default: 90 }, // degrees
  canSee: { type: 'ui32', array: 50 }, // Entity IDs in sight
  sightCount: { type: 'ui8', default: 0 },
  detectionRadius: { type: 'f32', default: 3 }, // Close detection
  stealthModifier: { type: 'i8', default: 0 }
})

// Faction system for complex NPC relationships
export const Faction = defineComponent({
  factionId: { type: 'ui8' },
  reputation: { type: 'i16', default: 0 }, // -1000 to 1000
  hostileToPlayer: { type: 'ui8', default: 0 },
  alliedFactions: { type: 'ui8', array: 10 },
  enemyFactions: { type: 'ui8', array: 10 }
})

// World interaction system
export const Interactable = defineComponent({
  interactionType: { type: 'ui8' }, // 0=examine, 1=use, 2=talk, 3=loot
  interactionRange: { type: 'f32', default: 2 },
  requiresItem: { type: 'ui32', default: 0 },
  skillCheck: { type: 'ui8', default: 0 }, // Required skill type
  skillLevel: { type: 'ui8', default: 0 }, // Required skill level
  usesRemaining: { type: 'ui8', default: 255 }, // 255 = infinite
  cooldownTime: { type: 'f32', default: 0 }
})

// Top-down movement with 8-directional support
export const TopDownMovement = defineComponent({
  moveSpeed: { type: 'f32', default: 100 }, // pixels per second
  runSpeed: { type: 'f32', default: 200 },
  isRunning: { type: 'ui8', default: 0 },
  facing: { type: 'ui8', default: 0 }, // 0-7 for 8 directions
  canMove: { type: 'ui8', default: 1 },
  
  // Input state
  inputX: { type: 'f32', default: 0 }, // -1 to 1
  inputY: { type: 'f32', default: 0 },
  inputRun: { type: 'ui8', default: 0 }
})

/*
RPG Configuration Interface:
- Enables different RPG systems (SPECIAL, D&D, custom)
- Configurable progression curves and stat caps
- Modular skill systems for different game styles
*/
export interface RPGConfig {
  statSystem: 'special' | 'dnd' | 'custom'
  maxStatValue: number
  startingStatPoints: number
  skillPointsPerLevel: number
  experienceCurve: 'linear' | 'exponential' | 'custom'
  combatMode: 'realtime' | 'turnbased' | 'hybrid'
  
  // Skill configuration
  skillCap: number
  skillStartingValues: Record<string, number>
  
  // Combat configuration
  maxActionPoints: number
  criticalHitChance: number
  
  // Inventory configuration
  inventoryType: 'slots' | 'grid' | 'unlimited'
  encumbranceSystem: boolean
  itemDurability: boolean
}