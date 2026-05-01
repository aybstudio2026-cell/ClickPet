import { useEffect, useState } from 'react'
import { supabase, supabaseClickpet } from '../lib/supabase'
import { usePetStore, calcStage } from '../store/petStore'
import { invoke } from '@tauri-apps/api/core'
import Shop from './Shop'
import { UserPet } from '../types'
import UpdateChecker from '../components/UpdateChecker'

const STAGES_REQUIRED = [0, 1000, 5000, 25000, 50000]
const STAGE_NAMES = ['Slime Semilla', 'Slime Pequeño', 'Slime Joven', 'Slime Rey', 'Slime Legendario']

const PET_STAGE_NAMES: Record<string, string[]> = {
  slime: ['Slime Semilla', 'Slime Pequeño', 'Slime Joven', 'Slime Rey', 'Slime Legendario'],
  dragon: ['Dragón Huevo', 'Dragón Bebé', 'Dragón Joven', 'Dragón Adulto', 'Dragón Legendario'],
  fairy: ['Hada Semilla', 'Hada Pequeña', 'Hada Joven', 'Hada Mayor', 'Hada Legendaria'],
}

const PET_EMOJIS: Record<string, string[]> = {
  slime: ['🟢', '🫧', '👾', '👑', '✨'],
  dragon: ['🥚', '🐲', '🐉', '🔥', '⚡'],
  fairy: ['🌱', '🧚', '🌸', '🌟', '💫'],
}

interface OwnedPet extends UserPet {
  pet: { name: string; slug: string } | null
}

