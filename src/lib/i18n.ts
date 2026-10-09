import type { Language } from './types'

const copy = {
  es: { dashboard:'Dashboard', customers:'Clientes', visits:'Visitas', loyalty:'Fidelización', rewards:'Recompensas', campaigns:'Campañas', automations:'Automatizaciones', referrals:'Referidos', partners:'Partners', qr:'QR', reports:'Reportes', team:'Equipo', locations:'Locales', settings:'Configuración', logout:'Cerrar sesión', demo:'Modo demo', greeting:'Buenas tardes', points:'puntos', viewAll:'Ver todos', search:'Buscar', new:'Nuevo', save:'Guardar', cancel:'Cancelar' },
  en: { dashboard:'Dashboard', customers:'Customers', visits:'Visits', loyalty:'Loyalty', rewards:'Rewards', campaigns:'Campaigns', automations:'Automations', referrals:'Referrals', partners:'Partners', qr:'QR', reports:'Reports', team:'Team', locations:'Locations', settings:'Settings', logout:'Log out', demo:'Demo mode', greeting:'Good afternoon', points:'points', viewAll:'View all', search:'Search', new:'New', save:'Save', cancel:'Cancel' }
} as const

export type CopyKey = keyof typeof copy.es
export const t = (language: Language, key: CopyKey) => copy[language][key]
