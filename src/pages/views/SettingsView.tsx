import { supabase } from '../../lib/supabase'
import { usePetStore } from '../../store/petStore'
import { petCardStyles as pc } from '../../styles/dashboard/petCard'
import { layoutStyles as l } from '../../styles/dashboard/layout'

export default function SettingsView() {
  const { profile } = usePetStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h3 style={l.sectionTitle}>Ajustes</h3>

      <div style={pc.petCard}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>Cuenta</div>
          <div style={{ fontSize: '13px', color: '#78767B' }}>{profile?.email}</div>
        </div>
        <button style={{ ...l.btnSecondary, color: '#E05C5C', borderColor: '#E05C5C30' }}
          onClick={() => supabase.auth.signOut()}>
          Cerrar sesión
        </button>
      </div>

      <div style={{ ...pc.petCard, flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>Sobre ClickPet</div>
        <div style={{ fontSize: '12px', color: '#78767B', lineHeight: 1.6 }}>
          Versión 0.1.0 · Tu compañero digital tranquilo.
        </div>
      </div>
    </div>
  )
}