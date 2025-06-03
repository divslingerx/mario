import { Entity, Solid, Trigger } from '@js2d/engine'
import { StructureStats } from './Wall'

/**
 * Door that can open/close
 */
export class Door extends Entity {
  static stats: StructureStats = {
    maxHealth: 300,
    buildTime: 8,
    requiredMaterials: {
      'steel': 3,
      'components': 2
    }
  }
  
  health: number
  maxHealth: number
  isBuilt = false
  buildProgress = 0
  isOpen = false
  isLocked = false
  
  // Auto-close timer
  autoCloseDelay = 3000 // ms
  lastOpenTime = 0
  
  constructor() {
    super()
    
    this.maxHealth = Door.stats.maxHealth
    this.health = this.maxHealth
    
    // Doors are solid when closed, triggers when open
    this.addTrait(new Solid())
    
    const trigger = new Trigger()
    trigger.onCollide = (entity) => {
      // Auto-open for friendly entities
      if (!this.isLocked && !this.isOpen) {
        this.open()
      }
    }
    this.addTrait(trigger)
    
    // Set size
    this.size.set(32, 32)
  }
  
  /**
   * Open the door
   */
  open(): void {
    if (!this.isBuilt || this.isOpen || this.isLocked) return
    
    this.isOpen = true
    this.lastOpenTime = Date.now()
    
    // Disable solid collision
    const solid = this.getTrait(Solid)
    if (solid) {
      solid.obstructs = false
    }
    
    this.events.emit('door-opened')
  }
  
  /**
   * Close the door
   */
  close(): void {
    if (!this.isBuilt || !this.isOpen) return
    
    this.isOpen = false
    
    // Re-enable solid collision
    const solid = this.getTrait(Solid)
    if (solid) {
      solid.obstructs = true
    }
    
    this.events.emit('door-closed')
  }
  
  /**
   * Toggle lock
   */
  toggleLock(): void {
    this.isLocked = !this.isLocked
    if (this.isLocked && this.isOpen) {
      this.close()
    }
  }
  
  /**
   * Update auto-close
   */
  update(deltaTime: number): void {
    super.update(deltaTime)
    
    // Auto-close after delay
    if (this.isOpen && !this.isLocked && this.autoCloseDelay > 0) {
      if (Date.now() - this.lastOpenTime > this.autoCloseDelay) {
        this.close()
      }
    }
  }
  
  /**
   * Draw the door
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save()
    
    if (!this.isBuilt) {
      // Blueprint mode
      context.globalAlpha = 0.5
      context.strokeStyle = '#60a5fa'
      context.lineWidth = 2
      context.setLineDash([5, 5])
      context.strokeRect(-16, -16, 32, 32)
      
      // Build progress
      if (this.buildProgress > 0) {
        context.fillStyle = '#60a5fa'
        const progressHeight = (this.buildProgress / Door.stats.buildTime) * 32
        context.fillRect(-16, 16 - progressHeight, 32, progressHeight)
      }
    } else {
      // Door frame
      context.fillStyle = '#374151'
      context.fillRect(-16, -16, 4, 32) // Left
      context.fillRect(12, -16, 4, 32)   // Right
      context.fillRect(-16, -16, 32, 4)  // Top
      
      if (this.isOpen) {
        // Open door (swung to side)
        context.save()
        context.translate(-16, -16)
        context.rotate(-Math.PI / 3)
        
        context.fillStyle = '#4b5563'
        context.fillRect(0, 0, 28, 4)
        
        context.restore()
      } else {
        // Closed door
        context.fillStyle = this.isLocked ? '#991b1b' : '#4b5563'
        context.fillRect(-12, -16, 24, 32)
        
        // Handle
        context.fillStyle = '#9ca3af'
        context.beginPath()
        context.arc(8, 0, 3, 0, Math.PI * 2)
        context.fill()
        
        // Lock indicator
        if (this.isLocked) {
          context.fillStyle = '#dc2626'
          context.fillRect(-4, -4, 8, 8)
        }
      }
    }
    
    context.restore()
  }
}

/**
 * Factory function
 */
export function createDoor(): Door {
  return new Door()
}