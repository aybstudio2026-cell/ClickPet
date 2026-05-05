import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { supabase } from '../../lib/supabase'
import { usePetStore } from '../../store/petStore'
import { layoutStyles as l } from '../../styles/dashboard/layout'
import {
  User, Globe, PawPrint, Info,
  BookOpen, Power, LogOut, Monitor,
} from 'lucide-react'

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
]

const SIZES = [
  { id: 'small',  label: 'Pequeño', desc: '160×196' },
  { id: 'medium', label: 'Mediano', desc: '220×270' },
  { id: 'large',  label: 'Grande',  desc: '320×392' },
]

interface Props {
  openTutorial: () => void
}

export default function SettingsView({ openTutorial }: Props) {
  const { profile, isOverlayVisible } = usePetStore()
  const [lang,         setLang]         = useState('es')
  const [overlaySize,  setOverlaySize]  = useState<string>(
    () => localStorage.getItem('clickpet_overlay_size') ?? 'medium'
  )
  const [confirmClose, setConfirmClose] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  async function handleSizeChange(size: string) {
    setOverlaySize(size)
    localStorage.setItem('clickpet_overlay_size', size)
    if (isOverlayVisible) {
      await invoke('resize_overlay', { size })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={l.sectionTitle}>Ajustes</h3>

      {/* ── Fila 1: Cuenta + Idioma ── */}
      <div style={row}>

        {/* Cuenta */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={iconBox('#EEF0FF')}>
              <User size={16} color="#3D4B9E" strokeWidth={2} />
            </div>
            <div>
              <p style={cardTitle}>Cuenta</p>
              <p style={cardDesc}>{profile?.email ?? '—'}</p>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            {confirmSignOut ? (
              <>
                <span style={{ fontSize: '12px', color: '#78767B', alignSelf: 'center' }}>
                  ¿Seguro?
                </span>
                <button style={btnGhost} onClick={() => setConfirmSignOut(false)}>
                  Cancelar
                </button>
                <button style={btnDanger} onClick={() => supabase.auth.signOut()}>
                  <LogOut size={13} strokeWidth={2} />
                  Salir
                </button>
              </>
            ) : (
              <button
                style={{ ...btnGhost, color: '#E05C5C', borderColor: '#E05C5C30', width: '100%' }}
                onClick={() => setConfirmSignOut(true)}
              >
                <LogOut size={13} strokeWidth={2} />
                Cerrar sesión
              </button>
            )}
          </div>
        </div>

        {/* Idioma */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={iconBox('#EEF8F3')}>
              <Globe size={16} color="#2D6B45" strokeWidth={2} />
            </div>
            <div>
              <p style={cardTitle}>Idioma</p>
              <p style={cardDesc}>Idioma de la interfaz</p>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
            {LANGUAGES.map(lng => (
              <button
                key={lng.code}
                style={{
                  ...btnOption,
                  borderColor: lang === lng.code ? '#B8C0FF' : '#E8E7F0',
                  background:  lang === lng.code ? '#B8C0FF20' : 'transparent',
                  color:       lang === lng.code ? '#2D3A8C' : '#78767B',
                  fontWeight:  lang === lng.code ? 600 : 400,
                  flex: 1,
                }}
                onClick={() => setLang(lng.code)}
              >
                {lng.flag} {lng.label}
              </button>
            ))}
          </div>
          {lang === 'en' && (
            <p style={{ fontSize: '11px', color: '#78767B', marginTop: '8px' }}>
              🚧 English translation coming soon
            </p>
          )}
        </div>
      </div>

      {/* ── Fila 2: Tamaño overlay + Tutorial ── */}
      <div style={row}>

        {/* Tamaño overlay */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={iconBox('#FFF4EE')}>
              <Monitor size={16} color="#8B4513" strokeWidth={2} />
            </div>
            <div>
              <p style={cardTitle}>Tamaño de la mascota</p>
              <p style={cardDesc}>Ajusta el overlay en pantalla</p>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
            {SIZES.map(opt => (
              <button
                key={opt.id}
                style={{
                  ...btnOption,
                  borderColor: overlaySize === opt.id ? '#B8C0FF' : '#E8E7F0',
                  background:  overlaySize === opt.id ? '#B8C0FF20' : 'transparent',
                  color:       overlaySize === opt.id ? '#2D3A8C' : '#78767B',
                  fontWeight:  overlaySize === opt.id ? 600 : 400,
                  flex: 1,
                  flexDirection: 'column',
                  gap: '2px',
                }}
                onClick={() => handleSizeChange(opt.id)}
              >
                <span>{opt.label}</span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>{opt.desc}</span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: isOverlayVisible ? '#4CAF82' : '#78767B', marginTop: '8px' }}>
            {isOverlayVisible
              ? '✅ Cambio aplicado en tiempo real'
              : '💡 Muestra tu mascota para ver el cambio'}
          </p>
        </div>

        {/* Tutorial */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={iconBox('#EEF0FF')}>
              <BookOpen size={16} color="#3D4B9E" strokeWidth={2} />
            </div>
            <div>
              <p style={cardTitle}>Tutorial</p>
              <p style={cardDesc}>Vuelve a ver la introducción</p>
            </div>
          </div>
          <button
            style={{ ...btnGhost, width: '100%', marginTop: '12px' }}
            onClick={openTutorial}
          >
            <BookOpen size={13} strokeWidth={2} />
            Ver tutorial
          </button>
        </div>
      </div>

      {/* ── Fila 3: Sobre la app + Cerrar app ── */}
      <div style={row}>

        {/* Sobre la app */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={iconBox('#F4F3FA')}>
              <Info size={16} color="#78767B" strokeWidth={2} />
            </div>
            <div>
              <p style={cardTitle}>Sobre ClickPet</p>
              <p style={cardDesc}>Versión 0.1.0</p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#78767B', marginTop: '10px', lineHeight: 1.6 }}>
            Tu compañero digital tranquilo. Desarrollado con Tauri + React + Supabase.
          </p>
        </div>

        {/* Cerrar app */}
        <div style={{ ...card, borderColor: confirmClose ? '#FFB3B3' : '#E8E7F0' }}>
          <div style={cardHeader}>
            <div style={iconBox('#FFF0F0')}>
              <Power size={16} color="#E05C5C" strokeWidth={2} />
            </div>
            <div>
              <p style={cardTitle}>Cerrar ClickPet</p>
              <p style={cardDesc}>Cierra completamente la app</p>
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            {confirmClose ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#78767B', flex: 1 }}>
                  ¿Seguro que quieres cerrar?
                </span>
                <button style={btnGhost} onClick={() => setConfirmClose(false)}>
                  Cancelar
                </button>
                <button style={btnDanger} onClick={() => invoke('close_app')}>
                  <Power size={13} strokeWidth={2} />
                  Cerrar
                </button>
              </div>
            ) : (
              <button
                style={{ ...btnGhost, color: '#E05C5C', borderColor: '#E05C5C30', width: '100%' }}
                onClick={() => setConfirmClose(true)}
              >
                <Power size={13} strokeWidth={2} />
                Cerrar aplicación
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Estilos ───────────────────────────────────────────────────

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
}

const card: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: '14px',
  padding: '1rem 1.25rem',
  border: '1px solid #E8E7F0',
  boxShadow: '0 2px 8px rgba(60,55,120,0.06)',
}

const cardHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
  color: '#1A1A2E',
}

const cardDesc: React.CSSProperties = {
  margin: 0,
  fontSize: '12px',
  color: '#78767B',
  marginTop: '1px',
}

function iconBox(bg: string): React.CSSProperties {
  return {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
}

const btnGhost: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: '8px',
  border: '1.5px solid #E8E7F0',
  background: 'transparent',
  color: '#4A4A6A',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  justifyContent: 'center',
}

const btnDanger: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: '8px',
  border: 'none',
  background: '#E05C5C',
  color: '#fff',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}

const btnOption: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: '10px',
  border: '1.5px solid #E8E7F0',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  transition: 'all 0.15s',
}