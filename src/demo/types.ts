import type { DemoScenario } from '../data/scenarios'
import type { Role } from '../lib/types'

export type DemoView = 'presenter' | 'customer'
export type DemoPosition = 'top' | 'right' | 'bottom' | 'left'
export type DemoRole = Role | 'customer'

export interface DemoStep {
  id: string
  route: string
  target: string
  title: string
  description: string
  presenterScript: string
  deeperTalkingPoint?: string
  prospectQuestion?: string
  position?: DemoPosition
  role?: DemoRole
  scenario?: DemoScenario
  requiresAction?: string
}

export interface DemoJourney {
  id: string
  title: string
  outcome: string
  duration: '3 min' | '5 min' | '7 min' | '10 min' | '10–12 min'
  roles: string[]
  startingPoint: string
  steps: DemoStep[]
  future?: boolean
}
