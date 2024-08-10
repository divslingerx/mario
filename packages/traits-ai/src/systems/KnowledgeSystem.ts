import { defineQuery, IWorld } from 'bitecs'
import { NPCKnowledge, NPCPersonality } from '../components'

/**
 * Handles NPC knowledge updates, perception, and world awareness
 */
export class KnowledgeSystem {
  /**
   * Update NPC knowledge about the world
   */
  updateKnowledge(world: IWorld): void {
    const knowledgeQuery = defineQuery([NPCKnowledge, NPCPersonality])
    const entities = knowledgeQuery(world)
    
    for (const entity of entities) {
      const knowledge = NPCKnowledge[entity]
      const personality = NPCPersonality[entity]
      
      // Update environmental awareness
      knowledge.guardsNearby = this.detectGuards(entity, world) ? 1 : 0
      knowledge.witnessCount = this.countWitnesses(entity, world)
      
      // Update social awareness
      this.updateSocialKnowledge(entity, knowledge, world)
      
      // Update resource awareness
      this.updateResourceKnowledge(entity, knowledge, world)
      
      // High perception NPCs notice more
      if (personality.perception > 150) {
        this.enhancedPerception(entity, knowledge, world)
      }
    }
  }

  /**
   * Update NPC's knowledge about social situations
   */
  private updateSocialKnowledge(entity: number, knowledge: any, world: IWorld): void {
    // Update reputation tracking
    knowledge.reputationKnown = this.getKnownReputation(entity, world)
    
    // Update relationship awareness
    knowledge.friendsNearby = this.countFriendsNearby(entity, world)
    knowledge.enemiesNearby = this.countEnemiesNearby(entity, world)
    
    // Update social opportunities
    knowledge.socialOpportunities = this.detectSocialOpportunities(entity, world)
  }

  /**
   * Update NPC's knowledge about available resources
   */
  private updateResourceKnowledge(entity: number, knowledge: any, world: IWorld): void {
    // Update food source knowledge
    knowledge.foodSourcesKnown = this.scanFoodSources(entity, world)
    
    // Update tool availability
    knowledge.toolsAvailable = this.scanAvailableTools(entity, world)
    
    // Update trade opportunities
    knowledge.tradeOpportunities = this.scanTradeOpportunities(entity, world)
  }

  /**
   * Enhanced perception for high-perception NPCs
   */
  private enhancedPerception(entity: number, knowledge: any, world: IWorld): void {
    // Enhanced detection range and accuracy
    knowledge.perceptionRange = Math.min(255, knowledge.perceptionRange + 20)
    
    // Better threat assessment
    knowledge.threatLevel = this.assessThreatLevel(entity, world)
    
    // Better opportunity recognition
    knowledge.hiddenOpportunities = this.detectHiddenOpportunities(entity, world)
  }

  // Helper methods for knowledge gathering
  private detectGuards(entity: number, world: IWorld): boolean {
    // Would check for guard entities in range
    return Math.random() > 0.7
  }

  private countWitnesses(entity: number, world: IWorld): number {
    // Would count nearby NPCs that can see this entity
    return Math.floor(Math.random() * 5)
  }

  private getKnownReputation(entity: number, world: IWorld): number {
    // Would check entity's known reputation score
    return Math.floor(Math.random() * 200) - 100 // -100 to +100
  }

  private countFriendsNearby(entity: number, world: IWorld): number {
    return Math.floor(Math.random() * 3)
  }

  private countEnemiesNearby(entity: number, world: IWorld): number {
    return Math.floor(Math.random() * 2)
  }

  private detectSocialOpportunities(entity: number, world: IWorld): number {
    return Math.floor(Math.random() * 4)
  }

  private scanFoodSources(entity: number, world: IWorld): number {
    return Math.floor(Math.random() * 6)
  }

  private scanAvailableTools(entity: number, world: IWorld): number {
    return Math.floor(Math.random() * 3)
  }

  private scanTradeOpportunities(entity: number, world: IWorld): number {
    return Math.floor(Math.random() * 4)
  }

  private assessThreatLevel(entity: number, world: IWorld): number {
    return Math.floor(Math.random() * 100)
  }

  private detectHiddenOpportunities(entity: number, world: IWorld): number {
    return Math.floor(Math.random() * 2)
  }

  /**
   * Get comprehensive knowledge report for an NPC
   */
  getKnowledgeReport(entity: number): any {
    const knowledge = NPCKnowledge[entity]
    
    return {
      environmental: {
        guardsNearby: knowledge.guardsNearby,
        witnessCount: knowledge.witnessCount,
        threatLevel: knowledge.threatLevel || 0
      },
      social: {
        reputation: knowledge.reputationKnown || 0,
        friendsNearby: knowledge.friendsNearby || 0,
        enemiesNearby: knowledge.enemiesNearby || 0,
        socialOpportunities: knowledge.socialOpportunities || 0
      },
      resources: {
        foodSources: knowledge.foodSourcesKnown || 0,
        toolsAvailable: knowledge.toolsAvailable || 0,
        tradeOpportunities: knowledge.tradeOpportunities || 0
      }
    }
  }
}