import { Trait } from '@js2d/engine'
import { Entity } from '@js2d/engine'
import { StatusEffect } from '../weapons/WeaponTypes'

/**
 * Makes an entity hackable - used for AI enemies and electronic systems
 */
export class HackableTrait extends Trait {
  static componentName = 'hackable'
  
  // Hacking resistance (0-100)
  private firewall = 50
  private maxFirewall = 50
  
  // Current hack level (0-100)
  private hackLevel = 0
  
  // Status effects
  private statusEffects = new Map<StatusEffect, number>() // effect -> duration
  
  // Faction tracking
  private originalFaction = 'network'
  private currentFaction = 'network'
  
  // System type affects vulnerabilities
  private systemType: 'basic' | 'advanced' | 'quantum' = 'basic'
  
  constructor(firewall = 50, systemType: 'basic' | 'advanced' | 'quantum' = 'basic') {
    super()
    this.firewall = firewall
    this.maxFirewall = firewall
    this.systemType = systemType
  }
  
  /**
   * Apply hacking damage
   */
  applyHackDamage(amount: number, hackingPower: number): boolean {
    // Calculate actual damage based on firewall strength
    const penetration = Math.max(0, hackingPower - this.firewall)
    const damage = amount * (penetration / 100)
    
    this.hackLevel = Math.min(100, this.hackLevel + damage)
    
    // Check if fully hacked
    if (this.hackLevel >= 100) {
      this.onFullyHacked()
      return true
    }
    
    return false
  }
  
  /**
   * Apply a status effect
   */
  applyStatusEffect(effect: StatusEffect, duration: number): void {
    const currentDuration = this.statusEffects.get(effect) || 0
    this.statusEffects.set(effect, Math.max(currentDuration, duration))
    
    // Apply immediate effects
    switch (effect) {
      case StatusEffect.SHUTDOWN:
        this.entity.events.emit('shutdown')
        break
      case StatusEffect.HACKED:
        this.switchFaction('player')
        break
      case StatusEffect.CONFUSED:
        this.entity.events.emit('confused')
        break
    }
  }
  
  /**
   * Called when entity is fully hacked
   */
  private onFullyHacked(): void {
    this.switchFaction('player')
    this.entity.events.emit('hacked', {
      previousFaction: this.originalFaction
    })
    
    // Reset hack level but keep faction change
    this.hackLevel = 0
    this.firewall = this.maxFirewall * 0.5 // Weakened after hack
  }
  
  /**
   * Switch faction allegiance
   */
  private switchFaction(newFaction: string): void {
    this.currentFaction = newFaction
    this.entity.events.emit('faction-changed', {
      from: this.currentFaction,
      to: newFaction
    })
  }
  
  /**
   * Update status effects
   */
  update(entity: Entity, deltaTime: number): void {
    // Update status effect durations
    for (const [effect, duration] of this.statusEffects) {
      const newDuration = duration - deltaTime
      if (newDuration <= 0) {
        this.statusEffects.delete(effect)
        this.onStatusEffectExpired(effect)
      } else {
        this.statusEffects.set(effect, newDuration)
      }
    }
    
    // Slowly recover firewall strength
    if (this.firewall < this.maxFirewall) {
      this.firewall = Math.min(
        this.maxFirewall,
        this.firewall + (5 * deltaTime / 1000) // 5 points per second
      )
    }
    
    // Slowly reduce hack level if not fully hacked
    if (this.hackLevel > 0 && this.hackLevel < 100) {
      this.hackLevel = Math.max(
        0,
        this.hackLevel - (10 * deltaTime / 1000) // 10 points per second
      )
    }
  }
  
  /**
   * Handle status effect expiration
   */
  private onStatusEffectExpired(effect: StatusEffect): void {
    switch (effect) {
      case StatusEffect.SHUTDOWN:
        this.entity.events.emit('reboot')
        break
      case StatusEffect.HACKED:
        this.switchFaction(this.originalFaction)
        break
    }
  }
  
  /**
   * Get hacking status for UI
   */
  getHackingStatus() {
    return {
      firewall: this.firewall,
      maxFirewall: this.maxFirewall,
      firewallPercent: (this.firewall / this.maxFirewall) * 100,
      hackLevel: this.hackLevel,
      isHacked: this.currentFaction !== this.originalFaction,
      faction: this.currentFaction,
      statusEffects: Array.from(this.statusEffects.keys()),
      systemType: this.systemType
    }
  }
  
  /**
   * Check if entity has a specific status effect
   */
  hasStatusEffect(effect: StatusEffect): boolean {
    return this.statusEffects.has(effect)
  }
  
  /**
   * Get vulnerability to specific damage types
   */
  getVulnerability(damageType: string): number {
    // Quantum systems are resistant to logic attacks but vulnerable to quantum disruption
    if (this.systemType === 'quantum') {
      if (damageType === 'logic') return 0.5
      if (damageType === 'quantum') return 2.0
    }
    
    // Advanced systems have better general resistance
    if (this.systemType === 'advanced') {
      return 0.75
    }
    
    return 1.0
  }
}