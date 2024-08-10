/*
GOAP Actions - Export Index
*/

export { FoodActions } from './FoodActions'
export { ToolActions } from './ToolActions'

import { FoodActions } from './FoodActions'
import { ToolActions } from './ToolActions'

export const CommonActions = [
  ...FoodActions,
  ...ToolActions
]