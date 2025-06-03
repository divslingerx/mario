# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Monorepo Commands
- **Development**: `pnpm dev` - Start Mario demo development server (default)
- **Build All**: `pnpm build` - Build all packages in workspace
- **Install**: `pnpm install` - Install dependencies for all packages

### Package-Specific Commands
Run from package directory or with `pnpm --filter <package-name>`:
- **Engine packages**: `pnpm build` (TypeScript compilation)
- **Demo packages**: `pnpm dev` (Vite dev server), `pnpm build` (production build)
- **AI Apocalypse**: `pnpm --filter @js2d/ai-apocalypse dev`

## Architecture

This is a modular 2D game engine built with TypeScript, evolving from a Mario Bros clone into a general-purpose game framework with AI capabilities.

### Monorepo Structure

```
packages/
├── engine/              # Core game engine (@js2d/engine)
├── mario-demo/          # Classic Mario implementation
├── ai-apocalypse/       # AI survival RPG game
├── traits-ai/           # GOAP AI behaviors
├── traits-emergent/     # State propagation & emergent behaviors
├── traits-physics/      # Rapier2D physics integration
├── traits-procedural/   # Procedural generation
└── docs/                # Documentation site
```

### Core Systems

**Entity-Trait System**: Entities are composed of reusable traits (components). Use `entity.addTrait()` to attach behaviors and `entity.getTrait()` to access them. Traits follow a lifecycle: update → obstruct → collides → finalize.

**Scene Management**: `SceneRunner` orchestrates scene transitions. Levels extend `Scene` and contain entities, collision systems, and rendering layers.

**Collision System**:
- `EntityCollider` handles entity-to-entity collisions
- `TileCollider` handles entity-to-tile collisions
- Uses bounding box intersection detection

**Input System**: Unified input handling supporting multiple sources:
- `KeyboardInputSource` - Traditional keyboard controls
- `GamepadInputSource` - Controller support
- `AIInputSource` - AI-driven input for NPCs
- Access via `inputRouter.getInput(playerIndex)`

**Rendering Pipeline**: `Compositor` manages layered rendering with different layer types (background, sprites, collision debug, UI dashboard, etc.)

**Audio System**: `AudioBoard` manages sound effects, `MusicController` handles background music with looping and transitions.

**AI Systems**:
- **Pathfinding**: A* pathfinding with `PathfindingSystem` and `Pathfinding` trait
- **Vision**: `VisionCone` trait for line-of-sight detection
- **GOAP**: Goal-Oriented Action Planning in `@js2d/traits-ai`

### Key Directories

**Engine Package** (`packages/engine/src/`):
- `Entity.ts`, `Trait.ts`, `Level.ts` - Core ECS classes
- `traits/` - Built-in traits (Physics, Gravity, Jump, etc.)
- `layers/` - Rendering layer implementations
- `loaders/` - Asset loading utilities
- `input/` - Input system implementations
- `systems/` - Game systems (PathfindingSystem)

**Game Assets** (`public/`):
- `levels/` - Level definition JSON files
- `sprites/` - Sprite animation definitions
- `audio/` - Sound effects and music
- `img/` - Sprite sheets and textures

### Entity Creation Pattern

```typescript
// Entity factory pattern
export function createPawn() {
  const pawn = new Entity()
  pawn.size.set(16, 24)
  
  // Add traits for behavior composition
  pawn.addTrait(new Physics())
  pawn.addTrait(new Gravity())
  pawn.addTrait(new Go())
  pawn.addTrait(new Jump())
  
  return pawn
}

// Access traits
const physics = entity.getTrait(Physics)
physics.velocity.set(100, 0)
```

### Level Loading

Levels are JSON-defined with entities, tiles, backgrounds, and triggers. The level loader creates entities from factories and sets up the complete scene including collision layers and UI elements.

### Input Handling Pattern

```typescript
// Setup input router with multiple sources
const inputRouter = new InputRouter()
inputRouter.addSource(0, new KeyboardInputSource(keyboard))
inputRouter.addSource(1, new GamepadInputSource())
inputRouter.addSource(2, new AIInputSource(aiController))

// In entity update
const input = inputRouter.getInput(playerIndex)
if (input.jump.pressed) {
  jump.start()
}
```

## Code Documentation and Commenting Standards

### Comment Philosophy
Comments should provide context and reasoning, not just describe what the code does. Assume developers are mid to senior level and focus on why and what to research rather than how.

### Good Commenting Practices

**For Game Engine Architecture:**
```typescript
// Entity-Component System uses trait composition over inheritance to avoid 
// diamond problem and enable flexible behavior mixing. See: ECS design patterns
entity.addTrait(new Physics())
```

**For Performance Optimizations:**
```typescript
// Spatial partitioning reduces collision checks from O(n²) to O(n log n)
// Critical for performance with 100+ entities. See: Quadtree algorithms
const quadtree = new QuadTree(level.bounds)
```

