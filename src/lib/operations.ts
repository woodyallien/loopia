import { activity as seedActivity, campaigns as seedCampaigns, customers as seedCustomers } from '../data/mock'
import type { Campaign, Customer, Tier } from './types'
import { ageInDays, daysSince, digits, parseCustomerCode, sameDay, tierFor, usablePoints } from './analytics'

export interface ProgramRules {
  pointsPerSol: number
  visitBonus: number
  milestoneBonus: number
  milestoneEvery: number
  dailyCap: number
  expirationDays: number
  staffPhones: string[]
}

export interface BusinessSettings {
  businessName: string
  businessType: string
  city: string
  timezone: string
  visibleName: string
  welcome: string
  primaryColor: string
  accentColor: string
  logo: string
  referralFriendPoints: number
  referralReferrerPoints: number
  rules: ProgramRules
  notifications: { newCustomers: boolean; redemptions: boolean; campaigns: boolean; atRisk: boolean }
}

export type StoredCustomer = Customer & { baselineSpend: number; baselineVisits: number }

export interface CustomerSnapshot {
  points: number
  visits: number
  spend: number
  lastVisit: string
  tier: Tier
  status: Customer['status']
  referrals: number
}

export interface VisitRecord {
  id: string
  customerId: string
  customerName: string
  location: string
  amount: number
  points: number
  rewardName: string | null
  at: string
  staffName: string
  origin: 'history' | 'live'
  snapshot?: CustomerSnapshot
  campaignId?: string
  referralId?: string
  referrerId?: string
  referrerPoints?: number
}

export interface ReferralRecord {
  id: string
  referrerId: string
  referrerName: string
  referredId: string
  referredName: string
  referredPhone: string
  status: 'registered' | 'converted'
  createdAt: string
  sales: number
}

export interface AutomationRule {
  id: string
  name: string
  when: 'signup' | 'inactive-30' | 'birthday' | 'tier'
  then: string
  active: boolean
  triggered: number
  returned: number
}

export interface ActivityItem {
  id: string
  name: string
  action: string
  value: string
  at: string
  visitId?: string
}

export interface OperationsState {
  version: 1
  customers: StoredCustomer[]
  visits: VisitRecord[]
  campaigns: Campaign[]
  referrals: ReferralRecord[]
  automations: AutomationRule[]
  activity: ActivityItem[]
  settings: BusinessSettings
  awardedBirthdays: string[]
}

export interface AwardBreakdown {
  base: number
  visit: number
  milestone: number
  manual: number
  total: number
  awarded: number
  capped: boolean
}

const STORAGE_KEY = 'loopia-operations'

export const operationsKey = STORAGE_KEY

const defaultSettings = (): BusinessSettings => ({
  businessName: 'Andes Hospitality Demo',
  businessType: 'Restaurantes, bares y cafés',
  city: 'Cusco',
  timezone: 'America/Lima (GMT-5)',
  visibleName: 'Patio Central',
  welcome: 'Qué gusto verte',
  primaryColor: '#23473b',
  accentColor: '#be9157',
  logo: '',
  referralFriendPoints: 100,
  referralReferrerPoints: 150,
  rules: {
    pointsPerSol: 1,
    visitBonus: 25,
    milestoneBonus: 100,
    milestoneEvery: 5,
    dailyCap: 800,
    expirationDays: 365,
    staffPhones: [],
  },
  notifications: { newCustomers: true, redemptions: true, campaigns: true, atRisk: true },
})

function initials(name: string) {
  return name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase()
}

function snapshot(customer: StoredCustomer): CustomerSnapshot {
  return {
    points: customer.points,
    visits: customer.visits,
    spend: customer.spend,
    lastVisit: customer.lastVisit,
    tier: customer.tier,
    status: customer.status,
    referrals: customer.referrals,
  }
}

export function awardFromRules(amount: number, visits: number, manual: number, rules: ProgramRules): Omit<AwardBreakdown, 'awarded' | 'capped'> & { total: number } {
  const base = Math.max(0, Math.floor(amount)) * rules.pointsPerSol
  const visit = rules.visitBonus
  const milestone = rules.milestoneEvery > 0 && (visits + 1) % rules.milestoneEvery === 0 ? rules.milestoneBonus : 0
  const extra = Math.max(0, Math.floor(manual))
  return { base, visit, milestone, manual: extra, total: base + visit + milestone + extra }
}

