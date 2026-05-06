import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCached, setCached } from '../lib/imageCache'

export function usePetStageImage(slug: string, stage: number, baseUrl?: string) {
  const cacheKey = `pet_stage_${slug}_${stage}`
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    // Reset al cambiar slug o stage
    setSrc(null)

    // Revisar cache primero
    const cached = getCached(cacheKey)
    if (cached) {
      setSrc(cached)
      return
    }

    async function load() {
      try {
        // Intentar cargar stage{N}.png desde disco
        const path = await invoke<string>('get_stage_image_path', { slug, stage })

        if (path) {
          const b64 = await invoke<string>('read_image_as_base64', { path })
          if (b64) {
            setCached(cacheKey, b64)
            setSrc(b64)
            return
          }
        }

        // Fallback: cargar base.png si hay URL pública
        if (baseUrl) {
          const basePath = await invoke<string>('get_pet_base_path', { slug })
          if (basePath) {
            const b64 = await invoke<string>('read_image_as_base64', { path: basePath })
            if (b64) {
              setCached(cacheKey, b64)
              setSrc(b64)
            }
          }
        }
      } catch (err) {
        console.error(`Error cargando stage image ${slug} stage ${stage}:`, err)
      }
    }

    load()
  }, [slug, stage])

  return src
}