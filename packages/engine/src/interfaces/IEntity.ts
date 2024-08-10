/*
Entity System Interfaces - Component Architecture:
- Decouples entity management from specific implementations
- Enables different entity storage strategies (arrays, maps, pools)
- Supports trait composition without inheritance constraints
- See: Game Programming Patterns (Nystrom) - Component chapter
*/

import { ITrait, ITraitEntity, ITraitContext } from './ITrait'

// Core entity data without behavior coupling
export interface IEntityData {
  id: string | null
  pos: { x: number; y: number; set(x: number, y: number): void }
  vel: { x: number; y: number; set(x: number, y: number): void }
  size: { x: number; y: number; set(x: number, y: number): void }
  lifetime: number
}

/*
IEntityManager Interface:
- Manages entity lifecycle without coupling to specific storage
- Enables entity pooling for performance optimization
- Supports efficient iteration patterns for update loops
*/
export interface IEntityManager<T extends ITraitEntity = ITraitEntity> {
  // Entity lifecycle
  createEntity(id?: string): T
  destroyEntity(entity: T): void
  getEntity(id: string): T | undefined
  
  // Collection operations
  getAllEntities(): Iterable<T>
  getEntitiesByTag?(tag: string): Iterable<T>
  getEntityCount(): number
  
  // Bulk operations for performance
  updateAllEntities(context: ITraitContext): void
  finalizeAllEntities(): void
  
  // Memory management
  clearAll(): void
  compactStorage?(): void
}

/*
ITraitContainer Interface:
- Manages trait composition without tight coupling to Entity class
- Enables runtime trait addition/removal for dynamic behavior
- Supports trait querying and iteration patterns
*/
export interface ITraitContainer {
  // Trait management
  addTrait<T extends ITrait>(trait: T): T
  removeTrait<T extends ITrait>(TraitType: new (...args: any[]) => T): boolean
  getTrait<T extends ITrait>(TraitType: new (...args: any[]) => T): T | undefined
  hasTrait<T extends ITrait>(TraitType: new (...args: any[]) => T): boolean
  
  // Trait iteration for update loops
  getAllTraits(): Iterable<ITrait>
  getTraitCount(): number
  
  // Trait querying by interface/capability
  getTraitsByType?<T extends ITrait>(type: string): T[]
}

/*
IEntityFactory Interface:
- Decouples entity creation from specific implementations
- Enables prefab system and entity templates
- Supports dependency injection for entity construction
*/
export interface IEntityFactory<T extends ITraitEntity = ITraitEntity> {
  // Entity creation patterns
  createEntity(template?: string): T
  createFromTemplate(templateName: string, overrides?: Partial<IEntityData>): T
  
  // Template management
  registerTemplate(name: string, factory: () => T): void
  hasTemplate(name: string): boolean
  
  // Batch creation for performance
  createEntities(count: number, template?: string): T[]
}

/*
IEntityQuery Interface:
- Enables efficient entity queries without coupling to storage implementation
- Supports filtering by traits, tags, spatial location
- Performance optimization for systems that process entity subsets
*/
export interface IEntityQuery<T extends ITraitEntity = ITraitEntity> {
  // Trait-based queries
  withTrait<TTrait extends ITrait>(TraitType: new (...args: any[]) => TTrait): IEntityQuery<T>
  withoutTrait<TTrait extends ITrait>(TraitType: new (...args: any[]) => TTrait): IEntityQuery<T>
  
  // Property-based filtering
  withTag(tag: string): IEntityQuery<T>
  inRegion(bounds: { x: number; y: number; width: number; height: number }): IEntityQuery<T>
  
  // Query execution
  execute(): Iterable<T>
  count(): number
  first(): T | undefined
}