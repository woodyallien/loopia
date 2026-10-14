import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Campaign } from '../lib/types'
import {
  adjustPoints as adjustPointsIn,
  commitVisit as commitVisitIn,
  createCustomer as createCustomerIn,
  createOperationsState,
  duplicateGroups,
  loadOperationsState,
  mergeCustomers as mergeCustomersIn,
  redeemReward as redeemRewardIn,
  runBirthdays as runBirthdaysIn,
  saveCampaign as saveCampaignIn,
  sendCampaign as sendCampaignIn,
  sendOffer as sendOfferIn,
  undoVisit as undoVisitIn,
  operationsKey,
  type AutomationRule,
  type BusinessSettings,
  type CommitResult,
  type OperationsState,
  type StoredCustomer,
} from '../lib/operations'

interface OperationsApi {
  customers: StoredCustomer[]
  visits: OperationsState['visits']
  campaigns: Campaign[]
  referrals: OperationsState['referrals']
  automations: AutomationRule[]
  activity: OperationsState['activity']
  settings: BusinessSettings
  duplicates: StoredCustomer[][]
  commitVisit: (input: Parameters<typeof commitVisitIn>[1]) => CommitResult
  undoVisit: (visitId: string) => void
  createCustomer: (input: Parameters<typeof createCustomerIn>[1]) => ReturnType<typeof createCustomerIn>['result']
  mergeCustomers: (keepId: string, dropId: string) => void
  adjustPoints: (customerId: string, delta: number, staffName: string) => CommitResult
  redeemReward: (customerId: string, reward: { id: string; name: string; points: number }, staffName: string, location: string) => CommitResult
  saveCampaign: (campaign: Campaign) => void
  saveAndSend: (campaign: Campaign) => void
  sendCampaign: (campaignId: string) => void
  sendOffer: (customer: StoredCustomer) => void
  toggleAutomation: (id: string) => void
  addAutomation: (rule: Omit<AutomationRule, 'id' | 'triggered' | 'returned'>) => void
  runBirthdays: () => number
  saveSettings: (settings: BusinessSettings) => void
  updateCustomer: (customerId: string, patch: Partial<Pick<StoredCustomer, 'name' | 'email' | 'birthday' | 'language'>>) => void
}

const Context = createContext<OperationsApi | null>(null)

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OperationsState>(() => loadOperationsState())
  useEffect(() => localStorage.setItem(operationsKey, JSON.stringify(state)), [state])
  useEffect(() => {
    const reset = () => {
      localStorage.removeItem(operationsKey)
      setState(createOperationsState())
    }
    window.addEventListener('loopia-reset', reset)
    return () => window.removeEventListener('loopia-reset', reset)
  }, [])
  const api = useMemo<OperationsApi>(() => ({
    customers: state.customers,
    visits: state.visits,
    campaigns: state.campaigns,
    referrals: state.referrals,
    automations: state.automations,
    activity: state.activity,
    settings: state.settings,
    duplicates: duplicateGroups(state.customers),
    commitVisit: input => {
      const outcome = commitVisitIn(state, input)
      if (outcome.result.ok) setState(outcome.state)
      return outcome.result
    },
    undoVisit: visitId => setState(current => undoVisitIn(current, visitId)),
    createCustomer: input => {
      const outcome = createCustomerIn(state, input)
      if (outcome.result.ok) setState(outcome.state)
      return outcome.result
    },
    mergeCustomers: (keepId, dropId) => setState(current => mergeCustomersIn(current, keepId, dropId)),
    adjustPoints: (customerId, delta, staffName) => {
      const outcome = adjustPointsIn(state, customerId, delta, staffName)
      if (outcome.result.ok) setState(outcome.state)
      return outcome.result
    },
    redeemReward: (customerId, reward, staffName, location) => {
      const outcome = redeemRewardIn(state, customerId, reward, staffName, location)
      if (outcome.result.ok) setState(outcome.state)
      return outcome.result
    },
    saveCampaign: campaign => setState(current => saveCampaignIn(current, campaign)),
    saveAndSend: campaign => setState(current => sendCampaignIn(saveCampaignIn(current, campaign), campaign.id)),
    sendCampaign: campaignId => setState(current => sendCampaignIn(current, campaignId)),
    sendOffer: customer => setState(current => sendOfferIn(current, customer)),
    toggleAutomation: id => setState(current => ({ ...current, automations: current.automations.map(rule => rule.id === id ? { ...rule, active: !rule.active } : rule) })),
    addAutomation: rule => setState(current => ({ ...current, automations: [...current.automations, { ...rule, id: `a${Date.now()}`, triggered: 0, returned: 0 }] })),
    runBirthdays: () => {
      const before = state.awardedBirthdays.length
      const next = runBirthdaysIn(state)
      setState(next)
      return next.awardedBirthdays.length - before
    },
    saveSettings: settings => setState(current => ({ ...current, settings })),
    updateCustomer: (customerId, patch) => setState(current => ({
      ...current,
      customers: current.customers.map(customer => {
        if (customer.id !== customerId) return customer
        const name = patch.name?.trim() || customer.name
        return {
          ...customer,
          ...patch,
          name,
          initials: name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
        }
      }),
    })),
  }), [state])
  return <Context.Provider value={api}>{children}</Context.Provider>
}

export function useOperations() {
  const value = useContext(Context)
  if (!value) throw new Error('useOperations must be used within OperationsProvider')
  return value
}
