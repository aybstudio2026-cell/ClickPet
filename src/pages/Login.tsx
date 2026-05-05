import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { loginStyles as s } from '../styles/login'
import { invoke } from '@tauri-apps/api/core'
import {Mail, Lock, User, Eye, EyeOff, X, Minus} from 'lucide-react'

// ← Cuando tengas tu logo, descomenta esta línea:
import logo from '../assets/logo.png'

export default function Login() {
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [fullName,   setFullName]   = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [showPass,   setShowPass]   = useState(false)

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
        options: { data: { full_name: fullName.trim() } },
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

  async function handleMinimize() {
    const { Window } = await import('@tauri-apps/api/window')
    const win = Window.getCurrent()
    await win.minimize()
  }

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* ── Botones de ventana ── */}
        <div style={windowBtns}>
          <button
            style={{ ...windowBtn, color: '#78767B' }}
            onClick={handleMinimize}
            title="Minimizar"
          >
            <Minus size={12} strokeWidth={2.5} />
          </button>
          <button
            style={{ ...windowBtn, color: '#E05C5C' }}
            onClick={() => invoke('close_app')}
            title="Cerrar"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Panel izquierdo ── */}
        <div style={s.leftPanel} data-tauri-drag-region>

          {/* Logo — cuando lo tengas, reemplaza el div por <img src={logo} .../> */}
          <div style={logoPlaceholder}>
            <div style={logoInner}>
              {/* <img src={logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> */}
              <img src={logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>

          <h1 style={s.leftTitle}>ClickPet</h1>
          <p style={s.leftSubtitle}>
            Tu compañero digital tranquilo.{'\n'}Crece con cada click de tu día.
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

        {/* ── Panel derecho ── */}
        <div style={s.rightPanel} data-tauri-drag-region>

          {/* Tabs */}
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

          {/* Campo nombre (solo registro) */}
          {isRegister && (
            <div style={s.fieldGroup}>
              <label style={s.label}>Full Name</label>
              <div style={s.inputWrapper}>
                <span style={iconStyle}>
                  <User size={14} color="#78767B" strokeWidth={2} />
                </span>
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

          {/* Email */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Email Address</label>
            <div style={s.inputWrapper}>
              <span style={iconStyle}>
                <Mail size={14} color="#78767B" strokeWidth={2} />
              </span>
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

          {/* Password */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <div style={s.inputWrapper}>
              <span style={iconStyle}>
                <Lock size={14} color="#78767B" strokeWidth={2} />
              </span>
              <input
                style={{
                  ...s.input,
                  paddingRight: '40px',
                  WebkitTextSecurity: showPass ? 'none' : 'disc',
                } as React.CSSProperties}
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={eyeBtn}
              >
                {showPass
                  ? <EyeOff size={14} color="#78767B" strokeWidth={2} />
                  : <Eye    size={14} color="#78767B" strokeWidth={2} />
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <div style={s.error}>{error}</div>}

          {/* Botón principal */}
          <button
            style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? 'Cargando...'
              : isRegister
                ? 'Create Account →'
                : 'Welcome Back →'
            }
          </button>

          {/* Hint */}
          <p style={s.hint}>
            {isRegister ? (
              <>
                ¿Ya tienes cuenta?{' '}
                <span style={s.hintLink} onClick={() => switchTab(false)}>
                  Inicia sesión
                </span>
              </>
            ) : (
              <>Si ya tienes cuenta en nuestra tienda, usa el mismo correo y contraseña.</>
            )}
          </p>

        </div>
      </div>
    </div>
  )
}

// ── Estilos locales ───────────────────────────────────────────

const windowBtns: React.CSSProperties = {
  position: 'absolute',
  top: '14px',
  right: '14px',
  display: 'flex',
  gap: '6px',
  zIndex: 10,
}

const windowBtn: React.CSSProperties = {
  width: '26px',
  height: '26px',
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(120,118,123,0.12)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s',
  padding: 0,
}

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
}

const eyeBtn: React.CSSProperties = {
  position: 'absolute',
  right: '10px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
}

const logoPlaceholder: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
  border: '1.5px solid rgba(255,255,255,0.4)',
}

const logoInner: React.CSSProperties = {
  width: '60px',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}