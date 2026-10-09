import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { useApp } from '../context/AppContext'
import { AuthGrowthCue, AuthLayout } from '../layouts/AuthLayout'

export function Join() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { login } = useApp()
  const nextAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStep(1)
  }
  const startWorkspace = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    login('admin', 'admin')
    navigate('/app/onboarding')
  }
  return (
    <AuthLayout
      title={step === 0 ? 'Crea tu cuenta' : 'Cuéntanos de tu negocio'}
      description={step === 0 ? 'Empezamos con lo esencial. El resto lo configuramos en el onboarding.' : 'Con esto preparamos tu espacio de trabajo.'}
      panel={<AuthGrowthCue />}
    >
      <div className="mt-6" aria-label={`Paso ${step + 1} de 2`}>
        <div className="flex gap-2">
          {[0, 1].map(index => (
            <span key={index} className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-brand' : 'bg-subtle'}`} />
          ))}
        </div>
        <p className="mt-2 text-xs text-secondary">Paso {step + 1} de 2 · {step === 0 ? 'Tu cuenta' : 'Tu negocio'}</p>
      </div>
      {step === 0 ? (
        <form className="mt-6 space-y-4" onSubmit={nextAccount}>
          <label>
            <span className="label">Nombre</span>
            <input className="input" name="name" required autoComplete="name" defaultValue="María Salazar" />
          </label>
          <label>
            <span className="label">Correo electrónico</span>
            <input className="input" name="email" type="email" required autoComplete="email" defaultValue="maria@andesdemo.pe" />
          </label>
          <label>
            <span className="label">Contraseña</span>
            <input className="input" name="password" type="password" required autoComplete="new-password" defaultValue="admin" minLength={6} />
          </label>
          <Button type="submit" className="w-full">Continuar</Button>
          <p className="text-center text-xs text-secondary">¿Ya tienes cuenta? <a href="/login" className="font-medium text-brand">Ingresar</a></p>
        </form>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={startWorkspace}>
          <label>
            <span className="label">Nombre del negocio</span>
            <input className="input" name="business" required defaultValue="Andes Hospitality" />
          </label>
          <label>
            <span className="label">Tipo de negocio</span>
            <select className="input" name="type" aria-label="Tipo de negocio">
              <option>Restaurante</option>
              <option>Bar</option>
              <option>Café</option>
              <option>Grupo / varios</option>
            </select>
          </label>
          <label>
            <span className="label">Ciudad</span>
            <input className="input" name="city" required defaultValue="Cusco" />
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep(0)}>Atrás</Button>
            <Button type="submit" className="flex-1">Crear espacio</Button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
