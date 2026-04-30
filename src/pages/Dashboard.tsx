import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePetStore } from '../store/petStore'
import { PetStage } from '../types'
import { invoke } from '@tauri-apps/api/core'

const STAGES_REQUIRED = [0, 1000, 5000, 25000, 50000]
const STAGE_NAMES = ['Slime Semilla', 'Slime Pequeño', 'Slime Joven', 'Slime Rey', 'Slime Legendario']

export default function Dashboard() {
  const {
    profile, setProfile,
    activePet, setActivePet,
    isOverlayVisible, setOverlayVisible,
    justEvolved, setJustEvolved,
  } = usePetStore()

  const [loading, setLoading] = useState(true)
  const [evolveMsg, setEvolveMsg] = useState<string | null>(null)

  // Notificación de evolución
  useEffect(() => {
    if (justEvolved && activePet) {
      const name = STAGE_NAMES[activePet.current_stage - 1]
      setEvolveMsg(`✨ ¡${activePet.current_stage === 5 ? '¡LEGENDARIO!' : `Evolucionó a ${name}!`}`)
      setJustEvolved(false)
      setTimeout(() => setEvolveMsg(null), 3000)
    }
  }, [justEvolved])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (profileData) setProfile(profileData)

    let { data: userPet } = await supabase
      .schema('clickpet')
      .from('user_pets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!userPet) {
      await supabase.rpc('grant_free_slime', { p_user_id: user.id })
      const { data: newPet } = await supabase
        .schema('clickpet')
        .from('user_pets')
        .select('*')
        .eq('user_id', user.id)
        .single()
      userPet = newPet
    }

    if (userPet) {
      setActivePet(userPet)
      // Registrar el pet_id en Rust para el overlay
      await invoke('set_user_pet_id', { userPetId: userPet.id })
    }
    
    setLoading(false)
  }

  async function handlePlayPause() {
  if (!activePet) return
  if (isOverlayVisible) {
    await invoke('hide_overlay')
    setOverlayVisible(false)
  } else {
    await invoke('show_overlay', { userPetId: activePet.id })
    setOverlayVisible(true)
  }
}

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#1a1a2e', color: '#94a3b8', fontSize: 14 }}>
      Cargando...
    </div>
  )

  const currentStage = activePet?.current_stage ?? 1
  const totalClicks = activePet?.total_clicks ?? 0
  const nextRequired = STAGES_REQUIRED[currentStage] ?? 50000
  const progress = currentStage >= 5 ? 100
    : Math.min((totalClicks / nextRequired) * 100, 100)
  const stageName = STAGE_NAMES[currentStage - 1]

  return (
    <div style={s.container}>

      {/* Notificación evolución */}
      {evolveMsg && (
        <div style={s.evolveToast}>
          {evolveMsg}
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <span style={s.logo}>🐾 Click Pet</span>
        <div style={s.balance}>💰 {profile?.balance ?? 0} monedas</div>
      </div>

      {/* Mascota card */}
      <div style={s.petCard}>
        <div style={s.petEmoji}>
          {['🟢','🫧','👾','👑','✨'][currentStage - 1]}
        </div>
        <div style={s.petInfo}>
          <div style={s.petName}>Slime</div>
          <div style={s.stageName}>{stageName}</div>
          <div style={s.stageRow}>
            <span>Stage {currentStage}/5</span>
            <span style={{ color: '#e2e8f0', fontWeight: 500 }}>
              {totalClicks.toLocaleString()} clicks
            </span>
          </div>
          <div style={s.progressBg}>
            <div style={{ ...s.progressFill, width: `${progress}%` }} />
          </div>
          {currentStage < 5
            ? <div style={s.nextLabel}>
                Próxima evolución: {nextRequired.toLocaleString()} clicks
                {' '}({(nextRequired - totalClicks).toLocaleString()} restantes)
              </div>
            : <div style={{ ...s.nextLabel, color: '#fbbf24' }}>✨ ¡Legendario!</div>
          }
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div style={s.statsRow}>
        <div style={s.statBox}>
          <div style={s.statVal}>{totalClicks.toLocaleString()}</div>
          <div style={s.statLabel}>Total clicks</div>
        </div>
        <div style={s.statBox}>
          <div style={s.statVal}>{currentStage}/5</div>
          <div style={s.statLabel}>Stage actual</div>
        </div>
        <div style={s.statBox}>
          <div style={s.statVal}>{Math.round(progress)}%</div>
          <div style={s.statLabel}>Progreso</div>
        </div>
      </div>

      {/* Botón Play/Pause */}
      <button
        style={isOverlayVisible ? s.btnPause : s.btnPlay}
        onClick={handlePlayPause}
      >
        {isOverlayVisible ? '⏸ Ocultar mascota' : '▶ Mostrar mascota'}
      </button>

      {/* Pociones */}
      <div style={s.potionSection}>
        <p style={s.sectionTitle}>🧪 Pociones</p>
        <p style={s.empty}>Próximamente en la tienda</p>
      </div>

      {/* Footer */}
      <button
        style={s.signOut}
        onClick={() => supabase.auth.signOut()}
      >
        Cerrar sesión
      </button>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: {
    padding: '1.25rem', background: '#1a1a2e', minHeight: '100vh',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
    color: '#e2e8f0', position: 'relative', overflow: 'hidden',
  },
  evolveToast: {
    position: 'fixed', top: 16, left: '50%',
    transform: 'translateX(-50%)',
    background: '#4ade80', color: '#1a1a2e',
    padding: '10px 20px', borderRadius: 12,
    fontWeight: 700, fontSize: 14,
    zIndex: 999, whiteSpace: 'nowrap',
    boxShadow: '0 4px 20px rgba(74,222,128,0.5)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  logo: { fontSize: 18, fontWeight: 600 },
  balance: {
    fontSize: 13, background: '#0f3460',
    padding: '4px 12px', borderRadius: 20, color: '#4ade80',
  },
  petCard: {
    background: '#16213e', borderRadius: 16, padding: '1.25rem',
    display: 'flex', gap: '1rem', alignItems: 'center',
    border: '1px solid #0f3460',
  },
  petEmoji: { fontSize: 56, lineHeight: 1, flexShrink: 0 },
  petInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  petName: { fontSize: 20, fontWeight: 600 },
  stageName: { fontSize: 13, color: '#4ade80' },
  stageRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 12, color: '#94a3b8', marginTop: 4,
  },
  progressBg: { height: 6, background: '#0f3460', borderRadius: 999, marginTop: 4 },
  progressFill: {
    height: '100%', background: '#4ade80', borderRadius: 999,
    transition: 'width 0.4s ease',
  },
  nextLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  statsRow: { display: 'flex', gap: '0.5rem' },
  statBox: {
    flex: 1, background: '#16213e', borderRadius: 12,
    padding: '0.75rem', textAlign: 'center', border: '1px solid #0f3460',
  },
  statVal: { fontSize: 18, fontWeight: 600, color: '#4ade80' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  btnPlay: {
    padding: '12px', borderRadius: 12, border: 'none',
    background: '#4ade80', color: '#1a1a2e',
    fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  btnPause: {
    padding: '12px', borderRadius: 12, border: 'none',
    background: '#0f3460', color: '#94a3b8',
    fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  potionSection: {
    background: '#16213e', borderRadius: 12,
    padding: '1rem', border: '1px solid #0f3460',
  },
  sectionTitle: { fontSize: 14, fontWeight: 600, marginBottom: 6 },
  empty: { fontSize: 13, color: '#64748b' },
  signOut: {
    marginTop: 'auto', padding: '8px', borderRadius: 8,
    border: 'none', background: 'transparent',
    color: '#64748b', cursor: 'pointer', fontSize: 12,
  },
}