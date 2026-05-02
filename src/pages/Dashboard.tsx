import { useEffect, useState } from 'react'
import { supabase, supabaseClickpet } from '../lib/supabase'
import { usePetStore, calcStage } from '../store/petStore'
import { invoke } from '@tauri-apps/api/core'
import { UserPet } from '../types'
import { dashboardStyles as s } from '../styles/dashboard'
import UpdateChecker from '../components/UpdateChecker'

const STAGES_REQUIRED = [0, 1000, 5000, 25000, 50000]

const PET_STAGE_NAMES: Record<string, string[]> = {
  slime:  ['Slime Semilla', 'Slime Pequeño', 'Slime Joven', 'Slime Rey', 'Slime Legendario'],
  dragon: ['Dragón Huevo',  'Dragón Bebé',   'Dragón Joven', 'Dragón Adulto', 'Dragón Legendario'],
  fairy:  ['Hada Semilla',  'Hada Pequeña',  'Hada Joven',  'Hada Mayor',  'Hada Legendaria'],
}

const PET_EMOJIS: Record<string, string[]> = {
  slime:  ['🟢', '🫧', '👾', '👑', '✨'],
  dragon: ['🥚', '🐲', '🐉', '🔥', '⚡'],
  fairy:  ['🌱', '🧚', '🌸', '🌟', '💫'],
}

type NavPage = 'dashboard' | 'mascotas' | 'inventario' | 'tienda' | 'ajustes'

interface OwnedPet extends UserPet {
  pet: { name: string; slug: string } | null
}

interface ShopPotion {
  id: string
  name: string
  slug: string
  price: number
  pack_size: number
  description: string
}

interface ShopPet {
  id: string
  name: string
  slug: string
  price: number
  description: string
  is_free: boolean
}

