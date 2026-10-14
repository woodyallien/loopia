import type { Language } from './types'

const copy = {
  es: { dashboard:'Dashboard', customers:'Clientes', visits:'Visitas', loyalty:'Fidelización', rewards:'Recompensas', campaigns:'Campañas', automations:'Automatizaciones', referrals:'Referidos', partners:'Partners', qr:'QR', reports:'Reportes', team:'Equipo', locations:'Locales', settings:'Configuración', logout:'Cerrar sesión', demo:'Modo demo', greeting:'Buenas tardes', points:'puntos', viewAll:'Ver todos', search:'Buscar', new:'Nuevo', save:'Guardar', cancel:'Cancelar' },
  en: { dashboard:'Dashboard', customers:'Customers', visits:'Visits', loyalty:'Loyalty', rewards:'Rewards', campaigns:'Campaigns', automations:'Automations', referrals:'Referrals', partners:'Partners', qr:'QR', reports:'Reports', team:'Team', locations:'Locations', settings:'Settings', logout:'Log out', demo:'Demo mode', greeting:'Good afternoon', points:'points', viewAll:'View all', search:'Search', new:'New', save:'Save', cancel:'Cancel' }
} as const

export type CopyKey = keyof typeof copy.es
export const t = (language: Language, key: CopyKey) => copy[language][key]

export const pick = (language: Language, es: string, en: string) => (language === 'en' ? en : es)

export function greeting(language: Language, now = new Date()) {
  const hour = now.getHours()
  if (hour < 12) return pick(language, 'Buenos días', 'Good morning')
  if (hour < 19) return pick(language, 'Buenas tardes', 'Good afternoon')
  return pick(language, 'Buenas noches', 'Good evening')
}

const activityPhrases: [string, string][] = [
  [' y canjeó ', ' and redeemed '],
  ['registró una visita', 'logged a visit'],
  ['refirió a un amigo', 'referred a friend'],
  ['alcanzó nivel', 'reached tier'],
  ['recibió una oferta de WhatsApp', 'received a WhatsApp offer'],
  ['recibió un ajuste de puntos', 'received a points adjustment'],
  ['recibió el beneficio de cumpleaños', 'received the birthday reward'],
  ['se registró', 'signed up'],
  ['se envió por', 'was sent via'],
  ['canjeó', 'redeemed'],
  ['Nuevo nivel', 'New tier'],
  ['contactos', 'contacts'],
  ['contacto', 'contact'],
  ['Nuevo', 'New'],
]

export function translateActivity(language: Language, text: string) {
  if (language === 'es') return text
  return activityPhrases.reduce((value, [es, en]) => value.replaceAll(es, en), text)
}

const tierNames: Record<string, string> = { Explorador: 'Explorer', Viajero: 'Traveler', Frecuente: 'Regular', Insider: 'Insider', VIP: 'VIP' }

export function tierLabel(language: Language, tier: string) {
  return language === 'en' ? tierNames[tier] ?? tier : tier
}
