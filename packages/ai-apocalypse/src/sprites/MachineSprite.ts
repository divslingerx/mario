/**
 * Procedural machine/robot sprite generator
 */

export interface MachineAppearance {
  type: 'drone' | 'walker' | 'tank' | 'spider'
  size: 'small' | 'medium' | 'large'
  condition: 'pristine' | 'functional' | 'damaged' | 'rusted'
  faction: 'network' | 'rogue' | 'player' | 'neutral'
  components: string[]
}

export class MachineSprite {
  // Faction color schemes
  static readonly FACTION_COLORS = {
    network: {
      primary: '#3b82f6',   // Blue
      secondary: '#1e40af',
      accent: '#60a5fa',
      light: '#93c5fd'
    },
    rogue: {
      primary: '#dc2626',   // Red
      secondary: '#991b1b',
      accent: '#f87171',
      light: '#fca5a5'
    },
    player: {
      primary: '#10b981',   // Green
      secondary: '#059669',
      accent: '#34d399',
      light: '#86efac'
    },
    neutral: {
      primary: '#6b7280',   // Gray
      secondary: '#374151',
      accent: '#9ca3af',
      light: '#d1d5db'
    }
  }
  
  // Condition modifiers
  static readonly CONDITION_EFFECTS = {
    pristine: { rust: 0, scratches: 0, sparks: 0 },
    functional: { rust: 0.1, scratches: 0.3, sparks: 0.1 },
    damaged: { rust: 0.3, scratches: 0.7, sparks: 0.4 },
    rusted: { rust: 0.8, scratches: 0.9, sparks: 0.2 }
  }
  
  /**
   * Generate random machine appearance
   */
  static generateRandomAppearance(faction: 'network' | 'rogue' | 'player' | 'neutral' = 'network'): MachineAppearance {
    const types = ['drone', 'walker', 'tank', 'spider'] as const
    const sizes = ['small', 'medium', 'large'] as const
    const conditions = ['pristine', 'functional', 'damaged', 'rusted'] as const
    
    const type = types[Math.floor(Math.random() * types.length)]
    const components = this.generateComponents(type)
    
    return {
      type,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      faction,
      components
    }
  }
  
  /**
   * Generate components based on type
   */
  static generateComponents(type: string): string[] {
    const components: string[] = []
    const allComponents = {
      drone: ['propellers', 'camera', 'antenna', 'spotlight', 'grabber'],
      walker: ['legs', 'turret', 'sensor_array', 'armor_plates', 'hydraulics'],
      tank: ['treads', 'cannon', 'radar', 'heavy_armor', 'smoke_launcher'],
      spider: ['multi_legs', 'eye_cluster', 'web_spinner', 'claws', 'stabilizers']
    }
    
    const typeComponents = allComponents[type as keyof typeof allComponents] || []
    
    // Add 2-4 components
    const count = 2 + Math.floor(Math.random() * 3)
    for (let i = 0; i < count && i < typeComponents.length; i++) {
      components.push(typeComponents[Math.floor(Math.random() * typeComponents.length)])
    }
    
    return [...new Set(components)] // Remove duplicates
  }
  
  /**
   * Draw machine with given appearance
   */
  static draw(
    context: CanvasRenderingContext2D,
    appearance: MachineAppearance,
    x: number,
    y: number,
    scale: number = 1,
    animTime: number = 0
  ): void {
    context.save()
    context.translate(x, y)
    context.scale(scale, scale)
    
    const sizeMod = appearance.size === 'small' ? 0.7 :
                    appearance.size === 'large' ? 1.3 : 1
    
    // Draw based on type
    switch (appearance.type) {
      case 'drone':
        this.drawDrone(context, appearance, sizeMod, animTime)
        break
      case 'walker':
        this.drawWalker(context, appearance, sizeMod, animTime)
        break
      case 'tank':
        this.drawTank(context, appearance, sizeMod, animTime)
        break
      case 'spider':
        this.drawSpider(context, appearance, sizeMod, animTime)
        break
    }
    
    // Apply condition effects
    this.applyConditionEffects(context, appearance, sizeMod)
    
    context.restore()
  }
  
