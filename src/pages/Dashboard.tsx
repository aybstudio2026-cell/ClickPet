import { useEffect, useState } from 'react'
import { supabase, supabaseClickpet } from '../lib/supabase'
import { usePetStore } from '../store/petStore'
import { invoke } from '@tauri-apps/api/core'
import { useClickSync } from '../hooks/useClickSync'
import { usePetData, PET_STAGE_NAMES } from '../hooks/usePetData'
import { layoutStyles as l } from '../styles/dashboard/layout'
import UpdateChecker from '../components/UpdateChecker'
import DashboardView from './views/DashboardView'
import PetsView from './views/PetsView'
import InventoryView from './views/InventoryView'
import ShopView from './views/ShopView'
import SettingsView from './views/SettingsView'
import {
  LayoutDashboard, PawPrint, FlaskConical,
  ShoppingCart, Settings, LogOut, Minus, X,
} from 'lucide-react'
import logo from '../assets/logo.png'

type NavPage = 'dashboard' | 'mascotas' | 'inventario' | 'tienda' | 'ajustes'

const NAV_ITEMS = [
  { id: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard'    },
  { id: 'mascotas',   icon: PawPrint,        label: 'Mis Mascotas' },
  { id: 'inventario', icon: FlaskConical,    label: 'Mi Inventario'},
  { id: 'tienda',     icon: ShoppingCart,    label: 'Tienda'       },
  { id: 'ajustes',    icon: Settings,        label: 'Ajustes'      },
]


  interface DashboardProps {
    openTutorial: () => void
  }

export default function Dashboard({ openTutorial }: DashboardProps) {
  const {
    profile, activePet,
    isOverlayVisible, setOverlayVisible,
    justEvolved, setJustEvolved,
    potions, setPotions,
  } = usePetStore()

  const [navPage, setNavPage] = useState<NavPage>('dashboard')
  const [evolveMsg, setEvolveMsg] = useState<string | null>(null)
  const [switchingPet, setSwitchingPet] = useState(false)
  

  const {
    loading, ownedPets, shopPotions, shopPets,
    ownedPetIds, setOwnedPetIds, activePetSlug,
    loadData, switchPet, refreshAfterPurchase,
  } = usePetData()

  useClickSync()

  useEffect(() => { loadData() }, [])

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

  async function handleToggleOverlay() {
    if (!activePet) return
    try {
      if (isOverlayVisible) {
        const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
        const overlay = await WebviewWindow.getByLabel('overlay')
        if (overlay) {
          await overlay.emit('force-sync', {})
          await new Promise(r => setTimeout(r, 500))
        }
        await invoke('hide_overlay')
        setOverlayVisible(false)
      } else {
        const size = localStorage.getItem('clickpet_overlay_size') ?? 'medium'
        await invoke('show_overlay', { userPetId: activePet.id, size })
        setOverlayVisible(true)
      }
    } catch (err) { console.error(err) }
  }
  
  async function handleSwitchPet(pet: typeof ownedPets[0]) {
    if (pet.id === activePet?.id || switchingPet) return
    setSwitchingPet(true)
    await switchPet(pet, isOverlayVisible)
    setSwitchingPet(false)
  }

  async function handleUsePotion() {
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

  const petName = ownedPets.find(p => p.id === activePet?.id)?.pet?.name ?? 'Slime'
  const displayName = (profile as any)?.username || (profile as any)?.full_name
    || profile?.email?.split('@')[0] || 'Trainer'

  const activePetBaseUrl = ownedPets.find(p => p.id === activePet?.id)?.pet?.asset_base_url

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#F4F3FA', color: '#78767B', fontSize: 14,
      fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      Cargando...
    </div>
  )

  return (
    <div style={l.page}>
      {evolveMsg && <div style={l.evolveToast}>{evolveMsg}</div>}

      {/* Sidebar */}
      <aside style={l.sidebar} data-tauri-drag-region>
        {/* Logo */}
        <div style={l.sidebarLogo}>
          <div style={l.sidebarLogoIcon}>
            <img src={logo} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
          <span style={l.sidebarLogoText}>ClickPet</span>
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = navPage === item.id
          return (
            <button
              key={item.id}
              style={{
                ...l.navItem,
                ...(isActive ? l.navItemActive : {}),
              }}
              onClick={() => setNavPage(item.id as NavPage)}
            >
              <Icon
                size={16}
                strokeWidth={2}
                color={isActive ? '#3D4B9E' : '#78767B'}
                style={{ flexShrink: 0 }}
              />
              {item.label}
            </button>
          )
        })}

        <div style={l.navSpacer} />
        <div style={l.navDivider} />

        <button
          style={{ ...l.navItem, color: '#E05C5C' }}
          onClick={() => supabase.auth.signOut()}
        >
          <LogOut size={16} strokeWidth={2} color="#E05C5C" style={{ flexShrink: 0 }} />
          Cerrar sesión
        </button>
      </aside>

      {/* Main */}
      <main style={l.main}>
        <UpdateChecker />
        <div style={l.header}>
          <div style={l.headerLeft}>
            <h2 style={l.welcomeText}>Welcome back, {displayName}!</h2>
            <p style={l.welcomeSub}>
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Balance */}
            <div style={l.balancePill}>
              <div style={l.balanceIcon}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M9 1L2 9.5H7.5L7 15L14 6.5H8.5L9 1Z"
                    fill="#4CAF82" stroke="#4CAF82" strokeWidth="0.5"
                    strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={l.balanceLabel}>Balance</div>
                <div style={l.balanceAmount}>
                  {(profile?.balance ?? 0).toLocaleString()} COINS
                </div>
              </div>
            </div>

            {/* Botones de ventana */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                style={winBtn}
                title="Minimizar"
                onClick={async () => {
                  const { Window } = await import('@tauri-apps/api/window')
                  Window.getCurrent().minimize()
                }}
              >
                <Minus size={12} strokeWidth={2.5} color="#78767B" />
              </button>
              <button
                style={{ ...winBtn, background: '#FFE5E5' }}
                title="Cerrar"
                onClick={() => invoke('close_app')}
              >
                <X size={12} strokeWidth={2.5} color="#E05C5C" />
              </button>
            </div>
          </div>
        </div>

        <div style={l.content}>
          {navPage === 'dashboard' && (
  <DashboardView
    activePetSlug={activePetSlug}
    activePetBaseUrl={activePetBaseUrl}   // ← nuevo
    petName={petName}
    onToggleOverlay={handleToggleOverlay}
    onGoShop={() => setNavPage('tienda')}
    onUsePotion={handleUsePotion}
  />
)}
          {navPage === 'mascotas' && (
            <PetsView
              activePetSlug={activePetSlug}
              petName={petName}
              ownedPets={ownedPets}
              switchingPet={switchingPet}
              onToggleOverlay={handleToggleOverlay}
              onSwitchPet={handleSwitchPet}
              onGoShop={() => setNavPage('tienda')}
            />
          )}
          {navPage === 'inventario' && (
            <InventoryView
              onGoShop={() => setNavPage('tienda')}
            />
          )}
          {navPage === 'tienda' && (
            <ShopView
              shopPotions={shopPotions}
              shopPets={shopPets}
              ownedPetIds={ownedPetIds}
              setOwnedPetIds={setOwnedPetIds}
              onPurchased={refreshAfterPurchase}
            />
          )}
          {navPage === 'ajustes' && (
            <SettingsView openTutorial={openTutorial} />
          )}
        </div>
      </main>
    </div>
  )
}

const winBtn: React.CSSProperties = {
  width: '28px', height: '28px',
  borderRadius: '8px', border: 'none',
  background: '#F4F3FA', cursor: 'pointer',
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', flexShrink: 0,
  transition: 'background 0.15s',
}