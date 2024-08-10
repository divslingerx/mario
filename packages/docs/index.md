---
layout: home

hero:
  name: JS2D Game Engine
  text: High-Performance Modular 2D Games
  tagline: Build RPGs, platformers, and procedural worlds with TypeScript
  image:
    src: /logo.svg
    alt: JS2D
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View Examples
      link: /examples/
    - theme: alt
      text: API Reference
      link: /api/

features:
  - icon: ⚡
    title: High Performance
    details: BitECS + Rapier + PixiJS for 60fps with 1000+ entities. Optimized for mobile and desktop.
  
  - icon: 🧩
    title: Modular Traits
    details: Mix and match traits like Lego blocks. RPG + Physics + Procedural generation in any combination.
  
  - icon: 🌍
    title: Infinite Worlds
    details: Wave Function Collapse terrain generation with real-time streaming. Perfect for open-world RPGs.
  
  - icon: 🎮
    title: Game-Ready Systems
    details: Complete RPG mechanics, inventory, dialog, quests, and faction systems out of the box.
  
  - icon: 🌐
    title: Multiplayer Ready
    details: Deterministic physics and component serialization built for networked games.
  
  - icon: 📱
    title: Modern TypeScript
    details: Full type safety, excellent IDE support, and modern JavaScript patterns throughout.
---

## Quick Start

Create your first top-down RPG in minutes:

```typescript
import { JS2DWorld, Transform, Sprite } from '@js2d/engine'
import { RPGStats, TopDownMovement, Inventory } from '@js2d/traits-topdown'
import { RigidBody, Collider } from '@js2d/traits-physics'

// Create game world
const world = new JS2DWorld()

// Create player character
const player = world.createEntity()
world.addComponent(player, Transform, { x: 100, y: 100 })
world.addComponent(player, RPGStats, { 
  strength: 7, agility: 8, intelligence: 6 
})
world.addComponent(player, TopDownMovement, { moveSpeed: 150 })
world.addComponent(player, Inventory, { maxSlots: 20 })

// Add physics for collision
world.addComponent(player, RigidBody, { bodyType: 1 }) // Kinematic
world.addComponent(player, Collider, { width: 32, height: 32 })

// Game loop
function update(deltaTime: number) {
  world.update(deltaTime)
}
```

## Architecture Overview

JS2D uses a modern Entity-Component-System architecture optimized for performance:

### 🎯 **Core Engine** (`@js2d/engine`)
- **BitECS** - Cache-friendly ECS with excellent performance
- **PixiJS Renderer** - WebGL-accelerated 2D graphics with batching
- **Rapier Physics** - Deterministic Rust-based physics via WASM

### 🔧 **Trait Packages** (Mix and Match)
- **`@js2d/traits-physics`** - RigidBody, Collider, Joint components
- **`@js2d/traits-topdown`** - RPG stats, inventory, dialog, combat
- **`@js2d/traits-procedural`** - Wave Function Collapse, infinite worlds
- **`@js2d/traits-sidescroller`** - Platformer mechanics (coming soon)

### 📊 **Performance Targets**
- **60 FPS** with 500+ physics bodies
- **1000+ entities** with complex trait interactions  
- **< 5ms** physics simulation time
- **Infinite worlds** with real-time generation

## Why JS2D?

### Traditional Game Engines
- **Monolithic** - Everything coupled together
- **Language barriers** - C++ or custom scripting
- **Mobile performance** - Often poor on devices
- **Learning curve** - Steep for web developers

### JS2D Approach
- **Modular traits** - Use only what you need
- **Modern TypeScript** - Familiar to web developers
- **Web-first performance** - Optimized for browsers
- **Incremental adoption** - Start simple, add complexity

## Community & Support

- 📖 **[Documentation](/guide/getting-started)** - Comprehensive guides and API reference
- 🎮 **[Live Examples](/examples/)** - Interactive examples you can modify
- 💬 **[Discord](https://discord.gg/js2d)** - Community discussion and support
- 🐛 **[GitHub Issues](https://github.com/your-org/js2d/issues)** - Bug reports and feature requests
- 📺 **[YouTube Tutorials](https://youtube.com/js2d)** - Video walkthroughs

## License

[MIT](https://github.com/your-org/js2d/blob/main/LICENSE) - Build commercial games without restrictions.