import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const { error } = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🐾 Click Pet</h1>
        <p style={styles.subtitle}>
          {isRegister ? 'Crea tu cuenta' : 'Inicia sesión'}
        </p>

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Entrar'}
        </button>

        <p
          style={styles.toggle}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? '¿Ya tienes cuenta? Inicia sesión'
            : '¿No tienes cuenta? Regístrate'}
        </p>

        <p style={styles.hint}>
          💡 Si ya tienes cuenta en nuestra tienda, usa el mismo email y contraseña.
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw', height: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#1a1a2e',
  },
  card: {
    background: '#16213e',
    borderRadius: 16,
    padding: '2rem',
    width: '100%',
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    border: '1px solid #0f3460',
  },
  title: { fontSize: 28, textAlign: 'center', color: '#e2e8f0' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#94a3b8', marginBottom: 8 },
  input: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #0f3460',
    background: '#0f3460',
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
  },
  button: {
    padding: '10px',
    borderRadius: 8,
    border: 'none',
    background: '#4ade80',
    color: '#1a1a2e',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 4,
  },
  toggle: {
    fontSize: 13,
    color: '#4ade80',
    textAlign: 'center',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  error: { fontSize: 13, color: '#f87171', textAlign: 'center' },
  hint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.5,
    marginTop: 4,
  },
}