# @js2d/traits-emergent

Dwarf Fortress-style emergent behavior system for cascading interactions and complex emergent gameplay.

## Features

- **Entity States**: Wet, burning, drunk, poisoned, and custom states
- **Cascading Interactions**: Fire spreads, water extinguishes, animals get drunk
- **Chain Reactions**: Simple interactions trigger complex cascading events
- **Configurable Rules**: Define custom interaction behaviors for your game
- **Performance Optimized**: Spatial indexing and complexity budgets for smooth gameplay
- **Material System**: Different materials react differently to interactions
- **Temperature System**: Realistic fire/ice/heat interactions

## The Magic of Emergent Gameplay

```typescript
// A cat steps in beer...
world.addComponent(cat, EntityStates, { 
  wet: 50,  // Cat stepped in beer puddle
  stateFlags: StateFlags.WET 
})

// Cat licks paws (automatic behavior)...
// -> Triggers "alcohol_intoxication" rule
// -> Cat becomes drunk

// Drunk cat stumbles around...
// -> Triggers "drunk_stumbling" rule  
// -> Cat bumps into candle

// Candle falls over...
// -> Triggers "fire_spread_flammable" rule
// -> Wooden table catches fire

// Fire spreads...
// -> Triggers "emergency_fire_response" rule
// -> NPCs panic and fetch water buckets

// All from a cat stepping in beer! 🔥🐱🍺
```

## Core Components

### EntityStates
Track multiple simultaneous states on entities:

```typescript
import { EntityStates, StateFlags } from '@js2d/traits-emergent'

// Create a flammable wooden table
const table = world.createEntity()
world.addComponent(table, EntityStates, {
  stateFlags: 0, // No initial states
  wetDecay: 15.0,      // Dries quickly
  burningDecay: 3.0    // Burns for a while
})

world.addComponent(table, Material, {
  materialType: 3,     // Wood
  flammability: 180,   // Highly flammable
  durability: 100
})
```

### Interactive Scenarios

**Tavern Chaos:**
```typescript
// Drunk patron bumps into table
world.addComponent(patron, EntityStates, {
  drunk: 200,
  stateFlags: StateFlags.DRUNK
})

// Spilled beer makes floor wet
world.addComponent(floor, EntityStates, {
  wet: 100,
  stateFlags: StateFlags.WET
})

// Cat walks through puddle, licks paws, gets drunk
// Drunk cat stumbles into fireplace
// Fire spreads to wooden furniture
// Patrons panic and try to put out fire
```

**Alchemy Laboratory:**
```typescript
// Magical experiment goes wrong
world.addComponent(cauldron, EntityStates, {
  burning: 255,        // Intense magical fire
  magnetic: 150,       // Magical magnetic field
  stateFlags: StateFlags.BURNING | StateFlags.MAGNETIC
})

// Metal objects fly toward cauldron
// Explosive chemical reactions
// Chain reactions throughout lab
```

## Custom Interaction Rules

Define your own cascading behaviors:

```typescript
import { InteractionRule, StateFlags } from '@js2d/traits-emergent'

const customRules: InteractionRule[] = [
  {
    id: 'ice_spell_extinguish',
    name: 'Ice Magic Extinguishes Fire',
    triggerStates: StateFlags.FROZEN,
    targetStates: StateFlags.BURNING,
    range: 40,
    probability: 0.95,
    cooldown: 200,
    repeatable: true,
    priority: 120,
    effects: [
      {
        type: 'removeState',
        target: 'receiver',
        stateChange: { state: 'burning', intensity: 255 }
      },
      {
        type: 'addState',
        target: 'receiver', 
        stateChange: { state: 'frozen', intensity: 100, duration: 5000 }
      },
      {
        type: 'changeTemperature',
        target: 'both',
        temperatureChange: -50
      },
      {
        type: 'spawnParticles',
        target: 'receiver'
      }
    ]
  },

  {
    id: 'plague_spread',
    name: 'Disease Spreads Between NPCs',
    triggerStates: StateFlags.POISONED,
    targetStates: 0, // Can infect anyone
    range: 25,
    probability: 0.05, // Low chance per interaction
    cooldown: 10000,   // Don't spam infections
    repeatable: true,
    priority: 60,
    effects: [
      {
        type: 'addState',
        target: 'receiver',
        stateChange: { state: 'poisoned', intensity: 80, duration: 30000 }
      },
      {
        chainReactions: [
          {
            probability: 0.3,
            delay: 5000,
            rule: 'npc_seek_healer' // NPCs look for cure
          }
        ]
      }
    ]
  }
]

// Add to emergent system
const emergentSystem = new EmergentBehaviorSystem([
  ...DefaultInteractionRules,
  ...customRules
])
```

## Integration Example

