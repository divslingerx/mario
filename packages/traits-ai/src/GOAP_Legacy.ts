/*
GOAP (Goal-Oriented Action Planning) System for Intelligent NPCs - LEGACY VERSION

This file has been replaced by a modular structure for better maintainability.
This legacy version is kept for reference only.

NEW STRUCTURE:
- /components/   - BitECS components for NPC data
- /actions/      - Pre-defined action sets  
- /goals/        - Pre-defined goal sets
- /systems/      - Core AI logic (planning, execution, knowledge, needs)
- /types/        - TypeScript interfaces and types

Example usage with new modular system:
```typescript
import { GOAPSystem, CommonActions, CommonGoals } from '@js2d/traits-ai'

const aiSystem = new GOAPSystem(CommonActions, CommonGoals)
aiSystem.update(world, deltaTime)
```

Use the main index.ts file which re-exports everything from the modular structure.
*/

// This file now serves as documentation of the old monolithic approach
export const LEGACY_NOTICE = `
This GOAP implementation has been split into focused modules:

- GOAPSystem: Main coordinator (systems/GOAPSystem.ts)
- PlanningSystem: Goal finding and action planning (systems/PlanningSystem.ts)  
- ExecutionSystem: Action execution and effects (systems/ExecutionSystem.ts)
- KnowledgeSystem: NPC perception and world awareness (systems/KnowledgeSystem.ts)
- NeedsSystem: Hunger, thirst, sleep simulation (systems/NeedsSystem.ts)

Components:
- NPCPersonality: Traits that drive decisions (components/NPCPersonality.ts)
- NPCNeeds: Basic survival needs (components/NPCNeeds.ts)
- NPCKnowledge: Environmental awareness (components/NPCKnowledge.ts)  
- GOAPPlanner: Planning state (components/GOAPPlanner.ts)

Actions & Goals:
- FoodActions: Ways to acquire food (actions/FoodActions.ts)
- ToolActions: Tool acquisition actions (actions/ToolActions.ts)
- SurvivalGoals: Basic survival goals (goals/SurvivalGoals.ts)
- SocialGoals: Relationship and reputation goals (goals/SocialGoals.ts)
- EconomicGoals: Wealth and trade goals (goals/EconomicGoals.ts)

Use the modular imports for better tree-shaking and maintainability.
`