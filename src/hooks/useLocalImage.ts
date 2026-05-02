import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'

export function useLocalImage(slug: string, stage: number, animation: string = 'idle') {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    invoke<string>('get_asset_path', { slug, stage, animation })
      .then(path => { if (path) setSrc(path) })
      .catch(() => {})
  }, [slug, stage, animation])

  return src
}