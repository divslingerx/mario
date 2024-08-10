/*
NPC Personality Component:
- Moral compass and decision-making traits
- Intelligence and wisdom for problem solving
- Social traits for interactions
*/

import { defineComponent } from 'bitecs'

export const NPCPersonality = defineComponent({
  // Moral compass (0-255)
  honesty: { type: 'ui8', default: 128 },      // Willingness to steal/lie
  courage: { type: 'ui8', default: 128 },      // Risk tolerance
  compassion: { type: 'ui8', default: 128 },   // Care for others
  greed: { type: 'ui8', default: 128 },        // Desire for wealth
  
  // Intelligence and wisdom
  intelligence: { type: 'ui8', default: 100 }, // Problem-solving ability
  wisdom: { type: 'ui8', default: 100 },       // Learning from experience
  perception: { type: 'ui8', default: 100 },   // Environmental awareness
  
  // Social traits
  charisma: { type: 'ui8', default: 100 },     // Social manipulation
  intimidation: { type: 'ui8', default: 100 }, // Ability to threaten
  
  // Personality modifiers
  impulsiveness: { type: 'ui8', default: 128 }, // Think before acting?
  paranoia: { type: 'ui8', default: 50 },       // Trust others?
  ambition: { type: 'ui8', default: 100 }       // Long-term planning
})