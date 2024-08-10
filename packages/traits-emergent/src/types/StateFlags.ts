/*
State Flags for Bitwise Operations:
- Ultra-fast state checking using bit operations
- Can combine multiple states efficiently
- Extensible up to 32 different states
*/

export const StateFlags = {
  WET: 1 << 0,
  BURNING: 1 << 1,
  DRUNK: 1 << 2,
  DIRTY: 1 << 3,
  POISONED: 1 << 4,
  BLESSED: 1 << 5,
  CURSED: 1 << 6,
  MAGNETIC: 1 << 7,
  FROZEN: 1 << 8,
  ELECTRIFIED: 1 << 9,
  INVISIBLE: 1 << 10,
  FLYING: 1 << 11,
  SLEEPING: 1 << 12,
  ANGRY: 1 << 13,
  FRIGHTENED: 1 << 14,
  CONFUSED: 1 << 15,
  // Reserve 16 more for future expansion
} as const

export type StateFlagKey = keyof typeof StateFlags