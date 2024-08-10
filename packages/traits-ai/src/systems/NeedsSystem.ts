import { defineQuery, IWorld } from 'bitecs'
import { NPCNeeds } from '../components'

/**
 * Handles NPC needs simulation - hunger, thirst, sleep, etc.
 */
export class NeedsSystem {
  /**
   * Update NPC needs - they increase over time
   */
  updateNeeds(world: IWorld, deltaTime: number): void {
    const needsQuery = defineQuery([NPCNeeds])
    const entities = needsQuery(world)
    
    for (const entity of entities) {
      const needs = NPCNeeds[entity]
      const minutesPassed = deltaTime / 60000
      
      // Increase needs over time
      needs.hunger = Math.min(255, needs.hunger + needs.hungerRate * minutesPassed)
      needs.thirst = Math.min(255, needs.thirst + needs.thirstRate * minutesPassed)
      needs.sleep = Math.min(255, needs.sleep + needs.sleepRate * minutesPassed)
      needs.social = Math.min(255, needs.social + needs.socialRate * minutesPassed)
      needs.safety = Math.min(255, needs.safety + needs.safetyRate * minutesPassed)
      
      // Check for critical thresholds
      this.checkCriticalNeeds(entity, needs)
    }
  }

  /**
   * Check if any needs have reached critical levels
   */
  private checkCriticalNeeds(entity: number, needs: any): void {
    const criticalEvents: string[] = []
    
    if (needs.hunger >= needs.hungerCritical) {
      criticalEvents.push('starving')
    }
    
    if (needs.thirst >= needs.thirstCritical) {
      criticalEvents.push('dehydrated')
    }
    
    if (needs.sleep >= needs.sleepCritical) {
      criticalEvents.push('exhausted')
    }
    
    if (needs.social >= needs.socialCritical) {
      criticalEvents.push('lonely')
    }
    
    if (needs.safety >= needs.safetyCritical) {
      criticalEvents.push('terrified')
    }
    
    if (criticalEvents.length > 0) {
      console.warn(`NPC ${entity} critical needs: ${criticalEvents.join(', ')}`)
      // Would trigger emergency behaviors or system alerts
    }
  }

  /**
   * Satisfy a specific need for an NPC
   */
  satisfyNeed(entity: number, needType: string, amount: number): void {
    const needs = NPCNeeds[entity]
    if (!needs) return
    
    switch (needType) {
      case 'hunger':
        needs.hunger = Math.max(0, needs.hunger - amount)
        break
      case 'thirst':
        needs.thirst = Math.max(0, needs.thirst - amount)
        break
      case 'sleep':
        needs.sleep = Math.max(0, needs.sleep - amount)
        break
      case 'social':
        needs.social = Math.max(0, needs.social - amount)
        break
      case 'safety':
        needs.safety = Math.max(0, needs.safety - amount)
        break
    }
    
    console.log(`NPC ${entity} satisfied ${needType} by ${amount}`)
  }

  /**
   * Get the most urgent need for an NPC
   */
  getMostUrgentNeed(entity: number): { type: string; value: number; urgency: number } | null {
    const needs = NPCNeeds[entity]
    if (!needs) return null
    
    const needsList = [
      { type: 'hunger', value: needs.hunger, critical: needs.hungerCritical },
      { type: 'thirst', value: needs.thirst, critical: needs.thirstCritical },
      { type: 'sleep', value: needs.sleep, critical: needs.sleepCritical },
      { type: 'social', value: needs.social, critical: needs.socialCritical },
      { type: 'safety', value: needs.safety, critical: needs.safetyCritical }
    ]
    
    // Calculate urgency (how close to critical threshold)
    let mostUrgent = needsList[0]
    let highestUrgency = 0
    
    for (const need of needsList) {
      const urgency = need.value / need.critical
      if (urgency > highestUrgency) {
        highestUrgency = urgency
        mostUrgent = need
      }
    }
    
    return {
      type: mostUrgent.type,
      value: mostUrgent.value,
      urgency: highestUrgency
    }
  }

  /**
   * Get needs summary for an NPC
   */
  getNeedsSummary(entity: number): any {
    const needs = NPCNeeds[entity]
    if (!needs) return null
    
    return {
      hunger: {
        current: needs.hunger,
        critical: needs.hungerCritical,
        rate: needs.hungerRate,
        status: needs.hunger >= needs.hungerCritical ? 'critical' : 
                needs.hunger >= needs.hungerCritical * 0.8 ? 'urgent' : 'normal'
      },
      thirst: {
        current: needs.thirst,
        critical: needs.thirstCritical,
        rate: needs.thirstRate,
        status: needs.thirst >= needs.thirstCritical ? 'critical' : 
                needs.thirst >= needs.thirstCritical * 0.8 ? 'urgent' : 'normal'
      },
      sleep: {
        current: needs.sleep,
        critical: needs.sleepCritical,
        rate: needs.sleepRate,
        status: needs.sleep >= needs.sleepCritical ? 'critical' : 
                needs.sleep >= needs.sleepCritical * 0.8 ? 'urgent' : 'normal'
      },
      social: {
        current: needs.social,
        critical: needs.socialCritical,
        rate: needs.socialRate,
        status: needs.social >= needs.socialCritical ? 'critical' : 
                needs.social >= needs.socialCritical * 0.8 ? 'urgent' : 'normal'
      },
      safety: {
        current: needs.safety,
        critical: needs.safetyCritical,
        rate: needs.safetyRate,
        status: needs.safety >= needs.safetyCritical ? 'critical' : 
                needs.safety >= needs.safetyCritical * 0.8 ? 'urgent' : 'normal'
      }
    }
  }
}