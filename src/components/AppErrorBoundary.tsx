import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return <main className="grid min-h-screen place-items-center bg-background p-6"><div className="max-w-md text-center"><p className="eyebrow">Loopia</p><h1 className="mt-2 text-3xl font-bold">Algo salió mal.</h1><p className="mt-3 text-secondary">Puedes recargar la página o volver al inicio.</p><div className="mt-6 flex justify-center gap-3"><button className="btn bg-ink text-white" onClick={() => window.location.reload()}>Reintentar</button><Link className="btn border bg-surface" to="/">Volver al inicio</Link></div></div></main>
  }
}
