import { Entity, Trait, Go, Jump, Physics, Solid } from '@js2d/engine'
import { WeaponTrait } from '../traits/WeaponTrait'
import { Weapons } from '../weapons/WeaponTypes'

/**
 * Player character - a human survivor in the AI apocalypse
 */
export class Survivor extends Entity {
  constructor() {
    super()
    
    // Basic traits from engine
    this.addTrait(new Physics())
    this.addTrait(new Solid())
    this.addTrait(new Go())
    this.addTrait(new Jump())
    
    // Game-specific traits
    const weaponTrait = new WeaponTrait()
    this.addTrait(weaponTrait)
    
    // Give starting weapons
    weaponTrait.addWeapon(Weapons.neural_spike)
    weaponTrait.addWeapon(Weapons.emp_pulse)
    
    // Set size
    this.size.set(24, 32)
  }
  
  /**
   * Draw with SVG-style placeholder
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save()
    
    // Simple human figure
    context.fillStyle = '#4a5568' // Gray clothing
    context.fillRect(-12, -16, 24, 20) // Body
    
    context.fillStyle = '#feb2b2' // Skin tone
    context.fillRect(-8, -32, 16, 16) // Head
    
    // Eyes
    context.fillStyle = '#1a202c'
    context.fillRect(-5, -28, 3, 3)
    context.fillRect(2, -28, 3, 3)
    
    // Arms
    context.fillStyle = '#4a5568'
    context.fillRect(-16, -16, 4, 12)
    context.fillRect(12, -16, 4, 12)
    
    // Legs
    context.fillRect(-8, 4, 6, 12)
    context.fillRect(2, 4, 6, 12)
    
    // Weapon indicator
    const weapon = this.getTrait(WeaponTrait)?.getCurrentWeapon()
    if (weapon) {
      context.fillStyle = '#48bb78' // Green for ready
      context.fillRect(-20, -20, 4, 4)
    }
    
    context.restore()
  }
}

/**
 * Factory function to create survivors
 */
export function createSurvivor(): Survivor {
  return new Survivor()
}