export function previewAward(customer: StoredCustomer, amount: number, manual: number, rules: ProgramRules, visits: VisitRecord[], now = new Date()): AwardBreakdown {
  const raw = awardFromRules(amount, customer.visits, manual, rules)
  const already = pointsEarnedToday(visits, customer.id, now)
  const room = Math.max(0, rules.dailyCap - already)
  const awarded = Math.min(raw.total, room)
  return { ...raw, awarded, capped: awarded < raw.total }
}

function pointsEarnedToday(visits: VisitRecord[], customerId: string, now: Date) {
  return visits
    .filter(visit => visit.origin === 'live' && visit.customerId === customerId && visit.points > 0 && sameDay(visit.at, now))
    .reduce((sum, visit) => sum + visit.points, 0)
}

export function isStaffPhone(phone: string, rules: ProgramRules) {
  const needle = digits(phone)
  if (!needle) return false
  return rules.staffPhones.some(item => digits(item) === needle)
}

export function findCustomer(customers: StoredCustomer[], query: string) {
  const code = parseCustomerCode(query).toLowerCase()
  const phone = digits(query)
  return customers.find(customer => customer.id.toLowerCase() === code || (phone.length >= 6 && digits(customer.phone) === phone))
}

export function duplicateGroups(customers: StoredCustomer[]) {
  const groups = new Map<string, StoredCustomer[]>()
  customers.forEach(customer => {
    const key = digits(customer.phone)
    if (key.length < 6) return
    groups.set(key, [...(groups.get(key) ?? []), customer])
  })
  return [...groups.values()].filter(group => group.length > 1)
}

export function resolveAudience(customers: StoredCustomer[], audience: string, expirationDays: number) {
  const text = audience.toLowerCase()
  if (text.includes('frecuent')) return customers.filter(customer => customer.status === 'Frecuente' || customer.status === 'VIP' || customer.visits >= 10)
  if (text.includes('nuevo')) return customers.filter(customer => customer.visits <= 2 || customer.status === 'Nuevo')
  if (text.includes('vip')) return customers.filter(customer => customer.tier !== 'VIP' && 6000 - usablePoints(customer, expirationDays) <= 200 && usablePoints(customer, expirationDays) < 6000)
  return customers.filter(customer => daysSince(customer.lastVisit) >= 30)
}

