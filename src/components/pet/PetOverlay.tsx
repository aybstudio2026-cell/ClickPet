import { useEffect, useRef, useState } from 'react'
import { supabaseClickpet } from '../../lib/supabase'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'

// ── Constantes spritesheet ────────────────────────────────────
const SHEET_COLS = 6
const SHEET_ROWS = 6
const SYNC_INTERVAL = 30000
const INACTIVITY_TIMEOUT = 180000

// ── Helpers ───────────────────────────────────────────────────
function calcStage(clicks: number): number {
  if (clicks >= 50000) return 5
  if (clicks >= 25000) return 4
  if (clicks >= 5000)  return 3
  if (clicks >= 1000)  return 2
  return 1
}

// ── Config animaciones ────────────────────────────────────────
const ANIM_CONFIG: Record<string, { frames: number[]; loop: boolean; fps: number }> = {
  idle:   { frames: Array.from({ length: 36 }, (_, i) => i), loop: true,  fps: 14 },
  click:  { frames: Array.from({ length: 36 }, (_, i) => i), loop: false, fps: 24 },
  rapid:  { frames: Array.from({ length: 36 }, (_, i) => i), loop: false, fps: 30 },
  sleep:  { frames: Array.from({ length: 36 }, (_, i) => i), loop: true,  fps: 8  },
  potion: { frames: Array.from({ length: 36 }, (_, i) => i), loop: false, fps: 24 },
}

// ── Cache sprites ─────────────────────────────────────────────
const spriteCache = new Map<string, string>()

async function loadSprite(
  slug: string,
  stage: number,
  animation: string
): Promise<string | null> {
  const key = `${slug}_${stage}_${animation}`
  if (spriteCache.has(key)) return spriteCache.get(key)!
  try {
    const path = await invoke<string>('get_asset_path', { slug, stage, animation })
    if (!path) return null
    const b64 = await invoke<string>('read_image_as_base64', { path })
    if (b64) spriteCache.set(key, b64)
    return b64 || null
  } catch {
    return null
  }
}

// ── SpriteAnimator ────────────────────────────────────────────
function SpriteAnimator({
  src,
  animation,
  containerW,
  containerH,
}: {
  src: string
  animation: string
  containerW: number
  containerH: number
}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const imgRef       = useRef<HTMLImageElement | null>(null)
  const frameRef     = useRef(0)
  const rafRef       = useRef<number>(0)
  const lastTimeRef  = useRef(0)
  const animRef      = useRef(animation)

  useEffect(() => { animRef.current = animation }, [animation])

  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.src = src
    img.onload = () => {
      imgRef.current = img
      frameRef.current = 0
      lastTimeRef.current = 0
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(animate)
    }
    return () => { cancelAnimationFrame(rafRef.current) }
  }, [src])

  useEffect(() => { frameRef.current = 0 }, [animation])

  function animate(timestamp: number) {
    const config = ANIM_CONFIG[animRef.current] ?? ANIM_CONFIG.idle
    const msPerFrame = 1000 / config.fps

    if (timestamp - lastTimeRef.current >= msPerFrame) {
      lastTimeRef.current = timestamp
      drawFrame(frameRef.current)
      frameRef.current++
      if (frameRef.current >= config.frames.length) {
        if (config.loop) {
          frameRef.current = 0
        } else {
          frameRef.current = 0
          animRef.current = 'idle'
        }
      }
    }
    rafRef.current = requestAnimationFrame(animate)
  }

  function drawFrame(frameIndex: number) {
    const canvas = canvasRef.current
    const img    = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const frameW = img.naturalWidth  / SHEET_COLS
    const frameH = img.naturalHeight / SHEET_ROWS
    const col    = frameIndex % SHEET_COLS
    const row    = Math.floor(frameIndex / SHEET_COLS)

    const scale   = Math.min(canvas.width / frameW, canvas.height / frameH)
    const drawW   = frameW * scale
    const drawH   = frameH * scale
    const offsetX = (canvas.width  - drawW) / 2
    const offsetY = (canvas.height - drawH) / 2

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(
      img,
      col * frameW, row * frameH,
      frameW, frameH,
      offsetX, offsetY,
      drawW, drawH,
    )
  }

  return (
    <canvas
      ref={canvasRef}
      width={containerW}
      height={containerH}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        imageRendering: 'auto',
      }}
    />
  )
}

