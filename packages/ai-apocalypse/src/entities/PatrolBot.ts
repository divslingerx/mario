import { Entity, Physics, Gravity, Go, Solid, PendulumMove } from '@js2d/engine'
import { HackableTrait } from '../traits/HackableTrait'
import { WeaponTrait } from '../traits/WeaponTrait'
import { Weapons } from '../weapons/WeaponTypes'

/**
 * Ground patrol robot - walks back and forth, heavily armored
 */
export class PatrolBot extends Entity {
  private animTime = 0
  private legOffset = 0
  
  constructor() {
    super()
    
    // Basic traits
    this.addTrait(new Physics())
    this.addTrait(new Gravity())
    this.addTrait(new Go())
    this.addTrait(new Solid())
    this.addTrait(new PendulumMove()) // Patrols back and forth
    
    // Game-specific traits
    this.addTrait(new HackableTrait(70, 'advanced')) // Strong firewall
    
    const weaponTrait = new WeaponTrait()
    weaponTrait.addWeapon(Weapons.rail_rifle)
    weaponTrait.setMaxEnergy(200) // More energy capacity
    this.addTrait(weaponTrait)
    
    // Set size - larger and bulkier
    this.size.set(40, 48)
    
    // Slower but steady
    const go = this.getTrait(Go)!
    go.dragFactor = 8
    
    // Configure patrol
    const patrol = this.getTrait(PendulumMove)!
    patrol.speed = 30
  }
  
  update(deltaTime: number): void {
    super.update(deltaTime)
    
    // Walking animation
    const go = this.getTrait(Go)
    if (go && Math.abs(go.dir) > 0) {
      this.animTime += deltaTime / 1000
      this.legOffset = Math.sin(this.animTime * 8) * 3
    }
  }
  
  /**
   * Draw with SVG-style placeholder
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save()
    
    // Tank treads
    context.fillStyle = '#1a202c'
    context.fillRect(-20, 16, 40, 8)
    
    // Tread details
    context.strokeStyle = '#2d3748'
    context.lineWidth = 1
    for (let i = -18; i < 18; i += 4) {
      context.beginPath()
      context.moveTo(i + this.legOffset % 4, 18)
      context.lineTo(i + this.legOffset % 4, 22)
      context.stroke()
    }
    
    // Main body - angular military design
    context.fillStyle = '#4a5568'
    context.beginPath()
    context.moveTo(-18, 16)
    context.lineTo(-15, -20)
    context.lineTo(15, -20)
    context.lineTo(18, 16)
    context.closePath()
    context.fill()
    
    // Armor plating
    context.strokeStyle = '#2d3748'
    context.lineWidth = 2
    context.strokeRect(-12, -16, 24, 20)
    
    // Sensor array
    const hackable = this.getTrait(HackableTrait)
    const isHacked = hackable?.getHackingStatus().isHacked
    
    context.fillStyle = isHacked ? '#48bb78' : '#f56565'
    context.fillRect(-8, -16, 16, 4)
    
    // Scanning beam effect
    if (!isHacked) {
      context.strokeStyle = '#f5656560'
      context.lineWidth = 1
      const scanAngle = (this.animTime * 2) % (Math.PI * 2)
      context.beginPath()
      context.moveTo(0, -14)
      context.lineTo(Math.cos(scanAngle) * 60, -14 + Math.sin(scanAngle) * 40)
      context.stroke()
    }
    
    // Weapon mount
    context.fillStyle = '#2d3748'
    context.fillRect(-4, -24, 8, 8)
    
    // Hack/firewall indicator
    if (hackable) {
      const status = hackable.getHackingStatus()
      
      // Firewall strength
      context.strokeStyle = '#4299e1'
      context.lineWidth = 2
      context.strokeRect(-22, -30, 44, 6)
      context.fillStyle = '#4299e1'
      context.fillRect(-20, -28, (status.firewallPercent / 100) * 40, 2)
      
      // Hack progress
      if (status.hackLevel > 0) {
        context.fillStyle = '#9f7aea'
        context.fillRect(-20, -26, (status.hackLevel / 100) * 40, 2)
      }
    }
    
    context.restore()
  }
}

/**
 * Factory function
 */
export function createPatrolBot(): PatrolBot {
  return new PatrolBot()
}