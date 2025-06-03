/*
Emergent Behavior System - Main Export Index
Provides Dwarf Fortress-style emergent interactions between entities
*/

// Core system
export { EmergentBehaviorSystem, DefaultInteractionRules } from './EmergentBehavior'

// Components
export * from './components'

// Rules
export * from './rules'

// Types
export type {
  InteractionRule,
  InteractionEffect
} from './EmergentBehavior'

export { StateFlags } from './EmergentBehavior'
export * from './types/InteractionTypes'
export * from './types/StateFlags'