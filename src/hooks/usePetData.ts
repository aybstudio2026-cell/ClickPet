import { useState } from 'react'
import { supabase, supabaseClickpet } from '../lib/supabase'
import { usePetStore } from '../store/petStore'
import { invoke } from '@tauri-apps/api/core'
import { UserPet } from '../types'

export interface OwnedPet extends UserPet {
  pet: { name: string; slug: string } | null
}

export interface ShopPotion {
  id: string
  name: string
  slug: string
  price: number
  pack_size: number
  description: string
  _type: 'potion'
}

export interface ShopPet {
  id: string
  name: string
  slug: string
  price: number
  description: string
  is_free: boolean
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

    const [potRes, petRes] = await Promise.all([
      supabaseClickpet.from('potions').select('*').order('price'),
      supabaseClickpet.from('pets').select('*').eq('is_free', false).order('price'),
    ])
    if (potRes.data) setShopPotions(potRes.data.map(p => ({ ...p, _type: 'potion' as const })))
    if (petRes.data) setShopPets(petRes.data.map(p => ({ ...p, _type: 'pet' as const })))

    const { data: ownedRes } = await supabaseClickpet
      .from('user_pets').select('pet_id').eq('user_id', user.id)
    if (ownedRes) setOwnedPetIds(ownedRes.map(p => p.pet_id))

    setLoading(false)
  }

  async function switchPet(pet: OwnedPet, isOverlayVisible: boolean) {
    setActivePet(pet)
    setActivePetSlug(pet.pet?.slug ?? 'slime')
    await invoke('set_user_pet_id', { userPetId: pet.id })
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