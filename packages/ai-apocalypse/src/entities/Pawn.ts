import { Entity, Physics, Go, Solid, Pathfinding } from '@js2d/engine'
// TODO: Import from AI package when created
// import { 
//   NPCPersonality, 
//   NPCNeeds, 
//   NPCMemory, 
//   GOAPPlanner 
// } from '@js2d/traits-ai'
import { WeaponTrait } from '../traits/WeaponTrait'
import { WorkerTrait } from '../traits/WorkerTrait'
import { Weapons } from '../weapons/WeaponTypes'
import { PawnSprite, PawnAppearance } from '../sprites/PawnSprite'

/**
 * RimWorld-style pawn - autonomous colonist with needs, skills, and AI
 */
export class Pawn extends Entity {
  name: string
  appearance: PawnAppearance
  
  constructor(name: string) {
    super()
    this.name = name
    this.appearance = PawnSprite.generateRandomAppearance()
    
    // Basic movement traits
    this.addTrait(new Physics())
    this.addTrait(new Solid())
    this.addTrait(new Go())
    this.addTrait(new Pathfinding())
    
    // AI traits
    // TODO: Enable when AI package is created
    // this.addTrait(new NPCPersonality())
    // this.addTrait(new NPCNeeds())
    // this.addTrait(new NPCMemory())
    // this.addTrait(new GOAPPlanner())
    
    // Game-specific traits
    this.addTrait(new WorkerTrait())
    
    const weaponTrait = new WeaponTrait()
    weaponTrait.addWeapon(Weapons.neural_spike)
    this.addTrait(weaponTrait)
    
    // Set size
    this.size.set(20, 28)
    
    // Configure personality randomly
    // TODO: Enable when AI package is created
    // this.randomizePersonality()
    
    // Set needs
    // this.initializeNeeds()
  }
  
  private randomizePersonality(): void {
    const personality = this.getTrait(NPCPersonality)
    if (!personality) return
    
    // Randomize traits for variety
    personality.honesty = Math.floor(Math.random() * 255)
    personality.courage = Math.floor(Math.random() * 255)
    personality.intelligence = Math.floor(Math.random() * 255)
    personality.charisma = Math.floor(Math.random() * 255)
    personality.compassion = Math.floor(Math.random() * 255)
    personality.patience = Math.floor(Math.random() * 255)
  }
  
  private initializeNeeds(): void {
    const needs = this.getTrait(NPCNeeds)
    if (!needs) return
    
    // Start with random need levels
    needs.hunger = Math.floor(Math.random() * 100)
    needs.thirst = Math.floor(Math.random() * 100)
    needs.sleep = Math.floor(Math.random() * 100)
    needs.social = Math.floor(Math.random() * 50)
  }
  
  /**
   * Draw pawn with procedural sprite
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save()
    
    // Draw the pawn sprite
    const go = this.getTrait(Go)
    const facing = go && go.dir < 0 ? 'left' : 'right'
    
    PawnSprite.draw(context, this.appearance, 0, 0, 1, facing)
    
    // Name tag
    context.fillStyle = '#ffffff'
    context.font = '10px sans-serif'
    context.textAlign = 'center'
    context.strokeStyle = '#000000'
    context.lineWidth = 2
    context.strokeText(this.name, 0, -28)
    context.fillText(this.name, 0, -28)
    
    // Need indicators
    // TODO: Enable when AI package is created
    // const needs = this.getTrait(NPCNeeds)
    // this.drawNeedIndicators(context, needs)
    
    // Tool/weapon indicator
    const worker = this.getTrait(WorkerTrait)
    if (worker?.currentTool) {
      context.fillStyle = '#10b981'
      context.fillRect(-20, -20, 4, 4)
    }
    
    context.restore()
  }
  
  private drawNeedIndicators(context: CanvasRenderingContext2D, needs: any): void {
    if (!needs) return
    
    let indicatorY = 20
    
    // Hunger bar
    if (needs.hunger > 100) {
      this.drawNeedBar(context, 'Hunger', needs.hunger / 255, '#ef4444', indicatorY)
      indicatorY += 6
    }
    
    // Thirst bar
    if (needs.thirst > 100) {
      this.drawNeedBar(context, 'Thirst', needs.thirst / 255, '#3b82f6', indicatorY)
      indicatorY += 6
    }
    
    // Sleep bar
    if (needs.sleep > 100) {
      this.drawNeedBar(context, 'Sleep', needs.sleep / 255, '#8b5cf6', indicatorY)
      indicatorY += 6
    }
  }
  
  private drawNeedBar(
    context: CanvasRenderingContext2D, 
    label: string, 
    value: number, 
    color: string, 
    y: number
  ): void {
    // Background
    context.fillStyle = '#374151'
    context.fillRect(-20, y, 40, 4)
    
    // Fill
    context.fillStyle = color
    context.fillRect(-20, y, value * 40, 4)
    
    // Label
    context.fillStyle = '#ffffff'
    context.font = '8px sans-serif'
    context.fillText(label[0], -25, y + 3)
  }
}

/**
 * Generate random pawn names
 */
const firstNames = [
  'Alex', 'Blake', 'Casey', 'Drew', 'Ellis', 'Finn', 'Gray', 'Harper',
  'Jade', 'Kit', 'Lane', 'Max', 'Nova', 'Onyx', 'Phoenix', 'Quinn',
  'Reese', 'Sage', 'Sky', 'Taylor', 'Vale', 'Winter', 'Zen'
]

const lastNames = [
  'Steel', 'Gray', 'Stone', 'Cross', 'Black', 'White', 'Green', 'Blue',
  'North', 'South', 'East', 'West', 'Hill', 'Vale', 'Fox', 'Wolf',
  'Hawk', 'Storm', 'Frost', 'Fire', 'Light', 'Dark', 'Hope'
]

export function generatePawnName(): string {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)]
  const last = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${first} ${last}`
}

/**
 * Factory function
 */
export function createPawn(name?: string): Pawn {
  return new Pawn(name || generatePawnName())
}