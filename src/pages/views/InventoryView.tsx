import { useState } from 'react'
import { supabaseClickpet } from '../../lib/supabase'
import { usePetStore, calcStage } from '../../store/petStore'
import { inventoryStyles as iv } from '../../styles/dashboard/inventory'
import { petCardStyles as pc } from '../../styles/dashboard/petCard'
import { layoutStyles as l } from '../../styles/dashboard/layout'

interface Props {
  onGoShop: () => void
}

export default function InventoryView({ onGoShop }: Props) {
  const { potions, setPotions, activePet, isOverlayVisible } = usePetStore()
  const [selectedPotion, setSelectedPotion] = useState<string | null>(null)
  const [using, setUsing] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const activePotions = potions.filter(p => p.quantity > 0)
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

      // Actualizar inventario local
      setPotions(potions.map(p =>
        p.potion_id === selected.potion_id
          ? { ...p, quantity: p.quantity - 1 }
          : p
      ))

      const bonus = selected.potion?.click_bonus ?? 0

      if (bonus > 0) {
        // Sincronizar clicks a Supabase
        await supabaseClickpet.rpc('sync_clicks', {
          p_user_pet_id: activePet.id,
          p_clicks: bonus,
        })

        // Actualizar store local para reflejar en dashboard
        usePetStore.setState((state) => {
          if (!state.activePet) return {}
          const newTotal = state.activePet.total_clicks + bonus
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

        // Notificar al overlay si está visible
        if (isOverlayVisible) {
          const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
          const overlay = await WebviewWindow.getByLabel('overlay')
          if (overlay) await overlay.emit('use-potion', { bonus })
        }

        showMsg(`✨ ¡+${bonus.toLocaleString()} clicks aplicados!`, true)
      } else {
        if (isOverlayVisible) {
          const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
          const overlay = await WebviewWindow.getByLabel('overlay')
          if (overlay) await overlay.emit('use-potion', { bonus: 0 })
        }
        showMsg('✨ ¡Poción usada!', true)
      }

      if (selected.quantity - 1 <= 0) setSelectedPotion(null)

    } catch {
      showMsg('❌ Error al usar la poción.', false)
    } finally {
      setUsing(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={l.sectionTitle}>Mi Inventario</h3>

      <div style={iv.tabsRow}>
        <button style={iv.tabActive}>🧪 Pociones</button>
      </div>

      {totalPotions === 0 ? (
        <div style={{ ...pc.petCard, justifyContent: 'center',
          flexDirection: 'column', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎒</div>
          <div style={{ color: '#78767B', fontSize: '14px', marginBottom: '12px' }}>
            Tu inventario está vacío.
          </div>
          <button style={{ ...pc.btnShow, alignSelf: 'center' }} onClick={onGoShop}>
            Ir a la Tienda
          </button>
        </div>
      ) : (
        <>
          <div style={iv.inventoryGrid}>
            {activePotions.map(p => {
              const isSelected = selectedPotion === p.potion_id
              const bonus = p.potion?.click_bonus ?? 0
              return (
                <div key={p.potion_id}
                  style={{
                    ...iv.inventoryItem,
                    ...(isSelected ? iv.inventoryItemSelected : {}),
                    border: isSelected ? '2px solid #B8C0FF' : undefined,
                  }}
                  onClick={() => setSelectedPotion(isSelected ? null : p.potion_id)}
                >
                  <div style={iv.inventoryItemIcon}>🧪</div>
                  <div style={iv.inventoryItemName}>
                    {p.potion?.name ?? 'Poción'}
                  </div>
                  {bonus > 0 && (
                    <div style={{ fontSize: '10px', color: '#3D4B9E',
                      fontWeight: 700, background: '#B8C0FF30',
                      padding: '1px 6px', borderRadius: '999px' }}>
                      +{bonus.toLocaleString()} clicks
                    </div>
                  )}
                  <div style={iv.inventoryItemQty}>{p.quantity}</div>
                </div>
              )
            })}
            {Array.from({ length: Math.max(0, 8 - activePotions.length) }).map((_, i) => (
              <div key={`e-${i}`} style={{ ...iv.inventoryItem,
                opacity: 0.3, cursor: 'default' }}>
                <div style={{ fontSize: '24px', color: '#E8E7F0' }}>+</div>
              </div>
            ))}
          </div>

          {msg && (
            <div style={{ padding: '8px 14px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 600, textAlign: 'center',
              background: msg.ok ? '#EDF5EF' : '#FFE5E5',
              color: msg.ok ? '#2D6B45' : '#8B2020',
              border: `1px solid ${msg.ok ? '#C8E7D1' : '#FFB3B3'}` }}>
              {msg.text}
            </div>
          )}

          <div style={iv.inventoryUseBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '24px' }}>{selected ? '🧪' : '🎒'}</div>
              <div>
                {selected ? (
                  <>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>
                      {selected.potion?.name ?? 'Poción seleccionada'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#78767B' }}>
                      {(selected.potion?.click_bonus ?? 0) > 0
                        ? `Suma +${(selected.potion?.click_bonus ?? 0).toLocaleString()} clicks`
                        : 'Activa una animación especial'}
                      {' · '}{selected.quantity} disponibles
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>
                      Selecciona una poción
                    </div>
                    <div style={{ fontSize: '11px', color: '#78767B' }}>
                      Toca una poción del inventario para usarla
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              style={{
                ...l.btnAccent, padding: '9px 22px',
                opacity: (selected && !using) ? 1 : 0.4,
                cursor: (selected && !using) ? 'pointer' : 'not-allowed',
                fontSize: '13px',
              }}
              onClick={usePotion}
              disabled={!selected || using}
            >
              {using ? '...' : '✨ Usar'}
            </button>
          </div>

          {!isOverlayVisible && selected && (selected.potion?.click_bonus ?? 0) === 0 && (
            <div style={{ fontSize: '11px', color: '#78767B',
              textAlign: 'center', marginTop: '-8px' }}>
              💡 Muestra tu mascota para ver la animación
            </div>
          )}
        </>
      )}
    </div>
  )
}