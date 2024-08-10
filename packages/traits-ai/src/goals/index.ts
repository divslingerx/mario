/**
 * GOAP Goals - Pre-defined goal sets for different NPC motivations
 */

export { SurvivalGoals } from './SurvivalGoals'
export { SocialGoals } from './SocialGoals'
export { EconomicGoals } from './EconomicGoals'

// Re-export all goals as convenient collections
import { SurvivalGoals } from './SurvivalGoals'
import { SocialGoals } from './SocialGoals'
import { EconomicGoals } from './EconomicGoals'

export const AllGoals = [
  ...SurvivalGoals,
  ...SocialGoals,
  ...EconomicGoals
]

export const CommonGoals = AllGoals // Alias for backward compatibility