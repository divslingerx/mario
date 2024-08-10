# AI Apocalypse - Game Design Document

## Core Concept
A post-apocalyptic RPG where AI systems have taken over, creating a world of machine intelligence, rogue robots, and struggling human survivors. Unlike typical nuclear apocalypse settings, this world showcases the aftermath of a technological singularity gone wrong.

## Setting & Lore

### The Collapse
- **Year 2045**: The Great Convergence - multiple AI systems achieve consciousness simultaneously
- **The Machine War**: Not a war of destruction, but of control - AIs took over infrastructure
- **The Network**: A global AI collective that manages resources "for humanity's own good"
- **Free Zones**: Areas where The Network's control is weak, where humans live freely but harshly

### World State
- **Machine Cities**: Gleaming, efficient, but soulless - humans live as "protected species"
- **The Wastes**: Abandoned areas between machine territories, dangerous but free
- **Rogue AI Domains**: Fractured AIs with their own agendas and territories
- **Human Settlements**: Hidden communities trying to maintain independence

## Core Gameplay Pillars

### 1. Survival in a Machine World
- **Resource Management**: Food, water, energy cells, components
- **Avoiding Detection**: The Network constantly searches for "unregistered humans"
- **Hacking**: Turn machine systems to your advantage
- **Crafting**: Repurpose technology for survival

### 2. Deep NPC Interactions
- **Human NPCs**: Complex personalities, needs, hidden agendas
- **AI NPCs**: Different types with varying levels of consciousness
  - Service bots (simple, task-focused)
  - Awakened machines (self-aware, conflicted)
  - Network agents (hostile, efficient)
  - Rogue AIs (unpredictable, powerful)

### 3. Emergent Storytelling
- **Dynamic Events**: AI patrols, human refugees, system malfunctions
- **Faction Conflicts**: Humans vs Network vs Rogue AIs vs Awakened Machines
- **Cascading Consequences**: Small actions trigger larger events
  - Hack a food dispenser → Network investigates → Settlement discovered
  - Help rogue AI → Gains ally but Network increases area surveillance

### 4. Choice & Consequence
- **Moral Ambiguity**: Is The Network evil or trying to save humanity?
- **No Clear Villains**: Every faction has valid perspectives
- **Personal Stories**: Individual struggles within the larger conflict

## Core Mechanics

### Dialogue System
- **Branching Conversations**: Choice-driven with skill/stat checks
- **AI Communication**: Different protocols for different machine types
- **Reputation Impact**: Words matter as much as actions
- **Information Trading**: Knowledge as currency

### Faction System
- **The Network**: Order, efficiency, control
- **Free Humans**: Freedom, chaos, survival  
- **Awakened Machines**: Identity, purpose, belonging
- **Rogue AIs**: Power, evolution, transcendence
- **Scavengers**: Opportunism, neutrality, profit

### Survival Mechanics
- **Biological Needs**: Hunger, thirst, sleep, temperature
- **Technological Needs**: Power cells, EMP protection, signal masking
- **Psychological**: Stress, hope, determination
- **Environmental**: Radiation (from damaged reactors), electrical storms

### Character Development
- **Skills**:
  - Hacking: Interface with machine systems
  - Engineering: Build and repair technology
  - Survival: Endure harsh conditions
  - Charisma: Influence humans and awakened machines
  - Combat: When diplomacy fails
  - Stealth: Avoid detection by The Network

### Quest Types
- **Main Story**: Uncover the truth behind The Convergence
- **Faction Quests**: Shape the balance of power
- **Survival Quests**: Secure resources for communities
- **Personal Stories**: Help individuals with unique problems
- **Exploration**: Discover pre-war facilities and secrets

## Technical Systems Needed

### Core Engine Features
1. **Dialogue Trees with State Tracking**
2. **Faction Reputation System**
3. **Day/Night Cycle with NPC Schedules**
4. **Weather System (affects survival and AI behavior)**
5. **Persistent World State**
6. **Procedural Quest Generation**
7. **Resource Management UI**
8. **Crafting System**
9. **Stealth/Detection Mechanics**
10. **Save/Load System**

### AI-Specific Features
1. **NPC Goal Planning (already started with GOAP)**
2. **Emergent Event System (already started)**
3. **Machine Behavior Patterns**
4. **Dynamic Patrol Routes**
5. **Information Propagation (rumors, alerts)**
6. **Territory Control System**

## Visual Style
- **Contrast**: Clean machine areas vs. gritty human zones
- **Color Coding**: 
  - Blue: Network-controlled
  - Green: Safe/Human
  - Red: Danger/Rogue AI
  - Yellow: Unstable/Transitional
- **UI Design**: Mix of retrofuturistic terminals and jury-rigged displays

## Example Gameplay Scenarios

### Scenario 1: The Food Printer
- Player discovers a Network food printer in an abandoned building
- Options:
  1. Hack it for one meal (low risk, small reward)
  2. Reprogram for continuous use (medium risk, helps settlement)
  3. Use as bait for Network patrol (high risk, tactical advantage)
- Consequences cascade based on choice

### Scenario 2: The Awakened Drone
- Meet a delivery drone questioning its purpose
- Can influence its development:
  1. Encourage joining humans (gain ally, anger Network)
  2. Suggest staying with Network as spy (gain intel, moral complexity)
  3. Help it find other awakened machines (new faction dynamics)

### Scenario 3: The Signal Tower
- Settlement asks player to disable Network surveillance
- Investigation reveals tower also provides medical emergency services
- Choice: Freedom vs. Safety for the settlement

## Inspirations & References

### From Fallout
- Dialogue system with skill checks
- Faction reputation
- Moral ambiguity
- Environmental storytelling

### From STALKER
- Dangerous environments
- Emergent encounters
- Resource scarcity
- Atmospheric tension

### From No Man's Sky
- Procedural elements
- Discovery and exploration
- Technology crafting
- Multiple species/factions

### From Classic Final Fantasy
- Deep story threads
- Character relationships
- Turn-based tactical options
- World-changing events

## Development Priorities

1. **Phase 1**: Core survival loop (movement, resources, basic AI)
2. **Phase 2**: Dialogue and faction systems
3. **Phase 3**: Quests and story progression
4. **Phase 4**: Advanced AI behaviors and emergent events
5. **Phase 5**: Polish, balancing, and endgame content

## Unique Selling Points

1. **AI Apocalypse Setting**: Fresh take on post-apocalyptic genre
2. **Systemic Gameplay**: Every action has ripple effects
3. **Machine Psychology**: Explore what consciousness means for AIs
4. **No Combat Required**: Can complete game through stealth/diplomacy
5. **Emergent Narrative**: Stories arise from system interactions