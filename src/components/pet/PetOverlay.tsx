import { useEffect, useRef, useState } from 'react'
import { supabaseClickpet } from '../../lib/supabase'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'

const SYNC_INTERVAL = 30000 // 30 segundos
const INACTIVITY_TIMEOUT = 180000

function calcStage(clicks: number): number {
  if (clicks >= 50000) return 5
  if (clicks >= 25000) return 4
  if (clicks >= 5000)  return 3
  if (clicks >= 1000)  return 2
  return 1
}

export default function PetOverlay() {
  const params = new URLSearchParams(window.location.search)
  const [userPetId, setUserPetId] = useState(params.get('pet') ?? '')

  const [totalClicks, setTotalClicks] = useState(0)
  const [stage, setStage] = useState(1)
  const [animation, setAnimation] = useState<'idle' | 'click' | 'rapid' | 'sleep' | 'potion'>('idle')

  // --- NUEVOS ESTADOS PARA IMÁGENES ---
  const [petImageSrc, setPetImageSrc] = useState<string | null>(null)
  const [petSlug, setPetSlug] = useState('slime')

  const pendingRef = useRef(0)
  const lastClickTime = useRef(0)
  const clickCountRef = useRef(0)
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const totalRef = useRef(0)
  const stageRef = useRef(1)
  const animationRef = useRef<typeof animation>('idle')
  const userPetIdRef = useRef(userPetId)
  const petSlugRef = useRef(petSlug) // Ref para evitar problemas de clausura en listeners

  useEffect(() => { animationRef.current = animation }, [animation])
  useEffect(() => { stageRef.current = stage }, [stage])
  useEffect(() => { userPetIdRef.current = userPetId }, [userPetId])
  useEffect(() => { petSlugRef.current = petSlug }, [petSlug])

  // --- NUEVA FUNCIÓN: CARGAR IMAGEN DESDE RUST ---
  async function loadPetImage(slug: string, stageNum: number) {
    try {
      // Obtenemos la ruta del asset desde el backend
      const path = await invoke<string>('get_asset_path', { 
        slug, 
        stage: stageNum, 
        animation: 'idle' 
      })
      
      if (path) {
        // Leemos el archivo y lo convertimos a base64 para mostrarlo en el <img>
        const b64 = await invoke<string>('read_image_as_base64', { path })
        if (b64) setPetImageSrc(b64)
        else setPetImageSrc(null)
      } else {
        setPetImageSrc(null)
      }
    } catch (err) {
      console.error("Error loading pet image:", err)
      setPetImageSrc(null)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    if (!userPetId) return
    loadPetData(userPetId)
  }, [userPetId])

  // Escuchar pet-id desde Rust
  useEffect(() => {
    const unlisten = listen<string>('pet-id', (event) => {
      setUserPetId(event.payload)
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  // Escuchar clicks globales desde Rust
  useEffect(() => {
    const unlisten = listen('global-click', () => {
      registerClick()
    })
    return () => { unlisten.then(fn => fn()) }
  }, [petSlug]) // Re-bind cuando cambie el slug para tener el valor fresco

  // Sync cada 30 segundos
  useEffect(() => {
    if (!userPetId) return
    const interval = setInterval(() => syncClicks(userPetIdRef.current), SYNC_INTERVAL)
    window.addEventListener('beforeunload', () => syncClicks(userPetIdRef.current))
    startInactivityTimer()
    return () => {
      clearInterval(interval)
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [userPetId])

  // Listener de Pociones
  useEffect(() => {
    const unlisten = listen<{ bonus?: number }>('use-potion', (event) => {
      playAnimation('potion', 800)
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
          // Actualizar imagen al evolucionar por poción
          loadPetImage(petSlugRef.current, newStage)
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

  async function loadPetData(petId: string) {
    // 1. Obtener datos de progreso
    const { data } = await supabaseClickpet
      .from('user_pets')
      .select('total_clicks, current_stage')
      .eq('id', petId)
      .single()

    if (data) {
      setTotalClicks(data.total_clicks)
      setStage(data.current_stage)
      totalRef.current = data.total_clicks
      stageRef.current = data.current_stage
      
      // 2. Obtener el SLUG de la mascota (Join con tabla pets)
      const { data: petData } = await supabaseClickpet
        .from('user_pets')
        .select('pet:pets(slug)')
        .eq('id', petId)
        .single()
      
      const slug = (petData?.pet as any)?.slug ?? 'slime'
      setPetSlug(slug)
      
      // 3. Cargar la imagen inicial
      await loadPetImage(slug, data.current_stage)
      
      // Sincronizar dashboard
      await invoke('emit_to_dashboard', { clicks: data.total_clicks })
    }
  }

  function playAnimation(name: typeof animation, duration = 500) {
    if (animTimer.current) clearTimeout(animTimer.current)
    setAnimation(name)
    animationRef.current = name
    if (name !== 'sleep') {
      animTimer.current = setTimeout(() => {
        setAnimation('idle')
        animationRef.current = 'idle'
      }, duration)
    }
  }

  function startInactivityTimer() {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      playAnimation('sleep', 999999)
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
      // Actualizar imagen al evolucionar por clicks
      loadPetImage(petSlug, newStage)
    }

    invoke('emit_to_dashboard', { clicks: newTotal }).catch(() => {})

    const now = Date.now()
    if (now - lastClickTime.current < 300) {
      clickCountRef.current += 1
      if (clickCountRef.current >= 3) {
        playAnimation('rapid', 600)
        clickCountRef.current = 0
      } else {
        playAnimation('click', 300)
      }
    } else {
      clickCountRef.current = 1
      playAnimation('click', 300)
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

  // Backup de emojis por si falla la carga de imagen
  const stageEmoji = ['🟢', '🫧', '👾', '👑', '✨']

  const petStyle: React.CSSProperties = {
    width: 100, // Ajustamos tamaño para la imagen
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 80,
    lineHeight: 1,
    filter: 'drop-shadow(0 4px 16px rgba(74,222,128,0.5))',
    cursor: 'grab',
    transform:
      animation === 'rapid'  ? 'scale(1.35) rotate(-5deg)' :
      animation === 'click'  ? 'scale(1.15)' :
      animation === 'sleep'  ? 'scale(0.9)'  :
      animation === 'potion' ? 'scale(1.4) rotate(10deg)' :
      'scale(1)',
    transition: 'transform 0.15s ease',
    opacity: animation === 'sleep' ? 0.6 : 1,
  }

  return (
    <div
      style={styles.container}
      onMouseDown={handleDrag}
      onContextMenu={handleContextMenu}
    >
      <div style={petStyle}>
        {petImageSrc ? (
          <img 
            src={petImageSrc} 
            alt="pet" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        ) : (
          stageEmoji[stage - 1]
        )}
      </div>
      
      {animation === 'sleep'  && <div style={styles.badge}>💤</div>}
      {animation === 'rapid'  && <div style={styles.badge}>✨</div>}
      {animation === 'potion' && <div style={styles.badge}>🌟</div>}
      
      <div style={styles.clickCounter}>
        {totalClicks.toLocaleString()}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw', height: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    userSelect: 'none', background: 'transparent',
    position: 'relative', flexDirection: 'column',
  },
  badge: { position: 'absolute', fontSize: 22, top: 8, right: 8 },
  clickCounter: {
    fontSize: 11, color: 'rgba(74,222,128,0.7)',
    marginTop: 4, fontFamily: 'monospace',
  },
}