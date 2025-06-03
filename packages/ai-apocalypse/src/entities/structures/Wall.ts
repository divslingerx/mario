import { Entity, Solid } from '@js2d/engine'

export interface StructureStats {
  maxHealth: number
  buildTime: number
  requiredMaterials: Record<string, number>
}

/**
 * Basic wall structure for base building
 */
export class Wall extends Entity {
  static stats: StructureStats = {
    maxHealth: 500,
    buildTime: 10, // seconds
    requiredMaterials: {
      'steel': 5,
      'components': 1
    }
  }
  
  health: number
  maxHealth: number
  isBuilt = false
  buildProgress = 0
  
  constructor() {
    super()
    
    this.maxHealth = Wall.stats.maxHealth
    this.health = this.maxHealth
    
    // Walls are solid
    this.addTrait(new Solid())
    
    // Set size
    this.size.set(32, 32)
  }
  
  /**
   * Apply construction progress
   */
  build(amount: number): void {
    if (this.isBuilt) return
    
    this.buildProgress += amount
    
    if (this.buildProgress >= Wall.stats.buildTime) {
      this.isBuilt = true
      this.buildProgress = Wall.stats.buildTime
    }
  }
  
  /**
   * Take damage
   */
  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount)
    
    if (this.health <= 0) {
      this.destroy()
    }
  }
  
  /**
   * Repair damage
   */
  repair(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount)
  }
  
  /**
   * Destroy the wall
   */
  destroy(): void {
    // Emit destruction event
    this.events.emit('destroyed')
    
    // Drop some materials
    this.events.emit('drop-materials', {
      'steel': Math.floor(Wall.stats.requiredMaterials.steel * 0.5),
      'components': Math.random() > 0.5 ? 1 : 0
    })
  }
  
  /**
   * Draw the wall
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save()
    
    if (!this.isBuilt) {
      // Blueprint/construction mode
      context.globalAlpha = 0.5
      context.strokeStyle = '#60a5fa'
      context.lineWidth = 2
      context.setLineDash([5, 5])
      context.strokeRect(-16, -16, 32, 32)
      
      // Build progress
      if (this.buildProgress > 0) {
        context.fillStyle = '#60a5fa'
        const progressHeight = (this.buildProgress / Wall.stats.buildTime) * 32
        context.fillRect(-16, 16 - progressHeight, 32, progressHeight)
      }
    } else {
      // Built wall
      const damageRatio = this.health / this.maxHealth
      
      // Base color depends on damage
      if (damageRatio > 0.7) {
        context.fillStyle = '#6b7280' // Gray - healthy
      } else if (damageRatio > 0.3) {
        context.fillStyle = '#92400e' // Brown - damaged
      } else {
        context.fillStyle = '#991b1b' // Red - critical
      }
      
      // Main wall
      context.fillRect(-16, -16, 32, 32)
      
      // Metal plating detail
      context.strokeStyle = '#374151'
      context.lineWidth = 1
      context.strokeRect(-14, -14, 28, 28)
      context.strokeRect(-10, -10, 20, 20)
      
      // Damage cracks
      if (damageRatio < 0.7) {
        context.strokeStyle = '#1f2937'
        context.lineWidth = 2
        context.beginPath()
        context.moveTo(-8, -16)
        context.lineTo(-4, 0)
        context.lineTo(-8, 16)
        context.stroke()
      }
      
      if (damageRatio < 0.4) {
        context.beginPath()
        context.moveTo(8, -16)
        context.lineTo(4, 0)
        context.lineTo(8, 16)
        context.stroke()
      }
    }
    
    context.restore()
  }
}

/**
 * Factory function
 */
export function createWall(): Wall {
  return new Wall()
}