  private static drawDrone(
    context: CanvasRenderingContext2D,
    appearance: MachineAppearance,
    sizeMod: number,
    animTime: number
  ): void {
    const colors = this.FACTION_COLORS[appearance.faction]
    
    // Shadow
    context.fillStyle = 'rgba(0, 0, 0, 0.3)'
    context.beginPath()
    context.ellipse(0, 8 * sizeMod, 15 * sizeMod, 5 * sizeMod, 0, 0, Math.PI * 2)
    context.fill()
    
    // Propellers
    if (appearance.components.includes('propellers')) {
      context.strokeStyle = colors.secondary
      context.lineWidth = 2
      const propSpeed = animTime * 0.02
      
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i
        const px = Math.cos(angle) * 18 * sizeMod
        const py = Math.sin(angle) * 18 * sizeMod
        
        context.save()
        context.translate(px, py)
        context.rotate(propSpeed)
        context.beginPath()
        context.moveTo(-6 * sizeMod, 0)
        context.lineTo(6 * sizeMod, 0)
        context.moveTo(0, -6 * sizeMod)
        context.lineTo(0, 6 * sizeMod)
        context.stroke()
        context.restore()
      }
    }
    
    // Main body
    context.fillStyle = colors.primary
    context.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      const px = Math.cos(angle) * 12 * sizeMod
      const py = Math.sin(angle) * 12 * sizeMod
      if (i === 0) {
        context.moveTo(px, py)
      } else {
        context.lineTo(px, py)
      }
    }
    context.closePath()
    context.fill()
    
    // Center details
    context.fillStyle = colors.secondary
    context.fillRect(-8 * sizeMod, -4 * sizeMod, 16 * sizeMod, 8 * sizeMod)
    
    // Camera eye
    if (appearance.components.includes('camera')) {
      const eyeSize = 5 * sizeMod
      context.fillStyle = colors.accent
      context.beginPath()
      context.arc(0, 0, eyeSize, 0, Math.PI * 2)
      context.fill()
      
      // Scanning effect
      context.strokeStyle = colors.light
      context.lineWidth = 1
      const scanAngle = animTime * 0.005
      context.beginPath()
      context.moveTo(0, 0)
      context.lineTo(Math.cos(scanAngle) * 30 * sizeMod, Math.sin(scanAngle) * 30 * sizeMod)
      context.stroke()
    }
    
    // Antenna
    if (appearance.components.includes('antenna')) {
      context.strokeStyle = colors.secondary
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(0, -12 * sizeMod)
      context.lineTo(0, -20 * sizeMod)
      context.stroke()
      
      context.fillStyle = colors.accent
      context.beginPath()
      context.arc(0, -20 * sizeMod, 2, 0, Math.PI * 2)
      context.fill()
    }
  }
  
  private static drawWalker(
    context: CanvasRenderingContext2D,
    appearance: MachineAppearance,
    sizeMod: number,
    animTime: number
  ): void {
    const colors = this.FACTION_COLORS[appearance.faction]
    const walkCycle = Math.sin(animTime * 0.005) * 2
    
    // Legs
    if (appearance.components.includes('legs')) {
      context.strokeStyle = colors.secondary
      context.lineWidth = 3 * sizeMod
      
      // Left leg
      context.beginPath()
      context.moveTo(-8 * sizeMod, 5 * sizeMod)
      context.lineTo(-10 * sizeMod, 12 * sizeMod)
      context.lineTo(-8 * sizeMod + walkCycle, 20 * sizeMod)
      context.stroke()
      
      // Right leg
      context.beginPath()
      context.moveTo(8 * sizeMod, 5 * sizeMod)
      context.lineTo(10 * sizeMod, 12 * sizeMod)
      context.lineTo(8 * sizeMod - walkCycle, 20 * sizeMod)
      context.stroke()
    }
    
    // Main body
    context.fillStyle = colors.primary
    context.fillRect(-15 * sizeMod, -10 * sizeMod, 30 * sizeMod, 20 * sizeMod)
    
    // Armor plates
    if (appearance.components.includes('armor_plates')) {
      context.strokeStyle = colors.secondary
      context.lineWidth = 2
      context.strokeRect(-13 * sizeMod, -8 * sizeMod, 26 * sizeMod, 16 * sizeMod)
      
      // Plate details
      context.fillStyle = colors.secondary
      context.fillRect(-10 * sizeMod, -6 * sizeMod, 8 * sizeMod, 3 * sizeMod)
      context.fillRect(2 * sizeMod, -6 * sizeMod, 8 * sizeMod, 3 * sizeMod)
    }
    
    // Turret
    if (appearance.components.includes('turret')) {
      context.fillStyle = colors.secondary
      context.fillRect(-5 * sizeMod, -15 * sizeMod, 10 * sizeMod, 8 * sizeMod)
      
      // Barrel
      context.fillRect(10 * sizeMod, -13 * sizeMod, 15 * sizeMod, 4 * sizeMod)
    }
    
    // Sensor array
    if (appearance.components.includes('sensor_array')) {
      context.fillStyle = colors.accent
      for (let i = -2; i <= 2; i++) {
        context.beginPath()
        context.arc(i * 4 * sizeMod, -5 * sizeMod, 2, 0, Math.PI * 2)
        context.fill()
      }
    }
  }
  
  private static drawTank(
    context: CanvasRenderingContext2D,
    appearance: MachineAppearance,
    sizeMod: number,
    animTime: number
  ): void {
    const colors = this.FACTION_COLORS[appearance.faction]
    
    // Treads
    if (appearance.components.includes('treads')) {
      context.fillStyle = colors.secondary
      context.fillRect(-20 * sizeMod, 10 * sizeMod, 40 * sizeMod, 8 * sizeMod)
      
      // Tread detail
      context.strokeStyle = colors.primary
      context.lineWidth = 1
      const treadOffset = (animTime * 0.01) % 4
      for (let i = -18; i < 18; i += 4) {
        context.beginPath()
        context.moveTo((i + treadOffset) * sizeMod, 12 * sizeMod)
        context.lineTo((i + treadOffset) * sizeMod, 16 * sizeMod)
        context.stroke()
      }
    }
    
    // Hull
    context.fillStyle = colors.primary
    context.beginPath()
    context.moveTo(-18 * sizeMod, 10 * sizeMod)
    context.lineTo(-15 * sizeMod, -5 * sizeMod)
    context.lineTo(15 * sizeMod, -5 * sizeMod)
    context.lineTo(18 * sizeMod, 10 * sizeMod)
    context.closePath()
    context.fill()
    
    // Heavy armor
    if (appearance.components.includes('heavy_armor')) {
      context.strokeStyle = colors.secondary
      context.lineWidth = 3
      context.strokeRect(-12 * sizeMod, -3 * sizeMod, 24 * sizeMod, 10 * sizeMod)
    }
    
    // Cannon
    if (appearance.components.includes('cannon')) {
      // Turret base
      context.fillStyle = colors.secondary
      context.beginPath()
      context.arc(0, -5 * sizeMod, 8 * sizeMod, 0, Math.PI * 2)
      context.fill()
      
      // Cannon barrel
      context.fillRect(0, -7 * sizeMod, 25 * sizeMod, 4 * sizeMod)
      
      // Muzzle brake
      context.fillRect(23 * sizeMod, -8 * sizeMod, 4 * sizeMod, 6 * sizeMod)
    }
    
    // Radar
    if (appearance.components.includes('radar')) {
      context.strokeStyle = colors.accent
      context.lineWidth = 2
      const radarAngle = animTime * 0.003
      context.save()
      context.translate(0, -13 * sizeMod)
      context.rotate(radarAngle)
      context.beginPath()
      context.moveTo(0, 0)
      context.lineTo(10 * sizeMod, 0)
      context.stroke()
      context.restore()
    }
  }
  
  private static drawSpider(
    context: CanvasRenderingContext2D,
    appearance: MachineAppearance,
    sizeMod: number,
    animTime: number
  ): void {
    const colors = this.FACTION_COLORS[appearance.faction]
    const legPhase = animTime * 0.01
    
    // Multi-legs
    if (appearance.components.includes('multi_legs')) {
      context.strokeStyle = colors.secondary
      context.lineWidth = 2 * sizeMod
      
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 4; i++) {
          const legAngle = (i * 0.3 - 0.5) * side
          const legMove = Math.sin(legPhase + i) * 3
          
          context.beginPath()
          context.moveTo(side * 8 * sizeMod, -5 * sizeMod + i * 3)
          context.lineTo(
            side * (15 + legMove) * sizeMod, 
            5 * sizeMod + i * 2
          )
          context.lineTo(
            side * (12 + legMove) * sizeMod,
            15 * sizeMod
          )
          context.stroke()
        }
      }
    }
    
    // Abdomen
    context.fillStyle = colors.primary
    context.beginPath()
    context.ellipse(0, 0, 12 * sizeMod, 8 * sizeMod, 0, 0, Math.PI * 2)
    context.fill()
    
    // Head
    context.beginPath()
    context.ellipse(0, -10 * sizeMod, 8 * sizeMod, 6 * sizeMod, 0, 0, Math.PI * 2)
    context.fill()
    
    // Eye cluster
    if (appearance.components.includes('eye_cluster')) {
      const eyePositions = [
        { x: -3, y: -12 },
        { x: 3, y: -12 },
        { x: -5, y: -10 },
        { x: 5, y: -10 },
        { x: 0, y: -11 },
        { x: -2, y: -9 },
        { x: 2, y: -9 }
      ]
      
      context.fillStyle = colors.accent
      for (const pos of eyePositions) {
        context.beginPath()
        context.arc(pos.x * sizeMod, pos.y * sizeMod, 1.5, 0, Math.PI * 2)
        context.fill()
      }
    }
    
    // Claws
    if (appearance.components.includes('claws')) {
      context.fillStyle = colors.secondary
      context.beginPath()
      context.moveTo(-5 * sizeMod, -15 * sizeMod)
      context.lineTo(-3 * sizeMod, -18 * sizeMod)
      context.lineTo(-1 * sizeMod, -15 * sizeMod)
      context.closePath()
      context.fill()
      
      context.beginPath()
      context.moveTo(5 * sizeMod, -15 * sizeMod)
      context.lineTo(3 * sizeMod, -18 * sizeMod)
      context.lineTo(1 * sizeMod, -15 * sizeMod)
      context.closePath()
      context.fill()
    }
  }
  
  private static applyConditionEffects(
    context: CanvasRenderingContext2D,
    appearance: MachineAppearance,
    sizeMod: number
  ): void {
    const effects = this.CONDITION_EFFECTS[appearance.condition]
    
    // Rust patches
    if (effects.rust > 0 && Math.random() < effects.rust) {
      context.fillStyle = 'rgba(139, 69, 19, 0.6)'
      for (let i = 0; i < 3; i++) {
        const rx = (Math.random() - 0.5) * 30 * sizeMod
        const ry = (Math.random() - 0.5) * 20 * sizeMod
        const rs = Math.random() * 5 * sizeMod + 2
        context.beginPath()
        context.arc(rx, ry, rs, 0, Math.PI * 2)
        context.fill()
      }
    }
    
    // Scratches
    if (effects.scratches > 0 && Math.random() < effects.scratches) {
      context.strokeStyle = 'rgba(0, 0, 0, 0.3)'
      context.lineWidth = 1
      for (let i = 0; i < 2; i++) {
        context.beginPath()
        const sx = (Math.random() - 0.5) * 20 * sizeMod
        const sy = (Math.random() - 0.5) * 15 * sizeMod
        context.moveTo(sx, sy)
        context.lineTo(sx + Math.random() * 10 * sizeMod, sy + Math.random() * 5 * sizeMod)
        context.stroke()
      }
    }
    
    // Sparks
    if (effects.sparks > 0 && Math.random() < effects.sparks) {
      context.fillStyle = '#fbbf24'
      for (let i = 0; i < 3; i++) {
        const sparkX = (Math.random() - 0.5) * 25 * sizeMod
        const sparkY = (Math.random() - 0.5) * 15 * sizeMod
        context.fillRect(sparkX, sparkY, 2, 2)
      }
    }
  }
}