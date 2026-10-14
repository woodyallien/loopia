import { useEffect, useState } from 'react'
import { Bell, Building2, Check, Languages, Lock, MapPin, Palette, Shield, Star, Users } from 'lucide-react'
import { Badge, Button } from '../components/ui'
import { useOperations } from '../context/OperationsContext'
import type { BusinessSettings } from '../lib/operations'

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
  const { settings, saveSettings } = useOperations()
  const [tab, setTab] = useState<Section>('Negocio')
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [passwordNote, setPasswordNote] = useState(false)
  useEffect(() => setDraft(settings), [settings])
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings)
  const save = () => {
    saveSettings(draft)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }
  return (
    <div className="space-y-5">
      <header>
        <h1 className="page-title">Configuración</h1>
        <p className="mt-1 text-sm text-secondary">Ajusta el negocio por secciones. Los cambios se guardan con claridad.</p>
      </header>
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Secciones de configuración" className="h-fit overflow-hidden rounded-panel border bg-surface p-2">
          {sections.map(([name, Icon]) => (
            <button key={name} type="button" aria-current={tab === name ? 'page' : undefined} onClick={() => setTab(name)} className={`flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium ${tab === name ? 'bg-brand text-white dark:text-[#101513]' : 'text-secondary hover:bg-subtle hover:text-primary'}`}>
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
            {tab === 'Marca' && <Branding draft={draft} setDraft={setDraft} />}
            {tab === 'Idiomas' && <LanguagesPane />}
            {tab === 'Seguridad' && <Security noted={passwordNote} onPassword={() => setPasswordNote(true)} />}
            {tab === 'Notificaciones' && <Notifications draft={draft} setDraft={setDraft} />}
            {tab === 'Programa' && <Program draft={draft} setDraft={setDraft} />}
            {(tab === 'Negocio' || tab === 'Locales' || tab === 'Equipo') && <Generic tab={tab} draft={draft} setDraft={setDraft} />}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-5">
            <Button onClick={save} disabled={!dirty && !saved}>Guardar cambios</Button>
            <p className="text-xs text-tertiary" aria-live="polite">{saved ? 'Cambios guardados correctamente.' : dirty ? 'Hay cambios sin guardar en esta sección.' : 'Todo está guardado.'}</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function descriptionFor(tab: Section) {
  if (tab === 'Marca') return 'Personaliza la experiencia móvil de tus clientes.'
  if (tab === 'Programa') return 'Reglas de puntos, niveles, tope diario y vencimiento.'
  if (tab === 'Seguridad') return 'Acceso, autenticación y protección de la cuenta.'
  return 'Administra esta sección para toda la organización.'
}

function Generic({ tab, draft, setDraft }: { tab: Section; draft: BusinessSettings; setDraft: (value: BusinessSettings) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label>
        <span className="label">{tab === 'Negocio' ? 'Nombre del negocio' : 'Nombre'}</span>
        <input className="input" value={tab === 'Negocio' ? draft.businessName : draft.visibleName} aria-label={tab === 'Negocio' ? 'Nombre del negocio' : 'Nombre'} onChange={event => setDraft(tab === 'Negocio' ? { ...draft, businessName: event.target.value } : { ...draft, visibleName: event.target.value })} />
      </label>
      <label>
        <span className="label">{tab === 'Negocio' ? 'Tipo de negocio' : 'Preferencia'}</span>
        <select className="input" aria-label={tab === 'Negocio' ? 'Tipo de negocio' : 'Preferencia'} value={draft.businessType} onChange={event => setDraft({ ...draft, businessType: event.target.value })}>
          <option>Restaurantes, bares y cafés</option>
          <option>Activo</option>
        </select>
      </label>
      <label>
        <span className="label">Ciudad</span>
        <input className="input" value={draft.city} aria-label="Ciudad" onChange={event => setDraft({ ...draft, city: event.target.value })} />
      </label>
      <label>
        <span className="label">Zona horaria</span>
        <select className="input" aria-label="Zona horaria" value={draft.timezone} onChange={event => setDraft({ ...draft, timezone: event.target.value })}><option>America/Lima (GMT-5)</option></select>
      </label>
    </div>
  )
}

function Branding({ draft, setDraft }: { draft: BusinessSettings; setDraft: (value: BusinessSettings) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="label">Nombre visible</span><input className="input" value={draft.visibleName} aria-label="Nombre visible" onChange={event => setDraft({ ...draft, visibleName: event.target.value })} /></label>
        <label><span className="label">Mensaje de bienvenida</span><input className="input" value={draft.welcome} aria-label="Mensaje de bienvenida" onChange={event => setDraft({ ...draft, welcome: event.target.value })} /></label>
        <label>
          <span className="label">Color principal</span>
          <span className="flex gap-2">
            <input type="color" className="h-11 w-14 rounded-control border p-1" value={draft.primaryColor} aria-label="Selector de color principal" onChange={event => setDraft({ ...draft, primaryColor: event.target.value })} />
            <input className="input" value={draft.primaryColor} aria-label="Color principal" onChange={event => setDraft({ ...draft, primaryColor: event.target.value })} />
          </span>
        </label>
        <label>
          <span className="label">Color de acento</span>
          <span className="flex gap-2">
            <input type="color" className="h-11 w-14 rounded-control border p-1" value={draft.accentColor} aria-label="Selector de color de acento" onChange={event => setDraft({ ...draft, accentColor: event.target.value })} />
            <input className="input" value={draft.accentColor} aria-label="Color de acento" onChange={event => setDraft({ ...draft, accentColor: event.target.value })} />
          </span>
        </label>
      </div>
      <label className="block rounded-panel border border-dashed p-6 text-center text-sm text-secondary">
        {draft.logo ? <img src={draft.logo} alt="Logo del negocio" className="mx-auto mb-3 h-16 object-contain" /> : 'Subir logo o imagen de portada'}
        <input className="mt-3 block w-full text-xs" type="file" accept="image/*" aria-label="Subir logo" onChange={event => {
          const file = event.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => setDraft({ ...draft, logo: String(reader.result) })
          reader.readAsDataURL(file)
        }} />
      </label>
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

function Program({ draft, setDraft }: { draft: BusinessSettings; setDraft: (value: BusinessSettings) => void }) {
  const rules = draft.rules
  const setRule = (patch: Partial<BusinessSettings['rules']>) => setDraft({ ...draft, rules: { ...rules, ...patch } })
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label><span className="label">Puntos por sol</span><input className="input" type="number" min={0} value={rules.pointsPerSol} aria-label="Puntos por sol" onChange={event => setRule({ pointsPerSol: Number(event.target.value) })} /></label>
      <label><span className="label">Bono por visita</span><input className="input" type="number" min={0} value={rules.visitBonus} aria-label="Bono por visita" onChange={event => setRule({ visitBonus: Number(event.target.value) })} /></label>
      <label><span className="label">Tope diario de puntos</span><input className="input" type="number" min={0} value={rules.dailyCap} aria-label="Tope diario de puntos" onChange={event => setRule({ dailyCap: Number(event.target.value) })} /></label>
      <label>
        <span className="label">Vencimiento de puntos</span>
        <select className="input" aria-label="Vencimiento de puntos" value={rules.expirationDays} onChange={event => setRule({ expirationDays: Number(event.target.value) })}>
          <option value={365}>12 meses</option>
          <option value={180}>6 meses</option>
          <option value={60}>60 días</option>
          <option value={0}>Sin vencimiento</option>
        </select>
      </label>
      <label className="sm:col-span-2"><span className="label">Teléfonos del personal que no acumulan puntos</span><input className="input" value={rules.staffPhones.join(', ')} aria-label="Teléfonos del personal" placeholder="+51 999 000 000" onChange={event => setRule({ staffPhones: event.target.value.split(',').map(item => item.trim()).filter(Boolean) })} /></label>
      <label><span className="label">Puntos para el amigo referido</span><input className="input" type="number" min={0} value={draft.referralFriendPoints} aria-label="Puntos para el amigo referido" onChange={event => setDraft({ ...draft, referralFriendPoints: Number(event.target.value) })} /></label>
      <label><span className="label">Puntos para quien recomienda</span><input className="input" type="number" min={0} value={draft.referralReferrerPoints} aria-label="Puntos para quien recomienda" onChange={event => setDraft({ ...draft, referralReferrerPoints: Number(event.target.value) })} /></label>
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

function Notifications({ draft, setDraft }: { draft: BusinessSettings; setDraft: (value: BusinessSettings) => void }) {
  const items = [
    ['newCustomers', 'Nuevos clientes'],
    ['redemptions', 'Canjes de recompensas'],
    ['campaigns', 'Campañas enviadas'],
    ['atRisk', 'Alertas de clientes en riesgo'],
  ] as const
  return (
    <div className="space-y-3">
      {items.map(([key, label]) => (
        <label key={key} className="flex items-center justify-between gap-3 rounded-panel border p-4 text-sm">
          <span>{label}</span>
          <input type="checkbox" checked={draft.notifications[key]} aria-label={label} className="size-4 accent-[rgb(var(--brand))]" onChange={event => setDraft({ ...draft, notifications: { ...draft.notifications, [key]: event.target.checked } })} />
        </label>
      ))}
    </div>
  )
}

function Security({ noted, onPassword }: { noted: boolean; onPassword: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-panel bg-brand-subtle p-4">
        <Shield className="mt-0.5 text-brand" />
        <div>
          <p className="font-semibold">Cuenta protegida</p>
          <p className="mt-1 text-sm text-secondary">La autenticación de producción utiliza Supabase Auth y políticas por organización. En la demostración la contraseña sigue siendo admin.</p>
        </div>
      </div>
      <Button variant="secondary" onClick={onPassword}>Cambiar contraseña</Button>
      {noted && <p role="status" className="text-sm text-secondary">El cambio de contraseña queda para la cuenta conectada. Esta demostración mantiene admin / admin.</p>}
    </div>
  )
}
