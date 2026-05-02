import { usePetStore } from '../../store/petStore'
import { inventoryStyles as iv } from '../../styles/dashboard/inventory'
import { petCardStyles as pc } from '../../styles/dashboard/petCard'
import { layoutStyles as l } from '../../styles/dashboard/layout'

interface Props {
  onUsePotion: () => void
  onGoShop: () => void
}

export default function InventoryView({ onUsePotion, onGoShop }: Props) {
  const { potions, isOverlayVisible } = usePetStore()
  const totalPotions = potions.reduce((sum, p) => sum + p.quantity, 0)
  const activePotions = potions.filter(p => p.quantity > 0)

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
            {activePotions.map(p => (
              <div key={p.id} style={iv.inventoryItem}>
                <div style={iv.inventoryItemIcon}>🧪</div>
                <div style={iv.inventoryItemName}>Poción</div>
                <div style={iv.inventoryItemQty}>{p.quantity}</div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 8 - activePotions.length) }).map((_, i) => (
              <div key={`e-${i}`} style={{ ...iv.inventoryItem, opacity: 0.3, cursor: 'default' }}>
                <div style={{ fontSize: '24px', color: '#E8E7F0' }}>+</div>
              </div>
            ))}
          </div>

          <div style={iv.inventoryUseBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '20px' }}>🧪</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>
                  Usar Poción
                </div>
                <div style={{ fontSize: '11px', color: '#78767B' }}>
                  {isOverlayVisible
                    ? 'Activa una animación especial en tu mascota'
                    : 'Muestra tu mascota primero'}
                </div>
              </div>
            </div>
            <button style={{
              ...l.btnAccent, padding: '8px 20px',
              opacity: isOverlayVisible ? 1 : 0.4,
              cursor: isOverlayVisible ? 'pointer' : 'not-allowed',
            }} onClick={onUsePotion} disabled={!isOverlayVisible}>
              ✨ Usar
            </button>
          </div>
        </>
      )}
    </div>
  )
}