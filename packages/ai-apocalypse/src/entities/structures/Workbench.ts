import { Entity, Solid } from '@js2d/engine'
import { StructureStats } from './Wall'
import { WorkType } from '../../traits/WorkerTrait'

export interface Recipe {
  id: string
  name: string
  workType: WorkType
  workAmount: number
  ingredients: Record<string, number>
  products: Record<string, number>
  requiredSkill: number
}

/**
 * Crafting workbench where pawns can create items
 */
export class Workbench extends Entity {
  static stats: StructureStats = {
    maxHealth: 200,
    buildTime: 15,
    requiredMaterials: {
      'steel': 10,
      'components': 3
    }
  }
  
  static recipes: Recipe[] = [
    {
      id: 'craft_components',
      name: 'Craft Components',
      workType: WorkType.CRAFTING,
      workAmount: 20,
      ingredients: { 'steel': 5 },
      products: { 'components': 1 },
      requiredSkill: 3
    },
    {
      id: 'craft_medicine',
      name: 'Craft Medicine',
      workType: WorkType.CRAFTING,
      workAmount: 30,
      ingredients: { 'herbs': 3, 'components': 1 },
      products: { 'medicine': 2 },
      requiredSkill: 5
    },
    {
      id: 'craft_weapon_parts',
      name: 'Craft Weapon Parts',
      workType: WorkType.CRAFTING,
      workAmount: 40,
      ingredients: { 'steel': 8, 'components': 2 },
      products: { 'weapon_parts': 1 },
      requiredSkill: 7
    }
  ]
  
  health: number
  maxHealth: number
  isBuilt = false
  buildProgress = 0
  
  // Current crafting job
  currentRecipe: Recipe | null = null
  craftingProgress = 0
  assignedWorker: number | null = null
  
  // Storage
  inputStorage: Record<string, number> = {}
  outputStorage: Record<string, number> = {}
  maxStorage = 50
  
  constructor() {
    super()
    
    this.maxHealth = Workbench.stats.maxHealth
    this.health = this.maxHealth
    
    // Workbenches are solid
    this.addTrait(new Solid())
    
    // Set size (wider than tall)
    this.size.set(48, 32)
  }
  
  /**
   * Start crafting a recipe
   */
  startCrafting(recipeId: string, workerId: number): boolean {
    if (!this.isBuilt || this.currentRecipe) return false
    
    const recipe = Workbench.recipes.find(r => r.id === recipeId)
    if (!recipe) return false
    
    // Check ingredients
    if (!this.hasIngredients(recipe)) return false
    
    // Consume ingredients
    for (const [item, amount] of Object.entries(recipe.ingredients)) {
      this.inputStorage[item] = (this.inputStorage[item] || 0) - amount
    }
    
    this.currentRecipe = recipe
    this.craftingProgress = 0
    this.assignedWorker = workerId
    
    return true
  }
  
  /**
   * Check if has required ingredients
   */
  hasIngredients(recipe: Recipe): boolean {
    for (const [item, amount] of Object.entries(recipe.ingredients)) {
      if ((this.inputStorage[item] || 0) < amount) {
        return false
      }
    }
    return true
  }
  
  /**
   * Apply crafting work
   */
  applyCraftingWork(amount: number): void {
    if (!this.currentRecipe) return
    
    this.craftingProgress += amount
    
    if (this.craftingProgress >= this.currentRecipe.workAmount) {
      this.completeCrafting()
    }
  }
  
  /**
   * Complete current crafting
   */
  private completeCrafting(): void {
    if (!this.currentRecipe) return
    
    // Add products to output
    for (const [item, amount] of Object.entries(this.currentRecipe.products)) {
      this.outputStorage[item] = (this.outputStorage[item] || 0) + amount
    }
    
    this.events.emit('crafting-complete', {
      recipe: this.currentRecipe,
      worker: this.assignedWorker
    })
    
    this.currentRecipe = null
    this.craftingProgress = 0
    this.assignedWorker = null
  }
  
  /**
   * Add items to input storage
   */
  addInput(item: string, amount: number): number {
    const current = this.inputStorage[item] || 0
    const space = this.maxStorage - this.getTotalStorage()
    const toAdd = Math.min(amount, space)
    
    this.inputStorage[item] = current + toAdd
    return toAdd
  }
  
  /**
   * Take items from output storage
   */
  takeOutput(item: string, amount: number): number {
    const available = this.outputStorage[item] || 0
    const toTake = Math.min(amount, available)
    
    this.outputStorage[item] = available - toTake
    if (this.outputStorage[item] === 0) {
      delete this.outputStorage[item]
    }
    
    return toTake
  }
  
  /**
   * Get total items in storage
   */
  private getTotalStorage(): number {
    let total = 0
    for (const amount of Object.values(this.inputStorage)) {
      total += amount
    }
    for (const amount of Object.values(this.outputStorage)) {
      total += amount
    }
    return total
  }
  
  /**
   * Draw the workbench
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save()
    
    if (!this.isBuilt) {
      // Blueprint mode
      context.globalAlpha = 0.5
      context.strokeStyle = '#60a5fa'
      context.lineWidth = 2
      context.setLineDash([5, 5])
      context.strokeRect(-24, -16, 48, 32)
    } else {
      // Workbench surface
      context.fillStyle = '#8b5cf6' // Purple for tech
      context.fillRect(-24, -16, 48, 24)
      
      // Legs
      context.fillStyle = '#4c1d95'
      context.fillRect(-20, 8, 4, 8)
      context.fillRect(16, 8, 4, 8)
      
      // Work surface details
      context.strokeStyle = '#a78bfa'
      context.lineWidth = 1
      context.strokeRect(-22, -14, 44, 20)
      
      // Tools on surface
      context.fillStyle = '#e5e7eb'
      context.fillRect(-16, -12, 8, 4)  // Tool 1
      context.fillRect(-4, -10, 6, 6)   // Tool 2
      context.fillRect(8, -12, 10, 3)   // Tool 3
      
      // Crafting progress
      if (this.currentRecipe) {
        const progress = this.craftingProgress / this.currentRecipe.workAmount
        
        // Progress bar
        context.fillStyle = '#1f2937'
        context.fillRect(-20, -20, 40, 3)
        context.fillStyle = '#10b981'
        context.fillRect(-20, -20, 40 * progress, 3)
        
        // Sparks/work effect
        if (Math.random() > 0.7) {
          context.fillStyle = '#fbbf24'
          for (let i = 0; i < 3; i++) {
            const x = (Math.random() - 0.5) * 20
            const y = -10 + Math.random() * 5
            context.fillRect(x, y, 2, 2)
          }
        }
      }
      
      // Storage indicators
      if (Object.keys(this.outputStorage).length > 0) {
        context.fillStyle = '#10b981'
        context.beginPath()
        context.arc(20, -20, 3, 0, Math.PI * 2)
        context.fill()
      }
    }
    
    context.restore()
  }
}

/**
 * Factory function
 */
export function createWorkbench(): Workbench {
  return new Workbench()
}