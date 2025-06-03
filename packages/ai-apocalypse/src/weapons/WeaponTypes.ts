/**
 * Weapon system for AI Apocalypse - all weapons are themed around
 * hacking, electronics, and the human-AI conflict
 */

export enum WeaponCategory {
  HACKING = 'hacking',
  ELECTRICAL = 'electrical',
  DATA = 'data',
  SIGNAL = 'signal',
  KINETIC = 'kinetic',
  HYBRID = 'hybrid'
}

export enum DamageType {
  LOGIC = 'logic',        // Damages AI logic systems
  ELECTRICAL = 'electrical', // Overloads circuits
  DATA = 'data',          // Corrupts data/memory
  KINETIC = 'kinetic',    // Physical damage
  BIOLOGICAL = 'biological', // Affects organics
  NEURAL = 'neural'       // Affects both AI and human minds
}

export interface WeaponStats {
  id: string
  name: string
  category: WeaponCategory
  damageTypes: DamageType[]
  baseDamage: number
  range: number
  cooldown: number
  energyCost: number
  description: string
  
  // Special properties
  penetration?: number     // Bypasses armor/firewalls
  spread?: number         // Area effect
  duration?: number       // For DoT effects
  hackingPower?: number   // For digital attacks
  empRadius?: number      // For EMP effects
}

/**
 * Unique weapons for our AI apocalypse world
 */
export const Weapons: Record<string, WeaponStats> = {
  // Hacking Weapons
  'logic_bomb': {
    id: 'logic_bomb',
    name: 'Logic Bomb',
    category: WeaponCategory.HACKING,
    damageTypes: [DamageType.LOGIC, DamageType.DATA],
    baseDamage: 40,
    range: 150,
    cooldown: 2000,
    energyCost: 30,
    description: 'Deploys paradoxical code that crashes AI systems',
    hackingPower: 75,
    duration: 3000
  },
  
  'neural_spike': {
    id: 'neural_spike',
    name: 'Neural Spike',
    category: WeaponCategory.HACKING,
    damageTypes: [DamageType.NEURAL],
    baseDamage: 25,
    range: 100,
    cooldown: 1000,
    energyCost: 20,
    description: 'Direct neural interface attack - works on both AI and augmented humans',
    penetration: 50,
    hackingPower: 60
  },
  
  // Electrical Weapons
  'emp_pulse': {
    id: 'emp_pulse',
    name: 'EMP Pulse Generator',
    category: WeaponCategory.ELECTRICAL,
    damageTypes: [DamageType.ELECTRICAL],
    baseDamage: 50,
    range: 200,
    cooldown: 5000,
    energyCost: 50,
    description: 'Electromagnetic pulse that disables electronics',
    empRadius: 150,
    spread: 150
  },
  
  'tesla_arc': {
    id: 'tesla_arc',
    name: 'Tesla Arc Projector',
    category: WeaponCategory.ELECTRICAL,
    damageTypes: [DamageType.ELECTRICAL, DamageType.KINETIC],
    baseDamage: 35,
    range: 120,
    cooldown: 500,
    energyCost: 15,
    description: 'Chains lightning between multiple targets',
    spread: 60
  },
  
  // Data Weapons
  'virus_injector': {
    id: 'virus_injector',
    name: 'Virus Injector',
    category: WeaponCategory.DATA,
    damageTypes: [DamageType.DATA],
    baseDamage: 20,
    range: 80,
    cooldown: 1500,
    energyCost: 25,
    description: 'Injects malicious code that spreads between networked enemies',
    duration: 10000,
    hackingPower: 90
  },
  
  'memory_scrambler': {
    id: 'memory_scrambler',
    name: 'Memory Scrambler',
    category: WeaponCategory.DATA,
    damageTypes: [DamageType.DATA, DamageType.NEURAL],
    baseDamage: 30,
    range: 100,
    cooldown: 2000,
    energyCost: 35,
    description: 'Corrupts memory banks, causing confusion and errors',
    penetration: 30
  },
  
  // Signal Weapons
  'signal_jammer': {
    id: 'signal_jammer',
    name: 'Signal Jammer',
    category: WeaponCategory.SIGNAL,
    damageTypes: [DamageType.DATA],
    baseDamage: 10,
    range: 300,
    cooldown: 100,
    energyCost: 5,
    description: 'Prevents AI communication and coordination',
    spread: 200,
    duration: 5000
  },
  
  'feedback_loop': {
    id: 'feedback_loop',
    name: 'Feedback Loop Generator',
    category: WeaponCategory.SIGNAL,
    damageTypes: [DamageType.ELECTRICAL, DamageType.LOGIC],
    baseDamage: 45,
    range: 150,
    cooldown: 3000,
    energyCost: 40,
    description: 'Creates destructive feedback in AI sensor arrays'
  },
  
  // Kinetic Weapons (for when hacking fails)
  'rail_rifle': {
    id: 'rail_rifle',
    name: 'Salvaged Rail Rifle',
    category: WeaponCategory.KINETIC,
    damageTypes: [DamageType.KINETIC],
    baseDamage: 80,
    range: 500,
    cooldown: 2000,
    energyCost: 60,
    description: 'Magnetically accelerated projectiles for heavy armor',
    penetration: 90
  },
  
  'plasma_cutter': {
    id: 'plasma_cutter',
    name: 'Industrial Plasma Cutter',
    category: WeaponCategory.KINETIC,
    damageTypes: [DamageType.KINETIC, DamageType.ELECTRICAL],
    baseDamage: 60,
    range: 50,
    cooldown: 100,
    energyCost: 10,
    description: 'Repurposed industrial tool for close combat'
  },
  
  // Hybrid Weapons
  'network_blade': {
    id: 'network_blade',
    name: 'Network Blade',
    category: WeaponCategory.HYBRID,
    damageTypes: [DamageType.KINETIC, DamageType.DATA],
    baseDamage: 40,
    range: 30,
    cooldown: 300,
    energyCost: 15,
    description: 'Physical blade that also injects malware on contact',
    penetration: 50,
    hackingPower: 40
  },
  
  'quantum_disruptor': {
    id: 'quantum_disruptor',
    name: 'Quantum Disruptor',
    category: WeaponCategory.HYBRID,
    damageTypes: [DamageType.LOGIC, DamageType.ELECTRICAL, DamageType.NEURAL],
    baseDamage: 70,
    range: 200,
    cooldown: 8000,
    energyCost: 100,
    description: 'Experimental weapon that disrupts quantum processors',
    penetration: 100,
    spread: 100
  }
}

