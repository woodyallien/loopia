import { ArrowRight, Plus } from 'lucide-react'
import { Badge, Button } from '../components/ui'
import { money } from '../lib/utils'

const network = ['Patio Central', 'Mirador 24', 'Café Piedra']
const offers = [
  { from: 'Patio Central', to: 'Mirador 24', promo: 'Cena y desbloquea una bebida.', referred: 41, conversions: 27, sales: 1480 },
  { from: 'Café Piedra', to: 'Patio Central', promo: 'Visita el café y recibe 10% en almuerzo.', referred: 38, conversions: 23, sales: 2460 },
]

export function Partners() {
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Red de negocios</h1>
          <p className="mt-1 max-w-2xl text-sm text-secondary">
            Conecta tus locales o negocios aliados y convierte una visita en una oportunidad para otro negocio.
          </p>
        </div>
        <Button><Plus size={16} /> Nueva promoción</Button>
      </header>

      <section aria-label="Relación de la red" className="rounded-panel border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Conexión activa</p>
        <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          {network.map((name, index) => (
            <div key={name} className="flex items-center gap-2 sm:gap-4">
              <div className="rounded-control border bg-subtle px-4 py-3">
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-xs text-secondary">{index === 0 ? 'Origen' : index === 1 ? 'Aliado nocturno' : 'Aliado diurno'}</p>
              </div>
              {index < network.length - 1 && <ArrowRight className="rotate-90 text-tertiary sm:rotate-0" size={16} aria-hidden />}
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Métricas de red" className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Clientes derivados', '79'],
          ['Conversiones', '50'],
          ['Ventas atribuidas', money(3940)],
          ['Promociones activas', '2'],
        ].map(([label, value], index) => (
          <div key={label} className={`p-4 ${index ? 'border-t sm:border-l sm:border-t-0' : ''}`}>
            <p className="text-xs font-medium text-secondary">{label}</p>
            <p className="metric-number mt-2 text-2xl">{value}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="section-title">Promociones activas</h2>
            <p className="mt-1 text-sm text-secondary">Ofertas que mueven clientes entre locales conectados.</p>
          </div>
        </div>
        <div className="space-y-3">
          {offers.map(offer => (
            <article key={offer.promo} className="rounded-panel border bg-surface p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <strong>{offer.from}</strong>
                  <ArrowRight size={14} className="text-tertiary" />
                  <strong>{offer.to}</strong>
                  <Badge tone="success">Activa</Badge>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium">“{offer.promo}”</p>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4 text-sm">
                <div><p className="text-xs text-secondary">Derivados</p><p className="mt-1 font-semibold tabular-nums">{offer.referred}</p></div>
                <div><p className="text-xs text-secondary">Conversiones</p><p className="mt-1 font-semibold tabular-nums">{offer.conversions}</p></div>
                <div><p className="text-xs text-secondary">Ventas</p><p className="mt-1 font-semibold tabular-nums">{money(offer.sales)}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-panel border border-dashed bg-subtle/40 p-5">
        <p className="text-sm font-semibold">Próximamente: red abierta de negocios</p>
        <p className="mt-1 text-sm text-secondary">Conecta beneficios con otros negocios participantes sin compartir perfiles de clientes.</p>
      </aside>
    </div>
  )
}