function nextId(prefix: string, values: string[]) {
  const max = values.reduce((highest, value) => {
    const match = new RegExp(`${prefix}-(\\d+)`).exec(value)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}

function withCustomer(state: OperationsState, customerId: string, update: (customer: StoredCustomer) => StoredCustomer) {
  return { ...state, customers: state.customers.map(customer => customer.id === customerId ? update(customer) : customer) }
}

function pushActivity(state: OperationsState, item: ActivityItem, gate?: keyof BusinessSettings['notifications']) {
  if (gate && !state.settings.notifications[gate]) return state.activity
  return [item, ...state.activity].slice(0, 20)
}

function statusAfterVisit(customer: StoredCustomer): Customer['status'] {
  const days = daysSince(customer.lastVisit)
  if (days > 50) return 'Inactivo'
  if (days > 25) return 'En riesgo'
  if (customer.tier === 'VIP') return 'VIP'
  if (customer.visits <= 1) return 'Nuevo'
  if (customer.visits >= 8) return 'Frecuente'
  return 'Activo'
}

function bumpAutomation(state: OperationsState, when: AutomationRule['when'], returned = false) {
  let used = false
  return state.automations.map(rule => {
    if (used || !rule.active || rule.when !== when) return rule
    used = true
    return { ...rule, triggered: rule.triggered + 1, returned: rule.returned + (returned ? 1 : 0) }
  })
}

export function createOperationsState(): OperationsState {
  const now = Date.now()
  const customers: StoredCustomer[] = seedCustomers.map(customer => ({ ...customer, baselineSpend: customer.spend, baselineVisits: customer.visits }))
  const history: [string, string, number, number, number, string | null][] = [
    ['Carlos Quispe', 'Patio Central', 83, 108, 1, null],
    ['Sofía Mendoza', 'Patio Central', 146, 171, 2, null],
    ['James Smith', 'Mirador 24', 0, -350, 3, 'Café de la casa'],
    ['Lucía Flores', 'Café Piedra', 54, 79, 5, null],
    ['Mateo Vargas', 'Patio Central', 120, 145, 8, null],
    ['Camila Rojas', 'Patio Central', 64, 89, 10, null],
    ['Sarah Miller', 'Mirador 24', 42, 67, 12, null],
    ['Sofía Mendoza', 'Patio Central', 90, 115, 26, null],
  ]
  const visits: VisitRecord[] = history.flatMap((row, index) => {
    const customer = customers.find(item => item.name === row[0])
    if (!customer) return []
    return [{
      id: `history-${index + 1}`,
      customerId: customer.id,
      customerName: customer.name,
      location: row[1],
      amount: row[2],
      points: row[3],
      rewardName: row[5],
      at: new Date(now - row[4] * 3_600_000).toISOString(),
      staffName: 'Historial',
      origin: 'history' as const,
    }]
  })
  return {
    version: 1,
    customers,
    visits,
    campaigns: seedCampaigns.map(campaign => ({ ...campaign, recipientIds: campaign.recipientIds ?? [], message: campaign.message ?? '' })),
    referrals: [],
    automations: [
      { id: 'a1', name: 'Bienvenida', when: 'signup', then: 'Enviar WhatsApp de bienvenida', active: true, triggered: 128, returned: 41 },
      { id: 'a2', name: 'Te extrañamos', when: 'inactive-30', then: 'Enviar campaña de regreso', active: true, triggered: 82, returned: 14 },
      { id: 'a3', name: 'Feliz cumpleaños', when: 'birthday', then: 'Enviar beneficio especial', active: true, triggered: 36, returned: 19 },
      { id: 'a4', name: 'Nuevo nivel', when: 'tier', then: 'Notificar recompensa desbloqueada', active: false, triggered: 54, returned: 22 },
    ],
    activity: seedActivity.map((item, index) => ({
      id: `activity-${index + 1}`,
      name: item.name,
      action: item.action,
      value: item.value,
      at: new Date(now - (index + 1) * 15 * 60_000).toISOString(),
    })),
    settings: defaultSettings(),
    awardedBirthdays: [],
  }
}

export function loadOperationsState(): OperationsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createOperationsState()
    const parsed = JSON.parse(raw) as OperationsState
    if (parsed.version !== 1 || !parsed.customers?.length || !parsed.settings?.rules) return createOperationsState()
    return parsed
  } catch {
    return createOperationsState()
  }
}

export type CommitResult =
  | { ok: true; visit: VisitRecord; customer: StoredCustomer; awarded: AwardBreakdown; referralConverted: boolean }
  | { ok: false; reason: 'not-found' | 'staff-blocked' | 'daily-cap' | 'insufficient-points' }

