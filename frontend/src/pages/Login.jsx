import React, { useState } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/persons')
    } catch (err) {
      setError('Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout fade-in">
      <section className="auth-hero slide-up">
        <div>
          <h1>Gestión segura de personas en ejecución de la pena</h1>
          <p>
            Accedé al registro con controles de seguridad, trazabilidad y un flujo
            ágil para unidades y traslados.
          </p>
        </div>
        <div className="auth-meta">
          <div>Datos sensibles protegidos por roles</div>
          <div>Historial claro de movimientos</div>
          <div>Acceso rápido para operadores</div>
        </div>
      </section>

      <section className="auth-card slide-up">
        <h2>Iniciar sesión</h2>
        <p id="login-help">Ingresá con tus credenciales para continuar. No compartas tu contraseña.</p>
        <form onSubmit={handleSubmit} className="form-stack" aria-describedby="login-help" aria-busy={loading}>
          <div className="field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              placeholder="nombre.apellido"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              spellCheck="false"
              inputMode="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <div className="error-text" role="alert" aria-live="polite">
              {error}
            </div>
          )}
          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={loading} aria-disabled={loading}>
              {loading ? 'Validando...' : 'Entrar'}
            </button>
            <button className="btn-link" type="button">¿Olvidaste tu contraseña?</button>
          </div>
        </form>
      </section>
    </div>
  )
}
