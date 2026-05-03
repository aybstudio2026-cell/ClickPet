import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'

export function useLocalImage(slug: string, stage: number, animation: string = 'idle') {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
      invoke<string>('get_asset_path', { slug, stage, animation })
        .then(async path => {
        if (!path) return
        const base64 = await invoke<string>('read_image_as_base64', { path })
        if (base64) setSrc(base64)
      })
      .catch(() => {})
  }, [slug, stage, animation])

  return src
}