export function commitVisit(state: OperationsState, input: {
  customerId: string
  amount: number
  manual: number
  location: string
  staffName: string
  reward?: { id: string; name: string; points: number } | null
  now?: Date
}): { state: OperationsState; result: CommitResult } {
  const now = input.now ?? new Date()
  const current = state.customers.find(customer => customer.id === input.customerId)
  if (!current) return { state, result: { ok: false, reason: 'not-found' } }
  if (isStaffPhone(current.phone, state.settings.rules)) return { state, result: { ok: false, reason: 'staff-blocked' } }
  const expired = daysSince(current.lastVisit, now) > state.settings.rules.expirationDays && state.settings.rules.expirationDays > 0
  const baseCustomer = expired ? { ...current, points: 0 } : current
  const usable = usablePoints(baseCustomer, state.settings.rules.expirationDays, now)
  if (input.reward && usable < input.reward.points) return { state, result: { ok: false, reason: 'insufficient-points' } }
  const awarded = previewAward(baseCustomer, input.amount, input.manual, state.settings.rules, state.visits, now)
  if (awarded.awarded <= 0 && !input.reward) return { state, result: { ok: false, reason: 'daily-cap' } }
  const previousTier = baseCustomer.tier
  const wasInactive = daysSince(baseCustomer.lastVisit, now) >= 30
  const visitId = `visit-${now.getTime()}`
  let next = withCustomer(state, baseCustomer.id, () => baseCustomer)
  let referralConverted = false
  let referralId: string | undefined
  let referrerId: string | undefined
  let referrerPoints = 0
  const pendingReferral = baseCustomer.visits === 0
    ? next.referrals.find(referral => referral.referredId === baseCustomer.id && referral.status === 'registered')
    : undefined
  if (pendingReferral) {
    referralConverted = true
    referralId = pendingReferral.id
    referrerId = pendingReferral.referrerId
    referrerPoints = next.settings.referralReferrerPoints
    next = {
      ...next,
      referrals: next.referrals.map(referral => referral.id === pendingReferral.id ? { ...referral, status: 'converted', sales: input.amount } : referral),
    }
    next = withCustomer(next, pendingReferral.referrerId, referrer => ({
      ...referrer,
      points: referrer.points + referrerPoints,
      referrals: referrer.referrals + 1,
      tier: tierFor(referrer.points + referrerPoints),
    }))
  }
  const redemption = input.reward?.points ?? 0
  const points = Math.max(0, baseCustomer.points - redemption + awarded.awarded)
  const updated: StoredCustomer = {
    ...baseCustomer,
    points,
    visits: baseCustomer.visits + 1,
    spend: baseCustomer.spend + Math.max(0, input.amount),
    lastVisit: 'Hoy',
    tier: tierFor(points),
  }
  updated.status = statusAfterVisit(updated)
  const visit: VisitRecord = {
    id: visitId,
    customerId: updated.id,
    customerName: updated.name,
    location: input.location,
    amount: Math.max(0, input.amount),
    points: awarded.awarded - redemption,
    rewardName: input.reward?.name ?? null,
    at: now.toISOString(),
    staffName: input.staffName,
    origin: 'live',
    snapshot: snapshot(current),
    referralId,
    referrerId,
    referrerPoints,
  }
  const attributed = attributeCampaign(next.campaigns, updated.id, Math.max(0, input.amount), now)
  visit.campaignId = attributed.campaignId
  next = {
    ...next,
    campaigns: attributed.campaigns,
    visits: [visit, ...next.visits],
    automations: wasInactive ? bumpAutomation(next, 'inactive-30', true) : next.automations,
  }
  if (previousTier !== updated.tier) next = { ...next, automations: bumpAutomation(next, 'tier', true) }
  next = withCustomer(next, updated.id, () => updated)
  const rewardText = input.reward ? ` y canjeó ${input.reward.name}` : ''
  next = {
    ...next,
    activity: pushActivity(next, {
      id: `activity-${visitId}`,
      visitId,
      name: updated.name,
      action: `registró una visita${rewardText}`,
      value: `${awarded.awarded - redemption >= 0 ? '+' : ''}${awarded.awarded - redemption} pts`,
      at: now.toISOString(),
    }),
  }
  return { state: next, result: { ok: true, visit, customer: updated, awarded, referralConverted } }
}

function attributeCampaign(campaigns: Campaign[], customerId: string, amount: number, now: Date) {
  const ordered = campaigns
    .map((campaign, index) => ({ campaign, index }))
    .filter(item => item.campaign.sentAt && item.campaign.recipientIds?.includes(customerId) && ageInDays(item.campaign.sentAt, now) <= 14)
    .sort((a, b) => Date.parse(b.campaign.sentAt ?? '') - Date.parse(a.campaign.sentAt ?? ''))
  const match = ordered[0]
  if (!match) return { campaigns, campaignId: undefined as string | undefined }
  return {
    campaignId: match.campaign.id,
    campaigns: campaigns.map(campaign => campaign.id === match.campaign.id ? { ...campaign, returned: campaign.returned + 1, revenue: campaign.revenue + amount } : campaign),
  }
}

