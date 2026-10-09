import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getJourney } from '../demo/journeys'
import { useApp } from '../context/AppContext'
import { Button } from './ui'

export function DemoExperience() {
  const { demoJourney, demoStep, demoView, demoCompleted, setDemoStep, setDemoView, finishDemo, exitDemo, setDemoRole, user } = useApp()
  const location = useLocation(), navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false), [target, setTarget] = useState<HTMLElement|null>(null), [missing, setMissing] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const journey = demoJourney ? getJourney(demoJourney) : null
  const step = journey?.steps[demoStep]

  useEffect(() => {
    if (!step) return
    if (step.role === 'staff' && user?.role !== 'staff') setDemoRole('staff')
    if (step.role === 'owner' && user?.role === 'staff') setDemoRole('owner')
    if (location.pathname !== step.route) navigate(step.route)
  }, [step, location.pathname, navigate, setDemoRole, user?.role])

  useEffect(() => {
    if (!step || location.pathname !== step.route) return
    const timer = window.setTimeout(() => {
      document.querySelectorAll('[data-demo-highlight]').forEach(node => node.removeAttribute('data-demo-highlight'))
      const found = document.querySelector<HTMLElement>(step.target)
      setTarget(found)
      setMissing(!found)
      if (found) { found.setAttribute('data-demo-highlight', 'true'); found.scrollIntoView?.({ block: 'center', behavior: 'smooth' }); found.focus?.({ preventScroll: true }); }
      heading.current?.focus()
    }, 80)
    return () => window.clearTimeout(timer)
  }, [step, location.pathname])

  useEffect(() => () => document.querySelectorAll('[data-demo-highlight]').forEach(node => node.removeAttribute('data-demo-highlight')), [])
  useEffect(() => { const key = (event: KeyboardEvent) => { if (event.key === 'Escape' && demoJourney) exitDemo() }; document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key) }, [demoJourney, exitDemo])

  if (demoCompleted) return <Completion journeyId={demoCompleted} onClose={exitDemo} />
  if (!journey || !step) return null
  const next = () => demoStep === journey.steps.length - 1 ? finishDemo() : setDemoStep(demoStep + 1)
  return <aside className={`fixed bottom-3 left-3 right-3 z-[60] mx-auto max-w-xl rounded-2xl border border-gold/50 bg-surface/95 p-4 shadow-overlay backdrop-blur-md ${collapsed ? 'lg:max-w-xs' : ''}`} role="region" aria-label="Panel del recorrido demo" aria-live="polite">
    <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold font-bold text-ink">{demoStep + 1}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-clay">{demoView === 'presenter' ? 'Modo presentador' : 'Vista cliente'} · {demoStep + 1} de {journey.steps.length}</p><h2 ref={heading} tabIndex={-1} className="mt-1 text-base font-bold outline-none">{step.title}</h2>{!collapsed && <><p className="mt-1 text-sm text-secondary">{step.description}</p><div className="mt-3 grid gap-2 text-xs"><p><strong>Qué mostrar:</strong> {step.title}</p>{demoView === 'presenter' && <><p><strong>Qué decir:</strong> {step.presenterScript}</p>{step.deeperTalkingPoint && <p><strong>Talking point:</strong> {step.deeperTalkingPoint}</p>}{step.prospectQuestion && <p className="rounded-control bg-brand-subtle p-2"><strong>Pregunta al prospecto:</strong> {step.prospectQuestion}</p>}</>}</div></>}</div><button className="rounded-control p-2 text-secondary" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Expandir panel demo' : 'Contraer panel demo'}>{collapsed ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</button><button className="rounded-control p-2 text-secondary" onClick={exitDemo} aria-label="Salir del recorrido demo"><X size={17}/></button></div>
    {!collapsed && <><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-subtle"><div className="h-full rounded-full bg-gold transition-[width] motion-reduce:transition-none" style={{ width: `${((demoStep + 1) / journey.steps.length) * 100}%` }} /></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" disabled={demoStep === 0} onClick={() => setDemoStep(demoStep - 1)}><ArrowLeft size={15}/>Anterior</Button><div className="flex flex-wrap justify-end gap-2"><button className="btn min-h-9 border bg-surface" onClick={() => setDemoView(demoView === 'presenter' ? 'customer' : 'presenter')}>{demoView === 'presenter' ? 'Vista cliente' : 'Vista presentador'}</button><button className="btn min-h-9 border bg-surface" onClick={() => setDemoStep(0)} aria-label="Reiniciar recorrido"><RotateCcw size={15}/><span className="hidden sm:inline">Reiniciar</span></button><Button onClick={next}>{demoStep === journey.steps.length - 1 ? 'Finalizar' : 'Siguiente'}<ArrowRight size={15}/></Button></div></div>{missing && <p className="mt-2 text-xs text-warning">Este elemento no está disponible en esta vista. Puedes continuar sin interrumpir la demo.</p>}{target && <p className="sr-only">Elemento destacado: {step.title}</p>}</>}</aside>
}

function Completion({ journeyId, onClose }: { journeyId: string; onClose: () => void }) {
  const journey = getJourney(journeyId)
  const { scenario } = useApp()
  const feedback = () => { localStorage.setItem('loopia-feedback-prefill', JSON.stringify({ journey: journey?.title, scenario, role: 'owner', date: new Date().toISOString() })); onClose() }
  return <aside className="fixed bottom-3 left-3 right-3 z-[60] mx-auto max-w-xl rounded-2xl border border-gold/50 bg-surface p-5 shadow-overlay" role="dialog" aria-labelledby="demo-complete-title"><div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-full bg-success text-white"><Check size={18}/></span><div><p className="eyebrow">Demo completada</p><h2 id="demo-complete-title" className="mt-1 text-xl font-bold">{journey?.title}</h2><p className="mt-2 text-sm text-secondary">Loopia ayuda a identificar clientes, hacer que regresen, premiar fidelidad, generar referidos y medir resultados.</p></div></div><ul className="mt-4 grid gap-1 text-sm text-secondary sm:grid-cols-2"><li>✓ Identificar clientes</li><li>✓ Hacer que regresen</li><li>✓ Premiar fidelidad</li><li>✓ Generar referidos</li></ul><div className="mt-5 flex flex-wrap gap-2"><Link className="btn bg-ink text-white" to="/app/impact" onClick={onClose}>Simular este negocio</Link><Link className="btn border bg-surface" to="/app/feedback" onClick={feedback}>Registrar feedback del prospecto</Link><button className="btn ml-auto border bg-surface" onClick={onClose}>Cerrar</button></div></aside>
}
