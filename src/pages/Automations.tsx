import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Badge, Button } from '../components/ui'

const items = [
  { name: 'Bienvenida', when: 'Cliente nuevo se registra', then: 'Enviar WhatsApp de bienvenida', active: true, triggered: 128, returned: 41 },
  { name: 'Te extrañamos', when: 'Cliente no visita durante 30 días', then: 'Enviar campaña de regreso', active: true, triggered: 82, returned: 14 },
  { name: 'Feliz cumpleaños', when: 'Cumpleaños del cliente', then: 'Enviar beneficio especial', active: true, triggered: 36, returned: 19 },
  { name: 'Nuevo nivel', when: 'Nivel de fidelidad alcanzado', then: 'Notificar recompensa desbloqueada', active: false, triggered: 54, returned: 22 },
]

export function Automations() {
  const [active, setActive] = useState(items.map(item => item.active))
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Automatizaciones</h1>
          <p className="mt-1 text-sm text-secondary">Reglas simples: cuando ocurre algo, Loopia actúa por ti.</p>
        </div>
        <Button><Plus size={16} /> Nueva automatización</Button>
      </header>

      <div className="space-y-3">
        {items.map((item, index) => (
          <article key={item.name} className="rounded-panel border bg-surface p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{item.name}</h2>
                  <Badge tone={active[index] ? 'success' : 'neutral'}>{active[index] ? 'Activa' : 'Pausada'}</Badge>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={active[index]}
                aria-label={`${active[index] ? 'Pausar' : 'Activar'} ${item.name}`}
                onClick={() => setActive(value => value.map((on, i) => (i === index ? !on : on)))}
                className={`relative h-7 w-12 rounded-full transition-colors ${active[index] ? 'bg-brand' : 'bg-subtle'}`}
              >
                <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${active[index] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-control bg-subtle/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Cuando</p>
                <p className="mt-1 text-sm font-medium">{item.when}</p>
              </div>
              <span className="hidden text-xs font-semibold text-tertiary md:block" aria-hidden>→</span>
              <div className="rounded-control bg-subtle/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Entonces</p>
                <p className="mt-1 text-sm font-medium">{item.then}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-secondary">{item.triggered} activaciones · {item.returned} regresaron</p>
          </article>
        ))}
      </div>
    </div>
  )
}