**For Game Logic Decisions:**
```typescript
// Fixed timestep prevents physics inconsistencies across different framerates
// while allowing rendering interpolation. See: "Fix Your Timestep" article
timer.update = function update(deltaTime) { /* ... */ }
```

**For Asset Loading Strategy:**
```typescript
// Preload all sprites in parallel to prevent frame drops during gameplay
// Trade initial load time for smooth runtime performance
const [sprites, audio] = await Promise.all([loadSprites(), loadAudio()])
```

### Avoid Over-Commenting

Don't explain obvious TypeScript/JavaScript:
```typescript
// BAD: Set entity position
entity.pos.set(x, y)

// GOOD: No comment needed
entity.pos.set(x, y)
```

Don't repeat the implementation:
```typescript
// BAD: Loop through entities and update them
entities.forEach(entity => entity.update())

// GOOD: Update all entities in current frame
entities.forEach(entity => entity.update())
```

### When to Use Verbose Comments

**Complex System Interactions:**
```typescript
/*
Collision Detection Pipeline:
- Broad phase: Spatial partitioning eliminates distant entity pairs
- Narrow phase: AABB intersection for remaining candidates  
- Response: Trait-based collision handlers for game-specific behavior
- See: Real-Time Collision Detection (Ericson) for algorithms
*/
```

**Engine Design Decisions:**
```typescript
/*
Component Messaging via EventBuffer:
- Events queued during update phase, processed after all updates
- Prevents mid-frame state corruption from entity destruction/creation
- Alternative to immediate callbacks which can cause cascade bugs
- See: Entity system architecture patterns
*/
```

**Performance-Critical Code:**
```typescript
/*
Audio Context Management:
- Single shared AudioContext prevents browser concurrency limits
- Audio buffers pooled and reused to avoid GC pressure
- Critical for mobile performance where audio allocation is expensive
- See: Web Audio API best practices
*/
```

### Comment Guidelines Summary

**Do Comment:**
- Why specific game engine patterns were chosen
- Performance implications of rendering/physics decisions  
- Research directions for game developers needing deeper understanding
- System interactions between engine subsystems
- Game logic that implements domain-specific requirements

**Don't Comment:**
- TypeScript language features or standard library usage
- Simple property assignments and method calls
- Code that clearly expresses its game development intent
- Implementation details obvious from reading

**Key Principle:** Comments should make a game developer productive quickly without overwhelming them with unnecessary detail.

## Documentation Standards

### Documentation Philosophy
Documentation should be **living, tested, and minimal** - focus on what developers need to be productive rather than comprehensive coverage.

### Documentation Types

**Auto-Generated (Low Maintenance):**
- **API Reference**: TypeDoc from JSDoc comments in code
- **Performance Benchmarks**: Auto-generated from benchmark system  
- **Component Catalog**: Living examples that are also integration tests

**Manual Documentation (High Value Only):**
- **Getting Started**: Single tutorial covering 80% of common use cases
- **Architecture Guide**: High-level system interactions and design decisions
- **Game Type Tutorials**: One each for RPG, platformer, puzzle games
- **Migration Guides**: Only for breaking changes

### JSDoc Standards for Auto-Generated Docs

```typescript
/**
 * Creates physics body with collision detection
 * 
 * @example
 * ```typescript
 * // RPG character with kinematic physics
 * world.addComponent(player, RigidBody, {
 *   bodyType: 1, // Kinematic (input-controlled)
 *   mass: 70,
 *   linearDamping: 5.0 // Stops quickly
 * })
 * ```
 * 
 * @param entity - Entity to attach physics to
 * @param config - Physics configuration
 * @see {@link PhysicsWorld} for world setup
 * @see {@link https://rapier.rs} for physics engine docs
 */
```

### Living Examples as Documentation

All examples in `/packages/docs/examples/` must:
- **Compile successfully** (tested in CI)
- **Demonstrate real usage** (not toy examples)  
- **Include performance assertions** (verify targets met)
- **Double as integration tests** (catch API breakage)

### Documentation Maintenance Rules

**When Adding New APIs:**
1. Add JSDoc with practical example
2. Update existing living examples if they use the API
3. Add to getting started guide only if it's core functionality

**When Changing APIs:**
1. Update JSDoc examples first
2. Run example tests to verify they still work
3. Add migration notes only for breaking changes

**When Optimizing Performance:**
1. Update benchmark targets in examples
2. Document performance implications in JSDoc
3. Add to performance guide if it affects general usage

### Documentation File Structure
```
packages/docs/
├── .vitepress/          # VitePress config
├── guide/               # Manual tutorials (minimal)  
├── examples/            # Living examples + tests
├── api/                 # Auto-generated API docs
└── README.md            # Quick start + links
```

### Performance Documentation
- Benchmark results auto-generated from test runs
- Performance targets documented in code alongside benchmarks
- Optimization tips included in JSDoc for performance-critical APIs

**Documentation Principle:** Write once, maintain automatically, focus on developer productivity over completeness.