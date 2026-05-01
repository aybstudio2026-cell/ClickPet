import { useEffect, useState } from 'react'
import { supabase, supabaseClickpet } from '../lib/supabase'
import { usePetStore } from '../store/petStore'

interface Potion {
  id: string
  name: string
  slug: string
  price: number
  pack_size: number
  description: string
}

interface PetShop {
  id: string
  name: string
  slug: string
  price: number
  description: string
  is_free: boolean
}

type Tab = 'mascotas' | 'pociones'

export default function Shop({ onClose }: { onClose: () => void }) {
  const { profile, potions, setPotions, updateBalance } = usePetStore()
  const [tab, setTab] = useState<Tab>('mascotas')
  const [shopPotions, setShopPotions] = useState<Potion[]>([])
  const [shopPets, setShopPets] = useState<PetShop[]>([])
  const [ownedPetIds, setOwnedPetIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    loadShop()
  }, [])

  async function loadShop() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [potionsRes, petsRes, ownedRes] = await Promise.all([
      supabaseClickpet.from('potions').select('*').order('price'),
      supabaseClickpet.from('pets').select('*').eq('is_free', false).order('price'),
      supabaseClickpet.from('user_pets').select('pet_id').eq('user_id', user.id),
    ])

    if (potionsRes.data) setShopPotions(potionsRes.data)
    if (petsRes.data) setShopPets(petsRes.data)
    if (ownedRes.data) setOwnedPetIds(ownedRes.data.map(p => p.pet_id))

    setLoading(false)
  }

  function showMsg(text: string, ok: boolean) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  async function buyPotion(potion: Potion) {
    if (!profile) return
    if (profile.balance < potion.price) {
      showMsg('❌ Balance insuficiente. Recarga en la tienda.', false)
      return
    }
    setBuying(potion.id)
    try {
      const { error } = await supabaseClickpet.rpc('purchase_potions', {
        p_potion_id: potion.id,
      })
      if (error) throw error

      updateBalance(profile.balance - potion.price)

      const existing = potions.find(p => p.potion_id === potion.id)
      if (existing) {
        setPotions(potions.map(p =>
          p.potion_id === potion.id
            ? { ...p, quantity: p.quantity + potion.pack_size }
            : p
        ))
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setPotions([...potions, {
            id: crypto.randomUUID(),
            user_id: user.id,
            potion_id: potion.id,
            quantity: potion.pack_size,
          }])
        }
      }
      showMsg(`✅ ¡Compraste ${potion.pack_size} pociones!`, true)
    } catch {
      showMsg('❌ Error al comprar. Intenta de nuevo.', false)
    } finally {
      setBuying(null)
    }
  }

  async function buyPet(pet: PetShop) {
    if (!profile) return
    if (profile.balance < pet.price) {
      showMsg('❌ Balance insuficiente. Recarga en la tienda.', false)
      return
    }
    if (ownedPetIds.includes(pet.id)) {
      showMsg('Ya tienes esta mascota.', false)
      return
    }

    setBuying(pet.id)
    try {
      const { error } = await supabaseClickpet.rpc('purchase_pet', {
        p_pet_id: pet.id,
      })
      if (error) throw error

      updateBalance(profile.balance - pet.price)
      setOwnedPetIds(prev => [...prev, pet.id])
      showMsg(`✅ ¡${pet.name} es tuyo ahora!`, true)
    } catch (e: any) {
      showMsg(e?.message?.includes('Ya tienes') ? 'Ya tienes esta mascota.' : '❌ Error al comprar.', false)
    } finally {
      setBuying(null)
    }
  }

  const getPotionQty = (potionId: string) =>
    potions.find(p => p.potion_id === potionId)?.quantity ?? 0

  const petEmojis: Record<string, string> = {
    dragon: '🐉',
    fairy: '🧚',
    slime: '🟢',
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <span style={s.title}>🛒 Tienda</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Balance */}
        <div style={s.balanceRow}>
          💰 Balance:{' '}
          <strong style={{ color: '#4ade80' }}>
            {profile?.balance ?? 0} monedas
          </strong>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button
            style={{ ...s.tab, ...(tab === 'mascotas' ? s.tabActive : {}) }}
            onClick={() => setTab('mascotas')}
          >
            🐾 Mascotas
          </button>
          <button
            style={{ ...s.tab, ...(tab === 'pociones' ? s.tabActive : {}) }}
            onClick={() => setTab('pociones')}
          >
            🧪 Pociones
          </button>
        </div>

        {/* Mensaje */}
        {msg && (
          <div style={{
            ...s.msg,
            background: msg.ok ? '#14532d' : '#450a0a',
            borderColor: msg.ok ? '#4ade80' : '#f87171',
            color: msg.ok ? '#4ade80' : '#f87171',
          }}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <p style={s.empty}>Cargando tienda...</p>
        ) : (
          <div style={s.list}>

            {/* Tab mascotas */}
            {tab === 'mascotas' && shopPets.map(pet => {
              const owned = ownedPetIds.includes(pet.id)
              return (
                <div key={pet.id} style={s.card}>
                  <div style={s.petIcon}>
                    {petEmojis[pet.slug] ?? '🐾'}
                  </div>
                  <div style={s.itemInfo}>
                    <div style={s.itemName}>{pet.name}</div>
                    <div style={s.itemDesc}>{pet.description}</div>
                    <div style={s.itemMeta}>
                      <span style={{ fontSize: 11, color: '#4ade80' }}>
                        5 stages de evolución
                      </span>
                    </div>
                  </div>
                  <button
                    style={{
                      ...s.buyBtn,
                      background: owned
                        ? '#374151'
                        : (profile?.balance ?? 0) >= pet.price
                          ? '#4ade80' : '#374151',
                      cursor: owned ? 'default' : 'pointer',
                    }}
                    onClick={() => !owned && buyPet(pet)}
                    disabled={buying === pet.id || owned}
                  >
                    {buying === pet.id
                      ? '...'
                      : owned
                        ? '✅ Tuya'
                        : `${pet.price} 💰`}
                  </button>
                </div>
              )
            })}

            {tab === 'mascotas' && shopPets.length === 0 && (
              <p style={s.empty}>No hay mascotas disponibles por ahora.</p>
            )}

            {/* Tab pociones */}
            {tab === 'pociones' && shopPotions.map(potion => (
              <div key={potion.id} style={s.card}>
                <div style={s.petIcon}>🧪</div>
                <div style={s.itemInfo}>
                  <div style={s.itemName}>{potion.name}</div>
                  <div style={s.itemDesc}>{potion.description}</div>
                  <div style={s.itemMeta}>
                    <span style={{ fontSize: 11, color: '#4ade80' }}>
                      📦 x{potion.pack_size}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Tienes: {getPotionQty(potion.id)}
                    </span>
                  </div>
                </div>
                <button
                  style={{
                    ...s.buyBtn,
                    opacity: buying === potion.id ? 0.6 : 1,
                    background: (profile?.balance ?? 0) >= potion.price
                      ? '#4ade80' : '#374151',
                  }}
                  onClick={() => buyPotion(potion)}
                  disabled={buying === potion.id}
                >
                  {buying === potion.id ? '...' : `${potion.price} 💰`}
                </button>
              </div>
            ))}

          </div>
        )}

        <p style={s.hint}>
          💡 Recarga monedas en nuestra tienda online
        </p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#16213e', borderRadius: 16, padding: '1.25rem',
    width: '90%', maxWidth: 400, border: '1px solid #0f3460',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
    maxHeight: '85vh', overflowY: 'auto',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 600, color: '#e2e8f0' },
  closeBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 },
  balanceRow: { fontSize: 13, color: '#94a3b8' },
  tabs: { display: 'flex', gap: 8 },
  tab: {
    flex: 1, padding: '8px', borderRadius: 8,
    border: '1px solid #0f3460', background: 'transparent',
    color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 500,
  },
  tabActive: { background: '#0f3460', color: '#e2e8f0', borderColor: '#4ade80' },
  msg: { padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: {
    background: '#1a1a2e', borderRadius: 12, padding: '0.75rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    border: '1px solid #0f3460',
  },
  petIcon: { fontSize: 30, flexShrink: 0, width: 40, textAlign: 'center' },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  itemName: { fontSize: 13, fontWeight: 500, color: '#e2e8f0' },
  itemDesc: { fontSize: 11, color: '#64748b', lineHeight: 1.4 },
  itemMeta: { display: 'flex', gap: 8, marginTop: 2 },
  buyBtn: {
    padding: '6px 12px', borderRadius: 8, border: 'none',
    color: '#1a1a2e', fontWeight: 600, fontSize: 12,
    cursor: 'pointer', flexShrink: 0, minWidth: 70, textAlign: 'center',
  },
  empty: { fontSize: 13, color: '#64748b', textAlign: 'center', padding: '1rem 0' },
  hint: { fontSize: 11, color: '#64748b', textAlign: 'center' },
}