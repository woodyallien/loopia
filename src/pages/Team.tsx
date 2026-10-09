import { useState } from 'react'
import { MoreHorizontal, Plus } from 'lucide-react'
import { Badge, Button, Sheet } from '../components/ui'

type Member = {
  name: string
  email: string
  role: 'Dueño' | 'Gerente' | 'Personal'
  locations: string
  status: 'Activo' | 'Inactivo'
  lastActive: string
  initials: string
}

const team: Member[] = [
  { name: 'María Salazar', email: 'maria@andesdemo.pe', role: 'Dueño', locations: 'Todos los locales', status: 'Activo', lastActive: 'Hoy', initials: 'MS' },
  { name: 'Diego Vargas', email: 'diego@andesdemo.pe', role: 'Gerente', locations: 'Patio Central', status: 'Activo', lastActive: 'Hace 2 h', initials: 'DV' },
  { name: 'Ana Huamán', email: 'ana@andesdemo.pe', role: 'Personal', locations: 'Patio Central', status: 'Activo', lastActive: 'Hace 35 min', initials: 'AH' },
  { name: 'Luis Condori', email: 'luis@andesdemo.pe', role: 'Personal', locations: 'Mirador 24', status: 'Activo', lastActive: 'Ayer', initials: 'LC' },
]

const roles = [
  ['Dueño', 'Control total del negocio.'],
  ['Gerente', 'Gestiona clientes, campañas y operación.'],
  ['Personal', 'Registra visitas y canjea recompensas.'],
] as const

export function Team() {
  const [menuFor, setMenuFor] = useState<Member | null>(null)
  const counts = {
    owners: team.filter(member => member.role === 'Dueño').length,
    managers: team.filter(member => member.role === 'Gerente').length,
    staff: team.filter(member => member.role === 'Personal').length,
  }
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Equipo</h1>
          <p className="mt-1 text-sm text-secondary">Define acceso y responsabilidades sin complicaciones.</p>
        </div>
        <Button><Plus size={16} /> Invitar persona</Button>
      </header>

      <section aria-label="Resumen del equipo" className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-3">
        {[['Dueños', counts.owners], ['Gerentes', counts.managers], ['Personal', counts.staff]].map(([label, value], index) => (
          <div key={label as string} className={`p-4 ${index ? 'border-t sm:border-l sm:border-t-0' : ''}`}>
            <p className="text-xs font-medium text-secondary">{label}</p>
            <p className="metric-number mt-2 text-2xl">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-panel border bg-surface p-4 md:p-5">
        <h2 className="text-sm font-semibold">Qué puede hacer cada rol</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {roles.map(([role, description]) => (
            <div key={role} className="rounded-control bg-subtle/70 p-3">
              <p className="text-sm font-semibold">{role}</p>
              <p className="mt-1 text-xs leading-5 text-secondary">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="hidden overflow-hidden rounded-panel border bg-surface md:block">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b bg-subtle/60 text-xs font-medium text-secondary">
            <tr>{['Persona', 'Rol', 'Acceso a locales', 'Estado', 'Última actividad', ''].map(label => <th key={label || 'actions'} className="px-3 py-2.5 font-medium">{label}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {team.map(member => (
              <tr key={member.email} className="hover:bg-subtle/60">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-full bg-brand-subtle text-xs font-semibold">{member.initials}</span>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-secondary">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3"><Badge>{member.role}</Badge></td>
                <td className="px-3 py-3 text-secondary">{member.locations}</td>
                <td className="px-3 py-3"><Badge tone="success">{member.status}</Badge></td>
                <td className="px-3 py-3 text-secondary">{member.lastActive}</td>
                <td className="px-3 py-3">
                  <button type="button" aria-label={`Opciones para ${member.name}`} onClick={() => setMenuFor(member)}>
                    <MoreHorizontal size={16} className="text-secondary" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y rounded-panel border bg-surface md:hidden">
        {team.map(member => (
          <button key={member.email} type="button" onClick={() => setMenuFor(member)} className="flex w-full items-center gap-3 p-3 text-left">
            <span className="grid size-9 place-items-center rounded-full bg-brand-subtle text-xs font-semibold">{member.initials}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.name}</p>
              <p className="text-xs text-secondary">{member.role} · {member.locations}</p>
            </div>
            <Badge tone="success">{member.status}</Badge>
          </button>
        ))}
      </div>

      <Sheet open={Boolean(menuFor)} onClose={() => setMenuFor(null)} title="Acciones del miembro">
        {menuFor && (
          <div className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-brand-subtle text-sm font-semibold">{menuFor.initials}</span>
              <div>
                <p className="font-semibold">{menuFor.name}</p>
                <p className="text-sm text-secondary">{menuFor.role} · {menuFor.locations}</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full justify-start">Cambiar rol</Button>
            <Button variant="secondary" className="w-full justify-start">Cambiar locales</Button>
            <Button variant="danger" className="w-full justify-start">Desactivar</Button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
