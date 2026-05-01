import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { loginStyles as s } from '../styles/login'
import { invoke } from '@tauri-apps/api/core'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit() {
    if (!email || !password) {
      setError('Por favor completa todos los campos.')
      return
    }
    if (isRegister && !fullName.trim()) {
      setError('Por favor ingresa tu nombre completo.')
      return
    }

    setLoading(true)
    setError(null)

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() }
        }
      })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  function switchTab(toRegister: boolean) {
    setIsRegister(toRegister)
    setError(null)
    setFullName('')
  }

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Botón cerrar */}
        <button
          style={s.closeBtn}
          onClick={() => invoke('close_app')}
          title="Cerrar"
        >
          ✕
        </button>

        {/* Panel izquierdo */}
        <div style={s.leftPanel} data-tauri-drag-region>
          <div style={s.leftPet}>🐾</div>
          <h1 style={s.leftTitle}>ClickPet</h1>
          <p style={s.leftSubtitle}>
            Tu compañero digital tranquilo. Crece con cada click de tu día.
          </p>
          <div style={s.leftDots}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                ...s.leftDot,
                background: i === 0
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(255,255,255,0.4)',
                width: i === 0 ? '20px' : '8px',
              }} />
            ))}
          </div>
        </div>

        {/* Panel derecho */}
        <div style={s.rightPanel} data-tauri-drag-region>

          <div style={s.tabRow}>
            <button
              style={{ ...s.tab, ...(isRegister ? {} : s.tabActive) }}
              onClick={() => switchTab(false)}
            >
              Sign In
            </button>
            <button
              style={{ ...s.tab, ...(isRegister ? s.tabActive : {}) }}
              onClick={() => switchTab(true)}
            >
              Create Account
            </button>
          </div>

          {/* Campo nombre completo solo en registro */}
          {isRegister && (
            <div style={s.fieldGroup}>
              <label style={s.label}>Full Name</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}>👤</span>
                <input
                  style={s.input}
                  type="text"
                  placeholder="Nombre completo"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          )}

          <div style={s.fieldGroup}>
            <label style={s.label}>Email Address</label>
            <div style={s.inputWrapper}>
              <span style={s.inputIcon}>✉️</span>
              <input
                style={s.input}
                type="email"
                placeholder="hello@friend.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <div style={s.inputWrapper}>
              <span style={s.inputIcon}>🔒</span>
              <input
                style={{ ...s.input, paddingRight: '40px' }}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '10px',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '14px',
                  color: '#78767B', padding: 0,
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button
            style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? 'Cargando...'
              : isRegister
                ? 'Create Account →'
                : 'Welcome Back →'}
          </button>

          <p style={s.hint}>
            {isRegister
              ? <>¿Ya tienes cuenta?{' '}
                  <span style={s.hintLink} onClick={() => switchTab(false)}>
                    Inicia sesión
                  </span>
                </>
              : <>💡 Si ya tienes cuenta en nuestra tienda, usa el mismo correo y contraseña.</>
            }
          </p>

        </div>
      </div>
    </div>
  )
}