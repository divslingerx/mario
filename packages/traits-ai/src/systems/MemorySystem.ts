import { defineQuery, IWorld } from 'bitecs'
import { NPCMemory } from '../components'
import { 
  Memory, 
  MemoryType, 
  MemorySource, 
  PersonMemory,
  ConversationMemory,
  LocationMemory,
  FactMemory,
  StoredMemoryData,
  MemoryLogEntry
} from '../types/MemoryTypes'
import { MemoryStore, MemoryStoreFactory } from './MemoryPersistence'

/**
 * Manages NPC memory storage, retrieval, and decay
 * Handles information spreading between NPCs
 */
export class MemorySystem {
  // In-memory storage (will be persisted to JSON)
  private memories = new Map<number, Memory[]>()
  
  // Memory log for CSV export (simpler analysis)
  private memoryLog: MemoryLogEntry[] = []
  
  // Configuration
  private maxMemoriesPerNPC = 100
  private memoryDecayInterval = 60000 // 1 minute
  private lastDecayUpdate = 0
  
  // Persistence layer
  private store: MemoryStore
  
  constructor(store?: MemoryStore) {
    // Default to in-memory store
    this.store = store || MemoryStoreFactory.create('memory')
  }
  
  /**
   * Update memory system - handle decay and cleanup
   */
  update(world: IWorld, deltaTime: number): void {
    const currentTime = Date.now()
    
    // Periodic memory decay
    if (currentTime - this.lastDecayUpdate > this.memoryDecayInterval) {
      this.decayMemories(world)
      this.lastDecayUpdate = currentTime
    }
    
    // Process memory sharing between nearby NPCs
    this.shareMemories(world)
  }
  
  /**
   * Add a memory to an NPC
   */
  addMemory(entityId: number, memory: Memory): void {
    if (!this.memories.has(entityId)) {
      this.memories.set(entityId, [])
    }
    
    const npcMemories = this.memories.get(entityId)!
    
    // Check for duplicate memories
    const existingIndex = npcMemories.findIndex(m => 
      m.type === memory.type && 
      m.subject === memory.subject &&
      Math.abs(m.timestamp - memory.timestamp) < 5000 // Within 5 seconds
    )
    
    if (existingIndex >= 0) {
      // Update existing memory instead of duplicating
      const existing = npcMemories[existingIndex]
      existing.importance = Math.max(existing.importance, memory.importance)
      existing.lastAccessed = Date.now()
      existing.accuracy = (existing.accuracy + memory.accuracy) / 2
      return
    }
    
    // Add new memory
    npcMemories.push(memory)
    
    // Log for CSV export
    this.memoryLog.push({
      entityId,
      timestamp: memory.timestamp,
      memoryType: memory.type,
      subject: memory.subject,
      importance: memory.importance,
      source: memory.source,
      tags: memory.tags.join(',')
    })
    
    // Enforce memory capacity
    if (npcMemories.length > this.maxMemoriesPerNPC) {
      this.forgetLeastImportant(entityId)
    }
  }
  
  /**
   * Retrieve memories about a specific subject
   */
  getMemoriesAbout(entityId: number, subject: string): Memory[] {
    const npcMemories = this.memories.get(entityId) || []
    return npcMemories.filter(m => 
      m.subject === subject || 
      m.tags.includes(subject)
    ).sort((a, b) => b.importance - a.importance)
  }
  
  /**
   * Check if NPC knows about something
   */
  knowsAbout(entityId: number, subject: string): boolean {
    return this.getMemoriesAbout(entityId, subject).length > 0
  }
  
