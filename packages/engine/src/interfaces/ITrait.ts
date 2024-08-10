/*
ITrait Interface for Component-Based Architecture:
- Decouples trait implementations from specific Entity/Level classes
- Enables flexible composition without inheritance constraints  
- Supports dependency injection for better testability
- See: Entity Component System design patterns
*/

import { Side } from '../Entity'

// Generic context for trait operations - decouples from specific implementations
export interface ITraitContext {
  deltaTime: number
  tick: number
}

// Minimal entity interface that traits need - avoids tight coupling to full Entity class
export interface ITraitEntity {
  pos: { x: number; y: number }
  vel: { x: number; y: number }
  size: { x: number; y: number }
  lifetime: number
}

// Collision match data without coupling to TileResolver implementation
export interface ICollisionMatch {
  tile: { name: string; type: string }
  x1: number
  y1: number
  x2: number
  y2: number
}

// Event system interface - enables trait communication without direct coupling
export interface IEventTarget {
  emit(event: string | symbol, ...args: any[]): void
  listen(event: string | symbol, callback: (...args: any[]) => void): void
}

/*
ITrait Interface:
- Minimal contract for trait behavior
- Uses generic types to avoid coupling to specific implementations
- Each method is optional to support focused trait implementations
*/
export interface ITrait<TEntity extends ITraitEntity = ITraitEntity, TContext extends ITraitContext = ITraitContext> {
  // Core trait lifecycle
  update?(entity: TEntity, context: TContext): void
  finalize?(entity: TEntity): void
  
  // Collision system integration
  obstruct?(entity: TEntity, side: Side, match: ICollisionMatch): void
  collides?(us: TEntity, them: TEntity): void
  
  // Event system for trait communication
  events?: IEventTarget
}

/*
TraitComponent Base Class:
- Provides common functionality while implementing ITrait interface
- Can be extended or used as composition target
- Reduces boilerplate for trait implementations
*/
export abstract class TraitComponent<TEntity extends ITraitEntity = ITraitEntity, TContext extends ITraitContext = ITraitContext> implements ITrait<TEntity, TContext> {
  protected listeners: Array<{
    name: string | symbol
    callback: (...args: any[]) => void
    count: number
  }> = []

  protected listen(name: string | symbol, callback: (...args: any[]) => void, count = Infinity) {
    this.listeners.push({ name, callback, count })
  }

  // Template methods - subclasses override as needed
  update?(entity: TEntity, context: TContext): void
  obstruct?(entity: TEntity, side: Side, match: ICollisionMatch): void  
  collides?(us: TEntity, them: TEntity): void

  finalize(entity: TEntity): void {
    // Process queued events if entity has event system
    if ('events' in entity && entity.events && typeof entity.events.emit === 'function') {
      for (const listener of this.listeners) {
        listener.callback()
        listener.count -= 1
      }
    }
    
    this.listeners = this.listeners.filter(listener => listener.count > 0)
  }
}