export function undoVisit(state: OperationsState, visitId: string): OperationsState {
  const visit = state.visits.find(item => item.id === visitId && item.origin === 'live' && item.snapshot)
  if (!visit?.snapshot) return state
  const restored = visit.snapshot
  let next = withCustomer(state, visit.customerId, customer => ({ ...customer, ...restored }))
  if (visit.referrerId && visit.referrerPoints) {
    next = withCustomer(next, visit.referrerId, referrer => ({
      ...referrer,
      points: Math.max(0, referrer.points - (visit.referrerPoints ?? 0)),
      referrals: Math.max(0, referrer.referrals - 1),
      tier: tierFor(Math.max(0, referrer.points - (visit.referrerPoints ?? 0))),
    }))
  }
  if (visit.referralId) {
    next = { ...next, referrals: next.referrals.map(referral => referral.id === visit.referralId ? { ...referral, status: 'registered', sales: 0 } : referral) }
  }
  if (visit.campaignId) {
    next = {
      ...next,
      campaigns: next.campaigns.map(campaign => campaign.id === visit.campaignId ? { ...campaign, returned: Math.max(0, campaign.returned - 1), revenue: Math.max(0, campaign.revenue - visit.amount) } : campaign),
    }
  }
  return {
    ...next,
    visits: next.visits.filter(item => item.id !== visitId),
    activity: next.activity.filter(item => item.visitId !== visitId),
  }
}

export type CustomerWriteResult = { ok: true; customer: StoredCustomer; duplicate?: undefined } | { ok: false; reason: 'duplicate'; existing: StoredCustomer }

export function createCustomer(state: OperationsState, input: { name: string; phone: string; email?: string; birthday?: string; force?: boolean; referrerId?: string }, now = new Date()): { state: OperationsState; result: CustomerWriteResult } {
  const existing = state.customers.find(customer => digits(customer.phone) === digits(input.phone))
  if (existing && !input.force) return { state, result: { ok: false, reason: 'duplicate', existing } }
  const name = input.name.trim()
  const customer: StoredCustomer = {
    id: nextId('CUS', state.customers.map(item => item.id)),
    name,
    initials: initials(name),
    country: 'Perú',
    language: 'ES',
    visits: 0,
    spend: 0,
    points: input.referrerId ? state.settings.referralFriendPoints : 0,
    tier: 'Explorador',
    lastVisit: 'Hoy',
    referrals: 0,
    status: 'Nuevo',
    phone: input.phone.trim(),
    email: input.email?.trim() || `cliente${state.customers.length + 1}@example.com`,
    city: state.settings.city || 'Cusco',
    joined: now.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
    birthday: input.birthday || undefined,
    baselineSpend: 0,
    baselineVisits: 0,
  }
  customer.tier = tierFor(customer.points)
  let next: OperationsState = {
    ...state,
    customers: [customer, ...state.customers],
    automations: bumpAutomation(state, 'signup'),
    activity: pushActivity(state, { id: `activity-${customer.id}`, name: customer.name, action: 'se registró', value: customer.points ? `+${customer.points} pts` : 'Nuevo', at: now.toISOString() }, 'newCustomers'),
  }
  if (input.referrerId) {
    const referrer = state.customers.find(item => item.id === input.referrerId)
    if (referrer) {
      next = {
        ...next,
        referrals: [{
          id: `ref-${now.getTime()}`,
          referrerId: referrer.id,
          referrerName: referrer.name,
          referredId: customer.id,
          referredName: customer.name,
          referredPhone: customer.phone,
          status: 'registered',
          createdAt: now.toISOString(),
          sales: 0,
        }, ...next.referrals],
      }
    }
  }
  return { state: next, result: { ok: true, customer } }
}

