import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCached, setCached } from '../lib/imageCache'

export function useLocalImage(slug: string, stage: number, animation: string = 'idle') {
  const cacheKey = `pet_${slug}_${stage}_${animation}`
  const [src, setSrc] = useState<string | null>(() => getCached(cacheKey))

  useEffect(() => {
    if (!slug) return
    if (getCached(cacheKey)) return

    invoke<string>('get_asset_path', { slug, stage, animation })
      .then(async path => {
        if (!path) return
        const b64 = await invoke<string>('read_image_as_base64', { path })
        if (b64) {
          setCached(cacheKey, b64)
          setSrc(b64)
        }
      })
      .catch(() => {})
  }, [slug, stage, animation])

  return src
}