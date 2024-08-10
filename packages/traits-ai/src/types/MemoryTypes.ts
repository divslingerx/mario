/**
 * Memory system types for NPC knowledge and recall
 */

export interface Memory {
  id: string
  type: MemoryType
  subject: string                    // What/who this memory is about
  timestamp: number                  // When it was created
  lastAccessed: number              // Last time recalled
  importance: number                // 0-255, affects retention
  accuracy: number                  // 0-255, can degrade over time
  emotionalWeight: number           // -128 to 127, positive/negative
  source: MemorySource              // How this was learned
  tags: string[]                    // For categorization/search
  data: Record<string, any>         // Type-specific data
}

export enum MemoryType {
  // People and relationships
  PERSON_MET = 'person_met',
  CONVERSATION = 'conversation',
  RELATIONSHIP_CHANGE = 'relationship_change',
  
  // Events witnessed
  EVENT_WITNESSED = 'event_witnessed',
  COMBAT_ENCOUNTER = 'combat_encounter',
  DEATH_WITNESSED = 'death_witnessed',
  
  // Information learned
  FACT_LEARNED = 'fact_learned',
  LOCATION_DISCOVERED = 'location_discovered',
  SECRET_LEARNED = 'secret_learned',
  RUMOR_HEARD = 'rumor_heard',
  
  // Personal experiences
  INJURY_SUFFERED = 'injury_suffered',
  ITEM_FOUND = 'item_found',
  QUEST_COMPLETED = 'quest_completed',
  
  // Environmental
  DANGER_AREA = 'danger_area',
  SAFE_ZONE = 'safe_zone',
  RESOURCE_LOCATION = 'resource_location'
}

export enum MemorySource {
  DIRECT_EXPERIENCE = 'direct',      // Personally witnessed/experienced
  TOLD_BY_TRUSTED = 'trusted_source', // Heard from trusted source
  TOLD_BY_STRANGER = 'stranger',     // Heard from unknown source
  OVERHEARD = 'overheard',          // Eavesdropped
  DEDUCED = 'deduced',              // Figured out from other info
  IMPLANTED = 'implanted'           // False memory or manipulation
}

export interface PersonMemory extends Memory {
  type: MemoryType.PERSON_MET
  data: {
    entityId: number
    name?: string
    faction?: string
    trustLevel: number              // -100 to 100
    lastSeen: number               // Timestamp
    lastLocation?: string
    characteristics: string[]       // Notable features
    interactions: number           // Times interacted
  }
}

export interface ConversationMemory extends Memory {
  type: MemoryType.CONVERSATION
  data: {
    participants: number[]         // Entity IDs
    topics: string[]              // What was discussed
    learned: string[]             // New information gained
    promises: string[]            // Commitments made
    mood: string                  // Tone of conversation
  }
}

export interface LocationMemory extends Memory {
  type: MemoryType.LOCATION_DISCOVERED
  data: {
    locationId: string
    coordinates?: { x: number; y: number }
    safety: number                // 0-255
    resources: string[]           // Available resources
    inhabitants: string[]         // Who lives there
    lastVisited: number          // Timestamp
  }
}

export interface FactMemory extends Memory {
  type: MemoryType.FACT_LEARNED
  data: {
    category: string              // tech, faction, survival, etc
    fact: string                  // The actual information
    confidence: number            // How sure they are
    verifiedBy: string[]         // Other sources confirming
    contradictedBy: string[]     // Conflicting information
  }
}

/**
 * Memory storage format for persistence
 */
export interface StoredMemoryData {
  entityId: number
  memories: Memory[]
  lastSaved: number
  version: string
}

/**
 * CSV format for memory logs (simpler analysis)
 */
export interface MemoryLogEntry {
  entityId: number
  timestamp: number
  memoryType: MemoryType
  subject: string
  importance: number
  source: MemorySource
  tags: string                    // Comma-separated
}