export function mergeCustomers(state: OperationsState, keepId: string, dropId: string): OperationsState {
  if (keepId === dropId) return state
  const keep = state.customers.find(customer => customer.id === keepId)
  const drop = state.customers.find(customer => customer.id === dropId)
  if (!keep || !drop) return state
  const points = keep.points + drop.points
  const merged: StoredCustomer = {
    ...keep,
    visits: keep.visits + drop.visits,
    spend: keep.spend + drop.spend,
    points,
    referrals: keep.referrals + drop.referrals,
    baselineSpend: keep.baselineSpend + drop.baselineSpend,
    baselineVisits: keep.baselineVisits + drop.baselineVisits,
    lastVisit: daysSince(keep.lastVisit) <= daysSince(drop.lastVisit) ? keep.lastVisit : drop.lastVisit,
    tier: tierFor(points),
    email: keep.email.includes('example.com') ? drop.email : keep.email,
  }
  merged.status = statusAfterVisit(merged)
  return {
    ...state,
    customers: state.customers.filter(customer => customer.id !== dropId).map(customer => customer.id === keepId ? merged : customer),
    visits: state.visits.map(visit => visit.customerId === dropId ? { ...visit, customerId: keepId, customerName: keep.name } : visit),
    referrals: state.referrals.map(referral => ({
      ...referral,
      referrerId: referral.referrerId === dropId ? keepId : referral.referrerId,
      referrerName: referral.referrerId === dropId ? keep.name : referral.referrerName,
      referredId: referral.referredId === dropId ? keepId : referral.referredId,
      referredName: referral.referredId === dropId ? keep.name : referral.referredName,
    })),
    campaigns: state.campaigns.map(campaign => ({
      ...campaign,
      recipientIds: campaign.recipientIds?.map(id => id === dropId ? keepId : id),
    })),
  }
}

export function adjustPoints(state: OperationsState, customerId: string, delta: number, staffName: string, now = new Date()): { state: OperationsState; result: CommitResult } {
  const customer = state.customers.find(item => item.id === customerId)
  if (!customer) return { state, result: { ok: false, reason: 'not-found' } }
  if (isStaffPhone(customer.phone, state.settings.rules)) return { state, result: { ok: false, reason: 'staff-blocked' } }
  const amount = Math.floor(delta)
  if (amount === 0) return { state, result: { ok: false, reason: 'daily-cap' } }
  const room = state.settings.rules.dailyCap - pointsEarnedToday(state.visits, customerId, now)
  const granted = amount > 0 ? Math.min(amount, room) : amount
  if (granted === 0) return { state, result: { ok: false, reason: 'daily-cap' } }
  const expired = state.settings.rules.expirationDays > 0 && daysSince(customer.lastVisit, now) > state.settings.rules.expirationDays
  const starting = expired ? 0 : customer.points
  const points = Math.max(0, starting + granted)
  const updated: StoredCustomer = { ...customer, points, tier: tierFor(points) }
  const visit: VisitRecord = {
    id: `adjust-${now.getTime()}`,
    customerId,
    customerName: customer.name,
    location: 'Ajuste',
    amount: 0,
    points: granted,
    rewardName: null,
    at: now.toISOString(),
    staffName,
    origin: 'live',
    snapshot: snapshot(customer),
  }
  const awarded = { base: 0, visit: 0, milestone: 0, manual: granted, total: granted, awarded: granted, capped: granted !== amount }
  return {
    state: {
      ...withCustomer(state, customerId, () => updated),
      visits: [visit, ...state.visits],
      activity: pushActivity(state, { id: `activity-${visit.id}`, visitId: visit.id, name: customer.name, action: 'recibió un ajuste de puntos', value: `${granted > 0 ? '+' : ''}${granted} pts`, at: now.toISOString() }),
    },
    result: { ok: true, visit, customer: updated, awarded, referralConverted: false },
  }
}

export function saveCampaign(state: OperationsState, campaign: Campaign): OperationsState {
  const exists = state.campaigns.some(item => item.id === campaign.id)
  return { ...state, campaigns: exists ? state.campaigns.map(item => item.id === campaign.id ? campaign : item) : [campaign, ...state.campaigns] }
}

