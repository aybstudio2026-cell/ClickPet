import { invoke } from '@tauri-apps/api/core'
import { usePetStore } from '../store/petStore'


export interface PetAssetInfo {
  slug: string
  base_url: string
}

export const useAssets = () => {
  const { setDownloadingPet, removeDownloadingPet } = usePetStore()

  async function ensurePetAssets(
    slug: string, 
    zipUrl: string, 
    petId?: string
  ): Promise<void> {
    if (!zipUrl) return
    try {
      const hasAssets = await invoke<boolean>('check_pet_assets', { slug })
      if (!hasAssets) {
        if (petId) setDownloadingPet(petId, slug, 'downloading')
        console.log(`[Assets] Descargando ZIP de ${slug}...`)
        await invoke('download_pet_assets', { slug, zipUrl })
        console.log(`[Assets] Assets de ${slug} listos.`)
        if (petId) {
          setDownloadingPet(petId, slug, 'done')
          setTimeout(() => removeDownloadingPet(petId), 2000)
        }
      }
    } catch (err) {
      console.error('Error con assets:', err)
      if (petId) setDownloadingPet(petId, slug, 'error')
    }
  }

  async function ensurePotionImage(slug: string, imageUrl: string): Promise<void> {
    if (!imageUrl) return
    try {
      await invoke('download_potion_image', { slug, url: imageUrl })
    } catch (err) {
      console.error('Error descargando imagen de poción:', err)
    }
  }

  return { ensurePetAssets, ensurePotionImage }
}