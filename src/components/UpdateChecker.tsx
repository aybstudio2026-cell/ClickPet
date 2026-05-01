import { useEffect, useState } from 'react'

// export default function UpdateChecker() {
//   const [updateAvailable, setUpdateAvailable] = useState(false)
//   const [updating, setUpdating] = useState(false)

//   useEffect(() => {
//     checkUpdate()
//   }, [])

//   async function checkUpdate() {
//     try {
//       const { check } = await import('@tauri-apps/plugin-updater')
//       const update = await check()
//       if (update?.available) setUpdateAvailable(true)
//     } catch {
//       // Sin conexión o sin updater configurado, ignorar
//     }
//   }

//   async function installUpdate() {
//     try {
//       setUpdating(true)
//       const { check } = await import('@tauri-apps/plugin-updater')
//       const update = await check()
//       if (update?.available) {
//         await update.downloadAndInstall()
//         const { relaunch } = await import('@tauri-apps/plugin-process')
//         await relaunch()
//       }
//     } catch {
//       setUpdating(false)
//     }
//   }

//   if (!updateAvailable) return null

//   return (
//     <div style={s.banner}>
//       <span style={s.text}>🆕 Hay una actualización disponible</span>
//       <button style={s.btn} onClick={installUpdate} disabled={updating}>
//         {updating ? 'Instalando...' : 'Actualizar'}
//       </button>
//     </div>
//   )
// }

export default function UpdateChecker() {
  return null
}

const s: Record<string, React.CSSProperties> = {
  banner: {
    background: '#0f3460', border: '1px solid #4ade80',
    borderRadius: 10, padding: '8px 12px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 8,
  },
  text: { fontSize: 12, color: '#e2e8f0' },
  btn: {
    fontSize: 12, padding: '4px 12px', borderRadius: 6,
    border: 'none', background: '#4ade80',
    color: '#1a1a2e', fontWeight: 600, cursor: 'pointer',
  },
}