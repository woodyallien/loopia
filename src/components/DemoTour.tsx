import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui'

const steps = [
  ['/app', 'Dashboard', 'Empieza por las oportunidades: qué está pasando y qué acción conviene tomar.'],
  ['/app/customers/CUS-0002', 'Perfil de cliente', 'Muestra una historia completa: visitas, gasto, referidos e insights accionables.'],
  ['/app/visits', 'Registro de visita', 'Demuestra el flujo de atención del personal en pocos segundos.'],
  ['/app/loyalty', 'Fidelización', 'Explica puntos, niveles, desafíos y razones para regresar.'],
  ['/app/referrals', 'Referidos', 'Enseña cómo una recomendación se convierte en una nueva visita medible.'],
  ['/app/campaigns', 'Campañas', 'Cierra creando una acción para recuperar o activar clientes.'],
] as const

export function DemoTour({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const launcherRef = useRef<HTMLElement|null>(null)
  useEffect(() => { launcherRef.current = document.activeElement as HTMLElement; return () => launcherRef.current?.focus() }, [])
  useEffect(() => { const timer = window.setTimeout(() => headingRef.current?.focus(), 0); return () => window.clearTimeout(timer) }, [index])
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close) }, [onClose])
  const go = (next: number) => { setIndex(next); navigate(steps[next][0]) }
  const [path, title, description] = steps[index]
  return <aside className="fixed bottom-20 left-4 right-4 z-30 mx-auto max-w-lg rounded-2xl border border-gold/50 bg-white p-5 shadow-2xl dark:bg-[#192328] lg:bottom-6 lg:left-auto lg:right-6" role="dialog" aria-modal="false" aria-labelledby="demo-tour-title" aria-live="polite">
    <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold font-bold text-ink">{index + 1}</span><div className="flex-1"><p className="text-xs font-bold uppercase tracking-wider text-clay">Recorrido demo · {index + 1} de {steps.length}</p><h2 ref={headingRef} id="demo-tour-title" tabIndex={-1} className="mt-1 text-lg font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted">{description}</p><p className="sr-only">Ruta actual del recorrido: {path}</p></div><button onClick={onClose} className="rounded-lg p-2" aria-label="Cerrar recorrido"><X size={17} /></button></div>
    <div className="mt-4 flex justify-between"><Button variant="secondary" disabled={index === 0} onClick={() => go(index - 1)}><ArrowLeft size={16} /> Anterior</Button>{index === steps.length - 1 ? <Button onClick={onClose}>Finalizar</Button> : <Button onClick={() => go(index + 1)}>Siguiente <ArrowRight size={16} /></Button>}</div>
  </aside>
}
