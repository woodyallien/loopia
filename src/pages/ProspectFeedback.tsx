import { useState, type FormEvent, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../components/ui'
import { useApp } from '../context/AppContext'
import { demoScenarios } from '../data/scenarios'

export function ProspectFeedback() {
  const { scenario, user } = useApp()
  const [saved, setSaved] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const entry = { ...Object.fromEntries(new FormData(event.currentTarget)), createdAt: new Date().toISOString() }
    const existing = JSON.parse(localStorage.getItem('loopia-feedback') || '[]')
    localStorage.setItem('loopia-feedback', JSON.stringify([...existing, entry]))
    event.currentTarget.reset()
    setSaved(true)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="page-title">Feedback del prospecto</h1>
        <p className="mt-1 text-sm text-secondary">Herramienta interna de demo. Guarda señales justo después de la reunión.</p>
      </header>

      <section aria-label="Contexto de sesión" className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Escenario', demoScenarios[scenario].label],
          ['Rol', user?.role === 'owner' ? 'Dueño' : user?.role || '—'],
          ['Tipo', demoScenarios[scenario].label],
          ['Fecha', new Date().toLocaleDateString('es-PE')],
        ].map(([label, value], index) => (
          <div key={label} className={`p-4 ${index ? 'border-t sm:border-l sm:border-t-0' : ''}`}>
            <p className="text-xs font-medium text-secondary">{label}</p>
            <p className="mt-2 text-sm font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <form onSubmit={submit} className="space-y-6 rounded-panel border bg-surface p-5 md:p-6">
        <Group title="Operación actual">
          <Select label="Tipo de negocio" name="business_type" defaultValue={demoScenarios[scenario].label} options={['Restaurante', 'Bar', 'Café', 'Otro']} />
          <Select label="Tamaño del negocio" name="business_size" options={['1 local', '2–3 locales', '4–10 locales', 'Más de 10 locales']} />
          <Field label="Sistema de fidelización actual" name="current_loyalty" placeholder="Ej. Tarjeta física, descuentos, ninguno" />
        </Group>

        <Group title="Valor percibido">
          <Field label="Funcionalidad más valiosa" name="most_valuable" />
          <Field label="Funcionalidad menos útil" name="least_useful" />
        </Group>

        <Group title="Preocupaciones y precio">
          <Field label="Preocupación operativa" name="operational_concern" />
          <Select label="Precio mensual preferido" name="price_range" options={['Menos de S/ 100', 'S/ 100–199', 'S/ 200–349', 'S/ 350–499', 'S/ 500 o más']} />
        </Group>

        <Group title="Interés en piloto">
          <fieldset>
            <legend className="label">¿Probaría un piloto?</legend>
            <div className="flex min-h-11 flex-wrap items-center gap-4 rounded-control border px-3">
              {['Sí', 'Tal vez', 'No'].map(value => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="would_pilot" value={value} required />
                  {value}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="sm:col-span-2">
            <span className="label">Notas</span>
            <textarea className="input min-h-28" name="notes" placeholder="Frases textuales, objeciones y próximos pasos" aria-label="Notas" />
          </label>
        </Group>

        <Button type="submit">Guardar feedback</Button>
        {saved && (
          <p role="status" className="flex items-center gap-2 text-sm font-medium text-success">
            <Check size={16} /> Feedback guardado localmente.
          </p>
        )}
      </form>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function Field({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="input" name={name} placeholder={placeholder} required aria-label={label} />
    </label>
  )
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: string[]; defaultValue?: string }) {
  return (
    <label>
      <span className="label">{label}</span>
      <select className="input" name={name} defaultValue={defaultValue} aria-label={label}>
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}
