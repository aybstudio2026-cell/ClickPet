import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { supabase, supabaseClickpet } from '../../lib/supabase'
import { usePetStore } from '../../store/petStore'
import { shopStyles as sh } from '../../styles/dashboard/shop'
import { layoutStyles as l } from '../../styles/dashboard/layout'
import { ShopItem, ShopPotion, ShopPet, PET_EMOJIS } from '../../hooks/usePetData'
import { useAssets } from '../../hooks/useAssets'
import { useLocalImage } from '../../hooks/useLocalImage'

interface Props {
  shopPotions: ShopPotion[]
  shopPets: ShopPet[]
  ownedPetIds: string[]
  setOwnedPetIds: (ids: string[]) => void
  onPurchased: () => void
}

export default function ShopView({
  shopPotions, shopPets, ownedPetIds, setOwnedPetIds, onPurchased,
}: Props) {
  const { profile, potions, setPotions } = usePetStore()
  const [shopTab, setShopTab] = useState<'pociones' | 'mascotas'>('pociones')
  const [selected, setSelected] = useState<ShopItem | null>(null)
  const [qty, setQty] = useState(1)
  const [buying, setBuying] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const { ensurePetAssets } = useAssets()

  function showMsg(text: string, ok: boolean) {
    setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000)
  }

  function PetShopImage({ slug }: { slug: string }) {
    const src = useLocalImage(slug, 1, 'idle')
    if (src) return <img src={src} style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
    return <div style={{ fontSize: '42px' }}>{PET_EMOJIS[slug]?.[0] ?? '🐾'}</div>
  }

  function PotionShopImage({ slug }: { slug: string }) {
    const [src, setSrc] = useState<string | null>(null)
    
    useEffect(() => {
      invoke<string>('get_potion_path', { slug })
        .then(async path => {
          if (!path) return
          const base64 = await invoke<string>('read_image_as_base64', { path })
          if (base64) setSrc(base64)
        })
        .catch(() => {})
    }, [slug])
    
    if (src) return <img src={src} style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
    return <div style={{ fontSize: '42px' }}>🧪</div>
  }

  async function buyItem() {
    if (!selected || !profile) return
    const total = selected.price * qty
    if (profile.balance < total) { showMsg('❌ Balance insuficiente.', false); return }
    setBuying(true)
    try {
      if (selected._type === 'potion') {
        for (let i = 0; i < qty; i++) {
          const { error } = await supabaseClickpet.rpc('purchase_potions', { p_potion_id: selected.id })
          if (error) throw error
        }
        const addedQty = (selected as ShopPotion).pack_size * qty
        const existing = potions.find(p => p.potion_id === selected.id)
        if (existing) {
          setPotions(potions.map(p => p.potion_id === selected.id
            ? { ...p, quantity: p.quantity + addedQty } : p))
        } else {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) setPotions([...potions, {
            id: crypto.randomUUID(), user_id: user.id,
            potion_id: selected.id, quantity: addedQty,
          }])
        }
        showMsg('✅ ¡Comprado!', true)
      }

      if (selected._type === 'pet') {
        const { error } = await supabaseClickpet.rpc('purchase_pet', { p_pet_id: selected.id })
        if (error) throw error
        setOwnedPetIds([...ownedPetIds, selected.id])
        
        // ← DESCARGA al comprar mascota nueva
        if ((selected as ShopPet).asset_zip_url) {
          ensurePetAssets(
            selected.slug, 
            (selected as ShopPet).asset_zip_url!,
            selected.id 
          )
        }
        
        showMsg(`✅ ¡${selected.name} es tuyo!`, true)
      }

      onPurchased()
    } catch (e: any) {
      showMsg(e?.message ?? '❌ Error al comprar.', false)
    } finally { setBuying(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {selected ? (
        <>
          <button style={sh.backBtn} onClick={() => { setSelected(null); setQty(1); setMsg(null) }}>
            ← Volver a la Tienda
          </button>
          <div style={sh.productDetail}>
            <div style={sh.productImageBox}>
              {selected._type === 'potion'
                ? <PotionShopImage slug={selected.slug} />
                : <PetShopImage slug={selected.slug} />
              }
            </div>
            <div style={sh.productInfo}>
              <span style={sh.productTag}>
                {selected._type === 'potion' ? 'CONSUMIBLE' : 'MASCOTA'}
              </span>
              <h2 style={sh.productName}>{selected.name}</h2>
              <div style={sh.productPrice}>
                <span>🪙</span> {selected.price.toLocaleString()} Coins
              </div>
              <p style={sh.productDesc}>{selected.description}</p>
              <div style={sh.productEffects}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E', marginBottom: '2px' }}>
                  Efectos
                </div>
                {selected._type === 'potion' ? (
                  <>
                    <div style={sh.productEffectRow}>🧪 Pack de {(selected as ShopPotion).pack_size} unidades</div>
                    <div style={sh.productEffectRow}>✨ Activa animación especial en tu mascota</div>
                  </>
                ) : (
                  <>
                    <div style={sh.productEffectRow}>🐾 5 stages de evolución únicos</div>
                    <div style={sh.productEffectRow}>🖱️ Crece con tus clicks del día a día</div>
                  </>
                )}
              </div>

              {msg && (
                <div style={{
                  ...sh.shopMsg,
                  background: msg.ok ? '#EDF5EF' : '#FFE5E5',
                  color: msg.ok ? '#2D6B45' : '#8B2020',
                  borderColor: msg.ok ? '#C8E7D1' : '#FFB3B3',
                }}>
                  {msg.text}
                </div>
              )}

              <div style={sh.productQtyRow}>
                {selected._type === 'potion' && (
                  <div style={sh.qtyControl}>
                    <button style={sh.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span style={sh.qtyNum}>{qty}</span>
                    <button style={sh.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
                  </div>
                )}
                <button style={{
                  ...sh.btnBuyNow,
                  opacity: buying ? 0.6 : 1,
                  background: ownedPetIds.includes(selected.id) ? '#E8E7F0' : undefined,
                  color: ownedPetIds.includes(selected.id) ? '#78767B' : undefined,
                }} onClick={buyItem} disabled={buying || ownedPetIds.includes(selected.id)}>
                  {buying ? 'Comprando...'
                    : ownedPetIds.includes(selected.id) ? '✅ Ya la tienes'
                    : `Comprar — ${(selected.price * qty).toLocaleString()} 🪙`}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <h3 style={l.sectionTitle}>Tienda</h3>
          <div style={sh.shopTabs}>
            <button style={{ ...sh.shopTab, ...(shopTab === 'pociones' ? sh.shopTabActive : {}) }}
              onClick={() => setShopTab('pociones')}>
              🧪 Pociones
            </button>
            <button style={{ ...sh.shopTab, ...(shopTab === 'mascotas' ? sh.shopTabActive : {}) }}
              onClick={() => setShopTab('mascotas')}>
              🐾 Mascotas
            </button>
          </div>

          <div style={sh.shopGrid}>
            {(shopTab === 'pociones' ? shopPotions : shopPets).map(item => {
              const owned = item._type === 'pet' && ownedPetIds.includes(item.id)
              return (
                <div key={item.id} style={{ ...sh.shopItem, opacity: owned ? 0.7 : 1 }}
                  onClick={() => { setSelected(item); setQty(1) }}>
                  <div style={sh.shopItemIcon}>
                    {item._type === 'potion'
                      ? <PotionShopImage slug={item.slug} />
                      : <PetShopImage slug={item.slug} />
                    }
                  </div>
                  <div style={sh.shopItemName}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#78767B' }}>
                    {item._type === 'potion'
                      ? `x${(item as ShopPotion).pack_size} unidades`
                      : '5 stages'}
                  </div>
                  <div style={sh.shopItemPrice}>
                    {owned ? '✅ Tuya' : `🪙 ${item.price.toLocaleString()}`}
                  </div>
                  <button style={{
                    ...sh.shopItemBuyBtn,
                    background: owned ? '#E8E7F0' : undefined,
                    color: owned ? '#78767B' : undefined,
                  }}>
                    {owned ? 'Ya la tienes' : 'Ver detalles'}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}