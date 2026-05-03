import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'

export function usePetImage(slug: string, stage: number, animation: string = 'idle') {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setSrc(null) // reset al cambiar mascota
    invoke<string>('get_asset_path', { slug, stage, animation })
      .then(async path => {
        if (!path) return
        const b64 = await invoke<string>('read_image_as_base64', { path })
        if (b64) setSrc(b64)
      })
      .catch(() => {})
  }, [slug, stage, animation])

  return src
}