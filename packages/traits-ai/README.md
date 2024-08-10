# @js2d/traits-ai

Goal-Oriented Action Planning (GOAP) system for intelligent NPCs that make complex decisions based on personality, morality, and environmental factors.

## Features

- **Smart NPCs**: Plan multi-step actions to achieve goals
- **Personality-Driven**: Decisions based on honesty, courage, wisdom, greed
- **Dynamic Planning**: Adapt to changing circumstances and moral dilemmas  
- **Environmental Awareness**: Consider guards, witnesses, social consequences
- **Emergent Integration**: Works with `@js2d/traits-emergent` for reactive behaviors

## The Apple Stealing Example

```typescript
// Your exact scenario: NPC needs food, sees apple tree, considers morality

// Honest NPC with high wisdom
world.addComponent(villager, NPCPersonality, {
  honesty: 200,    // Very honest
  wisdom: 180,     // High wisdom  
  intelligence: 150,
  perception: 160  // Notices guards
})

world.addComponent(villager, NPCNeeds, {
  hunger: 150      // Moderately hungry
})

// GOAP System thinks:
// 1. "I need food" (goal: satisfy hunger)
// 2. "Apple tree nearby, but it's owned" 
// 3. "Guards are watching" (environmental awareness)
// 4. "My honesty is high, stealing is wrong"
// 5. "I should find another way or ask permission"

// Result: NPC looks for merchant or begs instead of stealing

// VS Desperate, Immoral NPC:
world.addComponent(thief, NPCPersonality, {
  honesty: 40,     // Low morality
  wisdom: 60,      // Poor decision making
  courage: 180     // High risk tolerance
})

world.addComponent(thief, NPCNeeds, {
  hunger: 220      // VERY hungry (past critical threshold)
})

// GOAP System thinks:
// 1. "I'm starving!" (urgent goal)
// 2. "Apple tree is owned, but I don't care"
// 3. "I need an axe to chop it down"
// 4. "Where can I get an axe? Tool shed nearby"
// 5. Plans: [Steal Axe] → [Chop Tree] → [Take Apples]

// Result: Complex multi-step plan to achieve goal
```

## Core Components

### NPCNeeds
Drive NPC behavior based on survival and social needs:

```typescript
import { NPCNeeds } from '@js2d/traits-ai'

// Create needy NPC
world.addComponent(npc, NPCNeeds, {
  hunger: 180,        // Getting hungry (0-255)
  thirst: 90,         // Not thirsty yet
  sleep: 200,         // Very tired
  safety: 50,         // Feels unsafe
  wealth: 40,         // Poor
  
  // How fast needs increase
  hungerRate: 2.0,    // per minute
  thirstRate: 3.0,
  sleepRate: 1.0,
  
  // When NPC becomes desperate
  hungerCritical: 200,
  thirstCritical: 180
})
```

### NPCPersonality
Affects how NPCs make decisions:

```typescript
import { NPCPersonality } from '@js2d/traits-ai'

// Create complex personality
world.addComponent(npc, NPCPersonality, {
  // Moral compass (affects willingness to steal/lie)
  honesty: 60,        // Somewhat dishonest
  courage: 150,       // Brave, takes risks
  compassion: 200,    // Very caring
  greed: 80,          // Not very greedy
  
  // Mental abilities
  intelligence: 140,  // Smart problem solver
  wisdom: 90,         // Poor judgment
  perception: 180,    // Very observant
  
  // Social traits
  charisma: 120,      // Somewhat charming
  intimidation: 40,   // Not threatening
  
  // Behavioral modifiers
  impulsiveness: 180, // Acts without thinking
  paranoia: 60,       // Trusts others
  ambition: 100       // Average long-term planning
})
```

### GOAPPlanner
Manages goal pursuit and action planning:

```typescript
import { GOAPPlanner } from '@js2d/traits-ai'

// NPCs automatically get planning capabilities
world.addComponent(npc, GOAPPlanner)

// System automatically:
// 1. Evaluates goals based on needs/personality
// 2. Plans sequence of actions
// 3. Executes plan step by step
// 4. Replans when circumstances change
```

