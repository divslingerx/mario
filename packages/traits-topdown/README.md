# @js2d/traits-topdown

Classic RPG mechanics and components for top-down games like Fallout, Diablo, or modern isometric RPGs.

## Features

- **SPECIAL Stats System**: Fallout-inspired attribute system
- **Skill Progression**: Configurable skill trees and advancement
- **Inventory Management**: Slot-based with weight and equipment systems
- **Dialog System**: Rich NPC interactions and branching conversations
- **Quest System**: Comprehensive quest tracking and management
- **Combat System**: Turn-based and real-time combat support
- **Faction System**: Complex relationship and reputation mechanics

## Performance Targets

- **60 FPS** with 200+ NPCs and complex interactions
- **< 2ms** RPG system update time
- **Efficient** inventory and dialog management

## Core Components

### RPG Stats (SPECIAL System)
```typescript
import { RPGStats } from '@js2d/traits-topdown'

// Create character with Fallout-style stats
world.addComponent(player, RPGStats, {
  strength: 7,     // Damage, carry weight
  perception: 6,   // Accuracy, detection
  endurance: 8,    // Health, stamina
  charisma: 4,     // Dialog options, prices
  intelligence: 9, // Skill points, dialog
  agility: 5,      // Action points, movement
  luck: 6,         // Critical hits, random events
  
  hitPoints: 120,
  maxHitPoints: 120,
  actionPoints: 8,
  experience: 1500,
  level: 3
})
```

### Skills System
```typescript
import { RPGSkills } from '@js2d/traits-topdown'

// Character specialization
world.addComponent(player, RPGSkills, {
  // Combat specialization
  smallGuns: 75,
  bigGuns: 25,
  energyWeapons: 30,
  
  // Utility specialization  
  lockpick: 60,
  speech: 80,
  science: 90,
  medicine: 45
})
```

### Inventory System
```typescript
import { Inventory, Item } from '@js2d/traits-topdown'

// Slot-based inventory with weight limits
world.addComponent(player, Inventory, {
  maxSlots: 50,
  maxWeight: 150, // Based on strength
  weaponSlot: stimPackItemId,
  armorSlot: leatherJacketId
})

// Define items
world.addComponent(stimPackEntity, Item, {
  itemId: 101,
  weight: 0.5,
  value: 50,
  stackSize: 10,
  itemType: 3, // Consumable
  healAmount: 50
})
```

### Dialog System
```typescript
import { DialogNPC } from '@js2d/traits-topdown'

// NPC with branching dialog
world.addComponent(npc, DialogNPC, {
  dialogId: 'merchant_001',
  trader: 1, // Can buy/sell items
  faction: 2, // Brotherhood of Steel
  disposition: 25 // Neutral-friendly
})
```

### Combat System
```typescript
import { CombatActor } from '@js2d/traits-topdown'

// Turn-based combat participant
world.addComponent(enemy, CombatActor, {
  actionPointsRemaining: 6,
  initiative: 12,
  isInCombat: 1
})
```

## Movement System

### 8-Directional Movement
```typescript
import { TopDownMovement } from '@js2d/traits-topdown'

world.addComponent(player, TopDownMovement, {
  moveSpeed: 100,  // pixels/second walking
  runSpeed: 200,   // pixels/second running
  facing: 2        // 0-7 for eight directions
})

// In input system
function handleMovement(entity: number, input: InputState) {
  const movement = TopDownMovement[entity]
  
  // 8-directional movement with keyboard
  movement.inputX = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  movement.inputY = (input.down ? 1 : 0) - (input.up ? 1 : 0)
  movement.inputRun = input.shift ? 1 : 0
  
  // Calculate facing direction (0-7)
  if (movement.inputX !== 0 || movement.inputY !== 0) {
    movement.facing = calculateFacing(movement.inputX, movement.inputY)
  }
}
```

## Quest System
```typescript
import { QuestTracker, QuestGiver } from '@js2d/traits-topdown'

// Quest giver NPC
world.addComponent(questNPC, QuestGiver, {
  availableQuests: [1001, 1002], // Quest IDs
  questCount: 2
})

// Player quest tracking
world.addComponent(player, QuestTracker, {
  activeQuests: [1001],
  questProgress: [2], // Current progress values
  questStates: [1],   // 1 = active
  questCount: 1
})
```

## Configuration Examples

### Classic Fallout Style
```typescript
const falloutConfig: RPGConfig = {
  statSystem: 'special',
  maxStatValue: 10,
  startingStatPoints: 35,
  skillPointsPerLevel: 15,
  combatMode: 'turnbased',
  skillCap: 100,
  maxActionPoints: 10
}
```

### Diablo-Style Action RPG
```typescript
const diabloConfig: RPGConfig = {
  statSystem: 'custom',
  maxStatValue: 999,
  experienceCurve: 'exponential',
  combatMode: 'realtime',
  inventoryType: 'grid',
  itemDurability: true
}
```

### Modern Isometric RPG
```typescript
const modernConfig: RPGConfig = {
  statSystem: 'dnd',
  maxStatValue: 20,
  skillPointsPerLevel: 4,
  combatMode: 'hybrid',
  encumbranceSystem: false,
  inventoryType: 'unlimited'
}
```

## Systems Integration

### Line of Sight System
```typescript
import { LineOfSight } from '@js2d/traits-topdown'

// Stealth and detection
world.addComponent(guard, LineOfSight, {
  viewRange: 15,      // tiles
  viewAngle: 120,     // degrees  
  detectionRadius: 3, // close detection
  stealthModifier: -2 // harder to detect
})
```

### Faction Relations
```typescript
import { Faction } from '@js2d/traits-topdown'

// Complex faction system
world.addComponent(npc, Faction, {
  factionId: 1, // Brotherhood of Steel
  reputation: 500, // Well-liked
  hostileToPlayer: 0,
  alliedFactions: [2, 5], // NCR, Followers
  enemyFactions: [3, 4]   // Legion, Raiders
})
```

## Performance Notes

- RPG stats use efficient packed integer storage
- Inventory uses slot-based system for O(1) operations
- Dialog trees are ID-based for memory efficiency
- Quest progress uses bitflags for compact storage
- Faction relations cached for fast lookups

## Usage with Other Packages

```typescript
// Combine with physics for realistic movement
import { RigidBody } from '@js2d/traits-physics'

// Physics-based RPG character
world.addComponent(player, RigidBody, { bodyType: 1 }) // Kinematic
world.addComponent(player, TopDownMovement)
world.addComponent(player, RPGStats)

// Character sheet defines physics properties
const stats = RPGStats[player]
const movement = TopDownMovement[player]
movement.moveSpeed = 50 + (stats.agility * 10) // Speed based on agility
```

## Dependencies

- `@js2d/engine` - Core ECS and component systems  
- `@js2d/traits-physics` - Movement and collision detection
- `bitecs` - Entity component system