import { Entity, Physics, Go, Solid } from '@js2d/engine'
import { HackableTrait } from '../traits/HackableTrait'
import { WeaponTrait } from '../traits/WeaponTrait'
import { Weapons } from '../weapons/WeaponTypes'
import { MachineSprite, MachineAppearance } from '../sprites/MachineSprite'

/**
 * Basic flying security drone - patrols and attacks intruders
 */
export class SecurityDrone extends Entity {
  private hoverOffset = 0
  private hoverTime = 0
  
  constructor() {
    super()
    
    // Basic traits
    this.addTrait(new Physics())
    this.addTrait(new Go())
    this.addTrait(new Solid())
    
    // No gravity - it flies!
    
    // Game-specific traits
    this.addTrait(new HackableTrait(30, 'basic')) // Low firewall
    
    const weaponTrait = new WeaponTrait()
    weaponTrait.addWeapon(Weapons.tesla_arc)
    this.addTrait(weaponTrait)
    
    // Set size
    this.size.set(32, 24)
    
    // Flying speed
    this.getTrait(Go)!.dragFactor = 5
  }
  
  update(deltaTime: number): void {
    super.update(deltaTime)
    
    // Hovering animation
    this.hoverTime += deltaTime / 1000
    this.hoverOffset = Math.sin(this.hoverTime * 3) * 4
  }
  
  /**
   * Draw with SVG-style placeholder
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save()
    context.translate(0, this.hoverOffset)
    
    // Main body - hexagonal shape
    context.fillStyle = '#2d3748' // Dark gray
    context.beginPath()
    context.moveTo(-16, 0)
    context.lineTo(-8, -12)
    context.lineTo(8, -12)
    context.lineTo(16, 0)
    context.lineTo(8, 12)
    context.lineTo(-8, 12)
    context.closePath()
    context.fill()
    
    // Camera eye
    const hackable = this.getTrait(HackableTrait)
    const isHacked = hackable?.getHackingStatus().isHacked
    
    context.fillStyle = isHacked ? '#48bb78' : '#f56565' // Green if hacked, red if hostile
    context.beginPath()
    context.arc(0, 0, 6, 0, Math.PI * 2)
    context.fill()
    
    // Propellers
    context.strokeStyle = '#718096'
    context.lineWidth = 2
    const propellerAngle = this.hoverTime * 10
    
    // Draw 4 propellers
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i
      const x = Math.cos(angle) * 20
      const y = Math.sin(angle) * 20
      
      context.save()
      context.translate(x, y)
      context.rotate(propellerAngle)
      context.beginPath()
      context.moveTo(-8, 0)
      context.lineTo(8, 0)
      context.moveTo(0, -8)
      context.lineTo(0, 8)
      context.stroke()
      context.restore()
    }
    
    // Hack indicator
    if (hackable) {
      const status = hackable.getHackingStatus()
      if (status.hackLevel > 0) {
        context.fillStyle = '#9f7aea'
        context.fillRect(-16, -20, (status.hackLevel / 100) * 32, 2)
      }
    }
    
    context.restore()
  }
}

/**
 * Factory function
 */
export function createSecurityDrone(): SecurityDrone {
  return new SecurityDrone()
}