export default function Dashboard() {
  const {
    profile, setProfile,
    activePet, setActivePet,
    isOverlayVisible, setOverlayVisible,
    justEvolved, setJustEvolved,
    potions, setPotions,
  } = usePetStore()

  const [loading, setLoading] = useState(true)
  const [evolveMsg, setEvolveMsg] = useState<string | null>(null)
  const [showShop, setShowShop] = useState(false)
  const [ownedPets, setOwnedPets] = useState<OwnedPet[]>([])
  const [activePetSlug, setActivePetSlug] = useState('slime')
  const [switchingPet, setSwitchingPet] = useState(false)

  // Notificación de evolución
  useEffect(() => {
    if (justEvolved && activePet) {
      const stageNames = PET_STAGE_NAMES[activePetSlug] ?? STAGE_NAMES
      const name = stageNames[activePet.current_stage - 1]
      setEvolveMsg(activePet.current_stage === 5
        ? '✨ ¡LEGENDARIO!'
        : `✨ ¡Evolucionó a ${name}!`)
      setJustEvolved(false)
      setTimeout(() => setEvolveMsg(null), 3000)
    }
  }, [justEvolved])

  // Escuchar clicks en tiempo real desde overlay
  useEffect(() => {
    let unlisten: (() => void) | null = null
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<number>('click-update', (event) => {
        const newTotal = event.payload
        usePetStore.setState((state) => {
          if (!state.activePet) return {}
          const oldStage = state.activePet.current_stage
          const newStage = calcStage(newTotal)
          return {
            justEvolved: newStage > oldStage,
            activePet: {
              ...state.activePet,
              total_clicks: newTotal,
              current_stage: newStage,
            },
          }
        })
      }).then(fn => { unlisten = fn })
    })
    return () => { if (unlisten) unlisten() }
  }, [])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    if (profileData) setProfile(profileData)

    // Cargar todas las mascotas del usuario con info del pet
    const { data: allPets } = await supabaseClickpet
      .from('user_pets')
      .select('*, pet:pets(name, slug)')
      .eq('user_id', user.id)

    if (!allPets || allPets.length === 0) {
      // Crear slime gratis
      const { data: slimePet } = await supabaseClickpet
        .from('pets').select('id').eq('slug', 'slime').single()
      if (slimePet) {
        const { data: newPet } = await supabaseClickpet
          .from('user_pets')
          .insert({ user_id: user.id, pet_id: slimePet.id })
          .select('*, pet:pets(name, slug)').single()
        if (newPet) {
          setOwnedPets([newPet])
          setActivePet(newPet)
          setActivePetSlug('slime')
          await invoke('set_user_pet_id', { userPetId: newPet.id })
        }
      }
    } else {
      setOwnedPets(allPets)
      // Usar primera mascota como activa por defecto
      const first = allPets[0]
      setActivePet(first)
      setActivePetSlug(first.pet?.slug ?? 'slime')
      await invoke('set_user_pet_id', { userPetId: first.id })
    }

    // Cargar inventario de pociones
    const { data: inv } = await supabaseClickpet
      .from('potion_inventory').select('*').eq('user_id', user.id)
    if (inv) setPotions(inv)

    setLoading(false)
  }

  async function switchPet(pet: OwnedPet) {
    if (pet.id === activePet?.id) return
    setSwitchingPet(true)

    setActivePet(pet)
    setActivePetSlug(pet.pet?.slug ?? 'slime')
    await invoke('set_user_pet_id', { userPetId: pet.id })

    // Si el overlay está visible, notificarle el nuevo pet
    if (isOverlayVisible) {
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
      const overlay = await WebviewWindow.getByLabel('overlay')
      if (overlay) await overlay.emit('pet-id', pet.id)
    }

    setSwitchingPet(false)
  }

  async function handlePlayPause() {
    if (!activePet) return
    try {
      if (isOverlayVisible) {
        await invoke('hide_overlay')
        setOverlayVisible(false)
      } else {
        await invoke('show_overlay', { userPetId: activePet.id })
        setOverlayVisible(true)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  async function usePotion() {
    if (!activePet) return
    const available = potions.find(p => p.quantity > 0)
    if (!available) { setShowShop(true); return }

    const { error } = await supabaseClickpet.rpc('use_potion', {
      p_user_pet_id: activePet.id,
      p_potion_id: available.potion_id,
    })

    if (!error) {
      setPotions(potions.map(p =>
        p.potion_id === available.potion_id
          ? { ...p, quantity: p.quantity - 1 } : p
      ))
      if (isOverlayVisible) {
        const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
        const overlay = await WebviewWindow.getByLabel('overlay')
        if (overlay) await overlay.emit('use-potion', {})
      }
    }
  }

  // Cuando se compra una mascota nueva, recargar la lista
  async function handleShopClose() {
    setShowShop(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: allPets } = await supabaseClickpet
      .from('user_pets')
      .select('*, pet:pets(name, slug)')
      .eq('user_id', user.id)
    if (allPets) setOwnedPets(allPets)
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

  const stageNames = PET_STAGE_NAMES[activePetSlug] ?? STAGE_NAMES
  const petEmojis = PET_EMOJIS[activePetSlug] ?? PET_EMOJIS.slime
  const stageName = stageNames[currentStage - 1]
  const petEmoji = petEmojis[currentStage - 1]
  const totalPotions = potions.reduce((sum, p) => sum + p.quantity, 0)

  return (
    <div style={s.container}>
      {showShop && <Shop onClose={handleShopClose} />}
      {evolveMsg && <div style={s.evolveToast}>{evolveMsg}</div>}

      {/* Header */}
      <UpdateChecker />
      <div style={s.header}>
        <span style={s.logo}>🐾 Click Pet</span>
        <div style={s.headerRight}>
          <div style={s.balance}>💰 {profile?.balance ?? 0}</div>
          <button style={s.storeBtn} onClick={() => setShowShop(true)}>Tienda</button>
        </div>
      </div>

      {/* Mascota activa */}
      <div style={s.petCard}>
        <div style={s.petEmoji}>{petEmoji}</div>
        <div style={s.petInfo}>
          <div style={s.petName}>
            {activePet
              ? (ownedPets.find(p => p.id === activePet.id)?.pet?.name ?? 'Slime')
              : 'Slime'}
          </div>
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

      {/* Selector de mascotas (solo si tiene más de una) */}
      {ownedPets.length > 1 && (
        <div style={s.petSelector}>
          <div style={s.selectorLabel}>Mis mascotas</div>
          <div style={s.selectorRow}>
            {ownedPets.map(pet => {
              const slug = pet.pet?.slug ?? 'slime'
              const emojis = PET_EMOJIS[slug] ?? PET_EMOJIS.slime
              const isActive = pet.id === activePet?.id
              return (
                <button
                  key={pet.id}
                  style={{
                    ...s.petChip,
                    borderColor: isActive ? '#4ade80' : '#0f3460',
                    background: isActive ? '#0f3460' : 'transparent',
                    opacity: switchingPet ? 0.6 : 1,
                  }}
                  onClick={() => switchPet(pet)}
                  disabled={switchingPet}
                >
                  <span style={{ fontSize: 20 }}>{emojis[pet.current_stage - 1]}</span>
                  <span style={{ fontSize: 11, color: isActive ? '#4ade80' : '#94a3b8' }}>
                    {pet.pet?.name ?? 'Slime'}
                  </span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>
                    {pet.total_clicks.toLocaleString()} clicks
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats */}
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
      <button style={isOverlayVisible ? s.btnPause : s.btnPlay} onClick={handlePlayPause}>
        {isOverlayVisible ? '⏸ Ocultar mascota' : '▶ Mostrar mascota'}
      </button>

      {/* Pociones */}
      <div style={s.potionSection}>
        <div style={s.potionHeader}>
          <span style={s.sectionTitle}>🧪 Pociones</span>
          <button style={s.shopBtn} onClick={() => setShowShop(true)}>Comprar →</button>
        </div>
        {totalPotions > 0 ? (
          <div style={s.potionRow}>
            <span style={s.potionCount}>
              Tienes <strong style={{ color: '#4ade80' }}>{totalPotions}</strong> pociones
            </span>
            <button
              style={{
                ...s.useBtn,
                opacity: isOverlayVisible ? 1 : 0.5,
                cursor: isOverlayVisible ? 'pointer' : 'default',
              }}
              onClick={usePotion}
              disabled={!isOverlayVisible}
            >
              {isOverlayVisible ? '✨ Usar' : 'Muestra la mascota'}
            </button>
          </div>
        ) : (
          <p style={s.empty}>
            Sin pociones.{' '}
            <span
              style={{ color: '#4ade80', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setShowShop(true)}
            >
              Comprar
            </span>
          </p>
        )}
      </div>

      <button style={s.signOut} onClick={() => supabase.auth.signOut()}>
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
    position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
    background: '#4ade80', color: '#1a1a2e', padding: '10px 20px',
    borderRadius: 12, fontWeight: 700, fontSize: 14, zIndex: 999,
    whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(74,222,128,0.5)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerRight: { display: 'flex', gap: 8, alignItems: 'center' },
  logo: { fontSize: 18, fontWeight: 600 },
  balance: { fontSize: 13, background: '#0f3460', padding: '4px 12px', borderRadius: 20, color: '#4ade80' },
  storeBtn: {
    fontSize: 12, padding: '4px 12px', borderRadius: 20,
    border: '1px solid #4ade80', background: 'transparent',
    color: '#4ade80', cursor: 'pointer',
  },
  petCard: {
    background: '#16213e', borderRadius: 16, padding: '1.25rem',
    display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid #0f3460',
  },
  petEmoji: { fontSize: 56, lineHeight: 1, flexShrink: 0 },
  petInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  petName: { fontSize: 20, fontWeight: 600 },
  stageName: { fontSize: 13, color: '#4ade80' },
  stageRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginTop: 4 },
  progressBg: { height: 6, background: '#0f3460', borderRadius: 999, marginTop: 4 },
  progressFill: { height: '100%', background: '#4ade80', borderRadius: 999, transition: 'width 0.4s ease' },
  nextLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  petSelector: {
    background: '#16213e', borderRadius: 12,
    padding: '0.75rem 1rem', border: '1px solid #0f3460',
  },
  selectorLabel: { fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  selectorRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  petChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 2, padding: '8px 12px', borderRadius: 10,
    border: '1px solid', cursor: 'pointer', minWidth: 70,
    transition: 'all 0.15s',
  },
  statsRow: { display: 'flex', gap: '0.5rem' },
  statBox: { flex: 1, background: '#16213e', borderRadius: 12, padding: '0.75rem', textAlign: 'center', border: '1px solid #0f3460' },
  statVal: { fontSize: 18, fontWeight: 600, color: '#4ade80' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  btnPlay: { padding: '12px', borderRadius: 12, border: 'none', background: '#4ade80', color: '#1a1a2e', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  btnPause: { padding: '12px', borderRadius: 12, border: 'none', background: '#0f3460', color: '#94a3b8', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  potionSection: { background: '#16213e', borderRadius: 12, padding: '1rem', border: '1px solid #0f3460' },
  potionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 600 },
  shopBtn: { fontSize: 12, background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer' },
  potionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  potionCount: { fontSize: 13, color: '#94a3b8' },
  useBtn: { fontSize: 12, padding: '6px 12px', borderRadius: 8, border: 'none', background: '#4ade80', color: '#1a1a2e', fontWeight: 600, cursor: 'pointer' },
  empty: { fontSize: 13, color: '#64748b' },
  signOut: { marginTop: 'auto', padding: '8px', borderRadius: 8, border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 12 },
}