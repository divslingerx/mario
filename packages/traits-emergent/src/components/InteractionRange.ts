/*
Interaction Range Component:
- Defines how close entities must be to interact
- Which states can trigger/receive interactions
*/

import { defineComponent } from 'bitecs'

export const InteractionRange = defineComponent({
  range: { type: 'f32', default: 32 }, // How close entities must be to interact
  activeStates: { type: 'ui32', default: 0xffffffff }, // Which states can trigger interactions
  receptiveStates: { type: 'ui32', default: 0xffffffff } // Which states can be affected
})