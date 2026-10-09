import { Link } from 'react-router-dom'

export function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-background p-6"><div className="max-w-md text-center"><p className="eyebrow">Loopia</p><h1 className="mt-2 text-3xl font-bold">No encontramos esta página.</h1><p className="mt-3 text-secondary">La dirección puede estar escrita de forma incorrecta o ya no existir.</p><div className="mt-6 flex justify-center gap-3"><Link className="btn bg-ink text-white" to="/">Volver al inicio</Link><Link className="btn border bg-surface" to="/app">Ir al dashboard</Link></div></div></main>
}
