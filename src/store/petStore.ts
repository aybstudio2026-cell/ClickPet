import { create } from 'zustand'
import { UserPet, Profile, PotionInventory } from '../types'

interface DownloadingPet {
  petId: string
  slug: string
  progress: 'downloading' | 'done' | 'error'
}


interface PetStore {
  profile: Profile | null
  activePet: UserPet | null
  pendingClicks: number
  isOverlayVisible: boolean
  justEvolved: boolean
  potions: PotionInventory[]
  setProfile: (profile: Profile) => void
  setActivePet: (pet: UserPet) => void
  addClick: () => void
  resetPendingClicks: () => void
  setOverlayVisible: (visible: boolean) => void
  updateStage: (stage: number, totalClicks: number) => void
  setJustEvolved: (v: boolean) => void
  setPotions: (potions: PotionInventory[]) => void
  updateBalance: (balance: number) => void
  downloadingPets: DownloadingPet[]
  setDownloadingPet: (petId: string, slug: string, progress: DownloadingPet['progress']) => void
  removeDownloadingPet: (petId: string) => void
}

export const usePetStore = create<PetStore>((set) => ({
  profile: null,
  activePet: null,
  pendingClicks: 0,
  isOverlayVisible: false,
  justEvolved: false,
  potions: [],
  downloadingPets: [],

  setProfile: (profile) => set({ profile }),
  setActivePet: (pet) => set({ activePet: pet }),
  setPotions: (potions) => set({ potions }),
  updateBalance: (balance) => set((state) => ({
    profile: state.profile ? { ...state.profile, balance } : null
  })),

  setDownloadingPet: (petId, slug, progress) => set((state) => {
    const existing = state.downloadingPets.find(d => d.petId === petId)
    if (existing) {
      return { downloadingPets: state.downloadingPets.map(d => d.petId === petId ? { ...d, progress } : d) }
    }
    return { downloadingPets: [...state.downloadingPets, { petId, slug, progress }] }
  }),

  removeDownloadingPet: (petId) => set((state) => ({
    downloadingPets: state.downloadingPets.filter(d => d.petId !== petId)
  })),

  addClick: () => set((state) => {
    if (!state.activePet) return {}
    const newTotal = state.activePet.total_clicks + 1
    const oldStage = state.activePet.current_stage
    const newStage = calcStage(newTotal)
    return {
      pendingClicks: state.pendingClicks + 1,
      justEvolved: newStage > oldStage,
      activePet: {
        ...state.activePet,
        total_clicks: newTotal,
        current_stage: newStage,
      },
    }
  }),

  resetPendingClicks: () => set({ pendingClicks: 0 }),
  setOverlayVisible: (visible) => set({ isOverlayVisible: visible }),
  setJustEvolved: (v) => set({ justEvolved: v }),

  updateStage: (stage, totalClicks) =>
    set((state) => ({
      activePet: state.activePet
        ? { ...state.activePet, current_stage: stage, total_clicks: totalClicks }
        : null,
    })),
}))

export function calcStage(clicks: number): number {
  if (clicks >= 50000) return 5
  if (clicks >= 25000) return 4
  if (clicks >= 5000)  return 3
  if (clicks >= 1000)  return 2
  return 1
}