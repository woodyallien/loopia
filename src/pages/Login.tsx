import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { useApp } from '../context/AppContext'
import { AuthGrowthCue, AuthLayout } from '../layouts/AuthLayout'

export function Login() {
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const { login } = useApp()
  const navigate = useNavigate()
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (login(String(form.get('username')), String(form.get('password')))) navigate('/app')
    else setError('Usuario o contraseña incorrectos')
  }
  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      description="Ingresa para gestionar clientes, visitas y crecimiento."
      panel={<AuthGrowthCue />}
    >
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <label>
          <span className="label">Usuario / email</span>
          <input className="input" name="username" autoComplete="username" defaultValue="admin" required aria-invalid={Boolean(error)} aria-describedby={error ? 'login-error' : undefined} />
        </label>
        <label>
          <span className="label">Contraseña</span>
          <span className="relative block">
            <input
              className="input pr-12"
              name="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              defaultValue="admin"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : 'demo-hint'}
            />
            <button type="button" onClick={() => setShow(value => !value)} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-control text-secondary" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>
        {error && <p id="login-error" role="alert" className="text-sm font-medium text-danger">{error}</p>}
        <Button type="submit" className="w-full">Ingresar</Button>
        <Button type="button" variant="secondary" className="w-full" onClick={() => { login('admin', 'admin'); navigate('/app') }}>Usar cuenta demo</Button>
      </form>
      <p id="demo-hint" className="mt-6 text-xs text-tertiary">
        Demo: usuario <code className="rounded bg-subtle px-1 py-0.5 text-secondary">admin</code> · contraseña <code className="rounded bg-subtle px-1 py-0.5 text-secondary">admin</code>
      </p>
    </AuthLayout>
  )
}
