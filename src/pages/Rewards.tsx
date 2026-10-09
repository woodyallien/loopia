import { useMemo, useState } from 'react'
import { Copy, Gift, Pause, Pencil, Plus, Sparkles } from 'lucide-react'
import { Badge, Button, Sheet } from '../components/ui'
import { rewards } from '../data/mock'
import type { Reward } from '../lib/types'

type Filter = 'Todas' | 'Activas' | 'Programadas' | 'Agotadas' | 'Borradores'
type CatalogItem = Reward & { redemptions: number; location: string; status: Filter; image: 'coffee' | 'gift' }

const filters: Filter[] = ['Todas', 'Activas', 'Programadas', 'Agotadas', 'Borradores']
const meta: Omit<CatalogItem, keyof Reward>[] = [
  { redemptions: 48, location: 'Todos los locales', status: 'Activas', image: 'coffee' },
  { redemptions: 31, location: 'Patio Central', status: 'Activas', image: 'gift' },
  { redemptions: 22, location: 'Café Piedra', status: 'Activas', image: 'gift' },
  { redemptions: 9, location: 'Mirador 24', status: 'Programadas', image: 'coffee' },
]

export function Rewards() {
  const [filter, setFilter] = useState<Filter>('Todas')
  const [selected, setSelected] = useState<CatalogItem | null>(null)
  const [create, setCreate] = useState(false)
  const [redeemed, setRedeemed] = useState<string[]>([])
  const [draft, setDraft] = useState({ name: 'Café de cortesía', points: 350, type: 'Bebida gratis', description: 'Un café a elección en tu próxima visita.' })
  const catalog = useMemo(() => rewards.map((reward, index) => ({ ...reward, ...meta[index] })), [])
  const visible = catalog.filter(item => filter === 'Todas' || item.status === filter)
  const featured = catalog[0]
  const monthRedemptions = catalog.reduce((sum, item) => sum + item.redemptions, 0)

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Recompensas</h1>
          <p className="mt-1 text-sm text-secondary">Beneficios que tus clientes recuerdan y el personal puede canjear sin fricción.</p>
        </div>
        <Button onClick={() => setCreate(true)}><Plus size={16} /> Crear recompensa</Button>
      </header>

      <section aria-label="Resumen" className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Activas', String(catalog.filter(item => item.status === 'Activas').length)],
          ['Canjes este mes', String(monthRedemptions)],
          ['Puntos utilizados', (monthRedemptions * 420).toLocaleString()],
          ['Más popular', featured.name],
        ].map(([label, value], index) => (
          <div key={label} className={`p-4 ${index ? 'border-t sm:border-l sm:border-t-0 xl:border-t-0' : ''}`}>
            <p className="text-xs font-medium text-secondary">{label}</p>
            <p className="metric-number mt-2 truncate text-2xl">{value}</p>
          </div>
        ))}
      </section>

      <div className="hide-scroll flex gap-1 overflow-x-auto" role="tablist" aria-label="Filtros de recompensas">
        {filters.map(item => (
          <button
            key={item}
            role="tab"
            aria-selected={filter === item}
            onClick={() => setFilter(item)}
            className={`min-h-10 shrink-0 rounded-control px-3 text-xs font-medium ${filter === item ? 'bg-brand text-white dark:text-[#101513]' : 'text-secondary hover:bg-subtle'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <button
          type="button"
          onClick={() => setSelected(featured)}
          className="rounded-panel border bg-surface p-0 text-left lg:col-span-5"
        >
          <div className="grid h-40 place-items-center bg-brand-subtle"><Gift size={40} className="text-brand" /></div>
          <div className="p-5">
            <Badge tone="gold">Destacada</Badge>
            <h2 className="mt-3 text-xl font-semibold">{featured.name}</h2>
            <p className="mt-1 text-sm text-secondary">{featured.description}</p>
            <p className="mt-4 text-sm"><strong>{featured.points.toLocaleString()} pts</strong> · {featured.redemptions} canjes · {featured.location}</p>
          </div>
        </button>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
          {visible.map(item => (
            <article key={item.id} className="overflow-hidden rounded-panel border bg-surface">
              <button type="button" onClick={() => setSelected(item)} className="w-full text-left">
                <div className={`grid h-28 place-items-center ${item.image === 'coffee' ? 'bg-subtle' : 'bg-brand-subtle'}`}>
                  <Gift size={28} className="text-brand" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge tone={item.status === 'Activas' ? 'success' : 'neutral'}>{item.status === 'Activas' ? 'Activa' : item.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-secondary">{item.points.toLocaleString()} pts · {item.redemptions} canjes</p>
                  <p className="mt-1 text-xs text-tertiary">{item.location}</p>
                </div>
              </button>
              <div className="border-t px-4 py-3">
                <Button
                  variant="secondary"
                  className="w-full min-h-9 text-xs"
                  disabled={redeemed.includes(item.id)}
                  onClick={() => setRedeemed(value => [...value, item.id])}
                >
                  {redeemed.includes(item.id) ? 'Canjeada' : 'Canjear demo'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Sheet open={Boolean(selected)} onClose={() => setSelected(null)} title="Detalle de recompensa">
        {selected && (
          <div className="space-y-5 p-5">
            <div className="grid h-36 place-items-center rounded-panel bg-brand-subtle"><Gift size={36} className="text-brand" /></div>
            <div>
              <h3 className="text-xl font-semibold">{selected.name}</h3>
              <p className="mt-1 text-sm text-secondary">{selected.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border bg-[rgb(var(--border-subtle))]">
              {[['Puntos', selected.points.toLocaleString()], ['Canjes', selected.redemptions], ['Ubicación', selected.location], ['Elegibilidad', selected.tier ? `${selected.tier}+` : 'Todos']].map(([label, value]) => (
                <div key={label} className="bg-surface p-4">
                  <p className="text-xs text-secondary">{label}</p>
                  <p className="mt-1 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="border-l-2 border-brand pl-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Rendimiento</p>
              <p className="mt-1 text-sm">{selected.redemptions} canjes este mes · {(selected.redemptions * selected.points).toLocaleString()} puntos utilizados</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" className="min-h-10 text-xs"><Pencil size={14} /> Editar</Button>
              <Button variant="secondary" className="min-h-10 text-xs"><Pause size={14} /> Pausar</Button>
              <Button variant="secondary" className="min-h-10 text-xs"><Copy size={14} /> Duplicar</Button>
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={create} onClose={() => setCreate(false)} title="Crear recompensa">
        <form
          className="grid gap-0 lg:grid-cols-2"
          onSubmit={event => { event.preventDefault(); setCreate(false) }}
        >
          <div className="space-y-4 border-b p-5 lg:border-b-0 lg:border-r">
            <fieldset>
              <legend className="text-sm font-semibold">Recompensa</legend>
              <label className="mt-3 block"><span className="label">Nombre</span><input className="input" required value={draft.name} onChange={event => setDraft(value => ({ ...value, name: event.target.value }))} /></label>
              <label className="mt-3 block"><span className="label">Descripción</span><textarea className="input min-h-20" value={draft.description} onChange={event => setDraft(value => ({ ...value, description: event.target.value }))} /></label>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-semibold">Costo y elegibilidad</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label><span className="label">Puntos</span><input className="input" type="number" min={1} required value={draft.points} onChange={event => setDraft(value => ({ ...value, points: Number(event.target.value) }))} /></label>
                <label><span className="label">Tipo</span><select className="input" value={draft.type} onChange={event => setDraft(value => ({ ...value, type: event.target.value }))} aria-label="Tipo"><option>Bebida gratis</option><option>Producto gratis</option><option>Descuento</option><option>Experiencia</option></select></label>
              </div>
              <label className="mt-3 block"><span className="label">Elegibilidad</span><select className="input" aria-label="Elegibilidad"><option>Todos los niveles</option><option>Frecuente+</option><option>Insider+</option><option>VIP</option></select></label>
            </fieldset>
            <details>
              <summary className="cursor-pointer text-sm font-medium text-secondary">Opciones avanzadas</summary>
              <div className="mt-3 grid gap-3">
                <label><span className="label">Disponibilidad</span><select className="input" aria-label="Disponibilidad"><option>Siempre</option><option>Programada</option><option>Stock limitado</option></select></label>
                <label><span className="label">Local</span><select className="input" aria-label="Local"><option>Todos los locales</option><option>Patio Central</option><option>Mirador 24</option><option>Café Piedra</option></select></label>
              </div>
            </details>
            <Button type="submit" className="w-full"><Sparkles size={16} /> Crear recompensa</Button>
          </div>
          <div className="bg-subtle/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Vista del cliente</p>
            <div className="mx-auto mt-5 max-w-[220px] rounded-[1.6rem] border-[6px] border-[rgb(var(--text-primary))] bg-surface p-4">
              <p className="text-[10px] font-semibold text-secondary">PATIO CENTRAL</p>
              <div className="mt-4 rounded-panel bg-brand-subtle p-4">
                <Gift size={22} className="text-brand" />
                <p className="mt-3 font-semibold">{draft.name || 'Nombre'}</p>
                <p className="mt-1 text-xs text-secondary">{draft.description}</p>
                <p className="mt-4 text-sm font-semibold">{Number(draft.points || 0).toLocaleString()} pts</p>
              </div>
            </div>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
