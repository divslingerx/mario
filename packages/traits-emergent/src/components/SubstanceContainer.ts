/*
Substance Container Component:
- Beer barrels, water buckets, oil tanks, etc.
- Defines liquid properties and leaking behavior
*/

import { defineComponent } from 'bitecs'

export const SubstanceContainer = defineComponent({
  substanceType: { type: 'ui8', default: 0 }, // 0=empty, 1=water, 2=beer, 3=oil, 4=acid
  amount: { type: 'ui8', default: 0 },         // Current amount (0-255)
  capacity: { type: 'ui8', default: 255 },     // Maximum capacity
  leaking: { type: 'ui8', default: 0 },        // Is container damaged and leaking?
  viscosity: { type: 'ui8', default: 50 },     // How fast substance spreads
  volatility: { type: 'ui8', default: 0 }      // How easily it ignites/evaporates
})

export const SubstanceTypes = {
  EMPTY: 0,
  WATER: 1,
  BEER: 2,
  OIL: 3,
  ACID: 4,
  POISON: 5,
  MAGIC_POTION: 6,
  BLOOD: 7
} as const