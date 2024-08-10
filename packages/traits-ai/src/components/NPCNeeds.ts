/*
NPC Needs Component:
- Basic survival and social needs that motivate behavior
- Decay rates for how fast needs increase over time
- Critical thresholds for desperate actions
*/

import { defineComponent } from 'bitecs'

export const NPCNeeds = defineComponent({
  // Basic survival needs (0-255, higher = more urgent)
  hunger: { type: 'ui8', default: 100 },
  thirst: { type: 'ui8', default: 100 },
  sleep: { type: 'ui8', default: 100 },
  safety: { type: 'ui8', default: 100 },
  
  // Social needs
  companionship: { type: 'ui8', default: 50 },
  respect: { type: 'ui8', default: 50 },
  
  // Economic needs
  wealth: { type: 'ui8', default: 30 },
  shelter: { type: 'ui8', default: 80 },
  
  // Decay rates (how fast needs increase over time)
  hungerRate: { type: 'f32', default: 2.0 },   // per minute
  thirstRate: { type: 'f32', default: 3.0 },
  sleepRate: { type: 'f32', default: 1.0 },
  
  // Critical thresholds (when NPC becomes desperate)
  hungerCritical: { type: 'ui8', default: 200 },
  thirstCritical: { type: 'ui8', default: 180 },
  sleepCritical: { type: 'ui8', default: 220 }
})