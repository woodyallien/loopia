import { chartData } from '../data/mock'
import type { Customer, Language, Tier } from './types'

export type PeriodDays = 7 | 30 | 90 | 180
export type ChartMetric = 'clientes' | 'visitas' | 'ventas'

export function daysSince(lastVisit: string, now = new Date()) {
  if (!lastVisit || lastVisit === 'Hoy') return 0
  if (lastVisit === 'Ayer') return 1
  const relative = /Hace (\d+)/.exec(lastVisit)
  if (relative) return Number(relative[1])
  const parsed = Date.parse(lastVisit)
  if (Number.isNaN(parsed)) return 0
  return Math.max(0, Math.floor((now.getTime() - parsed) / 86_400_000))
}

export function relativeTime(iso: string, language: Language = 'es', now = new Date()) {
  const en = language === 'en'
  const minutes = Math.round((now.getTime() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return en ? 'Just now' : 'Ahora'
  if (minutes < 60) return en ? `${minutes} min ago` : `Hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return en ? `${hours} h ago` : `Hace ${hours} h`
  const days = Math.round(hours / 24)
  if (days === 1) return en ? 'Yesterday' : 'Ayer'
  return en ? `${days} days ago` : `Hace ${days} días`
}

export function lastVisitLabel(lastVisit: string, language: Language = 'es') {
  if (language === 'es') return lastVisit
  const days = daysSince(lastVisit)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export function hexToChannels(hex: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const value = parseInt(match[1], 16)
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`
}

export function purchaseForReward(gap: number, rules: { pointsPerSol: number; visitBonus: number }) {
  if (gap <= 0) return 0
  return Math.ceil(Math.max(0, gap - rules.visitBonus) / Math.max(1, rules.pointsPerSol))
}

export function digits(value: string) {
  return value.replace(/\D/g, '')
}

export function parseCustomerCode(value: string) {
  const match = /CUS-\d+/i.exec(value)
  return match ? match[0].toUpperCase() : value.trim()
}

export function sameDay(iso: string, now = new Date()) {
  const date = new Date(iso)
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
}

export function ageInDays(iso: string, now = new Date()) {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000))
}

export function homeLocation(index: number, locations: string[]) {
  if (!locations.length) return 'Local'
  return locations[((index % locations.length) + locations.length) % locations.length]
}

export function locationShare(location: string, locations: string[]) {
  if (!location || location === 'all') return 1
  const weights = [0.47, 0.32, 0.21]
  const index = locations.indexOf(location)
  if (index < 0) return 1
  return weights[index] ?? 1 / locations.length
}

export function tierFor(points: number): Tier {
  if (points >= 6000) return 'VIP'
  if (points >= 3000) return 'Insider'
  if (points >= 1500) return 'Frecuente'
  if (points >= 500) return 'Viajero'
  return 'Explorador'
}

export function nextTier(points: number) {
  const levels = [
    { name: 'Viajero' as const, min: 500 },
    { name: 'Frecuente' as const, min: 1500 },
    { name: 'Insider' as const, min: 3000 },
    { name: 'VIP' as const, min: 6000 },
  ]
  const upcoming = levels.find(level => points < level.min)
  const previous = [...levels].reverse().find(level => points >= level.min)?.min ?? 0
  if (!upcoming) return { name: 'VIP' as const, min: 6000, previous, progress: 100, remaining: 0 }
  const span = upcoming.min - previous
  const progress = span ? Math.min(100, Math.round(((points - previous) / span) * 100)) : 0
  return { name: upcoming.name, min: upcoming.min, previous, progress, remaining: upcoming.min - points }
}

export function usablePoints(customer: Pick<Customer, 'points' | 'lastVisit'>, expirationDays: number, now = new Date()) {
  if (!expirationDays) return customer.points
  if (daysSince(customer.lastVisit, now) > expirationDays) return 0
  return Math.max(0, customer.points)
}

export function inPeriod(customer: Pick<Customer, 'lastVisit'>, period: PeriodDays, now = new Date()) {
  return daysSince(customer.lastVisit, now) <= period
}

export function buildChart(metric: ChartMetric, period: PeriodDays, share: number, extra: number) {
  const key = metric === 'clientes' ? 'clientes' : metric === 'visitas' ? 'visitas' : 'ventas'
  if (period >= 180) {
    const points = chartData.map(row => ({ name: row.name, value: Math.round(row[key] * share) }))
    points[points.length - 1].value += extra
    return points
  }
  if (period >= 90) {
    const points = chartData.slice(-3).map(row => ({ name: row.name, value: Math.round(row[key] * share) }))
    points[points.length - 1].value += extra
    return points
  }
  if (period >= 30) {
    const last = chartData[chartData.length - 1][key]
    const parts = [0.22, 0.24, 0.26, 0.28]
    return ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((name, index) => ({
      name,
      value: Math.round(last * parts[index] * share) + (index === 3 ? extra : 0),
    }))
  }
  const last = chartData[chartData.length - 1][key]
  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const parts = [0.12, 0.11, 0.1, 0.16, 0.2, 0.18, 0.13]
  const today = (new Date().getDay() + 6) % 7
  return labels.map((name, index) => ({
    name,
    value: Math.round(last * 0.25 * parts[index] * share) + (index === today ? extra : 0),
  }))
}

export function trendPercent(current: number, previous: number) {
  if (!previous) return current ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}