  /**
   * Get most recent memories
   */
  getRecentMemories(entityId: number, count = 10): Memory[] {
    const npcMemories = this.memories.get(entityId) || []
    return [...npcMemories]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count)
  }
  
  /**
   * Create a person memory when meeting someone
   */
  rememberPerson(
    entityId: number, 
    targetId: number, 
    name?: string,
    trustLevel = 0
  ): void {
    const memory: PersonMemory = {
      id: `person_${targetId}_${Date.now()}`,
      type: MemoryType.PERSON_MET,
      subject: `entity_${targetId}`,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      importance: 100,
      accuracy: 255,
      emotionalWeight: trustLevel,
      source: MemorySource.DIRECT_EXPERIENCE,
      tags: ['person', name || `unknown_${targetId}`],
      data: {
        entityId: targetId,
        name,
        trustLevel,
        lastSeen: Date.now(),
        characteristics: [],
        interactions: 1
      }
    }
    
    this.addMemory(entityId, memory)
  }
  
  /**
   * Record a conversation
   */
  rememberConversation(
    entityId: number,
    participants: number[],
    topics: string[],
    learned: string[] = []
  ): void {
    const memory: ConversationMemory = {
      id: `conv_${Date.now()}`,
      type: MemoryType.CONVERSATION,
      subject: `conversation_${participants.join('_')}`,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      importance: 80 + (learned.length * 20),
      accuracy: 255,
      emotionalWeight: 0,
      source: MemorySource.DIRECT_EXPERIENCE,
      tags: ['conversation', ...topics],
      data: {
        participants,
        topics,
        learned,
        promises: [],
        mood: 'neutral'
      }
    }
    
    this.addMemory(entityId, memory)
  }
  
  /**
   * Learn a fact from someone
   */
  learnFact(
    entityId: number,
    fact: string,
    category: string,
    source: MemorySource,
    confidence = 128
  ): void {
    const memory: FactMemory = {
      id: `fact_${Date.now()}`,
      type: MemoryType.FACT_LEARNED,
      subject: fact,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      importance: confidence,
      accuracy: source === MemorySource.DIRECT_EXPERIENCE ? 255 : 128,
      emotionalWeight: 0,
      source,
      tags: ['fact', category],
      data: {
        category,
        fact,
        confidence,
        verifiedBy: [],
        contradictedBy: []
      }
    }
    
    this.addMemory(entityId, memory)
  }
  
  /**
   * Decay memories over time
   */
  private decayMemories(world: IWorld): void {
    const memoryQuery = defineQuery([NPCMemory])
    const entities = memoryQuery(world)
    
    for (const entity of entities) {
      const npcMemories = this.memories.get(entity) || []
      const currentTime = Date.now()
      
      // Decay accuracy and importance
      for (const memory of npcMemories) {
        const age = currentTime - memory.timestamp
        const daysSinceAccess = (currentTime - memory.lastAccessed) / 86400000
        
        // Memories decay faster if not accessed
        if (daysSinceAccess > 7) {
          memory.accuracy = Math.max(0, memory.accuracy - 5)
          memory.importance = Math.max(0, memory.importance - 2)
        }
        
        // Very old memories decay regardless
        if (age > 30 * 86400000) { // 30 days
          memory.accuracy = Math.max(0, memory.accuracy - 10)
        }
      }
      
      // Remove completely forgotten memories
      const filteredMemories = npcMemories.filter(m => 
        m.importance > 0 && m.accuracy > 0
      )
      
      if (filteredMemories.length < npcMemories.length) {
        this.memories.set(entity, filteredMemories)
      }
    }
  }
  
  /**
   * Share memories between nearby NPCs
   */
  private shareMemories(world: IWorld): void {
    const memoryQuery = defineQuery([NPCMemory])
    const entities = memoryQuery(world)
    
    // Simple proximity-based sharing (would integrate with spatial system)
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i]
        const entity2 = entities[j]
        
        // Check if they're close enough to talk (simplified)
        if (this.canShare(entity1, entity2, world)) {
          this.exchangeInformation(entity1, entity2, world)
        }
      }
    }
  }
  
  /**
   * Exchange information between two NPCs
   */
  private exchangeInformation(entity1: number, entity2: number, world: IWorld): void {
    const memory1 = NPCMemory[entity1]
    const memory2 = NPCMemory[entity2]
    
    // Check willingness to share
    if (Math.random() > memory1.willingnessToShare / 255) return
    if (Math.random() > memory2.willingnessToShare / 255) return
    
    // Share a random recent memory
    const memories1 = this.getRecentMemories(entity1, 5)
    const memories2 = this.getRecentMemories(entity2, 5)
    
    if (memories1.length > 0 && Math.random() < memory1.gossipy / 255) {
      const shared = memories1[Math.floor(Math.random() * memories1.length)]
      this.transferMemory(entity1, entity2, shared, world)
    }
    
    if (memories2.length > 0 && Math.random() < memory2.gossipy / 255) {
      const shared = memories2[Math.floor(Math.random() * memories2.length)]
      this.transferMemory(entity2, entity1, shared, world)
    }
  }
  
  /**
   * Transfer a memory from one NPC to another
   */
  private transferMemory(
    fromEntity: number, 
    toEntity: number, 
    memory: Memory, 
    world: IWorld
  ): void {
    const receiver = NPCMemory[toEntity]
    
    // Create a degraded copy of the memory
    const transferredMemory: Memory = {
      ...memory,
      id: `${memory.id}_transferred_${Date.now()}`,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      source: MemorySource.TOLD_BY_TRUSTED, // Simplified
      accuracy: Math.floor(memory.accuracy * 0.8), // 20% accuracy loss
      importance: Math.floor(memory.importance * 0.7) // Less important secondhand
    }
    
    // Apply skepticism
    if (receiver.skepticism > 128) {
      transferredMemory.accuracy = Math.floor(transferredMemory.accuracy * 0.8)
    }
    
    // Add the transferred memory
    this.addMemory(toEntity, transferredMemory)
  }
  
  /**
   * Check if two entities can share information
   */
  private canShare(entity1: number, entity2: number, world: IWorld): boolean {
    // Simplified - would check actual distance, relationship, etc
    return Math.random() > 0.9 // 10% chance per update
  }
  
  /**
   * Forget least important memories when at capacity
   */
  private forgetLeastImportant(entityId: number): void {
    const npcMemories = this.memories.get(entityId)
    if (!npcMemories) return
    
    // Sort by importance and recency
    npcMemories.sort((a, b) => {
      const scoreA = a.importance * 0.7 + (Date.now() - a.timestamp) / 86400000
      const scoreB = b.importance * 0.7 + (Date.now() - b.timestamp) / 86400000
      return scoreA - scoreB
    })
    
    // Remove bottom 10%
    const toRemove = Math.ceil(npcMemories.length * 0.1)
    npcMemories.splice(0, toRemove)
  }
  
  /**
   * Save memories to JSON
   */
  saveToJSON(entityId: number): string {
    const data: StoredMemoryData = {
      entityId,
      memories: this.memories.get(entityId) || [],
      lastSaved: Date.now(),
      version: '1.0.0'
    }
    
    return JSON.stringify(data, null, 2)
  }
  
  /**
   * Load memories from JSON
   */
  loadFromJSON(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData) as StoredMemoryData
      this.memories.set(data.entityId, data.memories)
    } catch (error) {
      console.error('Failed to load memory data:', error)
    }
  }
  
  /**
   * Export memory log to CSV
   */
  exportLogToCSV(): string {
    const headers = 'entityId,timestamp,memoryType,subject,importance,source,tags\n'
    const rows = this.memoryLog.map(entry => 
      `${entry.entityId},${entry.timestamp},${entry.memoryType},` +
      `"${entry.subject}",${entry.importance},${entry.source},"${entry.tags}"`
    ).join('\n')
    
    return headers + rows
  }
  
  /**
   * Get memory statistics for an NPC
   */
  getMemoryStats(entityId: number): any {
    const npcMemories = this.memories.get(entityId) || []
    
    const typeCount = new Map<MemoryType, number>()
    let totalImportance = 0
    let totalAccuracy = 0
    
    for (const memory of npcMemories) {
      typeCount.set(memory.type, (typeCount.get(memory.type) || 0) + 1)
      totalImportance += memory.importance
      totalAccuracy += memory.accuracy
    }
    
    return {
      totalMemories: npcMemories.length,
      averageImportance: npcMemories.length > 0 ? totalImportance / npcMemories.length : 0,
      averageAccuracy: npcMemories.length > 0 ? totalAccuracy / npcMemories.length : 0,
      memoryTypes: Object.fromEntries(typeCount),
      oldestMemory: npcMemories.reduce((oldest, m) => 
        m.timestamp < oldest.timestamp ? m : oldest, 
        npcMemories[0] || null
      ),
      capacity: `${npcMemories.length}/${this.maxMemoriesPerNPC}`
    }
  }
}