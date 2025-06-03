import { Trait } from '@js2d/engine'
import { Entity } from '@js2d/engine'

export enum WorkType {
  MINING = 'mining',
  BUILDING = 'building',
  CRAFTING = 'crafting',
  FARMING = 'farming',
  HAULING = 'hauling',
  REPAIRING = 'repairing',
  COOKING = 'cooking',
  RESEARCHING = 'researching'
}

export interface Job {
  id: string
  type: WorkType
  priority: number
  targetX: number
  targetY: number
  targetEntity?: number
  progress: number
  maxProgress: number
  requiredTool?: string
  onComplete?: () => void
  onCancel?: () => void
}

/**
 * Allows entities to perform work tasks
 */
export class WorkerTrait extends Trait {
  static componentName = 'worker'
  
  // Skill levels (0-20, RimWorld style)
  skills: Record<WorkType, number> = {
    [WorkType.MINING]: 0,
    [WorkType.BUILDING]: 0,
    [WorkType.CRAFTING]: 0,
    [WorkType.FARMING]: 0,
    [WorkType.HAULING]: 0,
    [WorkType.REPAIRING]: 0,
    [WorkType.COOKING]: 0,
    [WorkType.RESEARCHING]: 0
  }
  
  // Work preferences (-1 = hate, 0 = neutral, 1 = love)
  preferences: Record<WorkType, number> = {
    [WorkType.MINING]: 0,
    [WorkType.BUILDING]: 0,
    [WorkType.CRAFTING]: 0,
    [WorkType.FARMING]: 0,
    [WorkType.HAULING]: 0,
    [WorkType.REPAIRING]: 0,
    [WorkType.COOKING]: 0,
    [WorkType.RESEARCHING]: 0
  }
  
  // Current state
  currentJob: Job | null = null
  currentTool: string | null = null
  workSpeed = 1.0
  
  // Carried items
  carriedItem: string | null = null
  carryCapacity = 50
  
  constructor() {
    super()
    this.randomizeSkills()
  }
  
  /**
   * Randomize starting skills and preferences
   */
  private randomizeSkills(): void {
    for (const workType of Object.values(WorkType)) {
      // Random skill level 0-10 for starting pawns
      this.skills[workType] = Math.floor(Math.random() * 11)
      
      // Random preference
      const rand = Math.random()
      if (rand < 0.2) {
        this.preferences[workType] = -1 // Hates this work
      } else if (rand > 0.8) {
        this.preferences[workType] = 1 // Loves this work
      }
    }
  }
  
  /**
   * Assign a new job
   */
  assignJob(job: Job): boolean {
    // Check if worker can do this job
    if (!this.canDoJob(job)) return false
    
    // Cancel current job if any
    if (this.currentJob) {
      this.cancelCurrentJob()
    }
    
    this.currentJob = job
    return true
  }
  
  /**
   * Check if worker can perform a job
   */
  canDoJob(job: Job): boolean {
    // Check if has required tool
    if (job.requiredTool && this.currentTool !== job.requiredTool) {
      return false
    }
    
    // Check if hates this work type
    if (this.preferences[job.type] === -1) {
      return false
    }
    
    return true
  }
  
  /**
   * Cancel current job
   */
  cancelCurrentJob(): void {
    if (this.currentJob) {
      this.currentJob.onCancel?.()
      this.currentJob = null
    }
  }
  
  /**
   * Update work progress
   */
  update(entity: Entity, deltaTime: number): void {
    if (!this.currentJob) return
    
    // Check if at work location
    const dx = entity.pos.x - this.currentJob.targetX
    const dy = entity.pos.y - this.currentJob.targetY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 32) {
      // Too far, need to move closer
      return
    }
    
    // Calculate work speed based on skill
    const skill = this.skills[this.currentJob.type]
    const efficiency = 0.5 + (skill / 20) * 1.5 // 50% to 200% speed
    const preferenceBonus = this.preferences[this.currentJob.type] === 1 ? 1.2 : 1.0
    
    // Apply work
    const workAmount = this.workSpeed * efficiency * preferenceBonus * (deltaTime / 1000)
    this.currentJob.progress += workAmount
    
    // Check if complete
    if (this.currentJob.progress >= this.currentJob.maxProgress) {
      this.completeJob()
    }
  }
  
  /**
   * Complete current job
   */
  private completeJob(): void {
    if (!this.currentJob) return
    
    // Gain experience
    this.gainExperience(this.currentJob.type, 10)
    
    // Call completion callback
    this.currentJob.onComplete?.()
    
    // Clear job
    this.currentJob = null
  }
  
  /**
   * Gain skill experience
   */
  gainExperience(workType: WorkType, amount: number): void {
    const currentSkill = this.skills[workType]
    
    // Harder to gain skill at higher levels
    const gainRate = 1 / (1 + currentSkill / 10)
    const actualGain = amount * gainRate
    
    this.skills[workType] = Math.min(20, currentSkill + actualGain)
  }
  
  /**
   * Pick up an item
   */
  pickUpItem(itemId: string): boolean {
    if (this.carriedItem) return false
    
    this.carriedItem = itemId
    return true
  }
  
  /**
   * Drop carried item
   */
  dropItem(): string | null {
    const item = this.carriedItem
    this.carriedItem = null
    return item
  }
  
  /**
   * Equip a tool
   */
  equipTool(toolId: string): void {
    this.currentTool = toolId
  }
  
  /**
   * Get work efficiency for a job type
   */
  getEfficiency(workType: WorkType): number {
    const skill = this.skills[workType]
    const base = 0.5 + (skill / 20) * 1.5
    const preference = this.preferences[workType]
    
    if (preference === 1) return base * 1.2
    if (preference === -1) return 0 // Won't do it
    return base
  }
  
  /**
   * Get worker summary for UI
   */
  getWorkerInfo() {
    return {
      currentJob: this.currentJob ? {
        type: this.currentJob.type,
        progress: (this.currentJob.progress / this.currentJob.maxProgress) * 100
      } : null,
      carriedItem: this.carriedItem,
      currentTool: this.currentTool,
      topSkills: this.getTopSkills(3),
      hatedWork: Object.entries(this.preferences)
        .filter(([_, pref]) => pref === -1)
        .map(([type]) => type as WorkType)
    }
  }
  
  /**
   * Get top skills
   */
  private getTopSkills(count: number): Array<{ type: WorkType; level: number }> {
    return Object.entries(this.skills)
      .map(([type, level]) => ({ type: type as WorkType, level }))
      .sort((a, b) => b.level - a.level)
      .slice(0, count)
  }
}