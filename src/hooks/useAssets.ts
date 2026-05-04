import { invoke } from '@tauri-apps/api/core'
import { usePetStore } from '../store/petStore'

// Cache en memoria para no re-verificar en la misma sesión
const checkedSlugs = new Set<string>()

export const useAssets = () => {
  const { setDownloadingPet, removeDownloadingPet } = usePetStore()

  async function ensurePetAssets(
    slug: string,
    zipUrl: string,
    petId?: string
  ): Promise<void> {
    if (!zipUrl) return

    // Si ya verificamos este slug en esta sesión, no hacer nada
    if (checkedSlugs.has(slug)) return

    try {
      const hasAssets = await invoke<boolean>('check_pet_assets', { slug })

      if (hasAssets) {
        // Ya tiene assets, marcar como verificado y no mostrar nada
        checkedSlugs.add(slug)
        return
      }

      // No tiene assets — mostrar indicador y descargar
      if (petId) setDownloadingPet(petId, slug, 'downloading')

      await invoke('download_pet_assets', { slug, zipUrl })

      checkedSlugs.add(slug)

      if (petId) {
        setDownloadingPet(petId, slug, 'done')
        setTimeout(() => removeDownloadingPet(petId), 2000)
      }

    } catch (err) {
      console.error(`Error con assets de ${slug}:`, err)
      if (petId) setDownloadingPet(petId, slug, 'error')
    }
  }

  async function ensurePotionImage(slug: string, imageUrl: string): Promise<void> {
    if (!imageUrl) return
    try {
      await invoke('download_potion_image', { slug, url: imageUrl })
    } catch (err) {
      console.error(`Error descargando poción ${slug}:`, err)
    }
  }

  return { ensurePetAssets, ensurePotionImage }
}