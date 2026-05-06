import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { supabase } from '../../lib/supabase'
import { usePetStore } from '../../store/petStore'
import { layoutStyles as l } from '../../styles/dashboard/layout'
import {
  User, Settings2, Info, BookOpen,
  Power, LogOut, Check,
} from 'lucide-react'

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
]

const OVERLAY_SIZES = [
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
  const [confirmLogout, setConfirmLogout] = useState(false)

  async function handleSizeChange(size: string) {
    setOverlaySize(size)
    localStorage.setItem('clickpet_overlay_size', size)
    if (isOverlayVisible) {
      await invoke('resize_overlay', { size })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h3 style={l.sectionTitle}>Ajustes</h3>

      {/* ── Cuenta ── */}
      <Section icon={<User size={16} strokeWidth={2} color="#3D4B9E" />} title="Cuenta">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={valueText}>{profile?.email}</p>
            <p style={subText}>Cuenta vinculada con A&B Studio</p>
          </div>
          {confirmLogout ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={subText}>¿Cerrar sesión?</span>
              <button style={btnGhost} onClick={() => setConfirmLogout(false)}>
                Cancelar
              </button>
              <button
                style={{ ...btnGhost, color: '#E05C5C', borderColor: '#E05C5C40' }}
                onClick={() => supabase.auth.signOut()}
              >
                Confirmar
              </button>
            </div>
          ) : (
            <button
              style={{ ...btnGhost, color: '#E05C5C', borderColor: '#E05C5C40' }}
              onClick={() => setConfirmLogout(true)}
            >
              <LogOut size={13} strokeWidth={2} style={{ marginRight: '5px' }} />
              Cerrar sesión
            </button>
          )}
        </div>
      </Section>

      {/* ── Preferencias ── */}
      <Section
        icon={<Settings2 size={16} strokeWidth={2} color="#3D4B9E" />}
        title="Preferencias"
      >
        <div style={{ display: 'flex', gap: '2rem' }}>

          {/* Idioma */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#78767B',
              textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Idioma
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {LANGUAGES.map(lng => (
                <button
                  key={lng.code}
                  style={{
                    ...optionBtn,
                    borderColor: lang === lng.code ? '#3D4B9E' : '#E8E7F0',
                    background:  lang === lng.code ? '#B8C0FF20' : 'transparent',
                    color:       lang === lng.code ? '#2D3A8C' : '#78767B',
                    fontWeight:  lang === lng.code ? 600 : 400,
                  }}
                  onClick={() => setLang(lng.code)}
                >
                  {lang === lng.code && (
                    <Check size={11} strokeWidth={2.5} style={{ marginRight: '4px' }} />
                  )}
                  {lng.flag} {lng.label}
                </button>
              ))}
            </div>
            {lang === 'en' && (
              <p style={{ ...subText, color: '#B8A000' }}>🚧 Coming soon</p>
            )}
          </div>

          {/* Divisor vertical */}
          <div style={{ width: '1px', background: '#E8E7F0', alignSelf: 'stretch' }} />

          {/* Tamaño overlay */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#78767B',
              textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tamaño mascota
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {OVERLAY_SIZES.map(opt => (
                <button
                  key={opt.id}
                  style={{
                    ...optionBtn,
                    flexDirection: 'column', gap: '1px',
                    padding: '6px 12px',
                    borderColor: overlaySize === opt.id ? '#3D4B9E' : '#E8E7F0',
                    background:  overlaySize === opt.id ? '#B8C0FF20' : 'transparent',
                    color:       overlaySize === opt.id ? '#2D3A8C' : '#78767B',
                    fontWeight:  overlaySize === opt.id ? 600 : 400,
                  }}
                  onClick={() => handleSizeChange(opt.id)}
                >
                  <span style={{ fontSize: '12px' }}>{opt.label}</span>
                  <span style={{ fontSize: '10px', opacity: 0.55 }}>{opt.desc}</span>
                </button>
              ))}
            </div>
            <p style={subText}>
              {isOverlayVisible ? '✅ En tiempo real' : '💡 Muestra tu mascota primero'}
            </p>
          </div>

        </div>
      </Section>

      {/* ── Tutorial ── */}
      <Section
        icon={<BookOpen size={16} strokeWidth={2} color="#3D4B9E" />}
        title="Tutorial"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={subText}>Vuelve a ver la introducción de ClickPet</p>
          <button style={btnGhost} onClick={openTutorial}>
            Ver tutorial
          </button>
        </div>
      </Section>

      {/* ── Sobre la app ── */}
      <Section
        icon={<Info size={16} strokeWidth={2} color="#3D4B9E" />}
        title="Sobre ClickPet"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={valueText}>Versión 0.1.0</p>
            <p style={subText}>Tu compañero digital tranquilo · A&B Studio © 2026</p>
          </div>
        </div>
      </Section>
    </div>
  )
}

// ── Componente Section ────────────────────────────────────────
function Section({
  icon, title, children, danger = false,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '14px',
      padding: '14px 16px',
      border: `1px solid ${danger ? '#FFE5E5' : '#E8E7F0'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 2px 8px rgba(60,55,120,0.05)',
    }}>
      {/* Header de sección */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '8px',
          background: danger ? '#FFF0F0' : '#F4F3FA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: '14px', fontWeight: 600,
          color: danger ? '#E05C5C' : '#1A1A2E',
        }}>
          {title}
        </span>
      </div>

      {/* Contenido */}
      <div style={{ paddingLeft: '42px' }}>
        {children}
      </div>
    </div>
  )
}

// ── Estilos locales ───────────────────────────────────────────
const valueText: React.CSSProperties = {
  margin: 0, fontSize: '13px',
  fontWeight: 500, color: '#1A1A2E',
}

const subText: React.CSSProperties = {
  margin: 0, fontSize: '12px', color: '#78767B',
}

const optionBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center',
  padding: '7px 14px', borderRadius: '10px',
  border: '1.5px solid #E8E7F0',
  background: 'transparent', cursor: 'pointer',
  fontSize: '13px', fontFamily: 'inherit',
  transition: 'all 0.15s',
}

const btnGhost: React.CSSProperties = {
  display: 'flex', alignItems: 'center',
  padding: '6px 14px', borderRadius: '8px',
  border: '1.5px solid #E8E7F0',
  background: 'transparent', cursor: 'pointer',
  fontSize: '12px', fontWeight: 500,
  fontFamily: 'inherit', color: '#78767B',
  whiteSpace: 'nowrap',
}