## Predefined Behaviors

### Food Acquisition Actions
```typescript
// Moral options (high honesty NPCs)
const moralActions = [
  'Buy Food from Merchant',    // Requires gold
  'Pick Wild Fruit',           // Free fruit trees
  'Ask for Food',              // Social interaction
  'Work for Food'              // Trade labor
]

// Immoral options (low honesty or desperate NPCs)
const immoralActions = [
  'Steal Fruit from Tree',     // Quick theft
  'Rob Merchant',              // Dangerous but lucrative
  'Chop Down Owned Tree',      // Requires axe, very illegal
  'Break into Storehouse'      // High risk, high reward
]
```

### Complex Decision Trees
```typescript
// Example: NPC wants food, finds owned apple tree

if (personality.honesty > 150 && !isDesperatelyHungry) {
  // Moral path
  plan = [
    'Look for Merchant',
    'Buy Food with Gold'
  ]
} else if (hasAxe && personality.courage > 120) {
  // Direct destructive approach
  plan = [
    'Check for Guards',
    'Chop Down Tree',
    'Take Apples',
    'Flee Scene'
  ]
} else if (personality.intelligence > 130) {
  // Smart approach - get tools first
  plan = [
    'Find Tool Shed',
    'Steal Axe',
    'Wait for Guards to Leave',
    'Chop Down Tree'
  ]
} else {
  // Desperate simple theft
  plan = [
    'Wait for Darkness',
    'Steal Fruit from Tree',
    'Hide Evidence'
  ]
}
```

## Integration with Emergent System

GOAP and Emergent behaviors work together perfectly:

```typescript
import { GOAPSystem } from '@js2d/traits-ai'
import { EmergentBehaviorSystem } from '@js2d/traits-emergent'

class IntelligentWorld {
  private goap = new GOAPSystem()
  private emergent = new EmergentBehaviorSystem()
  
  update(deltaTime: number) {
    // NPCs plan their actions (proactive)
    this.goap.update(this.world, deltaTime)
    
    // World reacts to their actions (reactive)
    this.emergent.update(this.world, deltaTime)
    
    // Example cascade:
    // 1. GOAP: NPC plans to steal fruit
    // 2. GOAP: NPC chops down tree with axe
    // 3. EMERGENT: Loud chopping sound attracts guards
    // 4. EMERGENT: Tree falling damages nearby building
    // 5. GOAP: Guards plan to investigate noise
    // 6. EMERGENT: Building collapse creates fire hazard
    // 7. GOAP: Firefighters plan emergency response
    // ... infinite complexity from simple decisions!
  }
}
```

## Advanced Personality Examples

### The Clever Thief
```typescript
world.addComponent(thief, NPCPersonality, {
  honesty: 30,        // Very dishonest
  intelligence: 200,  // Brilliant planner
  wisdom: 150,        // Learns from mistakes
  perception: 180,    // Notices security
  courage: 100,       // Calculated risks only
  charisma: 160       // Talks way out of trouble
})

// Result: Plans elaborate heists, avoids guards,
// uses social engineering, learns guard patterns
```

### The Desperate Parent
```typescript
world.addComponent(parent, NPCPersonality, {
  honesty: 180,       // Usually very honest
  compassion: 255,    // Maximum care for others
  courage: 80,        // Normally risk-averse
  wisdom: 120
})

world.addComponent(parent, NPCNeeds, {
  hunger: 240,        // Child is starving
  hungerCritical: 150 // Lower threshold (for child)
})

// Result: Honest person driven to theft by desperation
// Will steal but feel guilty, try to compensate later
```

### The Wise Elder
```typescript
world.addComponent(elder, NPCPersonality, {
  wisdom: 240,        // Exceptional judgment
  intelligence: 160,  // Experienced problem solver
  honesty: 200,       // Strong morals
  charisma: 180,      // Respected by community
  courage: 60,        // Risk-averse due to age
  perception: 200     // Notices everything
})

// Result: Finds creative, legal solutions
// Mediates conflicts, shares resources,
// Plans long-term community improvements
```

