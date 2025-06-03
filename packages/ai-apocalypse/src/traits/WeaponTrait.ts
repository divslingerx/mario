import { Trait } from '@js2d/engine'
import { Entity } from '@js2d/engine'
import { WeaponStats, DamageType, StatusEffect } from '../weapons/WeaponTypes'

/**
 * Trait that allows entities to use weapons
 * Handles weapon switching, cooldowns, and firing
 */
export class WeaponTrait extends Trait {
  static componentName = 'weapon'
  
  private weapons: WeaponStats[] = []
  private currentWeaponIndex = 0
  private cooldowns = new Map<string, number>()
  private energy = 100
  private maxEnergy = 100
  private energyRegenRate = 10 // per second
  
  constructor() {
    super()
  }
  
  /**
   * Add a weapon to the entity's arsenal
   */
  addWeapon(weapon: WeaponStats): void {
    this.weapons.push(weapon)
    this.cooldowns.set(weapon.id, 0)
  }
  
  /**
   * Remove a weapon
   */
  removeWeapon(weaponId: string): boolean {
    const index = this.weapons.findIndex(w => w.id === weaponId)
    if (index >= 0) {
      this.weapons.splice(index, 1)
      this.cooldowns.delete(weaponId)
      if (this.currentWeaponIndex >= this.weapons.length) {
        this.currentWeaponIndex = Math.max(0, this.weapons.length - 1)
      }
      return true
    }
    return false
  }
  
  /**
   * Switch to next weapon
   */
  nextWeapon(): void {
    if (this.weapons.length > 0) {
      this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length
    }
  }
  
  /**
   * Switch to previous weapon
   */
  previousWeapon(): void {
    if (this.weapons.length > 0) {
      this.currentWeaponIndex = this.currentWeaponIndex === 0 
        ? this.weapons.length - 1 
        : this.currentWeaponIndex - 1
    }
  }
  
  /**
   * Get current weapon
   */
  getCurrentWeapon(): WeaponStats | null {
    return this.weapons[this.currentWeaponIndex] || null
  }
  
  /**
   * Attempt to fire current weapon
   */
  fire(targetX: number, targetY: number, sourceEntity: Entity): boolean {
    const weapon = this.getCurrentWeapon()
    if (!weapon) return false
    
    // Check cooldown
    const cooldownRemaining = this.cooldowns.get(weapon.id) || 0
    if (cooldownRemaining > 0) return false
    
    // Check energy
    if (this.energy < weapon.energyCost) return false
    
    // Fire the weapon (emit event for the weapon system to handle)
    this.entity.events.emit('weapon-fired', {
      weapon,
      sourceX: sourceEntity.pos.x,
      sourceY: sourceEntity.pos.y,
      targetX,
      targetY
    })
    
    // Apply cooldown and energy cost
    this.cooldowns.set(weapon.id, weapon.cooldown)
    this.energy = Math.max(0, this.energy - weapon.energyCost)
    
    return true
  }
  
  /**
   * Update cooldowns and energy regeneration
   */
  update(entity: Entity, deltaTime: number): void {
    // Update cooldowns
    for (const [weaponId, cooldown] of this.cooldowns) {
      if (cooldown > 0) {
        this.cooldowns.set(weaponId, Math.max(0, cooldown - deltaTime))
      }
    }
    
    // Regenerate energy
    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(
        this.maxEnergy,
        this.energy + (this.energyRegenRate * deltaTime / 1000)
      )
    }
  }
  
  /**
   * Get weapon status for UI
   */
  getWeaponStatus() {
    const current = this.getCurrentWeapon()
    if (!current) return null
    
    return {
      weapon: current,
      cooldownRemaining: this.cooldowns.get(current.id) || 0,
      cooldownPercent: current.cooldown > 0 
        ? ((this.cooldowns.get(current.id) || 0) / current.cooldown) * 100
        : 0,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      energyPercent: (this.energy / this.maxEnergy) * 100,
      canFire: (this.cooldowns.get(current.id) || 0) <= 0 && this.energy >= current.energyCost
    }
  }
  
  /**
   * Set energy (for pickups, etc)
   */
  setEnergy(amount: number): void {
    this.energy = Math.max(0, Math.min(this.maxEnergy, amount))
  }
  
  /**
   * Modify max energy
   */
  setMaxEnergy(amount: number): void {
    this.maxEnergy = Math.max(1, amount)
    this.energy = Math.min(this.energy, this.maxEnergy)
  }
}