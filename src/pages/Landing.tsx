import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowDown, ArrowRight, Check, MessageCircle } from 'lucide-react'
import { Logo } from '../components/Logo'
import { Button, Modal } from '../components/ui'
import { brand } from '../config/brand'

const loop = ['VISITA', 'SE IDENTIFICA', 'GANA', 'REGRESA', 'RECOMIENDA', 'NUEVO CLIENTE'] as const

export function Landing() {
  const [form, setForm] = useState(false)
  const [sent, setSent] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const saved = JSON.parse(localStorage.getItem('loopia-demo-requests') || '[]')
    localStorage.setItem('loopia-demo-requests', JSON.stringify([...saved, { ...data, createdAt: new Date().toISOString() }]))
    setSent(true)
  }
  return <>
    <main>
      <section className="relative overflow-hidden border-b bg-background pb-16 pt-28 lg:pb-24 lg:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgb(var(--brand-subtle)),transparent_55%),radial-gradient(ellipse_at_90%_40%,rgb(var(--surface-subtle)),transparent_50%)]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <p className="eyebrow">Fidelización y crecimiento para negocios locales</p>
            <h1 className="mt-4 max-w-xl text-[2.35rem] font-semibold leading-[1.08] tracking-[-.03em] text-primary sm:text-5xl lg:text-[3.25rem]">
              Convierte cada visita en una razón para volver.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-secondary sm:text-lg">
              Captura clientes, recompensa su fidelidad y convierte recomendaciones en nuevas visitas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setForm(true)}>Solicitar demo <ArrowRight size={16} /></Button>
              <a href="#como-funciona" className="btn-secondary">Ver cómo funciona</a>
              <a href={brand.whatsapp} target="_blank" rel="noopener noreferrer" className="btn text-secondary hover:bg-subtle"><MessageCircle size={16} /> Hablar por WhatsApp</a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-secondary"><Check size={15} className="text-brand" /> Restaurantes, bares, cafés y negocios locales · sin app para el cliente</p>
          </div>
          <HeroProductPreview />
        </div>
      </section>

      <section id="como-funciona" className="border-b bg-surface py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <p className="eyebrow">El ciclo Loopia</p>
            <h2 className="section-title mt-3 text-3xl md:text-4xl">Un sistema continuo, no seis pasos sueltos.</h2>
            <p className="mt-3 text-secondary">Cada visita alimenta la siguiente. El cliente lo siente simple; el negocio lo mide.</p>
          </div>
          <GrowthLoop />
        </div>
      </section>

      <section className="border-b bg-background py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <p className="eyebrow">El producto en acción</p>
            <h2 className="section-title mt-3 text-3xl md:text-4xl">Interfaces reales. Resultados claros.</h2>
          </div>
          <ProductBento />
        </div>
      </section>

      <section className="border-b bg-surface py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 space-y-16">
          <Showcase
            eyebrow="Dashboard"
            title="Conoce quién vuelve."
            text="Ve clientes activos, recurrencia y oportunidades de recuperación en una sola vista de decisión."
            reverse={false}
          >
            <DashFragment />
          </Showcase>
          <Showcase
            eyebrow="Perfil del cliente"
            title="Detecta quién está dejando de visitarte."
            text="Historial, puntos e insights accionables para decidir la siguiente conversación."
            reverse
          >
            <ProfileFragment />
          </Showcase>
          <Showcase
            eyebrow="Fidelidad y campañas"
            title="Recompensa la frecuencia sin complicar al personal."
            text="Niveles claros, recompensas visibles y campañas que recuperan visitas con contexto."
            reverse={false}
          >
            <LoyaltyCampaignFragment />
          </Showcase>
          <Showcase
            eyebrow="Referidos y portal"
            title="Convierte a tus mejores clientes en promotores."
            text="Mide recomendaciones y ofrece una membresía móvil que el cliente sí quiere abrir."
            reverse
          >
            <ReferralPortalFragment />
          </Showcase>
        </div>
      </section>

      <section className="border-b bg-background py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <p className="eyebrow">Hecho para hospitalidad local</p>
            <h2 className="section-title mt-3 text-3xl md:text-4xl">El mismo sistema, distinto ritmo por negocio.</h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              ['Restaurantes', 'Recurring diners', 'Identifica comensales recurrentes y recupera mesas vacías entre semana.'],
              ['Bares', 'Events + referrals', 'Activa noches con campañas y convierte asistentes en embajadores.'],
              ['Cafés', 'Frequency + challenges', 'Premia la frecuencia diaria con desafíos simples y recompensas rápidas.'],
            ].map(([type, cue, text]) => (
              <article key={type} className="rounded-panel border bg-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">{type}</p>
                <h3 className="mt-3 text-lg font-semibold">{cue}</h3>
                <p className="mt-2 text-sm leading-6 text-secondary">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-subtle/60 py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-5 text-center">
          <p className="eyebrow">30 días de ejemplo</p>
          <h2 className="section-title mt-3 text-3xl">Una vista clara de lo que puede crecer</h2>
          <p className="mt-3 text-sm text-secondary">Ejemplo ilustrativo con datos ficticios. No implica resultados garantizados.</p>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-panel border bg-[rgb(var(--border-subtle))] md:grid-cols-4">
            {[['183', 'clientes identificados'], ['41', 'clientes recurrentes'], ['17', 'referidos'], ['S/ 4,270.00', 'ventas registradas']].map(([value, label]) => (
              <div key={label} className="bg-surface p-6">
                <p className="metric-number text-3xl">{value}</p>
                <p className="mt-2 text-sm text-secondary">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[rgb(var(--brand))] py-20 text-center text-white lg:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Descubre cómo Loopia podría funcionar en tu negocio.</h2>
          <p className="mt-4 text-white/70">Una demostración práctica para captar, recuperar y multiplicar clientes.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => setForm(true)} className="bg-white text-[rgb(var(--brand))] hover:bg-white/90 dark:text-[#101513]">Solicitar demo</Button>
            <a className="btn border border-white/25 text-white hover:bg-white/10" href={brand.whatsapp} target="_blank" rel="noopener noreferrer">Hablar por WhatsApp</a>
          </div>
        </div>
      </section>
    </main>
    <footer className="border-t bg-background py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center">
        <Logo />
        <p className="text-xs text-secondary md:ml-auto">Privacidad · Términos</p>
      </div>
      <p className="mx-auto mt-6 max-w-7xl px-5 text-xs text-tertiary">El uso de funcionalidades de marketing y recopilación de datos debe realizarse conforme a la normativa aplicable de protección de datos y consentimiento.</p>
    </footer>
    <Modal open={form} onClose={() => { setForm(false); setSent(false) }} title="Solicitar una demostración">
      {sent ? (
        <div className="py-10 text-center" role="status">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-subtle text-brand"><Check /></span>
          <h3 className="mt-4 text-xl font-semibold">Gracias. Hemos recibido tu solicitud.</h3>
          <p className="mt-2 text-sm text-secondary">Nos pondremos en contacto muy pronto.</p>
        </div>
      ) : <DemoForm onSubmit={submit} />}
    </Modal>
  </>
}

function GrowthLoop() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setActive(loop.length - 1); return }
    const node = ref.current
    if (!node) return
    let timer = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      let step = 0
      setActive(0)
      timer = window.setInterval(() => {
        step += 1
        setActive(Math.min(step, loop.length - 1))
        if (step >= loop.length - 1) window.clearInterval(timer)
      }, 420)
      observer.disconnect()
    }, { threshold: 0.35 })
    observer.observe(node)
    return () => { observer.disconnect(); if (timer) window.clearInterval(timer) }
  }, [])
  return (
    <div ref={ref} className="mt-12 overflow-hidden rounded-panel border bg-background p-5 md:p-8" aria-label="Ciclo de crecimiento Loopia">
      <ol className="flex flex-col gap-0 md:flex-row md:items-stretch md:justify-between">
        {loop.map((label, index) => (
          <li key={label} className={`relative flex flex-1 items-center gap-3 py-3 md:flex-col md:gap-4 md:px-2 md:py-0 md:text-center ${index < active ? 'opacity-100' : index === active ? 'opacity-100' : 'opacity-35'} motion-safe:transition-opacity motion-safe:duration-500`}>
            <span className={`grid size-9 shrink-0 place-items-center rounded-full border text-xs font-semibold md:mx-auto ${index <= active ? 'border-brand bg-brand text-white dark:text-[#101513]' : 'border-strong bg-surface text-secondary'}`}>{index + 1}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-wide">{label}</p>
              {index < loop.length - 1 && <ArrowDown className="mt-2 text-tertiary md:hidden" size={14} aria-hidden />}
            </div>
            {index < loop.length - 1 && (
              <span className="absolute right-0 top-5 hidden h-px w-[calc(100%-2.5rem)] translate-x-1/2 bg-[rgb(var(--border-strong))] md:block" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

function ProductBento() {
  return (
    <div className="mt-10 grid gap-3 md:grid-cols-6 md:grid-rows-[auto_auto_auto]">
      <article className="rounded-panel border bg-surface p-5 md:col-span-4 md:row-span-2">
        <p className="eyebrow">Decision-first</p>
        <h3 className="mt-2 text-xl font-semibold">Dashboard que prioriza la siguiente acción</h3>
        <div className="mt-5"><DashFragment compact /></div>
      </article>
      <article className="rounded-panel border bg-surface p-5 md:col-span-2">
        <p className="eyebrow">Portal</p>
        <h3 className="mt-2 font-semibold">Membresía en el teléfono</h3>
        <div className="mt-4"><PhoneMini /></div>
      </article>
      <article className="rounded-panel border bg-surface p-5 md:col-span-2">
        <p className="eyebrow">Referidos</p>
        <h3 className="mt-2 font-semibold">Embudo de recomendaciones</h3>
        <div className="mt-4 space-y-2">
          {[['Invitaciones', '64'], ['Visitas', '31'], ['Conversiones', '17']].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-sm"><span className="text-secondary">{label}</span><strong className="tabular-nums">{value}</strong></div>
          ))}
          <div className="h-1.5 overflow-hidden rounded-full bg-subtle"><div className="h-full w-[55%] rounded-full bg-brand" /></div>
        </div>
      </article>
      <article className="rounded-panel border bg-brand-subtle p-5 md:col-span-2">
        <p className="text-xs text-secondary">Saldo del cliente</p>
        <p className="metric-number mt-2 text-3xl">+195 puntos</p>
        <p className="mt-1 text-sm text-secondary">Última visita registrada</p>
      </article>
      <article className="rounded-panel border bg-surface p-5 md:col-span-2">
        <p className="text-xs text-secondary">Por recuperar</p>
        <p className="metric-number mt-2 text-3xl">82</p>
        <p className="mt-1 text-sm text-secondary">clientes sin visita en 30 días</p>
      </article>
      <article className="rounded-panel border bg-surface p-5 md:col-span-2">
        <p className="eyebrow">Campaña</p>
        <h3 className="mt-2 font-semibold">Vuelve este jueves</h3>
        <p className="mt-2 text-sm text-secondary">18 regresaron · S/ 1,640.00</p>
        <div className="mt-3 h-1.5 rounded-full bg-subtle"><div className="h-full w-[72%] rounded-full bg-brand" /></div>
      </article>
    </div>
  )
}

function Showcase({ eyebrow, title, text, reverse, children }: { eyebrow: string; title: string; text: string; reverse: boolean; children: ReactNode }) {
  return (
    <div className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title mt-3 text-2xl md:text-3xl">{title}</h2>
        <p className="mt-3 max-w-md text-secondary">{text}</p>
      </div>
      <div className="rounded-panel border bg-background p-3 shadow-soft sm:p-4">{children}</div>
    </div>
  )
}

function DashFragment({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-control border bg-surface ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-secondary">¿Qué está pasando con tus clientes?</p>
        <span className="text-[10px] text-tertiary">30 días</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-control border bg-[rgb(var(--border-subtle))]">
        {[['41', 'Regresaron', '+18%'], ['17', 'Referidos', '+23%'], ['S/ 4.2k', 'Ventas', '+14%']].map(([value, label, trend]) => (
          <div key={label} className="bg-surface p-3">
            <p className="text-[10px] text-secondary">{label}</p>
            <p className="metric-number mt-1 text-lg">{value}</p>
            <p className="mt-1 text-[10px] font-medium text-success">{trend}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 border-l-2 border-brand pl-3">
        <p className="text-xs font-medium">76 clientes llevan 30 días sin volver</p>
        <p className="mt-0.5 text-[10px] text-secondary">Crear campaña de regreso →</p>
      </div>
    </div>
  )
}

function ProfileFragment() {
  return (
    <div className="rounded-control border bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-brand-subtle text-xs font-semibold">SM</span>
        <div>
          <p className="font-semibold">Sofía Mendoza</p>
          <p className="text-xs text-secondary">VIP · 6,420 puntos · Hace 3 días</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-control border bg-[rgb(var(--border-subtle))]">
        {[['27', 'Visitas'], ['S/ 4,680', 'Gasto'], ['4', 'Referidos']].map(([value, label]) => (
          <div key={label} className="bg-surface p-3 text-center">
            <p className="metric-number text-base">{value}</p>
            <p className="mt-1 text-[10px] text-secondary">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 border-l-2 border-brand pl-3 text-sm text-secondary">Suele visitar los viernes. Ideal para un incentivo de regreso.</p>
    </div>
  )
}

function LoyaltyCampaignFragment() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-control border bg-surface p-4">
        <p className="text-xs text-secondary">Nivel actual</p>
        <p className="mt-1 font-semibold">Frecuente</p>
        <div className="mt-4 h-1.5 rounded-full bg-subtle"><div className="h-full w-4/5 rounded-full bg-brand" /></div>
        <p className="mt-2 text-xs text-secondary">180 pts para Insider</p>
      </div>
      <div className="rounded-control border bg-surface p-4">
        <p className="text-xs text-secondary">Campaña activa</p>
        <p className="mt-1 font-semibold">Café doble puntos</p>
        <p className="mt-3 text-sm text-secondary">21 regresaron</p>
        <p className="text-xs text-success">S/ 2,180.00 atribuidos</p>
      </div>
    </div>
  )
}

function ReferralPortalFragment() {
  return (
    <div className="grid items-end gap-3 sm:grid-cols-[1fr_140px]">
      <div className="rounded-control border bg-surface p-4">
        <p className="text-xs text-secondary">Top embajadores</p>
        {[['Mateo Vargas', '8'], ['Lucía Flores', '7'], ['Camila Rojas', '6']].map(([name, value]) => (
          <div key={name} className="flex items-center justify-between border-b py-2.5 text-sm last:border-0">
            <span className="font-medium">{name}</span>
            <span className="text-secondary">{value} referidos</span>
          </div>
        ))}
      </div>
      <PhoneMini />
    </div>
  )
}

function PhoneMini() {
  return (
    <div className="mx-auto w-full max-w-[140px] rounded-[1.4rem] border-[5px] border-[rgb(var(--text-primary))] bg-surface p-3 shadow-soft">
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-subtle" />
      <p className="text-[9px] font-semibold text-secondary">PATIO CENTRAL</p>
      <p className="mt-2 text-[10px] text-secondary">Hola, Sofía</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">1,840</p>
      <p className="text-[9px] text-tertiary">puntos</p>
      <div className="mt-3 h-1 rounded-full bg-subtle"><div className="h-full w-4/5 rounded-full bg-brand" /></div>
      <p className="mt-2 text-[9px] font-medium">Postre para compartir</p>
    </div>
  )
}

function HeroProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl pb-10 lg:pb-6">
      <div className="rounded-feature border bg-surface p-3 shadow-soft">
        <DashFragment />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-control border bg-subtle/50 p-3">
            <p className="text-[10px] text-secondary">Recompensa popular</p>
            <p className="mt-1 text-sm font-semibold">Café de la casa</p>
            <p className="mt-1 text-xs text-secondary">350 pts · 48 canjes</p>
          </div>
          <div className="rounded-control border bg-subtle/50 p-3">
            <p className="text-[10px] text-secondary">Referido reciente</p>
            <p className="mt-1 text-sm font-semibold">Mateo → Ana</p>
            <p className="mt-1 text-xs text-success">Convertido · +150 pts</p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-2 right-2 w-[132px] motion-safe:animate-[float-soft_6s_ease-in-out_infinite] sm:right-0 sm:w-[148px]">
        <PhoneMini />
      </div>
    </div>
  )
}

function DemoForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Nombre" name="first_name" />
      <Field label="Apellido" name="last_name" />
      <Field label="Nombre del negocio" name="business_name" />
      <label>
        <span className="label">Tipo de negocio</span>
        <select name="business_type" className="input" aria-label="Tipo de negocio">
          <option>Restaurante</option><option>Bar</option><option>Café</option><option>Otro</option>
        </select>
      </label>
      <Field label="Ciudad" name="city" />
      <Field label="WhatsApp" name="whatsapp" />
      <Field label="Correo electrónico" name="email" type="email" />
      <label>
        <span className="label">Contacto preferido</span>
        <select name="contact_method" className="input" aria-label="Contacto preferido">
          <option>WhatsApp</option><option>Correo electrónico</option><option>Llamada</option>
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className="label">Mensaje</span>
        <textarea name="message" className="input min-h-24" aria-label="Mensaje" />
      </label>
      <Button className="sm:col-span-2" type="submit">Solicitar demo</Button>
    </form>
  )
}

function Field({ label, name, type = 'text' }: { label: string; name: string; type?: string }) {
  return <label><span className="label">{label}</span><input className="input" name={name} type={type} required aria-label={label} /></label>
}