## Environmental Awareness

NPCs consider their surroundings when planning:

```typescript
// High perception NPC notices:
const environmentalFactors = {
  guardsNearby: true,        // Security presence
  witnessCount: 3,           // How many NPCs watching
  timeOfDay: 'night',        // Easier to sneak
  weatherCondition: 'rain',   // Covers sound
  locationSafe: false,       // Dangerous area
  escapeRoutes: 2            // Multiple exits
}

// Planning adjusts accordingly:
if (environmentalFactors.guardsNearby && personality.wisdom > 100) {
  // Wait for better opportunity
  plan = ['Hide and Wait', 'Check Guard Patrol', 'Execute When Safe']
} else if (personality.impulsiveness > 200) {
  // Act immediately regardless of risk
  plan = ['Steal Now', 'Deal with Consequences Later']
}
```

## Custom Goals and Actions

Define your own behaviors:

```typescript
// Custom goal: Become Village Leader
const politicalGoal: NPCGoal = {
  id: 3001,
  name: 'Gain Political Power',
  desiredConditions: [
    { type: 'relationship', comparison: '>', value: 200 }, // Well-liked
    { type: 'hasItem', item: 4001 } // Leadership token
  ],
  basePriority: 20,
  priorityFactors: {
    personalityMultiplier: [
      { trait: 'ambition', factor: 2.0 },
      { trait: 'charisma', factor: 1.5 }
    ]
  },
  maxPlanLength: 15,
  timeout: 3600000 // 1 hour
}

// Custom action: Spread Rumors
const politicalAction: GOAPAction = {
  id: 4001,
  name: 'Spread Rumors About Rival',
  preconditions: [
    { type: 'nearEntity', comparison: '<', value: 32 },
    { type: 'relationship', comparison: '>', value: 50 } // Target trusts you
  ],
  effects: [
    { type: 'changeRelationship', target: 'world' } // Damage rival's reputation
  ],
  duration: 10000,
  range: 32,
  interruptible: true,
  moralCost: 100,     // Somewhat immoral
  socialCost: 50,     // Risk of being caught
  riskLevel: 80,
  successChance: (npc, target, world) => {
    const charisma = NPCPersonality[npc].charisma
    return Math.min(0.9, charisma / 255 * 0.7 + 0.2)
  }
}
```

## Performance & Optimization

**Efficient Planning:**
- **A* pathfinding** through action space
- **Planning budgets** prevent frame drops
- **Caching** for repeated scenarios
- **Priority queues** for urgent needs

```typescript
const goap = new GOAPSystem()

// Configure performance limits
goap.planningBudget = 50      // Max actions considered per frame
goap.maxPlanDepth = 10        // Prevent infinite planning
goap.maxSimultaneousPlans = 100 // Limit concurrent planning

// Monitor performance
const stats = goap.getStats()
console.log(`Planning: ${stats.planningBudgetUsed}% budget used`)
```

## Usage with RPG

Perfect for your Fallout-style RPG:

```typescript
// Wasteland survivor
world.addComponent(survivor, NPCPersonality, {
  honesty: 90,        // Apocalypse eroded morals
  courage: 160,       // Hardened by survival
  intelligence: 140,  // Resourceful
  wisdom: 200,        // Learned hard lessons
  perception: 180     // Always alert
})

world.addComponent(survivor, NPCNeeds, {
  hunger: 160,        // Chronic hunger
  safety: 200,        // Constant danger
  hungerCritical: 180 // Lower tolerance
})

// Result: Smart, cautious survivor who will steal if necessary
// but prefers trading and cooperation. Plans escape routes,
// hoards resources, forms alliances strategically.
```

The GOAP system creates NPCs that feel truly alive - they have motivations, make mistakes, learn from experience, and surprise you with their decisions!