```typescript
import { 
  EmergentBehaviorSystem,
  EntityStates,
  Material,
  Temperature,
  DefaultInteractionRules 
} from '@js2d/traits-emergent'

class RPGWithEmergentBehavior {
  private emergentSystem = new EmergentBehaviorSystem()
  
  update(deltaTime: number) {
    // Update core game systems first
    this.world.update(deltaTime)
    this.physics.step(deltaTime, this.world.getBitECSWorld())
    
    // Process emergent interactions
    this.emergentSystem.update(
      this.world.getBitECSWorld(), 
      deltaTime,
      this.spatialIndex // Optional spatial optimization
    )
    
    // Log crazy emergent events
    const stats = this.emergentSystem.getStats()
    if (stats.interactionsThisFrame > 10) {
      console.log('Chaos erupting!', stats)
    }
  }
  
  createTavern() {
    // Create interactive tavern environment
    const fireplace = this.createFireplace(100, 50)
    const beerBarrel = this.createBeerBarrel(200, 100)
    const woodenTable = this.createWoodenTable(150, 120)
    const tavernCat = this.createCat(180, 130)
    
    // Wait for emergent chaos to unfold...
  }
  
  private createFireplace(x: number, y: number): number {
    const fireplace = this.world.createEntity()
    
    this.world.addComponent(fireplace, Transform, { x, y })
    this.world.addComponent(fireplace, EntityStates, {
      burning: 200,
      stateFlags: StateFlags.BURNING,
      burningDecay: 0 // Fire doesn't go out
    })
    
    this.world.addComponent(fireplace, Temperature, {
      currentTemp: 300,
      baseTemp: 300,
      conductivity: 200 // Radiates heat strongly
    })
    
    this.world.addComponent(fireplace, InteractionRange, {
      range: 60, // Large interaction range for heat
      activeStates: StateFlags.BURNING
    })
    
    return fireplace
  }
  
  private createCat(x: number, y: number): number {
    const cat = this.world.createEntity()
    
    this.world.addComponent(cat, Transform, { x, y })
    this.world.addComponent(cat, EntityStates, {
      drunkDecay: 8.0, // Cats sober up relatively quickly
      wetDecay: 25.0   // Cats dry off fast
    })
    
    this.world.addComponent(cat, Material, {
      materialType: 0, // Organic
      flammability: 30, // Not very flammable (thankfully)
      absorbency: 80   // Fur absorbs liquids
    })
    
    this.world.addComponent(cat, InteractionRange, {
      range: 20,
      activeStates: 0xffffffff, // Cats interact with everything
      receptiveStates: 0xffffffff
    })
    
    return cat
  }
}
```

## Performance & Complexity

**Built for Scale:**
- **1000+ interactions per frame** without performance loss
- **Spatial indexing** for efficient nearby entity queries  
- **Complexity budgets** prevent infinite interaction loops
- **State decay** automatically cleans up temporary effects
- **Configurable limits** for different hardware targets

**Complexity Management:**
```typescript
// Limit interactions per frame for stable performance
emergentSystem.maxInteractionsPerFrame = 500

// Budget computation time
emergentSystem.complexityBudget = 50 // 50% of frame time

// Monitor system performance
const stats = emergentSystem.getStats()
console.log(`${stats.interactionsThisFrame} interactions, ${stats.complexityBudgetUsed}% budget used`)
```

## Game Examples

**Fantasy RPG:**
- Magic spells interact with environment (fire + oil = explosion)
- Diseases spread through populations
- Weather affects NPC behavior and materials
- Alchemical reactions create unexpected results

**Medieval Simulation:**
- Fire spreads through wooden buildings
- Food spoils and attracts vermin
- NPCs react to hunger, weather, events
- Economic chains emerge from supply/demand

**Space Colony:**
- Atmosphere leaks spread through connected rooms
- Electrical fires cascade through power grids
- Psychological effects spread through crew
- Resource scarcity triggers behavioral changes

**Urban City Builder:**
- Pollution affects citizen health and happiness
- Crime spreads through neighborhoods
- Economic shocks ripple through districts
- Infrastructure failures cascade

## Advanced Features

**Multi-State Interactions:**
```typescript
// Entity can be wet AND on fire simultaneously
const steamingObject = StateFlags.WET | StateFlags.BURNING
// This might trigger special "steam" effects
```

**Material-Based Reactions:**
```typescript
// Only metal objects conduct electricity
materialRequirements: {
  targetMaterial: 1 // Metal
}
```

**Temperature-Driven Behavior:**
```typescript
// Fire only spreads at high temperatures
temperatureRange: { min: 150, max: 1000 }
```

The emergent behavior system turns your game world into a living, breathing ecosystem where player actions can trigger unexpected and delightful chain reactions!