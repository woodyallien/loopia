import { Outlet } from 'react-router-dom'
import { MessageCircle, Moon, Sun } from 'lucide-react'
import { Logo } from '../components/Logo'
import { brand } from '../config/brand'
import { useApp } from '../context/AppContext'

export function PublicLayout() {
  const { language, setLanguage, theme, toggleTheme } = useApp()
  return (
    <div className="min-h-screen bg-background">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-transparent">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-5 md:h-20">
          <Logo />
          <nav className="ml-auto flex items-center gap-2" aria-label="Acciones públicas">
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="grid h-10 min-w-10 place-items-center rounded-control border bg-surface px-2 text-xs font-semibold text-secondary"
              aria-label="Cambiar idioma"
            >
              {language.toUpperCase()}
            </button>
            <button
              onClick={toggleTheme}
              className="grid size-10 place-items-center rounded-control border bg-surface text-secondary"
              aria-label="Cambiar tema"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <a href="/login" className="btn-secondary hidden sm:inline-flex">Ingresar</a>
          </nav>
        </div>
      </header>
      <Outlet />
      <a
        href={brand.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hablar por WhatsApp"
        className="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full bg-[rgb(var(--success))] text-white shadow-overlay hover:opacity-90"
      >
        <MessageCircle size={20} />
      </a>
    </div>
  )
}
