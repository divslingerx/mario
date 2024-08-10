/*
NPC Knowledge Component:
- Memory of resource locations and entities
- Social relationships and reputation
- Environmental awareness (guards, witnesses)
*/

import { defineComponent } from 'bitecs'

export const NPCKnowledge = defineComponent({
  // Known resource locations (entity IDs)
  knownFood: { type: 'ui32', array: 32 },      // Food sources
  knownWater: { type: 'ui32', array: 16 },     // Water sources
  knownShelter: { type: 'ui32', array: 8 },    // Shelter locations
  knownTools: { type: 'ui32', array: 16 },     // Tool locations
  knownDangers: { type: 'ui32', array: 16 },   // Dangerous entities/areas
  
  // Social knowledge
  knownAllies: { type: 'ui32', array: 16 },    // Friendly entities
  knownEnemies: { type: 'ui32', array: 16 },   // Hostile entities
  knownTraders: { type: 'ui32', array: 8 },    // NPCs who trade
  
  // Environmental awareness
  guardsNearby: { type: 'ui8', default: 0 },   // Are guards watching?
  witnessCount: { type: 'ui8', default: 0 },   // How many NPCs can see us?
  lastSeenGuard: { type: 'f64', default: 0 },  // When did we last see a guard?
  
  // Memory decay
  memoryDecayRate: { type: 'f32', default: 0.1 } // How fast we forget things
})