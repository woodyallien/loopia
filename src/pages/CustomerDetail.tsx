import { useState } from 'react'
import { ArrowLeft, Gift, MessageCircle, Plus, QrCode, Share2, Star } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Progress } from '../components/ui'
import { useOperations } from '../context/OperationsContext'
import { nextTier, relativeTime, usablePoints } from '../lib/analytics'
import { rewards } from '../data/mock'
import { money } from '../lib/utils'

const tabs = ['Resumen', 'Actividad', 'Recompensas', 'Referidos', 'Campañas'] as const
type Tab = typeof tabs[number]

export function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const operations = useOperations()
  const customer = operations.customers.find(item => item.id === id) || operations.customers[0]
  const [tab, setTab] = useState<Tab>('Resumen')
  const [notice, setNotice] = useState('')
  const balance = usablePoints(customer, operations.settings.rules.expirationDays)
  const isVip = customer.tier === 'VIP'
  const progress = nextTier(balance)
  const history = operations.visits.filter(visit => visit.customerId === customer.id)
  const events = history.length ? history.slice(0, 8).map(visit => [relativeTime(visit.at), visit.rewardName ? 'Recompensa canjeada' : 'Visita registrada', visit.rewardName ? `${visit.rewardName} · ${visit.points} puntos` : `${visit.location} · ${visit.amount ? money(visit.amount) : 'sin compra'} · ${visit.points > 0 ? '+' : ''}${visit.points} puntos`]) : [['Hoy', 'Sin movimientos nuevos', 'Las visitas que registres aparecerán aquí.']]
  const received = operations.campaigns.filter(campaign => campaign.recipientIds?.includes(customer.id))
  const referred = operations.referrals.filter(item => item.referrerId === customer.id)
  const givePoints = () => {
    const result = operations.adjustPoints(customer.id, 50, 'María Salazar')
    setNotice(result.ok ? 'Se acreditaron 50 puntos.' : 'No se pudieron acreditar puntos.')
  }
  const offer = () => {
    operations.sendOffer(customer)
    setNotice(`Oferta de WhatsApp preparada para ${customer.name.split(' ')[0]}.`)
  }

  return (
    <div className="space-y-5">
      <Link to="/app/customers" className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary">
        <ArrowLeft size={16} /> Volver a clientes
      </Link>

      <header className="flex flex-col gap-4 rounded-panel border bg-surface p-5 lg:flex-row lg:items-center">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand text-base font-semibold text-white dark:text-[#101513]">{customer.initials}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-title text-[26px] md:text-[28px]">{customer.name}</h1>
            <Badge tone="gold">{customer.tier}</Badge>
            <Badge tone={customer.status === 'En riesgo' ? 'warning' : 'success'}>{customer.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-secondary">{customer.country} · {customer.language === 'ES' ? 'Español' : 'English'} · {customer.phone}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-10" onClick={givePoints}><Plus size={16} /> Dar puntos</Button>
          <Button variant="secondary" className="min-h-10" onClick={() => navigate('/app/visits', { state: { customerId: customer.id } })}><QrCode size={16} /> Registrar visita</Button>
          <Button variant="secondary" className="min-h-10" onClick={offer}><MessageCircle size={16} /> Enviar oferta</Button>
        </div>
      </header>

      <section aria-label="Resumen del cliente" className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Puntos', balance.toLocaleString()],
          ['Visitas', customer.visits],
          ['Gasto', money(customer.spend)],
          ['Última visita', customer.lastVisit],
          ['Referidos', customer.referrals],
        ].map(([label, value], index) => (
          <div key={label as string} className={`p-4 ${index ? 'border-t sm:border-l sm:border-t-0 xl:border-t-0' : ''}`}>
            <p className="text-xs font-medium text-secondary">{label}</p>
            <p className="metric-number mt-2 text-xl">{value}</p>
          </div>
        ))}
      </section>

      {notice && <p role="status" className="text-sm text-secondary">{notice}</p>}
      <div data-demo="customer-insight" className="border-l-2 border-brand pl-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Insight</p>
        <p className="mt-1 text-sm leading-6">
          {customer.name.split(' ')[0]} suele visitar los viernes y lleva {customer.lastVisit.toLowerCase()} sin regresar.
          {customer.status === 'En riesgo' ? ' Una oferta personal esta semana puede recuperar la visita.' : ' Está cerca de su siguiente logro de fidelidad.'}
        </p>
      </div>

      <div role="tablist" aria-label="Secciones del perfil" className="hide-scroll flex gap-1 overflow-x-auto border-b">
        {tabs.map(item => (
          <button
            key={item}
            role="tab"
            id={`tab-${item}`}
            aria-selected={tab === item}
            aria-controls={`panel-${item}`}
            onClick={() => setTab(item)}
            className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-medium ${tab === item ? 'border-brand text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="rounded-panel border bg-surface">
          {tab === 'Resumen' && (
            <div className="p-5">
              <h2 className="section-title">Señales útiles</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  `${customer.name.split(' ')[0]} visitó ${Math.min(customer.visits, 6)} veces en los últimos 3 meses.`,
                  'Normalmente visita los viernes por la noche.',
                  `Ha recomendado a ${customer.referrals} personas.`,
                  `Ticket promedio: ${money(customer.spend / Math.max(customer.visits, 1))}.`,
                ].map(text => (
                  <p key={text} className="rounded-control bg-subtle/70 p-3 text-sm leading-6 text-secondary">{text}</p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="min-h-10" onClick={offer}><MessageCircle size={16} /> Enviar oferta</Button>
                <Button variant="secondary" className="min-h-10" onClick={givePoints}><Star size={16} /> Reconocer progreso</Button>
                <Button variant="secondary" className="min-h-10" onClick={() => setTab('Referidos')}><Share2 size={16} /> Ver referidos</Button>
              </div>
            </div>
          )}
          {tab === 'Actividad' && (
            <div className="p-5">
              <h2 className="section-title">Actividad reciente</h2>
              <div className="divider-list mt-2">
                {events.map(([when, title, text]) => (
                  <div key={title + when} className="flex gap-4 py-3">
                    <span className="w-28 shrink-0 text-xs text-secondary">{when}</span>
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="mt-0.5 text-sm text-secondary">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'Recompensas' && (
            <div className="p-5">
              <h2 className="section-title">Recompensas</h2>
              <div className="divider-list mt-2">
                {rewards.map(reward => [reward.name, balance >= reward.points ? `Disponible · ${reward.points.toLocaleString('es-PE')} pts` : `Te faltan ${(reward.points - balance).toLocaleString('es-PE')} pts`] as const).map(([name, meta]) => (
                  <div key={name} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="text-secondary">{meta}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'Referidos' && (
            <div className="p-5">
              <h2 className="section-title">Referidos</h2>
              <p className="mt-2 text-sm text-secondary">{customer.referrals} personas invitadas · {referred.length} registradas desde el portal.</p>
              <div className="divider-list mt-3">
                {(referred.length ? referred.map(item => [item.referredName, item.status === 'converted' ? 'Convertido' : 'Registrado'] as const) : [['Sin referidos nuevos', 'Pendiente'] as const]).map(([name, status]) => (
                  <div key={name} className="flex justify-between py-3 text-sm"><span className="font-medium">{name}</span><Badge tone={status === 'Convertido' ? 'success' : 'neutral'}>{status}</Badge></div>
                ))}
              </div>
            </div>
          )}
          {tab === 'Campañas' && (
            <div className="p-5">
              <h2 className="section-title">Campañas recibidas</h2>
              <div className="divider-list mt-2">
                {(received.length ? received : operations.campaigns).slice(0, 4).map(campaign => [campaign.name, `${campaign.channel} · ${campaign.status}`] as const).map(([name, meta]) => (
                  <div key={name} className="py-3 text-sm"><p className="font-medium">{name}</p><p className="text-secondary">{meta}</p></div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-panel border bg-surface p-4">
            <p className="text-xs text-secondary">Progreso de fidelidad</p>
            <div className="mt-2 flex items-center justify-between">
              <strong>{customer.tier}</strong>
              {isVip ? <Gift size={16} className="text-brand" /> : <Star size={16} className="text-brand" />}
            </div>
            <div className="mt-4">
              <Progress value={progress.progress} label={isVip ? 'Nivel máximo alcanzado' : `${progress.remaining.toLocaleString('es-PE')} puntos para ${progress.name}`} />
            </div>
          </div>
          <div className="rounded-panel border bg-surface p-4">
            <h2 className="text-sm font-semibold">Próxima mejor acción</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              {customer.status === 'En riesgo'
                ? 'Enviar una oferta personal antes del jueves para recuperar la visita.'
                : 'Reconocer su progreso y recordarle la recompensa que está por desbloquear.'}
            </p>
            <Button className="mt-4 w-full min-h-10" onClick={customer.status === 'En riesgo' ? offer : givePoints}>Usar recomendación</Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
