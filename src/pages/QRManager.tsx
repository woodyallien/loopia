import { useMemo, useState } from 'react'
import { Download, FileImage, Plus, Printer, QrCode as QRIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Badge, Button, Sheet } from '../components/ui'

type Category = 'Todos' | 'Entrada' | 'Mesa' | 'Ticket' | 'Campaña' | 'Referido'
type Code = {
  name: string
  type: Exclude<Category, 'Todos'>
  location: string
  id: string
  scans: number
  registrations: number
  conversion: number
}

const categories: Category[] = ['Todos', 'Entrada', 'Mesa', 'Ticket', 'Campaña', 'Referido']
const codes: Code[] = [
  { name: 'Entrada principal', type: 'Entrada', location: 'Patio Central', id: 'ENT-001', scans: 842, registrations: 318, conversion: 38 },
  { name: 'Mesa 07', type: 'Mesa', location: 'Patio Central', id: 'TAB-007', scans: 214, registrations: 96, conversion: 45 },
  { name: 'Recibos septiembre', type: 'Ticket', location: 'Todos los locales', id: 'REC-SEP', scans: 126, registrations: 41, conversion: 33 },
  { name: 'Campaña café', type: 'Campaña', location: 'Café Piedra', id: 'CAM-014', scans: 98, registrations: 37, conversion: 38 },
  { name: 'Referido embajadores', type: 'Referido', location: 'Todos los locales', id: 'REF-001', scans: 64, registrations: 29, conversion: 45 },
]

export function QRManager() {
  const [category, setCategory] = useState<Category>('Todos')
  const [selected, setSelected] = useState<Code | null>(null)
  const [create, setCreate] = useState(false)
  const visible = useMemo(() => codes.filter(code => category === 'Todos' || code.type === category), [category])
  const download = (type: string) => {
    if (!selected) return
    alert(`Descarga ${type} simulada para ${selected.name}`)
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">QR activos</h1>
          <p className="mt-1 text-sm text-secondary">Cada escaneo conserva la fuente, el local y la conversión.</p>
        </div>
        <Button onClick={() => setCreate(true)}><Plus size={16} /> Generar QR</Button>
      </header>

      <div className="hide-scroll flex gap-1 overflow-x-auto" role="tablist" aria-label="Categorías de QR">
        {categories.map(item => (
          <button
            key={item}
            role="tab"
            aria-selected={category === item}
            onClick={() => setCategory(item)}
            className={`min-h-10 shrink-0 rounded-control px-3 text-xs font-medium ${category === item ? 'bg-brand text-white dark:text-[#101513]' : 'text-secondary hover:bg-subtle'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-panel border bg-surface">
        <div className="divide-y">
          {visible.map(code => (
            <button
              key={code.id}
              type="button"
              onClick={() => setSelected(code)}
              className="flex w-full items-center gap-4 p-4 text-left hover:bg-subtle/60"
            >
              <span className="grid size-11 place-items-center rounded-control bg-brand-subtle text-brand"><QRIcon size={18} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{code.name}</p>
                  <Badge>{code.type}</Badge>
                </div>
                <p className="mt-1 text-xs text-secondary">{code.location} · {code.id}</p>
              </div>
              <div className="hidden text-right text-xs text-secondary sm:block">
                <p className="tabular-nums font-medium text-primary">{code.scans} escaneos</p>
                <p className="mt-0.5">{code.registrations} registros · {code.conversion}%</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Sheet open={Boolean(selected)} onClose={() => setSelected(null)} title="Vista previa del QR">
        {selected && (
          <div className="space-y-5 p-5 text-center">
            <div className="mx-auto w-fit rounded-panel border bg-surface p-5">
              <QRCodeSVG value={`https://loopia.app/join/${selected.id}`} size={200} level="H" fgColor="rgb(24,32,29)" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{selected.name}</h3>
              <p className="mt-1 text-sm text-secondary">{selected.type} · {selected.location} · {selected.id}</p>
            </div>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-panel border bg-[rgb(var(--border-subtle))] text-left">
              {[['Escaneos', selected.scans], ['Registros', selected.registrations], ['Conversión', `${selected.conversion}%`]].map(([label, value]) => (
                <div key={label as string} className="bg-surface p-3">
                  <p className="text-xs text-secondary">{label}</p>
                  <p className="metric-number mt-1">{value}</p>
                </div>
              ))}
            </div>
            <p className="sr-only">Este QR dirige al registro de {selected.name} en {selected.location}</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" onClick={() => download('PNG')}><FileImage size={16} /> PNG</Button>
              <Button variant="secondary" onClick={() => download('SVG')}><Download size={16} /> SVG</Button>
              <Button variant="secondary" onClick={() => download('impresión')}><Printer size={16} /> Imprimir</Button>
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={create} onClose={() => setCreate(false)} title="Generar código QR">
        <form className="space-y-4 p-5" onSubmit={event => { event.preventDefault(); setCreate(false) }}>
          <label><span className="label">Nombre</span><input className="input" required aria-label="Nombre del QR" /></label>
          <label>
            <span className="label">Tipo</span>
            <select className="input" aria-label="Tipo de QR">
              <option>Entrada</option><option>Mesa</option><option>Ticket</option><option>Campaña</option><option>Referido</option>
            </select>
          </label>
          <label>
            <span className="label">Local</span>
            <select className="input" aria-label="Local del QR">
              <option>Patio Central</option><option>Mirador 24</option><option>Café Piedra</option>
            </select>
          </label>
          <Button type="submit" className="w-full">Generar QR</Button>
        </form>
      </Sheet>
    </div>
  )
}
