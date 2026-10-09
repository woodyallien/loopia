import { useState } from 'react'
import { Bell, Building2, Check, Languages, Lock, MapPin, Palette, Shield, Star, Users } from 'lucide-react'
import { Badge, Button } from '../components/ui'

const sections = [
  ['Negocio', Building2],
  ['Marca', Palette],
  ['Programa', Star],
  ['Locales', MapPin],
  ['Equipo', Users],
  ['Idiomas', Languages],
  ['Notificaciones', Bell],
  ['Seguridad', Lock],
] as const

type Section = typeof sections[number][0]

export function Settings() {
  const [tab, setTab] = useState<Section>('Negocio')
  const [saved, setSaved] = useState(false)
  return (
    <div className="space-y-5">
      <header>
        <h1 className="page-title">Configuración</h1>
        <p className="mt-1 text-sm text-secondary">Ajusta el negocio por secciones. Los cambios se guardan con claridad.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Secciones de configuración" className="h-fit overflow-hidden rounded-panel border bg-surface p-2">
          {sections.map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              aria-current={tab === name ? 'page' : undefined}
              onClick={() => setTab(name)}
              className={`flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium ${tab === name ? 'bg-brand text-white dark:text-[#101513]' : 'text-secondary hover:bg-subtle hover:text-primary'}`}
            >
              <Icon size={16} />{name}
            </button>
          ))}
        </nav>

        <section className="rounded-panel border bg-surface p-5 md:p-6" aria-labelledby="settings-section-title">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
            <div>
              <h2 id="settings-section-title" className="section-title">{tab}</h2>
              <p className="mt-1 text-sm text-secondary">{descriptionFor(tab)}</p>
            </div>
            {saved && <span role="status" className="flex items-center gap-1 text-sm font-medium text-success"><Check size={16} /> Guardado</span>}
          </div>

          <div className="mt-5">
            {tab === 'Marca' && <Branding />}
            {tab === 'Idiomas' && <LanguagesPane />}
            {tab === 'Seguridad' && <Security />}
            {tab === 'Notificaciones' && <Notifications />}
            {tab === 'Programa' && <Program />}
            {(tab === 'Negocio' || tab === 'Locales' || tab === 'Equipo') && <Generic tab={tab} />}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-5">
            <Button onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2000) }}>Guardar cambios</Button>
            <p className="text-xs text-tertiary" aria-live="polite">{saved ? 'Cambios guardados correctamente.' : 'Hay cambios sin guardar en esta sección.'}</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function descriptionFor(tab: Section) {
  if (tab === 'Marca') return 'Personaliza la experiencia móvil de tus clientes.'
  if (tab === 'Programa') return 'Reglas de puntos, niveles y vencimiento.'
  if (tab === 'Seguridad') return 'Acceso, autenticación y protección de la cuenta.'
  return 'Administra esta sección para toda la organización.'
}

function Generic({ tab }: { tab: Section }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label>
        <span className="label">{tab === 'Negocio' ? 'Nombre del negocio' : 'Nombre'}</span>
        <input className="input" defaultValue={tab === 'Negocio' ? 'Andes Hospitality Demo' : ''} aria-label={tab === 'Negocio' ? 'Nombre del negocio' : 'Nombre'} />
      </label>
      <label>
        <span className="label">{tab === 'Negocio' ? 'Tipo de negocio' : 'Preferencia'}</span>
        <select className="input" aria-label={tab === 'Negocio' ? 'Tipo de negocio' : 'Preferencia'}>
          <option>Restaurantes, bares y cafés</option>
          <option>Activo</option>
        </select>
      </label>
      <label>
        <span className="label">Ciudad</span>
        <input className="input" defaultValue="Cusco" aria-label="Ciudad" />
      </label>
      <label>
        <span className="label">Zona horaria</span>
        <select className="input" aria-label="Zona horaria"><option>America/Lima (GMT-5)</option></select>
      </label>
    </div>
  )
}

function Branding() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="label">Nombre visible</span><input className="input" defaultValue="Andes Hospitality" aria-label="Nombre visible" /></label>
        <label><span className="label">Mensaje de bienvenida</span><input className="input" defaultValue="Qué gusto verte otra vez" aria-label="Mensaje de bienvenida" /></label>
        <label>
          <span className="label">Color principal</span>
          <span className="flex gap-2">
            <input type="color" className="h-11 w-14 rounded-control border p-1" defaultValue="#23473b" aria-label="Selector de color principal" />
            <input className="input" defaultValue="#23473b" aria-label="Color principal" />
          </span>
        </label>
        <label>
          <span className="label">Color de acento</span>
          <span className="flex gap-2">
            <input type="color" className="h-11 w-14 rounded-control border p-1" defaultValue="#be9157" aria-label="Selector de color de acento" />
            <input className="input" defaultValue="#be9157" aria-label="Color de acento" />
          </span>
        </label>
      </div>
      <div className="rounded-panel border border-dashed p-6 text-center text-sm text-secondary">Subir logo o imagen de portada</div>
      <div className="flex items-center justify-between rounded-panel bg-subtle p-4 opacity-70">
        <div>
          <p className="font-semibold">White-label <Badge>Planes superiores</Badge></p>
          <p className="text-xs text-secondary">Oculta la marca del producto en el portal.</p>
        </div>
        <button role="switch" aria-checked="false" disabled className="h-7 w-12 rounded-full bg-[rgb(var(--border-strong))]" aria-label="White-label" />
      </div>
    </div>
  )
}

function Program() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label><span className="label">Puntos por sol</span><input className="input" defaultValue="1" aria-label="Puntos por sol" /></label>
      <label><span className="label">Bono por visita</span><input className="input" defaultValue="25" aria-label="Bono por visita" /></label>
      <label><span className="label">Vencimiento de puntos</span><select className="input" aria-label="Vencimiento de puntos"><option>12 meses</option><option>6 meses</option><option>Sin vencimiento</option></select></label>
      <label><span className="label">Nivel inicial</span><select className="input" aria-label="Nivel inicial"><option>Explorador</option></select></label>
    </div>
  )
}

function LanguagesPane() {
  return (
    <div className="space-y-3">
      {[['Español', 'Idioma principal'], ['English', 'Disponible para clientes']].map(([name, meta]) => (
        <div className="flex items-center gap-4 rounded-panel border p-4" key={name}>
          <span className="grid size-9 place-items-center rounded-full bg-brand-subtle text-xs font-semibold">{name.slice(0, 2).toUpperCase()}</span>
          <div className="flex-1">
            <p className="font-semibold">{name}</p>
            <p className="text-xs text-secondary">{meta}</p>
          </div>
          <Badge tone="success">Activo</Badge>
        </div>
      ))}
    </div>
  )
}

function Notifications() {
  return (
    <div className="space-y-3">
      {['Nuevos clientes', 'Canjes de recompensas', 'Campañas enviadas', 'Alertas de clientes en riesgo'].map(item => (
        <label key={item} className="flex items-center justify-between gap-3 rounded-panel border p-4 text-sm">
          <span>{item}</span>
          <input type="checkbox" defaultChecked aria-label={item} className="size-4 accent-[rgb(var(--brand))]" />
        </label>
      ))}
    </div>
  )
}

function Security() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-panel bg-brand-subtle p-4">
        <Shield className="mt-0.5 text-brand" />
        <div>
          <p className="font-semibold">Cuenta protegida</p>
          <p className="mt-1 text-sm text-secondary">La autenticación de producción utiliza Supabase Auth y políticas por organización.</p>
        </div>
      </div>
      <Button variant="secondary">Cambiar contraseña</Button>
    </div>
  )
}
