import { Clock3, Play, RotateCcw, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { journeys } from '../demo/journeys'
import { useApp } from '../context/AppContext'
import { Badge, Button, Card, PageHeader } from '../components/ui'

export function DemoCenter() {
  const { startDemoJourney, resetDemo, scenario } = useApp(); const navigate = useNavigate()
  const start = (id: string) => { startDemoJourney(id); const journey = journeys.find(item => item.id === id); navigate(journey?.steps[0].route || '/app') }
  return <div className="space-y-6"><PageHeader eyebrow="Demo para prospectos" title="Centro de demostración" description="Selecciona una historia para mostrar cómo Loopia puede ayudar a un negocio." actions={<Button variant="secondary" onClick={resetDemo}><RotateCcw size={16}/>Reiniciar datos demo</Button>}/><div className="rounded-panel border bg-brand-subtle p-4 text-sm"><strong>Escenario activo:</strong> {scenario === 'restaurant' ? 'Restaurante' : scenario === 'bar' ? 'Bar' : 'Café'}. Cada recorrido está diseñado alrededor de una conversación de negocio, no de una lista de módulos.</div><section aria-label="Historias de demo" className="grid gap-4 lg:grid-cols-2">{journeys.map(journey => <Card key={journey.id} className="flex flex-col"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{journey.title}</h2><p className="mt-1 text-sm text-secondary">{journey.outcome}</p></div>{journey.future && <Badge tone="gold">Vista futura</Badge>}</div><div className="mt-5 grid grid-cols-3 gap-3 border-y py-3 text-xs"><span className="flex items-center gap-1 text-secondary"><Clock3 size={14}/>{journey.duration}</span><span className="flex items-center gap-1 text-secondary"><Users size={14}/>{journey.roles.join(' · ')}</span><span className="text-secondary">{journey.steps.length} pasos</span></div><p className="mt-4 text-xs text-secondary"><strong>Empieza en:</strong> {journey.startingPoint}</p><Button className="mt-5 w-full" onClick={() => start(journey.id)}><Play size={16}/>Iniciar historia</Button></Card>)}</section></div>
}
