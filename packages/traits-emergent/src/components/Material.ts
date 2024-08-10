/*
Material Component:
- Defines what entities are made of
- Affects how they interact with other materials
- Controls flammability, conductivity, durability
*/

import { defineComponent } from 'bitecs'

export const Material = defineComponent({
  materialType: { type: 'ui8', default: 0 }, // 0=organic, 1=metal, 2=stone, 3=wood, 4=cloth
  flammability: { type: 'ui8', default: 50 }, // 0-255 how easily it catches fire
  conductivity: { type: 'ui8', default: 0 },  // Electrical/magical conductivity
  absorbency: { type: 'ui8', default: 100 },  // How much liquid it can absorb
  durability: { type: 'ui8', default: 255 },  // How much damage before breaking
  currentDamage: { type: 'ui8', default: 0 }
})

export const MaterialTypes = {
  ORGANIC: 0,
  METAL: 1,
  STONE: 2,
  WOOD: 3,
  CLOTH: 4,
  GLASS: 5,
  LIQUID: 6,
  GAS: 7
} as const