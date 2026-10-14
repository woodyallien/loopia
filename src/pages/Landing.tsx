import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowDown, ArrowRight, Check, MessageCircle } from 'lucide-react'
import { Logo } from '../components/Logo'
import { Button, Modal } from '../components/ui'
import { brand } from '../config/brand'
import { useTr } from '../lib/useTr'

const loop = [
  ['VISITA', 'VISIT'],
  ['SE IDENTIFICA', 'CHECKS IN'],
  ['GANA', 'EARNS'],
  ['REGRESA', 'RETURNS'],
  ['RECOMIENDA', 'REFERS'],
  ['NUEVO CLIENTE', 'NEW CUSTOMER'],
] as const

export function Landing() {
  const tr = useTr()
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
            <p className="eyebrow">{tr('Fidelización y crecimiento para negocios locales', 'Loyalty and growth for local businesses')}</p>
            <h1 className="mt-4 max-w-xl text-[2.35rem] font-semibold leading-[1.08] tracking-[-.03em] text-primary sm:text-5xl lg:text-[3.25rem]">
              {tr('Convierte cada visita en una razón para volver.', 'Turn every visit into a reason to come back.')}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-secondary sm:text-lg">
              {tr('Captura clientes, recompensa su fidelidad y convierte recomendaciones en nuevas visitas.', 'Capture customers, reward their loyalty, and turn referrals into new visits.')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setForm(true)}>{tr('Solicitar demo', 'Request a demo')} <ArrowRight size={16} /></Button>
              <a href="#como-funciona" className="btn-secondary">{tr('Ver cómo funciona', 'See how it works')}</a>
              <a href={brand.whatsapp} target="_blank" rel="noopener noreferrer" className="btn text-secondary hover:bg-subtle"><MessageCircle size={16} /> {tr('Hablar por WhatsApp', 'Chat on WhatsApp')}</a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-secondary"><Check size={15} className="text-brand" /> {tr('Restaurantes, bares, cafés y negocios locales · sin app para el cliente', 'Restaurants, bars, cafés, and local shops · no app for customers')}</p>
          </div>
          <HeroProductPreview />
        </div>
      </section>

      <section id="como-funciona" className="border-b bg-surface py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <p className="eyebrow">{tr('El ciclo Loopia', 'The Loopia loop')}</p>
            <h2 className="section-title mt-3 text-3xl md:text-4xl">{tr('Un sistema continuo, no seis pasos sueltos.', 'One continuous system, not six separate steps.')}</h2>
            <p className="mt-3 text-secondary">{tr('Cada visita alimenta la siguiente. El cliente lo siente simple; el negocio lo mide.', 'Every visit feeds the next. Customers find it simple; the business can measure it.')}</p>
          </div>
          <GrowthLoop />
        </div>
      </section>

      <section className="border-b bg-background py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <p className="eyebrow">{tr('El producto en acción', 'The product in action')}</p>
            <h2 className="section-title mt-3 text-3xl md:text-4xl">{tr('Interfaces reales. Resultados claros.', 'Real screens. Clear results.')}</h2>
          </div>
          <ProductBento />
        </div>
      </section>

      <section className="border-b bg-surface py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 space-y-16">
          <Showcase
            eyebrow="Dashboard"
            title={tr('Conoce quién vuelve.', 'Know who comes back.')}
            text={tr('Ve clientes activos, recurrencia y oportunidades de recuperación en una sola vista de decisión.', 'See active customers, repeat visits, and win-back opportunities in one decision view.')}
            reverse={false}
          >
            <DashFragment />
          </Showcase>
          <Showcase
            eyebrow={tr('Perfil del cliente', 'Customer profile')}
            title={tr('Detecta quién está dejando de visitarte.', 'Spot who is drifting away.')}
            text={tr('Historial, puntos e insights accionables para decidir la siguiente conversación.', 'History, points, and actionable insights to plan the next conversation.')}
            reverse
          >
            <ProfileFragment />
          </Showcase>
          <Showcase
            eyebrow={tr('Fidelidad y campañas', 'Loyalty and campaigns')}
            title={tr('Recompensa la frecuencia sin complicar al personal.', 'Reward frequency without slowing down staff.')}
            text={tr('Niveles claros, recompensas visibles y campañas que recuperan visitas con contexto.', 'Clear tiers, visible rewards, and campaigns that win back visits with context.')}
            reverse={false}
          >
            <LoyaltyCampaignFragment />
          </Showcase>
          <Showcase
            eyebrow={tr('Referidos y portal', 'Referrals and portal')}
            title={tr('Convierte a tus mejores clientes en promotores.', 'Turn your best customers into promoters.')}
            text={tr('Mide recomendaciones y ofrece una membresía móvil que el cliente sí quiere abrir.', 'Measure referrals and offer a mobile membership customers actually want to open.')}
            reverse
          >
            <ReferralPortalFragment />
          </Showcase>
        </div>
      </section>

      <section className="border-b bg-background py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <p className="eyebrow">{tr('Hecho para hospitalidad local', 'Built for local hospitality')}</p>
            <h2 className="section-title mt-3 text-3xl md:text-4xl">{tr('El mismo sistema, distinto ritmo por negocio.', 'The same system, a different rhythm for each business.')}</h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              [tr('Restaurantes', 'Restaurants'), tr('Comensales recurrentes', 'Recurring diners'), tr('Identifica comensales recurrentes y recupera mesas vacías entre semana.', 'Recognize regular diners and fill empty weekday tables.')],
              [tr('Bares', 'Bars'), tr('Eventos + referidos', 'Events + referrals'), tr('Activa noches con campañas y convierte asistentes en embajadores.', 'Fill nights with campaigns and turn guests into ambassadors.')],
              [tr('Cafés', 'Cafés'), tr('Frecuencia + desafíos', 'Frequency + challenges'), tr('Premia la frecuencia diaria con desafíos simples y recompensas rápidas.', 'Reward daily habits with simple challenges and quick rewards.')],
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
          <p className="eyebrow">{tr('30 días de ejemplo', 'A sample 30 days')}</p>
          <h2 className="section-title mt-3 text-3xl">{tr('Una vista clara de lo que puede crecer', 'A clear view of what can grow')}</h2>
          <p className="mt-3 text-sm text-secondary">{tr('Ejemplo ilustrativo con datos ficticios. No implica resultados garantizados.', 'Illustrative example with fictional data. Results are not guaranteed.')}</p>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-panel border bg-[rgb(var(--border-subtle))] md:grid-cols-4">
            {[
              ['183', tr('clientes identificados', 'customers identified')],
              ['41', tr('clientes recurrentes', 'returning customers')],
              ['17', tr('referidos', 'referrals')],
              ['S/ 4,270.00', tr('ventas registradas', 'recorded sales')],
            ].map(([value, label]) => (
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
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{tr('Descubre cómo Loopia podría funcionar en tu negocio.', 'See how Loopia could work for your business.')}</h2>
          <p className="mt-4 text-white/70">{tr('Una demostración práctica para captar, recuperar y multiplicar clientes.', 'A hands-on demo for capturing, winning back, and multiplying customers.')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => setForm(true)} className="bg-white text-[rgb(var(--brand))] hover:bg-white/90 dark:text-[#101513]">{tr('Solicitar demo', 'Request a demo')}</Button>
            <a className="btn border border-white/25 text-white hover:bg-white/10" href={brand.whatsapp} target="_blank" rel="noopener noreferrer">{tr('Hablar por WhatsApp', 'Chat on WhatsApp')}</a>
          </div>
        </div>
      </section>
    </main>
    <footer className="border-t bg-background py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center">
        <Logo />
        <p className="text-xs text-secondary md:ml-auto">{tr('Privacidad · Términos', 'Privacy · Terms')}</p>
      </div>
      <p className="mx-auto mt-6 max-w-7xl px-5 text-xs text-tertiary">{tr('El uso de funcionalidades de marketing y recopilación de datos debe realizarse conforme a la normativa aplicable de protección de datos y consentimiento.', 'Marketing features and data collection must be used in line with applicable data protection and consent regulations.')}</p>
    </footer>
    <Modal open={form} onClose={() => { setForm(false); setSent(false) }} title={tr('Solicitar una demostración', 'Request a demo')}>
      {sent ? (
        <div className="py-10 text-center" role="status">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-subtle text-brand"><Check /></span>
          <h3 className="mt-4 text-xl font-semibold">{tr('Gracias. Hemos recibido tu solicitud.', 'Thank you. We received your request.')}</h3>
          <p className="mt-2 text-sm text-secondary">{tr('Nos pondremos en contacto muy pronto.', 'We will be in touch very soon.')}</p>
        </div>
      ) : <DemoForm onSubmit={submit} />}
    </Modal>
  </>
}

function GrowthLoop() {
  const tr = useTr()
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
    <div ref={ref} className="mt-12 overflow-hidden rounded-panel border bg-background p-5 md:p-8" aria-label={tr('Ciclo de crecimiento Loopia', 'Loopia growth loop')}>
      <ol className="flex flex-col gap-0 md:flex-row md:items-stretch md:justify-between">
        {loop.map(([es, en], index) => (
          <li key={es} className={`relative flex flex-1 items-center gap-3 py-3 md:flex-col md:gap-4 md:px-2 md:py-0 md:text-center ${index <= active ? 'opacity-100' : 'opacity-35'} motion-safe:transition-opacity motion-safe:duration-500`}>
            <span className={`grid size-9 shrink-0 place-items-center rounded-full border text-xs font-semibold md:mx-auto ${index <= active ? 'border-brand bg-brand text-white dark:text-[#101513]' : 'border-strong bg-surface text-secondary'}`}>{index + 1}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-wide">{tr(es, en)}</p>
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
  const tr = useTr()
  return (
    <div className="mt-10 grid gap-3 md:grid-cols-6 md:grid-rows-[auto_auto_auto]">
      <article className="rounded-panel border bg-surface p-5 md:col-span-4 md:row-span-2">
        <p className="eyebrow">{tr('Decisiones primero', 'Decision-first')}</p>
        <h3 className="mt-2 text-xl font-semibold">{tr('Dashboard que prioriza la siguiente acción', 'A dashboard that ranks the next action')}</h3>
        <div className="mt-5"><DashFragment compact /></div>
      </article>
      <article className="rounded-panel border bg-surface p-5 md:col-span-2">
        <p className="eyebrow">Portal</p>
        <h3 className="mt-2 font-semibold">{tr('Membresía en el teléfono', 'Membership on the phone')}</h3>
        <div className="mt-4"><PhoneMini /></div>
      </article>
      <article className="rounded-panel border bg-surface p-5 md:col-span-2">
        <p className="eyebrow">{tr('Referidos', 'Referrals')}</p>
        <h3 className="mt-2 font-semibold">{tr('Embudo de recomendaciones', 'Referral funnel')}</h3>
        <div className="mt-4 space-y-2">
          {[[tr('Invitaciones', 'Invites'), '64'], [tr('Visitas', 'Visits'), '31'], [tr('Conversiones', 'Conversions'), '17']].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-sm"><span className="text-secondary">{label}</span><strong className="tabular-nums">{value}</strong></div>
          ))}
          <div className="h-1.5 overflow-hidden rounded-full bg-subtle"><div className="h-full w-[55%] rounded-full bg-brand" /></div>
        </div>
      </article>
      <article className="rounded-panel border bg-brand-subtle p-5 md:col-span-2">
        <p className="text-xs text-secondary">{tr('Saldo del cliente', 'Customer balance')}</p>
        <p className="metric-number mt-2 text-3xl">+195 {tr('puntos', 'points')}</p>
        <p className="mt-1 text-sm text-secondary">{tr('Última visita registrada', 'Last recorded visit')}</p>
      </article>
      <article className="rounded-panel border bg-surface p-5 md:col-span-2">
        <p className="text-xs text-secondary">{tr('Por recuperar', 'To win back')}</p>
        <p className="metric-number mt-2 text-3xl">82</p>
        <p className="mt-1 text-sm text-secondary">{tr('clientes sin visita en 30 días', 'customers without a visit in 30 days')}</p>
      </article>
      <article className="rounded-panel border bg-surface p-5 md:col-span-2">
        <p className="eyebrow">{tr('Campaña', 'Campaign')}</p>
        <h3 className="mt-2 font-semibold">{tr('Vuelve este jueves', 'Come back this Thursday')}</h3>
        <p className="mt-2 text-sm text-secondary">{tr('18 regresaron', '18 came back')} · S/ 1,640.00</p>
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
  const tr = useTr()
  return (
    <div className={`rounded-control border bg-surface ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-secondary">{tr('¿Qué está pasando con tus clientes?', 'What is happening with your customers?')}</p>
        <span className="text-[10px] text-tertiary">{tr('30 días', '30 days')}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-control border bg-[rgb(var(--border-subtle))]">
        {[['41', tr('Regresaron', 'Came back'), '+18%'], ['17', tr('Referidos', 'Referrals'), '+23%'], ['S/ 4.2k', tr('Ventas', 'Sales'), '+14%']].map(([value, label, trend]) => (
          <div key={label} className="bg-surface p-3">
            <p className="text-[10px] text-secondary">{label}</p>
            <p className="metric-number mt-1 text-lg">{value}</p>
            <p className="mt-1 text-[10px] font-medium text-success">{trend}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 border-l-2 border-brand pl-3">
        <p className="text-xs font-medium">{tr('76 clientes llevan 30 días sin volver', '76 customers have not returned in 30 days')}</p>
        <p className="mt-0.5 text-[10px] text-secondary">{tr('Crear campaña de regreso →', 'Create a win-back campaign →')}</p>
      </div>
    </div>
  )
}

function ProfileFragment() {
  const tr = useTr()
  return (
    <div className="rounded-control border bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-brand-subtle text-xs font-semibold">SM</span>
        <div>
          <p className="font-semibold">Sofía Mendoza</p>
          <p className="text-xs text-secondary">VIP · 6,420 {tr('puntos · Hace 3 días', 'points · 3 days ago')}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-control border bg-[rgb(var(--border-subtle))]">
        {[['27', tr('Visitas', 'Visits')], ['S/ 4,680', tr('Gasto', 'Spend')], ['4', tr('Referidos', 'Referrals')]].map(([value, label]) => (
          <div key={label} className="bg-surface p-3 text-center">
            <p className="metric-number text-base">{value}</p>
            <p className="mt-1 text-[10px] text-secondary">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 border-l-2 border-brand pl-3 text-sm text-secondary">{tr('Suele visitar los viernes. Ideal para un incentivo de regreso.', 'Usually visits on Fridays. A good fit for a come-back incentive.')}</p>
    </div>
  )
}

function LoyaltyCampaignFragment() {
  const tr = useTr()
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-control border bg-surface p-4">
        <p className="text-xs text-secondary">{tr('Nivel actual', 'Current tier')}</p>
        <p className="mt-1 font-semibold">{tr('Frecuente', 'Regular')}</p>
        <div className="mt-4 h-1.5 rounded-full bg-subtle"><div className="h-full w-4/5 rounded-full bg-brand" /></div>
        <p className="mt-2 text-xs text-secondary">{tr('180 pts para Insider', '180 pts to Insider')}</p>
      </div>
      <div className="rounded-control border bg-surface p-4">
        <p className="text-xs text-secondary">{tr('Campaña activa', 'Active campaign')}</p>
        <p className="mt-1 font-semibold">{tr('Café doble puntos', 'Double-points coffee')}</p>
        <p className="mt-3 text-sm text-secondary">{tr('21 regresaron', '21 came back')}</p>
        <p className="text-xs text-success">S/ 2,180.00 {tr('atribuidos', 'attributed')}</p>
      </div>
    </div>
  )
}

function ReferralPortalFragment() {
  const tr = useTr()
  return (
    <div className="grid items-end gap-3 sm:grid-cols-[1fr_140px]">
      <div className="rounded-control border bg-surface p-4">
        <p className="text-xs text-secondary">{tr('Top embajadores', 'Top ambassadors')}</p>
        {[['Mateo Vargas', '8'], ['Lucía Flores', '7'], ['Camila Rojas', '6']].map(([name, value]) => (
          <div key={name} className="flex items-center justify-between border-b py-2.5 text-sm last:border-0">
            <span className="font-medium">{name}</span>
            <span className="text-secondary">{value} {tr('referidos', 'referrals')}</span>
          </div>
        ))}
      </div>
      <PhoneMini />
    </div>
  )
}

function PhoneMini() {
  const tr = useTr()
  return (
    <div className="mx-auto w-full max-w-[140px] rounded-[1.4rem] border-[5px] border-[rgb(var(--text-primary))] bg-surface p-3 shadow-soft">
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-subtle" />
      <p className="text-[9px] font-semibold text-secondary">PATIO CENTRAL</p>
      <p className="mt-2 text-[10px] text-secondary">{tr('Hola, Sofía', 'Hi, Sofía')}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">1,840</p>
      <p className="text-[9px] text-tertiary">{tr('puntos', 'points')}</p>
      <div className="mt-3 h-1 rounded-full bg-subtle"><div className="h-full w-4/5 rounded-full bg-brand" /></div>
      <p className="mt-2 text-[9px] font-medium">{tr('Postre para compartir', 'Dessert to share')}</p>
    </div>
  )
}

function HeroProductPreview() {
  const tr = useTr()
  return (
    <div className="relative mx-auto w-full max-w-xl pb-10 lg:pb-6">
      <div className="rounded-feature border bg-surface p-3 shadow-soft">
        <DashFragment />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-control border bg-subtle/50 p-3">
            <p className="text-[10px] text-secondary">{tr('Recompensa popular', 'Popular reward')}</p>
            <p className="mt-1 text-sm font-semibold">{tr('Café de la casa', 'House coffee')}</p>
            <p className="mt-1 text-xs text-secondary">350 pts · 48 {tr('canjes', 'redemptions')}</p>
          </div>
          <div className="rounded-control border bg-subtle/50 p-3">
            <p className="text-[10px] text-secondary">{tr('Referido reciente', 'Recent referral')}</p>
            <p className="mt-1 text-sm font-semibold">Mateo → Ana</p>
            <p className="mt-1 text-xs text-success">{tr('Convertido', 'Converted')} · +150 pts</p>
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
  const tr = useTr()
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label={tr('Nombre', 'First name')} name="first_name" />
      <Field label={tr('Apellido', 'Last name')} name="last_name" />
      <Field label={tr('Nombre del negocio', 'Business name')} name="business_name" />
      <label>
        <span className="label">{tr('Tipo de negocio', 'Business type')}</span>
        <select name="business_type" className="input" aria-label={tr('Tipo de negocio', 'Business type')}>
          <option value="Restaurante">{tr('Restaurante', 'Restaurant')}</option>
          <option value="Bar">Bar</option>
          <option value="Café">Café</option>
          <option value="Otro">{tr('Otro', 'Other')}</option>
        </select>
      </label>
      <Field label={tr('Ciudad', 'City')} name="city" />
      <Field label="WhatsApp" name="whatsapp" />
      <Field label={tr('Correo electrónico', 'Email')} name="email" type="email" />
      <label>
        <span className="label">{tr('Contacto preferido', 'Preferred contact')}</span>
        <select name="contact_method" className="input" aria-label={tr('Contacto preferido', 'Preferred contact')}>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Correo electrónico">{tr('Correo electrónico', 'Email')}</option>
          <option value="Llamada">{tr('Llamada', 'Phone call')}</option>
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className="label">{tr('Mensaje', 'Message')}</span>
        <textarea name="message" className="input min-h-24" aria-label={tr('Mensaje', 'Message')} />
      </label>
      <Button className="sm:col-span-2" type="submit">{tr('Solicitar demo', 'Request a demo')}</Button>
    </form>
  )
}

function Field({ label, name, type = 'text' }: { label: string; name: string; type?: string }) {
  return <label><span className="label">{label}</span><input className="input" name={name} type={type} required aria-label={label} /></label>
}
