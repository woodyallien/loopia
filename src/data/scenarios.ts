export type DemoScenario = 'restaurant' | 'bar' | 'cafe'

export interface ScenarioData {
  label: string
  organization: string
  locations: string[]
  featuredCustomer: string
  category: string
  metrics: { customers: string; newCustomers: string; returning: string; visits: string; sales: number; referrals: string }
  opportunity: string
}

export const demoScenarios: Record<DemoScenario, ScenarioData> = {
  restaurant: {
    label: 'Restaurante', organization: 'Andes Hospitality Demo', category: 'Restaurante',
    locations: ['Patio Central', 'Terraza Imperial', 'Comedor San Blas'], featuredCustomer: 'Carlos Quispe',
    metrics: { customers: '1,284', newCustomers: '183', returning: '41', visits: '2,451', sales: 48270, referrals: '31' },
    opportunity: '76 clientes llevan más de 30 días sin regresar.',
  },
  bar: {
    label: 'Bar', organization: 'Mirador Nocturno Demo', category: 'Bar',
    locations: ['Mirador 24', 'Bar San Blas', 'Patio de Noche'], featuredCustomer: 'Mateo Vargas',
    metrics: { customers: '862', newCustomers: '126', returning: '58', visits: '1,736', sales: 39640, referrals: '44' },
    opportunity: '43 clientes frecuentes no han vuelto en los últimos tres fines de semana.',
  },
  cafe: {
    label: 'Café', organization: 'Café Piedra Demo', category: 'Café',
    locations: ['Café Piedra Centro', 'Café Piedra Wanchaq', 'Kiosco Plaza'], featuredCustomer: 'Lucía Flores',
    metrics: { customers: '694', newCustomers: '94', returning: '73', visits: '1,984', sales: 21860, referrals: '27' },
    opportunity: 'Los martes por la tarde tienen 31% menos visitas recurrentes.',
  },
}
