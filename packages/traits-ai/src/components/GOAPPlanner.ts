/*
GOAP Planner Component:
- Current goal and action planning state
- Action plan sequence and execution tracking
- Planning performance monitoring
*/

import { defineComponent } from 'bitecs'

export const GOAPPlanner = defineComponent({
  // Current active goal
  currentGoal: { type: 'ui32', default: 0 },   // Goal ID
  goalPriority: { type: 'ui8', default: 0 },   // How important (0-255)
  
  // Action plan to achieve goal
  planSteps: { type: 'ui32', array: 16 },      // Action IDs in sequence
  planLength: { type: 'ui8', default: 0 },     // Number of steps
  currentStep: { type: 'ui8', default: 0 },    // Which step we're on
  
  // Planning state
  isPlanning: { type: 'ui8', default: 0 },     // Currently thinking?
  planValid: { type: 'ui8', default: 0 },      // Is current plan still good?
  lastPlanTime: { type: 'f64', default: 0 },   // When we last planned
  
  // Execution state
  actionStartTime: { type: 'f64', default: 0 },// When current action started
  actionTarget: { type: 'ui32', default: 0 },  // Entity we're acting on
  interrupted: { type: 'ui8', default: 0 }     // Was action interrupted?
})