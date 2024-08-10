/*
Entity State Component:
- Tracks multiple simultaneous states on entities
- State intensities and decay rates
- Bitfield flags for fast state checking
*/

import { defineComponent } from 'bitecs'

export const EntityStates = defineComponent({
  // State flags (bitfield for performance) - up to 32 states
  stateFlags: { type: 'ui32', default: 0 },
  
  // State intensities (0-255 for each state)
  wet: { type: 'ui8', default: 0 },
  burning: { type: 'ui8', default: 0 },
  drunk: { type: 'ui8', default: 0 },
  dirty: { type: 'ui8', default: 0 },
  poisoned: { type: 'ui8', default: 0 },
  blessed: { type: 'ui8', default: 0 },
  cursed: { type: 'ui8', default: 0 },
  magnetic: { type: 'ui8', default: 0 },
  
  // State decay rates (how fast states fade)
  wetDecay: { type: 'f32', default: 10.0 },    // Wet dries over time
  burningDecay: { type: 'f32', default: 5.0 }, // Fire burns out
  drunkDecay: { type: 'f32', default: 2.0 },   // Sobering up
  
  // Last interaction time to prevent rapid-fire effects
  lastInteraction: { type: 'f64', default: 0 }
})