/**
 * Status effects that weapons can apply
 */
export enum StatusEffect {
  CONFUSED = 'confused',         // AI makes poor decisions
  CORRUPTED = 'corrupted',       // Gradual data loss
  DISCONNECTED = 'disconnected', // Cut off from network
  OVERLOADED = 'overloaded',     // Electrical damage over time
  HACKED = 'hacked',             // Temporarily controlled
  SCRAMBLED = 'scrambled',       // Sensors malfunction
  SHUTDOWN = 'shutdown'          // Complete system failure
}

/**
 * Ammunition types for kinetic weapons
 */
export interface AmmoType {
  id: string
  name: string
  damageModifier: number
  specialEffects: StatusEffect[]
  description: string
}

export const AmmoTypes: Record<string, AmmoType> = {
  'ap_rounds': {
    id: 'ap_rounds',
    name: 'Armor Piercing Rounds',
    damageModifier: 1.2,
    specialEffects: [],
    description: 'Tungsten core for penetrating heavy armor'
  },
  
  'emp_rounds': {
    id: 'emp_rounds',
    name: 'EMP Rounds',
    damageModifier: 0.8,
    specialEffects: [StatusEffect.OVERLOADED],
    description: 'Delivers electromagnetic pulse on impact'
  },
  
  'virus_rounds': {
    id: 'virus_rounds',
    name: 'Virus Payload Rounds',
    damageModifier: 0.6,
    specialEffects: [StatusEffect.CORRUPTED, StatusEffect.HACKED],
    description: 'Injects malware through kinetic impact'
  }
}