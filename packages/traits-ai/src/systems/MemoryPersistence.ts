import { Memory, StoredMemoryData, MemoryLogEntry } from '../types/MemoryTypes'

/**
 * Interface for memory persistence - can be implemented with different storage backends
 */
export interface MemoryStore {
  /**
   * Save all memories for an entity
   */
  saveMemories(entityId: number, memories: Memory[]): Promise<void>
  
  /**
   * Load all memories for an entity
   */
  loadMemories(entityId: number): Promise<Memory[]>
  
  /**
   * Save a single memory (for real-time updates)
   */
  saveMemory(entityId: number, memory: Memory): Promise<void>
  
  /**
   * Delete memories for an entity
   */
  deleteMemories(entityId: number): Promise<void>
  
  /**
   * Query memories by criteria
   */
  queryMemories(criteria: MemoryQuery): Promise<Memory[]>
  
  /**
   * Get storage statistics
   */
  getStats(): Promise<StorageStats>
}

/**
 * Query criteria for memory searches
 */
export interface MemoryQuery {
  entityId?: number
  type?: string
  subject?: string
  tags?: string[]
  minImportance?: number
  afterTimestamp?: number
  beforeTimestamp?: number
  limit?: number
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalMemories: number
  totalEntities: number
  storageSize?: number
  lastUpdated: number
}

/**
 * Simple JSON file implementation
 */
export class JSONMemoryStore implements MemoryStore {
  constructor(private basePath: string = './data/memories') {}
  
  async saveMemories(entityId: number, memories: Memory[]): Promise<void> {
    const data: StoredMemoryData = {
      entityId,
      memories,
      lastSaved: Date.now(),
      version: '1.0.0'
    }
    
    // In a real implementation, this would write to file system
    // For now, just log
    console.log(`Would save ${memories.length} memories for entity ${entityId}`)
  }
  
  async loadMemories(entityId: number): Promise<Memory[]> {
    // In a real implementation, this would read from file system
    console.log(`Would load memories for entity ${entityId}`)
    return []
  }
  
  async saveMemory(entityId: number, memory: Memory): Promise<void> {
    // Load existing, add new, save all
    const existing = await this.loadMemories(entityId)
    existing.push(memory)
    await this.saveMemories(entityId, existing)
  }
  
  async deleteMemories(entityId: number): Promise<void> {
    console.log(`Would delete memories for entity ${entityId}`)
  }
  
  async queryMemories(criteria: MemoryQuery): Promise<Memory[]> {
    // Simple implementation - load all and filter
    // A database implementation would be more efficient
    console.log('Would query memories with criteria:', criteria)
    return []
  }
  
  async getStats(): Promise<StorageStats> {
    return {
      totalMemories: 0,
      totalEntities: 0,
      lastUpdated: Date.now()
    }
  }
}

/**
 * In-memory store for testing/development
 */
export class InMemoryStore implements MemoryStore {
  private storage = new Map<number, Memory[]>()
  
  async saveMemories(entityId: number, memories: Memory[]): Promise<void> {
    this.storage.set(entityId, [...memories])
  }
  
  async loadMemories(entityId: number): Promise<Memory[]> {
    return [...(this.storage.get(entityId) || [])]
  }
  
  async saveMemory(entityId: number, memory: Memory): Promise<void> {
    const existing = this.storage.get(entityId) || []
    existing.push(memory)
    this.storage.set(entityId, existing)
  }
  
  async deleteMemories(entityId: number): Promise<void> {
    this.storage.delete(entityId)
  }
  
  async queryMemories(criteria: MemoryQuery): Promise<Memory[]> {
    let results: Memory[] = []
    
    // Collect all memories
    if (criteria.entityId !== undefined) {
      results = this.storage.get(criteria.entityId) || []
    } else {
      for (const memories of this.storage.values()) {
        results.push(...memories)
      }
    }
    
    // Apply filters
    if (criteria.type) {
      results = results.filter(m => m.type === criteria.type)
    }
    
    if (criteria.subject) {
      results = results.filter(m => m.subject === criteria.subject)
    }
    
    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(m => 
        criteria.tags!.some(tag => m.tags.includes(tag))
      )
    }
    
    if (criteria.minImportance !== undefined) {
      results = results.filter(m => m.importance >= criteria.minImportance!)
    }
    
    if (criteria.afterTimestamp !== undefined) {
      results = results.filter(m => m.timestamp > criteria.afterTimestamp!)
    }
    
    if (criteria.beforeTimestamp !== undefined) {
      results = results.filter(m => m.timestamp < criteria.beforeTimestamp!)
    }
    
    // Sort by importance and timestamp
    results.sort((a, b) => {
      if (a.importance !== b.importance) {
        return b.importance - a.importance
      }
      return b.timestamp - a.timestamp
    })
    
    // Apply limit
    if (criteria.limit !== undefined) {
      results = results.slice(0, criteria.limit)
    }
    
    return results
  }
  
  async getStats(): Promise<StorageStats> {
    let totalMemories = 0
    for (const memories of this.storage.values()) {
      totalMemories += memories.length
    }
    
    return {
      totalMemories,
      totalEntities: this.storage.size,
      lastUpdated: Date.now()
    }
  }
}

/**
 * Factory for creating memory stores
 */
export class MemoryStoreFactory {
  static create(type: 'json' | 'memory' | 'sqlite', config?: any): MemoryStore {
    switch (type) {
      case 'json':
        return new JSONMemoryStore(config?.basePath)
      case 'memory':
        return new InMemoryStore()
      case 'sqlite':
        // Would return SQLiteMemoryStore when implemented
        throw new Error('SQLite store not yet implemented')
      default:
        return new InMemoryStore()
    }
  }
}