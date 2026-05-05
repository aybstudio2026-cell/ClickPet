import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { supabaseClickpet } from '../../lib/supabase'
import { usePetStore, calcStage } from '../../store/petStore'
import { inventoryStyles as iv } from '../../styles/dashboard/inventory'
import { getCached, setCached } from '../../lib/imageCache'
import { FlaskConical } from 'lucide-react'
import { layoutStyles as l } from '../../styles/dashboard/layout'

interface Props {
  onGoShop: () => void
}

const imageCache = new Map<string, string>()

function PotionImage({ slug, size = 52 }: { slug: string; size?: number }) {
  const cacheKey = `potion_${slug}`
  const [src, setSrc] = useState<string | null>(() => getCached(cacheKey))

  useEffect(() => {
    if (getCached(cacheKey)) {
      setSrc(getCached(cacheKey))
      return
    }

    // Si no está en cache, intentar cargar desde disco
    invoke<string>('get_potion_path', { slug })
      .then(async path => {
        if (!path) return
        const b64 = await invoke<string>('read_image_as_base64', { path })
        if (b64) {
          setCached(cacheKey, b64)
          setSrc(b64)
        }
      }).catch(() => {})
  }, [slug])

  // Polling para cuando la imagen se descarga después de comprar
  useEffect(() => {
    if (src) return // ya tiene imagen, no necesita polling
    const interval = setInterval(() => {
      const cached = getCached(cacheKey)
      if (cached) {
        setSrc(cached)
        clearInterval(interval)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [slug, src])

  if (src) return (
    <img src={src} style={{ width: size, height: size, objectFit: 'contain' }} />
  )
  return <div style={{ fontSize: `${size * 0.75}px`, lineHeight: 1 }}>🧪</div>
}

export default function InventoryView({ onGoShop }: Props) {
  const { potions, setPotions, activePet, isOverlayVisible } = usePetStore()
  const [selectedPotion, setSelectedPotion] = useState<string | null>(null)
  const [using, setUsing] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const activePotions = potions
    .filter(p => p.quantity > 0)
    .sort((a, b) => (a.potion?.click_bonus ?? 0) - (b.potion?.click_bonus ?? 0))

  const totalPotions = activePotions.reduce((sum, p) => sum + p.quantity, 0)
  const selected = activePotions.find(p => p.potion_id === selectedPotion)

  function showMsg(text: string, ok: boolean) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 2500)
  }

  async function usePotion() {
    if (!selected || !activePet) return
    setUsing(true)
    try {
      const { error } = await supabaseClickpet.rpc('use_potion', {
        p_user_pet_id: activePet.id,
        p_potion_id: selected.potion_id,
      })
      if (error) throw error

      setPotions(potions.map(p =>
        p.potion_id === selected.potion_id
          ? { ...p, quantity: p.quantity - 1 } : p
      ))

      const bonus = selected.potion?.click_bonus ?? 0

      if (bonus > 0) {
        await supabaseClickpet.rpc('sync_clicks', {
          p_user_pet_id: activePet.id,
          p_clicks: bonus,
        })
        usePetStore.setState((state) => {
          if (!state.activePet) return {}
          const newTotal = state.activePet.total_clicks + bonus
          const oldStage = state.activePet.current_stage
          const newStage = calcStage(newTotal)
          return {
            justEvolved: newStage > oldStage,
            activePet: { ...state.activePet, total_clicks: newTotal, current_stage: newStage },
          }
        })
        
        if (isOverlayVisible) {
          const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
          const overlay = await WebviewWindow.getByLabel('overlay')
          if (overlay) await overlay.emit('use-potion', { bonus })
        }
        showMsg(`✨ +${bonus.toLocaleString()} clicks sumados!`, true)
      } else {
        if (isOverlayVisible) {
          const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
          const overlay = await WebviewWindow.getByLabel('overlay')
          if (overlay) await overlay.emit('use-potion', { bonus: 0 })
        }
        showMsg('✨ Poción usada!', true)
      }

      if (selected.quantity - 1 <= 0) setSelectedPotion(null)
    } catch {
      showMsg('❌ Error al usar la poción.', false)
    } finally {
      setUsing(false)
    }
  }

  if (totalPotions === 0) return (
    <div style={iv.container}>
     <h3 style={l.sectionTitle}>Mi Inventario</h3>
      <div style={iv.emptyBox}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎒</div>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 20px', fontWeight: 500 }}>
          Tu inventario está vacío. <br/>¡Consigue pociones en la tienda!
        </p>
        <button style={iv.btnPrimary} onClick={onGoShop}>Ir a la Tienda</button>
      </div>
    </div>
  )

  return (
    <div style={iv.container}>
      {/* Header */}
      <div style={iv.header}>
        <h3 style={l.sectionTitle}>Mi Inventario</h3>
        <span style={iv.totalBadge}>{totalPotions} objetos</span>
      </div>

      <div style={iv.tabsRow}>
        <button style={iv.tabActive}>
          <FlaskConical
            size={13}
            strokeWidth={2}
            color="#2D3A8C"
            style={{ marginRight: '6px', verticalAlign: 'middle' }}
          />
          Pociones
        </button>
      </div>

      {/* Grid */}
      <div style={iv.inventoryGrid}>
        {activePotions.map(p => {
          const isSelected = selectedPotion === p.potion_id
          const bonus = p.potion?.click_bonus ?? 0
          return (
            <div
              key={p.potion_id}
              style={{
                ...iv.inventoryItem,
                ...(isSelected ? iv.inventoryItemActive : {}),
              }}
              onClick={() => setSelectedPotion(isSelected ? null : p.potion_id)}
            >
              <div style={iv.qtyBadge}>{p.quantity}</div>
              <PotionImage slug={p.potion?.slug ?? p.potion_id} />
              <p style={iv.inventoryItemName}>{p.potion?.name ?? 'Poción'}</p>
              {bonus > 0 && (
                <div style={iv.bonusPill}>
                  +{bonus >= 1000 ? `${bonus / 1000}K` : bonus}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mensaje feedback */}
      {msg && (
        <div style={{
          ...iv.msgBanner,
          background: msg.ok ? 'var(--color-background-success)' : 'var(--color-background-danger)',
          color: msg.ok ? 'var(--color-text-success)' : 'var(--color-text-danger)',
          border: `1px solid ${msg.ok ? 'var(--color-border-success)' : 'var(--color-border-danger)'}`,
        }}>
          {msg.text}
        </div>
      )}

      {/* Panel de uso */}
      <div style={iv.usePanel}>
        {selected ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <PotionImage slug={selected.potion?.slug ?? selected.potion_id} size={44} />
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {selected.potion?.name}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {(selected.potion?.click_bonus ?? 0) > 0
                    ? `Otorga ${selected.potion?.click_bonus.toLocaleString()} clicks`
                    : 'Efecto estético especial'}
                </p>
              </div>
            </div>
            <button
              style={{ ...iv.btnPrimary, opacity: using ? 0.6 : 1 }}
              onClick={usePotion}
              disabled={using}
            >
              {using ? 'Usando...' : 'Usar'}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: '20px' }}>💡</div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
              Selecciona un objeto para ver sus detalles
            </p>
          </div>
        )}
      </div>
    </div>
  )
}