// ── PetOverlay ────────────────────────────────────────────────
export default function PetOverlay() {
  const params = new URLSearchParams(window.location.search)

  const [userPetId,   setUserPetId]   = useState(params.get('pet') ?? '')
  const [petSlug,     setPetSlug]     = useState('slime')
  const [totalClicks, setTotalClicks] = useState(0)
  const [stage,       setStage]       = useState(1)
  const [animation,   setAnimation]   = useState<
    'idle' | 'click' | 'rapid' | 'sleep' | 'potion'
  >('idle')
  const [spriteSrc,   setSpriteSrc]   = useState<string | null>(null)
  const [winSize,     setWinSize]     = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  })

  const pendingRef      = useRef(0)
  const lastClickTime   = useRef(0)
  const clickCountRef   = useRef(0)
  const animTimer       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const totalRef        = useRef(0)
  const stageRef        = useRef(1)
  const animationRef    = useRef<typeof animation>('idle')
  const userPetIdRef    = useRef(userPetId)
  const petSlugRef      = useRef(petSlug)

  useEffect(() => { animationRef.current = animation }, [animation])
  useEffect(() => { stageRef.current     = stage      }, [stage])
  useEffect(() => { userPetIdRef.current = userPetId  }, [userPetId])
  useEffect(() => { petSlugRef.current   = petSlug    }, [petSlug])

  // Actualizar winSize si la ventana Tauri cambia de tamaño
  useEffect(() => {
    function onResize() {
      // Pequeño delay para que Tauri termine de aplicar el nuevo tamaño
      setTimeout(() => {
        setWinSize({ w: window.innerWidth, h: window.innerHeight })
      }, 50)
    }
    window.addEventListener('resize', onResize)

    // Leer tamaño correcto al montar también con delay
    setTimeout(() => {
      setWinSize({ w: window.innerWidth, h: window.innerHeight })
    }, 100)

    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Cargar sprite cuando cambia slug o stage
  useEffect(() => {
    if (!petSlug) return
    setSpriteSrc(null)
    loadSprite(petSlug, stage, 'idle').then(src => {
      if (src) setSpriteSrc(src)
    })
    // Precargar resto de animaciones en background
    const anims = ['click', 'rapid', 'sleep', 'potion']
    anims.forEach(anim => loadSprite(petSlug, stage, anim))
  }, [petSlug, stage])

  // Cambiar sprite al cambiar animación
  useEffect(() => {
    if (!petSlug) return
    loadSprite(petSlug, stage, animation).then(src => {
      if (src) setSpriteSrc(src)
    })
  }, [animation])

  // Cargar datos iniciales
  useEffect(() => {
    if (!userPetId) return
    loadPetData(userPetId)
  }, [userPetId])

  // ── Listeners Tauri ─────────────────────────────────────────

  useEffect(() => {
    const unlisten = listen<string>('pet-id', (event) => {
      setUserPetId(event.payload)
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  useEffect(() => {
    const unlisten = listen('global-click', () => {
      registerClick()
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  useEffect(() => {
    if (!userPetId) return
    const interval = setInterval(
      () => syncClicks(userPetIdRef.current),
      SYNC_INTERVAL
    )
    window.addEventListener('beforeunload', () => syncClicks(userPetIdRef.current))
    startInactivityTimer()
    return () => {
      clearInterval(interval)
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [userPetId])

  useEffect(() => {
    const unlisten = listen<{ bonus?: number }>('use-potion', (event) => {
      playAnimation('potion')
      const bonus = event.payload?.bonus ?? 0
      if (bonus > 0) {
        pendingRef.current += bonus
        const newTotal = totalRef.current + bonus
        totalRef.current = newTotal
        setTotalClicks(newTotal)
        const newStage = calcStage(newTotal)
        if (newStage !== stageRef.current) {
          setStage(newStage)
          stageRef.current = newStage
        }
        invoke('emit_to_dashboard', { clicks: newTotal }).catch(() => {})
      }
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  useEffect(() => {
    const unlisten = listen('force-sync', async () => {
      await syncClicks(userPetIdRef.current)
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  // ── Funciones ────────────────────────────────────────────────

  async function loadPetData(petId: string) {
    const { data } = await supabaseClickpet
      .from('user_pets')
      .select('total_clicks, current_stage, pet:pets(slug)')
      .eq('id', petId)
      .single()

    if (data) {
      const slug = (data.pet as any)?.slug ?? 'slime'
      setTotalClicks(data.total_clicks)
      setStage(data.current_stage)
      setPetSlug(slug)
      petSlugRef.current = slug
      totalRef.current   = data.total_clicks
      stageRef.current   = data.current_stage
      await invoke('emit_to_dashboard', { clicks: data.total_clicks })
    }
  }

  function playAnimation(name: typeof animation) {
    if (animTimer.current) clearTimeout(animTimer.current)
    setAnimation(name)
    animationRef.current = name
  }

  function startInactivityTimer() {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      playAnimation('sleep')
    }, INACTIVITY_TIMEOUT)
  }

  async function syncClicks(petId: string) {
    if (pendingRef.current === 0 || !petId) return
    const toSync = pendingRef.current
    pendingRef.current = 0
    await supabaseClickpet.rpc('sync_clicks', {
      p_user_pet_id: petId,
      p_clicks: toSync,
    })
  }

  function registerClick() {
    startInactivityTimer()
    if (animationRef.current === 'sleep') {
      setAnimation('idle')
      animationRef.current = 'idle'
    }

    pendingRef.current += 1
    const newTotal = totalRef.current + 1
    totalRef.current = newTotal
    setTotalClicks(newTotal)

    const newStage = calcStage(newTotal)
    if (newStage !== stageRef.current) {
      setStage(newStage)
      stageRef.current = newStage
      const anims = ['idle', 'click', 'rapid', 'sleep', 'potion']
      anims.forEach(anim => loadSprite(petSlugRef.current, newStage, anim))
    }

    invoke('emit_to_dashboard', { clicks: newTotal }).catch(() => {})

    const now = Date.now()
    if (now - lastClickTime.current < 300) {
      clickCountRef.current += 1
      if (clickCountRef.current >= 3) {
        playAnimation('rapid')
        clickCountRef.current = 0
      } else {
        playAnimation('click')
      }
    } else {
      clickCountRef.current = 1
      playAnimation('click')
    }
    lastClickTime.current = now
  }

  async function handleDrag(e: React.MouseEvent) {
    e.stopPropagation()
    const win = await getCurrentWebviewWindow()
    await win.startDragging()
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
  }

  const stageEmoji = ['🟢', '🫧', '👾', '👑', '✨']

  // ── Render ───────────────────────────────────────────────────
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        background: 'transparent',
        position: 'relative',
        cursor: 'grab',
        overflow: 'hidden',
      }}
      onMouseDown={handleDrag}
      onContextMenu={handleContextMenu}
    >
      {/* Mascota animada — ocupa toda la ventana */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform:
          animation === 'rapid'  ? 'scale(1.05) rotate(-2deg)' :
          animation === 'click'  ? 'scale(1.04)' :
          animation === 'sleep'  ? 'scale(0.97)' :
          animation === 'potion' ? 'scale(1.06) rotate(3deg)' :
          'scale(1)',
        transition: 'transform 0.1s ease',
        opacity: animation === 'sleep' ? 0.7 : 1,
      }}>
        {spriteSrc ? (
          <SpriteAnimator
            src={spriteSrc}
            animation={animation}
            containerW={winSize.w}
            containerH={winSize.h}
          />
        ) : (
          <div style={{
            fontSize: `${Math.min(winSize.w, winSize.h) * 0.6}px`,
            lineHeight: 1,
          }}>
            {stageEmoji[stage - 1]}
          </div>
        )}
      </div>

      {/* Badges — solo cuando hay animación especial */}
      {animation === 'sleep' && (
        <div style={{
          position: 'absolute',
          top: 8, right: 8,
          fontSize: '16px',
          pointerEvents: 'none',
        }}>
          💤
        </div>
      )}
      {animation === 'potion' && (
        <div style={{
          position: 'absolute',
          top: 8, right: 8,
          fontSize: '16px',
          pointerEvents: 'none',
        }}>
          🌟
        </div>
      )}
    </div>
  )
}