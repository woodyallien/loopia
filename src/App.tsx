import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { PublicLayout } from './layouts/PublicLayout'
import { isDemoMode } from './config/runtime'
import { NotFound } from './pages/NotFound'
import { DemoExperience } from './components/DemoExperience'

const AppLayout = lazy(() => import('./layouts/AppLayout').then(module => ({ default: module.AppLayout })))
const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })))
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })))
const Join = lazy(() => import('./pages/Join').then(module => ({ default: module.Join })))
const CustomerPortal = lazy(() => import('./pages/CustomerPortal').then(module => ({ default: module.CustomerPortal })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Customers = lazy(() => import('./pages/Customers').then(module => ({ default: module.Customers })))
const CustomerDetail = lazy(() => import('./pages/CustomerDetail').then(module => ({ default: module.CustomerDetail })))
const Visits = lazy(() => import('./pages/Visits').then(module => ({ default: module.Visits })))
const Loyalty = lazy(() => import('./pages/Loyalty').then(module => ({ default: module.Loyalty })))
const Rewards = lazy(() => import('./pages/Rewards').then(module => ({ default: module.Rewards })))
const Campaigns = lazy(() => import('./pages/Campaigns').then(module => ({ default: module.Campaigns })))
const Automations = lazy(() => import('./pages/Automations').then(module => ({ default: module.Automations })))
const Referrals = lazy(() => import('./pages/Referrals').then(module => ({ default: module.Referrals })))
const Partners = lazy(() => import('./pages/Partners').then(module => ({ default: module.Partners })))
const QRManager = lazy(() => import('./pages/QRManager').then(module => ({ default: module.QRManager })))
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })))
const Team = lazy(() => import('./pages/Team').then(module => ({ default: module.Team })))
const Locations = lazy(() => import('./pages/Locations').then(module => ({ default: module.Locations })))
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })))
const ImpactSimulator = lazy(() => import('./pages/ImpactSimulator').then(module => ({ default: module.ImpactSimulator })))
const ProspectFeedback = lazy(() => import('./pages/ProspectFeedback').then(module => ({ default: module.ProspectFeedback })))
const Onboarding = lazy(() => import('./pages/Onboarding').then(module => ({ default: module.Onboarding })))
const DemoCenter = lazy(() => import('./pages/DemoCenter').then(module => ({ default: module.DemoCenter })))

function Loading() {
  return <div className="grid min-h-64 place-items-center" role="status"><span className="flex items-center gap-3 text-sm font-semibold text-muted"><span className="size-5 animate-spin rounded-full border-2 border-gold border-t-transparent motion-reduce:animate-none" /> Cargando experiencia…</span></div>
}

function Protected() {
  const { user } = useApp()
  return user ? <AppLayout /> : <Navigate to="/login" replace />
}

function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useApp()
  return user?.role === 'staff' ? <Navigate to="/app/visits" replace /> : children
}

function DemoAdminOnly({ children }: { children: ReactNode }) {
  const { user } = useApp()
  return isDemoMode && user?.role === 'owner' ? children : <Navigate to="/app" replace />
}

function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
  const titles: Record<string, string> = { '/': 'Fidelización para negocios locales', '/login': 'Ingresar', '/join': 'Crear cuenta', '/portal': 'Mis puntos', '/app': 'Dashboard', '/app/demo': 'Centro de demostración', '/app/customers': 'Clientes', '/app/visits': 'Registrar visita', '/app/loyalty': 'Fidelización', '/app/rewards': 'Recompensas', '/app/campaigns': 'Campañas', '/app/automations': 'Automatizaciones', '/app/referrals': 'Referidos', '/app/partners': 'Red de negocios', '/app/qr': 'Códigos QR', '/app/reports': 'Reportes', '/app/team': 'Equipo', '/app/locations': 'Locales', '/app/settings': 'Configuración', '/app/impact': 'Simulador de impacto', '/app/feedback': 'Feedback del prospecto', '/app/onboarding': 'Configurar Loopia' }
    const page = pathname.startsWith('/app/customers/') ? 'Historia del cliente' : titles[pathname] || 'Loopia'
    document.title = `${page} | Loopia`
    document.querySelector('meta[name="robots"]')?.setAttribute('content', isDemoMode ? 'noindex, nofollow' : pathname.startsWith('/app') || pathname === '/portal' ? 'noindex, nofollow' : 'index, follow')
  }, [pathname])
  return null
}

export default function App() {
  return <Suspense fallback={<Loading />}><RouteEffects /><Routes>
    <Route element={<PublicLayout />}><Route index element={<Landing />} /></Route>
    <Route path="login" element={<Login />} />
    <Route path="join" element={<Join />} />
    <Route path="portal" element={<CustomerPortal />} />
    <Route path="app" element={<Protected />}>
      <Route index element={<AdminOnly><Dashboard /></AdminOnly>} />
      <Route path="customers" element={<AdminOnly><Customers /></AdminOnly>} />
      <Route path="customers/:id" element={<AdminOnly><CustomerDetail /></AdminOnly>} />
      <Route path="visits" element={<Visits />} />
      <Route path="loyalty" element={<AdminOnly><Loyalty /></AdminOnly>} />
      <Route path="rewards" element={<AdminOnly><Rewards /></AdminOnly>} />
      <Route path="campaigns" element={<AdminOnly><Campaigns /></AdminOnly>} />
      <Route path="automations" element={<AdminOnly><Automations /></AdminOnly>} />
      <Route path="referrals" element={<AdminOnly><Referrals /></AdminOnly>} />
      <Route path="partners" element={<AdminOnly><Partners /></AdminOnly>} />
      <Route path="qr" element={<AdminOnly><QRManager /></AdminOnly>} />
      <Route path="reports" element={<AdminOnly><Reports /></AdminOnly>} />
      <Route path="team" element={<AdminOnly><Team /></AdminOnly>} />
      <Route path="locations" element={<AdminOnly><Locations /></AdminOnly>} />
      <Route path="settings" element={<AdminOnly><Settings /></AdminOnly>} />
      <Route path="impact" element={<DemoAdminOnly><ImpactSimulator /></DemoAdminOnly>} />
      <Route path="feedback" element={<DemoAdminOnly><ProspectFeedback /></DemoAdminOnly>} />
      <Route path="onboarding" element={<AdminOnly><Onboarding /></AdminOnly>} />
      <Route path="demo" element={<DemoAdminOnly><DemoCenter /></DemoAdminOnly>} />
    </Route>
      <Route path="*" element={<NotFound />} />
  </Routes><DemoExperience /></Suspense>
}
