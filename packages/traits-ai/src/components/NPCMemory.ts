import { defineComponent, Types } from 'bitecs'

/**
 * Memory system for NPCs - tracks what they know, who they've met, and what they've seen
 * This enables realistic information flow and dynamic dialogue
 */
export const NPCMemory = defineComponent({
  // Memory capacity and decay
  memoryCapacity: { type: 'ui16', default: 100 },      // Max memories stored
  memoryDecayRate: { type: 'ui8', default: 1 },       // How fast memories fade
  
  // Memory stats
  totalMemories: { type: 'ui16', default: 0 },        // Current memory count
  importantMemories: { type: 'ui8', default: 0 },     // Memories marked important
  
  // Relationship memories
  knownEntities: { type: 'ui16', default: 0 },        // Number of entities remembered
  trustedEntities: { type: 'ui8', default: 0 },       // Entities marked as trusted
  
  // Knowledge domains (0-255 scale of expertise)
  locationKnowledge: { type: 'ui8', default: 50 },    // Knowledge of world geography
  factionKnowledge: { type: 'ui8', default: 30 },     // Understanding of factions
  technologyKnowledge: { type: 'ui8', default: 20 },  // Tech/hacking knowledge
  survivalKnowledge: { type: 'ui8', default: 100 },   // Survival tips and tricks
  
  // Memory processing
  lastMemoryUpdate: { type: 'ui32', default: 0 },     // Timestamp of last update
  memoryDirty: { type: 'ui8', default: 0 },           // Needs persistence
  
  // Information sharing
  willingnessToShare: { type: 'ui8', default: 128 }, // How freely they share info
  gossipy: { type: 'ui8', default: 100 },            // Tendency to spread rumors
  discretion: { type: 'ui8', default: 128 },         // Keeps secrets vs shares
  
  // Trust and verification  
  gullibility: { type: 'ui8', default: 128 },        // Believes without verification
  skepticism: { type: 'ui8', default: 128 },         // Questions information
  
  // Memory ID for JSON storage lookup
  memoryStorageId: { type: 'ui32', default: 0 }      // Unique ID for save file
})