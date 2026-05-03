import { useState } from 'react'
import { supabase, supabaseClickpet } from '../lib/supabase'
import { usePetStore } from '../store/petStore'
import { invoke } from '@tauri-apps/api/core'
import { UserPet } from '../types'
import { useAssets } from './useAssets'

export interface OwnedPet extends UserPet {
  pet: { name: string; slug: string; asset_zip_url?: string } | null
}
export interface ShopPotion {
  id: string
  name: string
  slug: string
  price: number
  pack_size: number
  click_bonus: number
  description: string
  image_url?: string
  _type: 'potion'
}

export interface ShopPet {
  id: string
  name: string
  slug: string
  price: number
  description: string
  is_free: boolean
  asset_zip_url?: string
  _type: 'pet'
}

export type ShopItem = ShopPotion | ShopPet

export const PET_STAGE_NAMES: Record<string, string[]> = {
  slime:  ['Slime Semilla', 'Slime Pequeño', 'Slime Joven', 'Slime Rey', 'Slime Legendario'],
  dragon: ['Dragón Huevo', 'Dragón Bebé', 'Dragón Joven', 'Dragón Adulto', 'Dragón Legendario'],
  fairy:  ['Hada Semilla', 'Hada Pequeña', 'Hada Joven', 'Hada Mayor', 'Hada Legendaria'],
}

export const PET_EMOJIS: Record<string, string[]> = {
  slime:  ['🟢', '🫧', '👾', '👑', '✨'],
  dragon: ['🥚', '🐲', '🐉', '🔥', '⚡'],
  fairy:  ['🌱', '🧚', '🌸', '🌟', '💫'],
}

export const STAGES_REQUIRED = [0, 1000, 5000, 25000, 50000]

export function usePetData() {
  const { setProfile, setActivePet, setPotions } = usePetStore()
  const [ownedPets, setOwnedPets] = useState<OwnedPet[]>([])
  const [shopPotions, setShopPotions] = useState<ShopPotion[]>([])
  const [shopPets, setShopPets] = useState<ShopPet[]>([])
  const [ownedPetIds, setOwnedPetIds] = useState<string[]>([])
  const [activePetSlug, setActivePetSlug] = useState('slime')
  const [loading, setLoading] = useState(true)
  const { ensurePetAssets, ensurePotionImage } = useAssets()

  async function loadData() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 1. Perfil
  const { data: profileData } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (profileData) setProfile(profileData)

  // 2. Mascotas del usuario
  const { data: allPets } = await supabaseClickpet
    .from('user_pets').select('*, pet:pets(name, slug, asset_zip_url)').eq('user_id', user.id)

  if (!allPets || allPets.length === 0) {
    // Lógica para crear slime inicial...
    const { data: slimePet } = await supabaseClickpet
      .from('pets').select('id, slug, asset_zip_url').eq('slug', 'slime').single()
    if (slimePet) {
      const { data: newPet } = await supabaseClickpet
        .from('user_pets')
        .insert({ user_id: user.id, pet_id: slimePet.id })
        .select('*, pet:pets(name, slug, asset_zip_url)').single()
      if (newPet) {
        setOwnedPets([newPet])
        setActivePet(newPet)
        setActivePetSlug('slime')
        await invoke('set_user_pet_id', { userPetId: newPet.id })
        if (slimePet.asset_zip_url) ensurePetAssets('slime', slimePet.asset_zip_url, newPet.id)
      }
    }
  } else {
    setOwnedPets(allPets)
    const first = allPets[0]
    setActivePet(first)
    setActivePetSlug(first.pet?.slug ?? 'slime')
    await invoke('set_user_pet_id', { userPetId: first.id })
    
    for (const pet of allPets) {
      if (pet.pet?.slug && pet.pet.asset_zip_url) {
        ensurePetAssets(pet.pet.slug, pet.pet.asset_zip_url, pet.id)
      }
    }
  }

  // 3. Inventario de pociones
  const { data: inv } = await supabaseClickpet
    .from('potion_inventory')
    .select('*, potion:potions(name, slug, click_bonus, pack_size)')
    .eq('user_id', user.id)
    .gt('quantity', 0)
  if (inv) setPotions(inv)

  // 4. DATOS DE LA TIENDA (Aquí se declaran potRes y petRes)
  const [potRes, petRes] = await Promise.all([
    supabaseClickpet.from('potions').select('id, name, slug, price, pack_size, click_bonus, description, image_url').order('price'),
    supabaseClickpet.from('pets').select('*, asset_zip_url').eq('is_free', false).order('price'),
  ])

  // 5. AHORA SÍ puedes usar potRes y petRes
  if (potRes.data) {
    setShopPotions(potRes.data.map(p => ({ ...p, _type: 'potion' as const })))
    // Verificar assets de pociones en tienda
    for (const potion of potRes.data) {
      if (potion.image_url) {
        ensurePotionImage(potion.slug, potion.image_url)
      }
    }
  }
  
  if (petRes.data) {
    setShopPets(petRes.data.map(p => ({ ...p, _type: 'pet' as const })))
  }

  const { data: ownedRes } = await supabaseClickpet
    .from('user_pets').select('pet_id').eq('user_id', user.id)
  if (ownedRes) setOwnedPetIds(ownedRes.map(p => p.pet_id))

  setLoading(false)
}
  async function switchPet(pet: OwnedPet, isOverlayVisible: boolean) {
    setActivePet(pet)
    setActivePetSlug(pet.pet?.slug ?? 'slime')
    await invoke('set_user_pet_id', { userPetId: pet.id })
    
    // Verificar assets al cambiar de mascota activa
    if (pet.pet?.slug && pet.pet.asset_zip_url) {
      ensurePetAssets(pet.pet.slug, pet.pet.asset_zip_url, pet.id)
    }
    
    if (isOverlayVisible) {
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
      const overlay = await WebviewWindow.getByLabel('overlay')
      if (overlay) await overlay.emit('pet-id', pet.id)
    }
  }

  async function refreshAfterPurchase() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [allPets, pd] = await Promise.all([
      supabaseClickpet.from('user_pets').select('*, pet:pets(name, slug)').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])
    if (allPets.data) setOwnedPets(allPets.data)
    if (pd.data) setProfile(pd.data)
    const ownedRes = await supabaseClickpet.from('user_pets').select('pet_id').eq('user_id', user.id)
    if (ownedRes.data) setOwnedPetIds(ownedRes.data.map(p => p.pet_id))
  }

  return {
    loading, ownedPets, shopPotions, shopPets,
    ownedPetIds, setOwnedPetIds, activePetSlug,
    setOwnedPets, loadData, switchPet, refreshAfterPurchase,
  }
}