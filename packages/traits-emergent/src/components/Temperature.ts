/*
Temperature Component:
- Realistic fire/ice interactions
- Heat conductivity and capacity
- Ignition and freezing points
*/

import { defineComponent } from 'bitecs'

export const Temperature = defineComponent({
  currentTemp: { type: 'i16', default: 20 },   // Current temperature in Celsius
  baseTemp: { type: 'i16', default: 20 },      // Base temperature (room temp)
  heatCapacity: { type: 'ui8', default: 100 }, // How much energy to change temp
  conductivity: { type: 'ui8', default: 50 },  // How fast temperature spreads
  ignitionPoint: { type: 'i16', default: 200 },// Temperature at which it catches fire
  freezingPoint: { type: 'i16', default: 0 }   // Temperature at which it freezes
})