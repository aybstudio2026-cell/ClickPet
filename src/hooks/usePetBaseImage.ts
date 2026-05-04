import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCached, setCached } from '../lib/imageCache'

export function usePetBaseImage(slug: string, baseUrl?: string) {
  const cacheKey = `pet_base_${slug}`

  // Inicializar con null siempre — el useEffect carga desde cache o descarga
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    // Reset inmediato al cambiar slug
    setSrc(null)

    // Si ya está en cache, aplicar inmediatamente
    const cached = getCached(cacheKey)
    if (cached) {
      setSrc(cached)
      return
    }

    // Si no está en cache, cargar
    async function load() {
      try {
        let path = await invoke<string>('get_pet_base_path', { slug })

        if (!path && baseUrl) {
          path = await invoke<string>('download_pet_base_image', {
            slug,
            url: baseUrl,
          })
        }

        if (!path) return

        const b64 = await invoke<string>('read_image_as_base64', { path })
        if (b64) {
          setCached(cacheKey, b64)
          setSrc(b64)
        }
      } catch (err) {
        console.error(`Error cargando imagen base de ${slug}:`, err)
      }
    }

    load()
  }, [slug]) // ← solo depende de slug, no de baseUrl para evitar re-renders

  return src
}