# JS2D Engine Traits Catalog

This document outlines all traits (components/systems) for the JS2D engine, focused on building deep, systemic RPGs with emergent gameplay. The engine is designed for games like our AI Apocalypse RPG - think Fallout meets STALKER in a world where AI took over.

## Core Traits (Engine Package)
Essential traits that most games will need.

### Movement & Physics
- **Transform** - Position, rotation, scale
- **Velocity** - Linear and angular velocity
- **Gravity** - Applies gravity force
- **Collider** - Physics collision shape
- **RigidBody** - Physics body properties
- **Friction** - Surface friction values
- **Bounciness** - Restitution/elasticity

### Rendering
- **Sprite** - 2D sprite rendering
- **AnimatedSprite** - Sprite animation sequences
- **TileMap** - Efficient tile rendering
- **ParticleEmitter** - Particle effects
- **LightSource** - Dynamic lighting
- **Shadow** - Shadow casting

### Input
- **KeyboardInput** - Keyboard controls
- **MouseInput** - Mouse/touch controls  
- **GamepadInput** - Controller support (Xbox, PlayStation, generic)
- **InputMapper** - Configurable input mapping

## AI & Behavior Traits (`@js2d/traits-ai`)
Already implemented - GOAP system, emergent behaviors, NPC personality/needs.

## Emergent System Traits (`@js2d/traits-emergent`)
Already implemented - State propagation, material properties, environmental interactions.

## Combat Traits (`@js2d/traits-combat`)
Combat and damage systems.

### Health & Damage
- **Health** - HP, max HP, regeneration
- **Armor** - Damage reduction
- **DamageDealer** - Applies damage on contact/trigger
- **Knockback** - Physics impulse on hit
- **Invulnerability** - Temporary damage immunity
- **Shield** - Directional blocking

### Weapons
- **MeleeWeapon** - Close combat weapons
- **RangedWeapon** - Projectile weapons
- **Ammunition** - Ammo tracking
- **WeaponSwitch** - Multiple weapon slots

### Status Effects
- **Poison** - Damage over time
- **Stun** - Movement/action disable
- **Slow** - Speed reduction
- **Buff/Debuff** - Stat modifiers

## Movement Traits (`@js2d/traits-movement`)
Advanced movement mechanics.

### Platformer Movement
- **Jump** - Variable height jumping
- **DoubleJump** - Air jumping
- **WallJump** - Jump off walls
- **WallSlide** - Slide down walls
- **Dash** - Quick directional burst
- **Glide** - Slow falling
- **Climb** - Ladder/vine climbing
- **Swim** - Water movement

### Top-Down Movement
- **EightWayMovement** - 8-directional movement
- **TankControls** - Rotate and move forward
- **Strafe** - Independent aim/move directions
- **Sprint** - Speed boost with stamina

## Interactive Traits (`@js2d/traits-interactive`)
Object interaction systems.

### Object Interaction
- **Interactable** - Can be activated by player
- **Pickupable** - Can be collected
- **Pushable** - Can be pushed around
- **Breakable** - Can be destroyed
- **Container** - Holds items/loot
- **Door** - Openable barriers
- **Switch** - Triggers other objects
- **Pressure Plate** - Weight-activated

### Inventory
- **Inventory** - Item storage
- **Equipment** - Wearable items
- **Hotbar** - Quick item access
- **Crafting** - Combine items
- **Trading** - Buy/sell interface

## Environmental Traits (`@js2d/traits-environment`)
World simulation features.

### Weather & Time
- **DayNightCycle** - Time progression
- **Weather** - Rain, snow, wind
- **Temperature** - Hot/cold effects
- **Seasons** - Seasonal changes

### Terrain
- **Destructible** - Terrain deformation
- **Liquid** - Water/lava simulation
- **Vegetation** - Growing plants
- **Fire Spread** - Already in emergent

## Audio Traits (`@js2d/traits-audio`)
Sound and music systems.

### Sound
- **SoundEmitter** - 3D positional audio
- **MusicPlayer** - Background music
- **SoundTrigger** - Play sound on event
- **AudioListener** - Player's "ears"
- **AudioZone** - Area-based audio

## UI Traits (`@js2d/traits-ui`)
User interface components.

### HUD Elements
- **HealthBar** - Visual health display
- **Minimap** - Small world overview
- **QuestLog** - Task tracking
- **DialogueBox** - Conversation UI
- **InventoryUI** - Item management
- **Tooltip** - Hover information

## Progression Traits (`@js2d/traits-progression`)
Character advancement systems.

### RPG Systems
- **Experience** - XP and leveling
- **Skills** - Learnable abilities
- **Attributes** - STR, DEX, INT, etc.
- **Talents** - Skill trees
- **Reputation** - Faction standing

## Multiplayer Traits (`@js2d/traits-multiplayer`)
Networking and multiplayer features.

### Networking
- **NetworkTransform** - Synced position
- **NetworkOwnership** - Player authority
- **NetworkLag** - Lag compensation
- **Chat** - Text communication
- **Voice** - Voice chat

## Vehicle Traits (`@js2d/traits-vehicle`)
Vehicle and mount systems.

### Vehicles
- **Vehicle** - Base vehicle behavior
- **VehicleControls** - Steering/acceleration
- **VehiclePhysics** - Realistic handling
- **Mountable** - Can be ridden
- **Fuel** - Resource consumption

## Economy Traits (`@js2d/traits-economy`)
Economic simulation.

### Trading
- **Currency** - Money tracking
- **Shop** - Buy/sell interface
- **Market** - Dynamic pricing
- **Production** - Resource generation
- **Supply/Demand** - Economic simulation

## Procedural Traits (`@js2d/traits-procedural`)
Content generation systems.

### Generation
- **ProceduralTerrain** - Terrain generation
- **WaveFunctionCollapse** - Pattern-based generation
- **DungeonGenerator** - Room/corridor layouts
- **LootTable** - Random item drops
- **NameGenerator** - Random names

## Save/Load Traits (`@js2d/traits-persistence`)
Data persistence.

### Persistence
- **Saveable** - Can be saved/loaded
- **WorldState** - Global save data
- **PlayerProfile** - Player preferences
- **CloudSave** - Online backup

## Debug Traits (`@js2d/traits-debug`)
Development tools.

### Debugging
- **DebugDraw** - Visual debugging
- **Console** - Runtime commands
- **Inspector** - Entity inspection
- **Profiler** - Performance monitoring
- **Replay** - Record/playback

## Plugin System Requirements

For traits to work as plugins, we need:

1. **Trait Registry** - Central registration system
2. **Dependency Resolution** - Traits can depend on other traits
3. **Event System** - Traits communicate via events
4. **Configuration** - Runtime trait parameters
5. **Versioning** - Compatibility checking

## Recommended Package Structure

```
@js2d/engine          - Core engine with essential traits
@js2d/traits-ai       - AI and behavior systems (exists)
@js2d/traits-emergent - Emergent systems (exists)
@js2d/traits-combat   - Combat and damage
@js2d/traits-movement - Advanced movement
@js2d/traits-rpg      - RPG systems (progression, inventory)
@js2d/traits-ui       - UI components
@js2d/traits-procedural - Generation systems
@js2d/traits-multiplayer - Networking
@js2d/traits-debug    - Development tools
```

## Notes

- Each trait package should be optional
- Traits should communicate through events/queries, not direct references
- Consider trait compatibility matrix
- Some traits might be better as community plugins
- GamepadInput should be in core engine since it's fundamental