type ShopItem = (ShopPotion | ShopPet) & { _type: 'potion' | 'pet' }

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
  const [ownedPets, setOwnedPets] = useState<OwnedPet[]>([])
  const [activePetSlug, setActivePetSlug] = useState('slime')
  const [switchingPet, setSwitchingPet] = useState(false)
  const [navPage, setNavPage] = useState<NavPage>('dashboard')

  // Shop state
  const [shopTab, setShopTab] = useState<'pociones' | 'mascotas'>('pociones')
  const [shopPotions, setShopPotions] = useState<ShopPotion[]>([])
  const [shopPets, setShopPets] = useState<ShopPet[]>([])
  const [ownedPetIds, setOwnedPetIds] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ShopItem | null>(null)
  const [buyQty, setBuyQty] = useState(1)
  const [buying, setBuying] = useState(false)
  const [shopMsg, setShopMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (justEvolved && activePet) {
      const names = PET_STAGE_NAMES[activePetSlug] ?? PET_STAGE_NAMES.slime
      setEvolveMsg(activePet.current_stage === 5
        ? '✨ ¡LEGENDARIO!'
        : `✨ Evolucionó a ${names[activePet.current_stage - 1]}`)
      setJustEvolved(false)
      setTimeout(() => setEvolveMsg(null), 3000)
    }
  }, [justEvolved])

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
            activePet: { ...state.activePet, total_clicks: newTotal, current_stage: newStage },
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

    const { data: allPets } = await supabaseClickpet
      .from('user_pets').select('*, pet:pets(name, slug)').eq('user_id', user.id)

    if (!allPets || allPets.length === 0) {
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
      const first = allPets[0]
      setActivePet(first)
      setActivePetSlug(first.pet?.slug ?? 'slime')
      await invoke('set_user_pet_id', { userPetId: first.id })
    }

    const { data: inv } = await supabaseClickpet
      .from('potion_inventory').select('*').eq('user_id', user.id)
    if (inv) setPotions(inv)

    // Cargar tienda
    const [potRes, petRes] = await Promise.all([
      supabaseClickpet.from('potions').select('*').order('price'),
      supabaseClickpet.from('pets').select('*').eq('is_free', false).order('price'),
    ])
    if (potRes.data) setShopPotions(potRes.data)
    if (petRes.data) setShopPets(petRes.data)

    const { data: ownedRes } = await supabaseClickpet
      .from('user_pets').select('pet_id').eq('user_id', user.id)
    if (ownedRes) setOwnedPetIds(ownedRes.map(p => p.pet_id))

    setLoading(false)
  }

  async function switchPet(pet: OwnedPet) {
    if (pet.id === activePet?.id || switchingPet) return
    setSwitchingPet(true)
    setActivePet(pet)
    setActivePetSlug(pet.pet?.slug ?? 'slime')
    await invoke('set_user_pet_id', { userPetId: pet.id })
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
        await invoke('hide_overlay'); setOverlayVisible(false)
      } else {
        await invoke('show_overlay', { userPetId: activePet.id }); setOverlayVisible(true)
      }
    } catch (err) { console.error(err) }
  }

  async function usePotion() {
    if (!activePet) return
    const available = potions.find(p => p.quantity > 0)
    if (!available) { setNavPage('tienda'); return }
    const { error } = await supabaseClickpet.rpc('use_potion', {
      p_user_pet_id: activePet.id, p_potion_id: available.potion_id,
    })
    if (!error) {
      setPotions(potions.map(p =>
        p.potion_id === available.potion_id ? { ...p, quantity: p.quantity - 1 } : p
      ))
      if (isOverlayVisible) {
        const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
        const overlay = await WebviewWindow.getByLabel('overlay')
        if (overlay) await overlay.emit('use-potion', {})
      }
    }
  }

  function showShopMsg(text: string, ok: boolean) {
    setShopMsg({ text, ok })
    setTimeout(() => setShopMsg(null), 3000)
  }

  async function buyItem() {
    if (!selectedProduct || !profile) return
    const price = selectedProduct.price * buyQty
    if (profile.balance < price) {
      showShopMsg('❌ Balance insuficiente.', false); return
    }
    setBuying(true)
    try {
      if (selectedProduct._type === 'potion') {
        for (let i = 0; i < buyQty; i++) {
          const { error } = await supabaseClickpet.rpc('purchase_potions', {
            p_potion_id: selectedProduct.id,
          })
          if (error) throw error
        }
        // Actualizar inventario local
        const existing = potions.find(p => p.potion_id === selectedProduct.id)
        const addedQty = (selectedProduct as ShopPotion).pack_size * buyQty
        if (existing) {
          setPotions(potions.map(p =>
            p.potion_id === selectedProduct.id
              ? { ...p, quantity: p.quantity + addedQty } : p
          ))
        } else {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) setPotions([...potions, {
            id: crypto.randomUUID(), user_id: user.id,
            potion_id: selectedProduct.id, quantity: addedQty,
          }])
        }
        showShopMsg(`✅ ¡Comprado!`, true)
      } else {
        const { error } = await supabaseClickpet.rpc('purchase_pet', {
          p_pet_id: selectedProduct.id,
        })
        if (error) throw error
        setOwnedPetIds(prev => [...prev, selectedProduct.id])
        // Refrescar mascotas
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: allPets } = await supabaseClickpet
            .from('user_pets').select('*, pet:pets(name, slug)').eq('user_id', user.id)
          if (allPets) setOwnedPets(allPets)
        }
        showShopMsg(`✅ ¡${selectedProduct.name} es tuyo!`, true)
      }
      // Refrescar balance
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: pd } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (pd) setProfile(pd)
      }
    } catch (e: any) {
      showShopMsg(e?.message ?? '❌ Error al comprar.', false)
    } finally {
      setBuying(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#F4F3FA', color: '#78767B', fontSize: 14,
      fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      Cargando...
    </div>
  )

  const currentStage = activePet?.current_stage ?? 1
  const totalClicks = activePet?.total_clicks ?? 0
  const nextRequired = STAGES_REQUIRED[currentStage] ?? 50000
  const progress = currentStage >= 5 ? 100 : Math.min((totalClicks / nextRequired) * 100, 100)
  const petEmojis = PET_EMOJIS[activePetSlug] ?? PET_EMOJIS.slime
  const stageNames = PET_STAGE_NAMES[activePetSlug] ?? PET_STAGE_NAMES.slime
  const petName = ownedPets.find(p => p.id === activePet?.id)?.pet?.name ?? 'Slime'
  const displayName = (profile as any)?.username || (profile as any)?.full_name
    || profile?.email?.split('@')[0] || 'Trainer'
  const totalPotions = potions.reduce((sum, p) => sum + p.quantity, 0)
  const otherPets = ownedPets.filter(p => p.id !== activePet?.id)

  const navItems = [
    { id: 'dashboard',  icon: '🏠', label: 'Dashboard' },
    { id: 'mascotas',   icon: '🐾', label: 'Mis Mascotas' },
    { id: 'inventario', icon: '🎒', label: 'Mi Inventario' },
    { id: 'tienda',     icon: '🛒', label: 'Tienda' },
    { id: 'ajustes',    icon: '⚙️', label: 'Ajustes' },
  ]

  return (
    <div style={s.page}>
      {evolveMsg && <div style={s.evolveToast}>{evolveMsg}</div>}

      {/* Sidebar */}
      <aside style={s.sidebar} data-tauri-drag-region>
        <div style={s.sidebarLogo}>
          <div style={s.sidebarLogoIcon}>🐾</div>
          <span style={s.sidebarLogoText}>ClickPet</span>
        </div>
        {navItems.map(item => (
          <button key={item.id} style={{
            ...s.navItem,
            ...(navPage === item.id ? s.navItemActive : {}),
          }} onClick={() => {
            setNavPage(item.id as NavPage)
            setSelectedProduct(null)
          }}>
            <span style={s.navIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div style={s.navSpacer} />
        <div style={s.navDivider} />
        <button style={{ ...s.navItem, color: '#E05C5C' }}
          onClick={() => supabase.auth.signOut()}>
          <span style={s.navIcon}>🚪</span>
          Cerrar sesión
        </button>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <UpdateChecker />

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <h2 style={s.welcomeText}>Welcome back, {displayName}!</h2>
            <p style={s.welcomeSub}>
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </p>
          </div>
          {/* Balance estilo tienda A&B */}
          <div style={s.balancePill}>
            <div style={s.balanceIcon}>🪙</div>
            <div>
              <div style={s.balanceAmount}>
                {(profile?.balance ?? 0).toLocaleString()} Coins
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={s.content}>

          {/* ── DASHBOARD ── */}
          {navPage === 'dashboard' && (
            <>
              <div style={s.petCard}>
                <div style={s.petImageBox}>{petEmojis[currentStage - 1]}</div>
                <div style={s.petCardInfo}>
                  <div style={s.petCardTop}>
                    <h3 style={s.petCardName}>{petName}</h3>
                    <span style={s.stageBadge}>Stage {currentStage}</span>
                  </div>
                  <div style={s.clicksRow}>
                    🖱️ <strong>{totalClicks.toLocaleString()}</strong> clicks totales
                  </div>
                  <div style={s.progressLabel}>
                    <span>Evolution Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div style={s.progressBg}>
                    <div style={{ ...s.progressFill, width: `${progress}%` }} />
                  </div>
                  {currentStage < 5 && (
                    <div style={{ fontSize: '11px', color: '#78767B', marginTop: '2px' }}>
                      {stageNames[currentStage - 1]} → {stageNames[currentStage]}
                      {' · '}{(nextRequired - totalClicks).toLocaleString()} clicks restantes
                    </div>
                  )}
                  <button style={isOverlayVisible ? s.btnHide : s.btnShow} onClick={handlePlayPause}>
                    {isOverlayVisible ? `⏸ Ocultar ${petName}` : `▶ Mostrar ${petName}`}
                  </button>
                </div>
              </div>

              <div style={s.statsRow}>
                <div style={s.statCard}>
                  <div style={s.statLabel}>Total Clicks</div>
                  <div style={s.statValue}>{totalClicks.toLocaleString()}</div>
                  <div style={s.statSub}>desde el inicio</div>
                </div>
                <div style={s.statCard}>
                  <div style={s.statLabel}>Stage Actual</div>
                  <div style={s.statValue}>{currentStage}/5</div>
                  <div style={s.statSub}>{stageNames[currentStage - 1]}</div>
                </div>
                <div style={s.statCard}>
                  <div style={s.statLabel}>Progreso</div>
                  <div style={s.statValue}>{Math.round(progress)}%</div>
                  <div style={s.statSub}>hacia stage {Math.min(currentStage + 1, 5)}</div>
                </div>
              </div>
            </>
          )}

          {/* ── MIS MASCOTAS ── */}
          {navPage === 'mascotas' && (
            <div style={s.petsGrid}>
              {/* Mascota activa grande */}
              <div style={s.activePetBig}>
                <div style={s.activePetImageBox}>{petEmojis[currentStage - 1]}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={s.petCardTop}>
                    <h3 style={s.petCardName}>{petName}</h3>
                    <span style={s.stageBadge}>Stage {currentStage}</span>
                    <span style={{ fontSize: '11px', color: '#3D4B9E',
                      background: '#B8C0FF30', padding: '2px 8px',
                      borderRadius: '999px', fontWeight: 600 }}>
                      Activa
                    </span>
                  </div>
                  <div style={s.clicksRow}>
                    🖱️ <strong>{totalClicks.toLocaleString()}</strong> clicks
                  </div>
                  <div style={s.progressLabel}>
                    <span>Evolution Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div style={s.progressBg}>
                    <div style={{ ...s.progressFill, width: `${progress}%` }} />
                  </div>
                  {currentStage < 5 && (
                    <div style={{ fontSize: '11px', color: '#78767B' }}>
                      {(nextRequired - totalClicks).toLocaleString()} clicks para evolucionar
                    </div>
                  )}
                </div>
                <button style={isOverlayVisible ? s.btnHide : s.btnShow} onClick={handlePlayPause}>
                  {isOverlayVisible ? `⏸ Ocultar` : `▶ Mostrar mascota`}
                </button>
              </div>

              {/* Panel otras mascotas */}
              <div style={s.otherPetsPanel}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#78767B',
                  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Otras mascotas
                </div>

                {otherPets.length === 0 ? (
                  <div style={s.emptyPetsMsg}>
                    <div style={{ fontSize: '32px' }}>🐣</div>
                    <div style={{ fontSize: '12px', color: '#78767B', lineHeight: 1.5 }}>
                      No tienes más mascotas.
                    </div>
                    <button
                      style={{ ...s.btnAccent, marginTop: '4px', fontSize: '12px',
                        padding: '6px 14px', borderRadius: '999px' }}
                      onClick={() => setNavPage('tienda')}
                    >
                      Comprar en Tienda
                    </button>
                  </div>
                ) : (
                  otherPets.map(pet => {
                    const slug = pet.pet?.slug ?? 'slime'
                    const emojis = PET_EMOJIS[slug] ?? PET_EMOJIS.slime
                    return (
                      <div key={pet.id}
                        style={{
                          ...s.otherPetChip,
                          opacity: switchingPet ? 0.6 : 1,
                        }}
                        onClick={() => switchPet(pet)}
                      >
                        <div style={s.otherPetEmoji}>{emojis[pet.current_stage - 1]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600,
                            color: '#1A1A2E' }}>
                            {pet.pet?.name ?? 'Mascota'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#78767B' }}>
                            Stage {pet.current_stage} · {pet.total_clicks.toLocaleString()} clicks
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#B8C0FF' }}>→</span>
                      </div>
                    )
                  })
                )}

                {otherPets.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#B8C0FF', textAlign: 'center',
                    marginTop: '8px', cursor: 'pointer' }}
                    onClick={() => setNavPage('tienda')}>
                    + Conseguir más mascotas
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── INVENTARIO ── */}
          {navPage === 'inventario' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A2E', margin: 0 }}>
                  Mi Inventario
                </h3>
              </div>

              {/* Tabs (solo pociones por ahora) */}
              <div style={{ display: 'flex', gap: '4px', background: '#fff',
                borderRadius: '12px', padding: '4px', border: '1px solid #E8E7F0',
                alignSelf: 'flex-start' }}>
                <button style={{ padding: '6px 16px', borderRadius: '9px', border: 'none',
                  background: '#B8C0FF', color: '#2D3A8C', fontSize: '13px',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Pociones
                </button>
              </div>

              {totalPotions === 0 ? (
                <div style={{ ...s.petCard, justifyContent: 'center',
                  flexDirection: 'column', textAlign: 'center', padding: '2.5rem' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎒</div>
                  <div style={{ color: '#78767B', fontSize: '14px', marginBottom: '12px' }}>
                    Tu inventario está vacío.
                  </div>
                  <button style={{ ...s.btnShow, alignSelf: 'center' }}
                    onClick={() => setNavPage('tienda')}>
                    Ir a la Tienda
                  </button>
                </div>
              ) : (
                <>
                  <div style={s.inventoryGrid}>
                    {potions.filter(p => p.quantity > 0).map(p => (
                      <div key={p.id} style={s.inventoryItem}>
                        <div style={s.inventoryItemIcon}>🧪</div>
                        <div style={s.inventoryItemName}>Poción</div>
                        <div style={s.inventoryItemQty}>{p.quantity}</div>
                      </div>
                    ))}
                    {/* Slots vacíos visuales */}
                    {Array.from({ length: Math.max(0, 8 - potions.filter(p => p.quantity > 0).length) }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ ...s.inventoryItem,
                        opacity: 0.35, cursor: 'default' }}>
                        <div style={{ fontSize: '28px', color: '#E8E7F0' }}>+</div>
                      </div>
                    ))}
                  </div>

                  <div style={s.inventoryUseBar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '20px' }}>🧪</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>
                          Usar Poción
                        </div>
                        <div style={{ fontSize: '11px', color: '#78767B' }}>
                          {isOverlayVisible
                            ? 'Activa una animación especial en tu mascota'
                            : 'Muestra tu mascota primero para usar pociones'}
                        </div>
                      </div>
                    </div>
                    <button
                      style={{
                        ...s.btnAccent,
                        opacity: isOverlayVisible ? 1 : 0.4,
                        cursor: isOverlayVisible ? 'pointer' : 'not-allowed',
                        padding: '8px 20px',
                      }}
                      onClick={usePotion}
                      disabled={!isOverlayVisible}
                    >
                      ✨ Usar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TIENDA ── */}
          {navPage === 'tienda' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {selectedProduct ? (
                /* ── DETALLE PRODUCTO ── */
                <>
                  <button style={s.backBtn} onClick={() => {
                    setSelectedProduct(null); setBuyQty(1); setShopMsg(null)
                  }}>
                    ← Volver a la Tienda
                  </button>

                  <div style={s.productDetail}>
                    <div style={s.productImageBox}>
                      {selectedProduct._type === 'potion' ? '🧪' : '🐾'}
                    </div>
                    <div style={s.productInfo}>
                      <span style={s.productTag}>
                        {selectedProduct._type === 'potion' ? 'CONSUMIBLE' : 'MASCOTA'}
                      </span>
                      <h2 style={s.productName}>{selectedProduct.name}</h2>
                      <div style={s.productPrice}>
                        <span style={{ fontSize: '18px' }}>🪙</span>
                        {selectedProduct.price.toLocaleString()} Coins
                      </div>
                      <p style={s.productDesc}>{selectedProduct.description}</p>

                      <div style={s.productEffects}>
                        <div style={{ fontSize: '13px', fontWeight: 600,
                          color: '#1A1A2E', marginBottom: '2px' }}>
                          Efectos
                        </div>
                        {selectedProduct._type === 'potion' ? (
                          <>
                            <div style={s.productEffectRow}>
                              🧪 Pack de {(selectedProduct as ShopPotion).pack_size} unidades
                            </div>
                            <div style={s.productEffectRow}>
                              ✨ Activa animación especial en tu mascota
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={s.productEffectRow}>
                              🐾 5 stages de evolución únicos
                            </div>
                            <div style={s.productEffectRow}>
                              🖱️ Crece con tus clicks del día a día
                            </div>
                          </>
                        )}
                      </div>

                      {shopMsg && (
                        <div style={{ padding: '8px 12px', borderRadius: '8px',
                          fontSize: '13px',
                          background: shopMsg.ok ? '#EDF5EF' : '#FFE5E5',
                          color: shopMsg.ok ? '#2D6B45' : '#8B2020',
                          border: `1px solid ${shopMsg.ok ? '#C8E7D1' : '#FFB3B3'}` }}>
                          {shopMsg.text}
                        </div>
                      )}

                      <div style={s.productQtyRow}>
                        {selectedProduct._type === 'potion' && (
                          <div style={s.qtyControl}>
                            <button style={s.qtyBtn}
                              onClick={() => setBuyQty(q => Math.max(1, q - 1))}>−</button>
                            <span style={s.qtyNum}>{buyQty}</span>
                            <button style={s.qtyBtn}
                              onClick={() => setBuyQty(q => q + 1)}>+</button>
                          </div>
                        )}
                        <button
                          style={{
                            ...s.btnBuyNow,
                            opacity: buying ? 0.6 : 1,
                            background: ownedPetIds.includes(selectedProduct.id)
                              ? '#E8E7F0' : undefined,
                            color: ownedPetIds.includes(selectedProduct.id)
                              ? '#78767B' : undefined,
                          }}
                          onClick={buyItem}
                          disabled={buying || ownedPetIds.includes(selectedProduct.id)}
                        >
                          {buying ? 'Comprando...'
                            : ownedPetIds.includes(selectedProduct.id)
                              ? '✅ Ya la tienes'
                              : `Comprar — ${(selectedProduct.price * buyQty).toLocaleString()} 🪙`}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ── GRID TIENDA ── */
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600,
                      color: '#1A1A2E', margin: 0 }}>
                      Tienda
                    </h3>
                  </div>

                  <div style={s.shopTabs}>
                    <button style={{ ...s.shopTab,
                      ...(shopTab === 'pociones' ? s.shopTabActive : {}) }}
                      onClick={() => setShopTab('pociones')}>
                      🧪 Pociones
                    </button>
                    <button style={{ ...s.shopTab,
                      ...(shopTab === 'mascotas' ? s.shopTabActive : {}) }}
                      onClick={() => setShopTab('mascotas')}>
                      🐾 Mascotas
                    </button>
                  </div>

                  {shopTab === 'pociones' && (
                    <div style={s.shopGrid}>
                      {shopPotions.map(p => (
                        <div key={p.id} style={s.shopItem}
                          onClick={() => {
                            setSelectedProduct({ ...p, _type: 'potion' })
                            setBuyQty(1)
                          }}>
                          <div style={s.shopItemIcon}>🧪</div>
                          <div style={s.shopItemName}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#78767B' }}>
                            x{p.pack_size} unidades
                          </div>
                          <div style={s.shopItemPrice}>
                            🪙 {p.price.toLocaleString()}
                          </div>
                          <button style={s.shopItemBuyBtn}>Ver detalles</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {shopTab === 'mascotas' && (
                    <div style={s.shopGrid}>
                      {shopPets.map(p => {
                        const owned = ownedPetIds.includes(p.id)
                        const emojis = PET_EMOJIS[p.slug] ?? PET_EMOJIS.slime
                        return (
                          <div key={p.id} style={{
                            ...s.shopItem,
                            opacity: owned ? 0.7 : 1,
                          }} onClick={() => {
                            setSelectedProduct({ ...p, _type: 'pet' })
                            setBuyQty(1)
                          }}>
                            <div style={s.shopItemIcon}>{emojis[0]}</div>
                            <div style={s.shopItemName}>{p.name}</div>
                            <div style={{ fontSize: '11px', color: '#78767B' }}>
                              5 stages
                            </div>
                            <div style={s.shopItemPrice}>
                              {owned ? '✅ Tuya' : `🪙 ${p.price.toLocaleString()}`}
                            </div>
                            <button style={{
                              ...s.shopItemBuyBtn,
                              background: owned ? '#E8E7F0' : undefined,
                              color: owned ? '#78767B' : undefined,
                            }}>
                              {owned ? 'Ya la tienes' : 'Ver detalles'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── AJUSTES ── */}
          {navPage === 'ajustes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A2E', margin: 0 }}>
                Ajustes
              </h3>
              <div style={s.petCard}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>
                    Cuenta
                  </div>
                  <div style={{ fontSize: '13px', color: '#78767B' }}>{profile?.email}</div>
                </div>
                <button style={{ ...s.btnSecondary, color: '#E05C5C',
                  borderColor: '#E05C5C30' }}
                  onClick={() => supabase.auth.signOut()}>
                  Cerrar sesión
                </button>
              </div>
              <div style={{ ...s.petCard, flexDirection: 'column',
                alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>
                  Sobre ClickPet
                </div>
                <div style={{ fontSize: '12px', color: '#78767B', lineHeight: 1.6 }}>
                  Versión 0.1.0 · Tu compañero digital tranquilo.
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}