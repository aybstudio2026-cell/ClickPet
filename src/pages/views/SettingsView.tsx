import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { supabase } from '../../lib/supabase'
import { usePetStore } from '../../store/petStore'
import { petCardStyles as pc } from '../../styles/dashboard/petCard'
import { layoutStyles as l } from '../../styles/dashboard/layout'

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
]

interface Props {
  openTutorial: () => void
}

export default function SettingsView({ openTutorial }: Props) {
  const { profile } = usePetStore()
  const [lang, setLang] = useState('es')
  const [overlaySize, setOverlaySize] = useState('medium')
  const [confirmClose, setConfirmClose] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h3 style={l.sectionTitle}>Ajustes</h3>

      {/* Cuenta */}
      <div style={settingCard}>
        <div style={settingHeader}>
          <span style={settingIcon}>👤</span>
          <div>
            <div style={settingTitle}>Cuenta</div>
            <div style={settingDesc}>{profile?.email}</div>
          </div>
        </div>
        <button
          style={{ ...l.btnSecondary, color: '#E05C5C', borderColor: '#E05C5C30' }}
          onClick={() => supabase.auth.signOut()}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Idioma */}
      <div style={{ ...settingCard, flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <div style={settingHeader}>
          <span style={settingIcon}>🌐</span>
          <div>
            <div style={settingTitle}>Idioma</div>
            <div style={settingDesc}>Idioma de la interfaz</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {LANGUAGES.map(lng => (
            <button key={lng.code}
              style={{
                padding: '7px 16px', borderRadius: '10px',
                border: `1.5px solid ${lang === lng.code ? '#B8C0FF' : '#E8E7F0'}`,
                background: lang === lng.code ? '#B8C0FF20' : 'transparent',
                color: lang === lng.code ? '#2D3A8C' : '#78767B',
                fontWeight: lang === lng.code ? 600 : 400,
                cursor: 'pointer', fontSize: '13px',
                fontFamily: 'inherit', display: 'flex',
                alignItems: 'center', gap: '6px',
              }}
              onClick={() => setLang(lng.code)}
            >
              {lng.flag} {lng.label}
            </button>
          ))}
        </div>
        {lang === 'en' && (
          <div style={{ fontSize: '11px', color: '#78767B', background: '#F4F3FA',
            padding: '6px 10px', borderRadius: '8px' }}>
            🚧 English translation coming soon
          </div>
        )}
      </div>

      {/* Tamaño overlay */}
      <div style={{ ...settingCard, flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <div style={settingHeader}>
          <span style={settingIcon}>🐾</span>
          <div>
            <div style={settingTitle}>Tamaño de la mascota</div>
            <div style={settingDesc}>Ajusta el tamaño del overlay en pantalla</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'small',  label: 'Pequeño', size: '120px' },
            { id: 'medium', label: 'Mediano',  size: '180px' },
            { id: 'large',  label: 'Grande',   size: '240px' },
          ].map(opt => (
            <button key={opt.id}
              style={{
                padding: '7px 14px', borderRadius: '10px',
                border: `1.5px solid ${overlaySize === opt.id ? '#B8C0FF' : '#E8E7F0'}`,
                background: overlaySize === opt.id ? '#B8C0FF20' : 'transparent',
                color: overlaySize === opt.id ? '#2D3A8C' : '#78767B',
                fontWeight: overlaySize === opt.id ? 600 : 400,
                cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
              }}
              onClick={() => setOverlaySize(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#78767B' }}>
          🚧 Se aplicará en la próxima sesión
        </div>
      </div>

      {/* Sobre la app */}
      <div style={{ ...settingCard, flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
        <div style={settingHeader}>
          <span style={settingIcon}>ℹ️</span>
          <div>
            <div style={settingTitle}>Sobre ClickPet</div>
            <div style={settingDesc}>Versión 0.1.0 · Tu compañero digital tranquilo</div>
          </div>
        </div>
      </div>

      {/* Tutorial */}
      <div style={settingCard}>
        <div style={settingHeader}>
          <span style={settingIcon}>📖</span>
          <div>
            <div style={settingTitle}>Tutorial</div>
            <div style={settingDesc}>Vuelve a ver la introducción de ClickPet</div>
          </div>
        </div>
        <button style={l.btnSecondary} onClick={openTutorial}>
          Ver tutorial
        </button>
      </div>

      {/* Cerrar aplicación */}
      <div style={{ ...settingCard, borderColor: '#FFE5E5' }}>
        <div style={settingHeader}>
          <span style={settingIcon}>🚪</span>
          <div>
            <div style={settingTitle}>Cerrar ClickPet</div>
            <div style={settingDesc}>Cierra completamente la aplicación</div>
          </div>
        </div>
        {confirmClose ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#78767B' }}>¿Seguro?</span>
            <button
              style={{ ...l.btnSecondary, fontSize: '12px', padding: '5px 12px' }}
              onClick={() => setConfirmClose(false)}
            >
              Cancelar
            </button>
            <button
              style={{ padding: '5px 12px', borderRadius: '8px', border: 'none',
                background: '#E05C5C', color: '#fff', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => invoke('close_app')}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <button
            style={{ ...l.btnSecondary, color: '#E05C5C',
              borderColor: '#E05C5C30', fontSize: '12px' }}
            onClick={() => setConfirmClose(true)}
          >
            Cerrar app
          </button>
        )}
      </div>

    </div>
  )
}

// Estilos locales del componente
const settingCard: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: '14px',
  padding: '1rem 1.25rem', border: '1px solid #E8E7F0',
  display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(60,55,120,0.06)',
}

const settingHeader: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '12px',
}

const settingIcon: React.CSSProperties = {
  fontSize: '20px', width: '36px', height: '36px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#F4F3FA', borderRadius: '10px', flexShrink: 0,
}

const settingTitle: React.CSSProperties = {
  fontSize: '14px', fontWeight: 600, color: '#1A1A2E',
}

const settingDesc: React.CSSProperties = {
  fontSize: '12px', color: '#78767B', marginTop: '1px',
}