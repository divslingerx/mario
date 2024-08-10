/*
Knowledge Management System:
- Tracks what NPCs know about the world
- Updates knowledge based on observations
- Shares information between NPCs through social interaction
*/

import { IWorld } from 'bitecs'
import { NPCKnowledge } from '../components/NPCKnowledge'

interface KnowledgeItem {
  type: 'entity' | 'location' | 'event' | 'relationship'
  subject: number          // What/who this knowledge is about
  data: any               // The actual knowledge data
  confidence: number      // How sure the NPC is (0-255)
  timestamp: number       // When this was learned
  source: 'observed' | 'told' | 'inferred'
}

export class KnowledgeManager {
  private maxKnowledgeItems = 100
  private forgettingRate = 0.001 // How fast knowledge fades

  /**
   * Update NPC knowledge based on observations
   */
  updateObservations(npc: number, world: IWorld): void {
    const knowledge = NPCKnowledge[npc]
    if (!knowledge) return

    // TODO: Scan nearby entities and update knowledge
    // This would integrate with the actual game world systems

    // Example: Learn about nearby entities
    this.observeNearbyEntities(npc, world)
    
    // Example: Update guard presence
    this.updateGuardKnowledge(npc, world)
    
    // Example: Learn about available resources
    this.observeResources(npc, world)
  }

  /**
   * Share knowledge between NPCs through conversation
   */
  shareKnowledge(npc1: number, npc2: number, world: IWorld): void {
    const knowledge1 = NPCKnowledge[npc1]
    const knowledge2 = NPCKnowledge[npc2]
    
    if (!knowledge1 || !knowledge2) return

    // NPCs share some of their knowledge based on relationship
    // TODO: Get relationship level between NPCs
    const relationship = this.getRelationship(npc1, npc2, world)
    const shareChance = Math.min(0.8, relationship / 255 * 0.6 + 0.2)

    if (Math.random() < shareChance) {
      this.transferKnowledge(npc1, npc2, 'gossip')
      this.transferKnowledge(npc2, npc1, 'gossip')
    }
  }

  /**
   * Add new knowledge to an NPC
   */
  addKnowledge(
    npc: number, 
    type: KnowledgeItem['type'],
    subject: number,
    data: any,
    confidence: number = 255,
    source: KnowledgeItem['source'] = 'observed'
  ): void {
    const knowledge = NPCKnowledge[npc]
    if (!knowledge) return

    const item: KnowledgeItem = {
      type,
      subject,
      data,
      confidence,
      timestamp: Date.now(),
      source
    }

    // TODO: Store knowledge item in component
    // This would need a more complex knowledge storage system
  }

  /**
   * Query NPC knowledge about a subject
   */
  getKnowledge(
    npc: number, 
    type: KnowledgeItem['type'], 
    subject: number
  ): KnowledgeItem[] {
    const knowledge = NPCKnowledge[npc]
    if (!knowledge) return []

    // TODO: Retrieve knowledge items matching criteria
    return []
  }

  /**
   * Update knowledge confidence based on new observations
   */
  updateConfidence(npc: number, subject: number, newEvidence: any): void {
    // TODO: Compare new evidence with existing knowledge
    // Increase confidence if consistent, decrease if contradictory
  }

  /**
   * Forget old or low-confidence knowledge
   */
  processForgetfulness(npc: number): void {
    const knowledge = NPCKnowledge[npc]
    if (!knowledge) return

    const now = Date.now()
    
    // TODO: Iterate through knowledge items and:
    // 1. Reduce confidence over time
    // 2. Remove items below confidence threshold
    // 3. Remove very old items
  }

  private observeNearbyEntities(npc: number, world: IWorld): void {
    // TODO: Get entities within observation range
    // Update knowledge about their locations, states, equipment, etc.
  }

  private updateGuardKnowledge(npc: number, world: IWorld): void {
    const knowledge = NPCKnowledge[npc]
    if (!knowledge) return

    // TODO: Scan for guard entities nearby
    // knowledge.guardsNearby = foundGuards
    // knowledge.lastGuardSighting = Date.now()
  }

  private observeResources(npc: number, world: IWorld): void {
    // TODO: Learn about available resources:
    // - Food sources (fruit trees, shops)
    // - Tool locations
    // - Safe/dangerous areas
    // - Trade opportunities
  }

  private getRelationship(npc1: number, npc2: number, world: IWorld): number {
    // TODO: Get relationship value from relationship system
    return 128 // Default neutral relationship
  }

  private transferKnowledge(
    from: number, 
    to: number, 
    method: 'conversation' | 'gossip' | 'observation'
  ): void {
    // TODO: Copy some knowledge items from one NPC to another
    // Reduce confidence based on transfer method
    // Mark source as 'told' instead of 'observed'
  }
}