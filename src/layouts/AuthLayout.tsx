import type { ReactNode } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function AuthLayout({
  children,
  title,
  description,
  panel,
}: {
  children: ReactNode
  title: string
  description: string
  panel: ReactNode
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[rgb(var(--brand))] p-10 text-white lg:flex lg:flex-col xl:p-14">
        <Logo light />
        <div className="my-auto max-w-lg">{panel}</div>
        <p className="text-xs text-white/50">Entorno de demostración · Datos ilustrativos</p>
      </section>
      <section className="relative flex items-center justify-center bg-background p-5 sm:p-8">
        <Link to="/" className="absolute left-5 top-5 inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary">
          <ArrowLeft size={16} /> Volver
        </Link>
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <p className="eyebrow">Portal de negocios</p>
          <h1 className="page-title mt-2">{title}</h1>
          <p className="mt-2 text-sm text-secondary">{description}</p>
          {children}
        </div>
      </section>
    </main>
  )
}

export function AuthGrowthCue() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-white/55">Crecimiento con cada visita</p>
      <blockquote className="mt-4 text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
        Convierte cada visita en una razón para volver.
      </blockquote>
      <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
        Captura clientes, recompensa su fidelidad y convierte recomendaciones en nuevas visitas.
      </p>
      <div className="mt-10 overflow-hidden rounded-panel border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Vista rápida</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[['183', 'clientes'], ['41', 'regresan'], ['17', 'referidos']].map(([value, label]) => (
            <div key={label} className="rounded-control bg-white/10 px-2 py-3 text-center">
              <p className="text-lg font-semibold tabular-nums">{value}</p>
              <p className="text-[10px] text-white/60">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-white/65">
          <Check size={14} className="text-white/80" /> Sin app para el cliente
        </p>
      </div>
    </div>
  )
}
