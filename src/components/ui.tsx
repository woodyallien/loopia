import { useEffect, useId, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/utils'

export function Button({ className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger' }) {
  return <button className={cn('btn', variant === 'primary' && 'bg-brand text-white hover:bg-brand-hover dark:text-[#101513]', variant === 'secondary' && 'border bg-surface hover:bg-subtle', variant === 'ghost' && 'hover:bg-subtle', variant === 'danger' && 'bg-danger text-white', className)} {...props} />
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('card', className)} {...props} /> }

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral'|'success'|'warning'|'gold' }) {
  return <span className={cn('badge', tone === 'neutral' && 'bg-subtle text-secondary', tone === 'success' && 'bg-[rgb(var(--success)/.12)] text-success', tone === 'warning' && 'bg-[rgb(var(--warning)/.14)] text-warning', tone === 'gold' && 'bg-brand-subtle text-brand')}>{children}</span>
}

export function Progress({ value, label }: { value: number; label: string }) {
  return <div><div className="mb-2 flex justify-between text-xs text-secondary"><span>{label}</span><span>{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="h-full rounded-full bg-brand transition-[width] motion-reduce:transition-none" style={{ width: `${Math.min(100, value)}%` }} /></div></div>
}

export function Empty({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="flex min-h-52 flex-col items-center justify-center text-center"><div className="mb-3 text-tertiary">{icon}</div><h3 className="font-semibold">{title}</h3><p className="mt-1 max-w-sm text-sm text-secondary">{text}</p></div>
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const previous = useRef<HTMLElement|null>(null)
  const titleId = useId()
  useEffect(() => {
    if (!open) return
    previous.current = document.activeElement as HTMLElement
    const root = document.getElementById('root')
    root?.setAttribute('inert', '')
    const node = ref.current
    node?.querySelector<HTMLElement>('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])')?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && node) {
        const items = [...node.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
        if (!items.length) return
        const first = items[0], last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', key)
    return () => { root?.removeAttribute('inert'); document.removeEventListener('keydown', key); previous.current?.focus() }
  }, [open, onClose])
  if (!open) return null
  return createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(var(--overlay))] p-4" role="presentation" onMouseDown={onClose}><div ref={ref} className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-feature border bg-elevated p-6 shadow-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={event => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 id={titleId} className="text-xl font-semibold">{title}</h2><Button variant="ghost" onClick={onClose} aria-label="Cerrar">×</Button></div>{children}</div></div>, document.body)
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  const previous = useRef<HTMLElement|null>(null)
  const titleId = useId()
  useEffect(() => {
    if (!open) return
    previous.current = document.activeElement as HTMLElement
    document.getElementById('root')?.setAttribute('inert', '')
    window.requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')?.focus())
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
        const first = items[0], last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', key)
    return () => { document.getElementById('root')?.removeAttribute('inert'); document.removeEventListener('keydown', key); previous.current?.focus() }
  }, [open, onClose])
  if (!open) return null
  return createPortal(<div className="fixed inset-0 z-50 bg-[rgb(var(--overlay))]" onMouseDown={onClose}><div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={event=>event.stopPropagation()} className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-auto rounded-t-feature bg-elevated shadow-overlay motion-safe:animate-[sheet-up_200ms_ease-out] md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[480px] md:rounded-none md:border-l md:animate-[sheet-in_200ms_ease-out]"><div className="sticky top-0 z-10 flex items-center justify-between border-b bg-elevated/95 px-5 py-4 backdrop-blur"><h2 id={titleId} className="text-lg font-semibold">{title}</h2><Button variant="ghost" onClick={onClose} aria-label="Cerrar panel">×</Button></div>{children}</div></div>,document.body)
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1 className="page-title mt-1">{title}</h1>{description&&<p className="mt-1.5 max-w-2xl text-sm text-secondary">{description}</p>}</div>{actions&&<div className="flex flex-wrap items-center gap-2">{actions}</div>}</header>
}

export function Skeleton({ className }: { className?: string }) { return <span className={cn('block animate-pulse rounded-control bg-subtle motion-reduce:animate-none',className)} aria-hidden="true" /> }
