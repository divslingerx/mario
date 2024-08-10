/*
Interaction Rules - Export Index
*/

export { FireRules } from './FireRules'
export { AlcoholRules } from './AlcoholRules'
export { SocialRules } from './SocialRules'

import { FireRules } from './FireRules'
import { AlcoholRules } from './AlcoholRules'
import { SocialRules } from './SocialRules'

export const DefaultInteractionRules = [
  ...FireRules,
  ...AlcoholRules,
  ...SocialRules
]