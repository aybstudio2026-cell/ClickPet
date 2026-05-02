import { invoke } from '@tauri-apps/api/core'

export interface PetAssetInfo {
  slug: string
  base_url: string
}

export const useAssets = () => {

  async function ensurePetAssets(slug: string, baseUrl: string): Promise<void> {
    if (!baseUrl) return
    try {
      const hasAssets = await invoke<boolean>('check_pet_assets', { slug })
      if (!hasAssets) {
        console.log(`Descargando assets de ${slug}...`)
        await invoke('download_pet_assets', {
          slug,
          baseUrl,
        })
        console.log(`Assets de ${slug} descargados.`)
      }
    } catch (err) {
      console.error('Error verificando/descargando assets:', err)
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

  function getLocalAssetUrl(slug: string, stage: number, animation: string): string {
    return invoke<string>('get_asset_path', { slug, stage, animation }) as any
  }

  return { ensurePetAssets, ensurePotionImage, getLocalAssetUrl }
}