export function sendCampaign(state: OperationsState, campaignId: string, now = new Date()): OperationsState {
  const campaign = state.campaigns.find(item => item.id === campaignId)
  if (!campaign || campaign.status === 'Enviada' || campaign.status === 'Completada') return state
  const recipients = resolveAudience(state.customers, campaign.audience, state.settings.rules.expirationDays)
  const sent: Campaign = {
    ...campaign,
    channel: campaign.channel === 'Email' || campaign.channel === 'SMS' ? campaign.channel : 'WhatsApp',
    status: 'Enviada',
    sent: recipients.length,
    sentAt: now.toISOString(),
    recipientIds: recipients.map(customer => customer.id),
    message: campaign.message || '¡Te extrañamos! Regresa esta semana y recibe 100 puntos extra.',
  }
  return {
    ...state,
    campaigns: state.campaigns.map(item => item.id === campaignId ? sent : item),
    activity: pushActivity(state, { id: `activity-${campaignId}-${now.getTime()}`, name: sent.name, action: `se envió por ${sent.channel}`, value: `${sent.sent} contactos`, at: now.toISOString() }, 'campaigns'),
  }
}

export function sendOffer(state: OperationsState, customer: StoredCustomer, now = new Date()): OperationsState {
  const campaign: Campaign = {
    id: `c${now.getTime()}`,
    name: `Oferta para ${customer.name.split(' ')[0]}`,
    channel: 'WhatsApp',
    audience: customer.name,
    status: 'Enviada',
    sent: 1,
    returned: 0,
    revenue: 0,
    sentAt: now.toISOString(),
    recipientIds: [customer.id],
    message: `${customer.name.split(' ')[0]}, tenemos un motivo para que vuelvas esta semana.`,
  }
  return {
    ...state,
    campaigns: [campaign, ...state.campaigns],
    activity: pushActivity(state, { id: `activity-${campaign.id}`, name: customer.name, action: 'recibió una oferta de WhatsApp', value: '1 contacto', at: now.toISOString() }, 'campaigns'),
  }
}

export function runBirthdays(state: OperationsState, now = new Date()): OperationsState {
  const monthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const yearKey = `${now.getFullYear()}-${monthDay}`
  let next = state
  state.customers.forEach(customer => {
    if (!customer.birthday || customer.birthday.slice(-5) !== monthDay) return
    const marker = `${customer.id}:${yearKey}`
    if (next.awardedBirthdays.includes(marker)) return
    const active = next.automations.some(rule => rule.active && rule.when === 'birthday')
    if (!active) return
    const points = customer.points + 200
    next = withCustomer(next, customer.id, current => ({ ...current, points, tier: tierFor(points) }))
    next = {
      ...next,
      awardedBirthdays: [...next.awardedBirthdays, marker],
      automations: bumpAutomation(next, 'birthday', true),
      activity: pushActivity(next, { id: `activity-${marker}`, name: customer.name, action: 'recibió el beneficio de cumpleaños', value: '+200 pts', at: now.toISOString() }, 'campaigns'),
    }
  })
  return next
}

export function redeemReward(state: OperationsState, customerId: string, reward: { id: string; name: string; points: number }, staffName: string, location: string, now = new Date()): { state: OperationsState; result: CommitResult } {
  const customer = state.customers.find(item => item.id === customerId)
  if (!customer) return { state, result: { ok: false, reason: 'not-found' } }
  if (isStaffPhone(customer.phone, state.settings.rules)) return { state, result: { ok: false, reason: 'staff-blocked' } }
  if (usablePoints(customer, state.settings.rules.expirationDays, now) < reward.points) return { state, result: { ok: false, reason: 'insufficient-points' } }
  const points = customer.points - reward.points
  const updated: StoredCustomer = { ...customer, points, tier: tierFor(points) }
  const visit: VisitRecord = {
    id: `redeem-${now.getTime()}`,
    customerId,
    customerName: customer.name,
    location,
    amount: 0,
    points: -reward.points,
    rewardName: reward.name,
    at: now.toISOString(),
    staffName,
    origin: 'live',
    snapshot: snapshot(customer),
  }
  const awarded = { base: 0, visit: 0, milestone: 0, manual: 0, total: 0, awarded: -reward.points, capped: false }
  return {
    state: {
      ...withCustomer(state, customerId, () => updated),
      visits: [visit, ...state.visits],
      activity: pushActivity(state, { id: `activity-${visit.id}`, visitId: visit.id, name: customer.name, action: `canjeó ${reward.name}`, value: `-${reward.points} pts`, at: now.toISOString() }, 'redemptions'),
    },
    result: { ok: true, visit, customer: updated, awarded, referralConverted: false },
  }
}
