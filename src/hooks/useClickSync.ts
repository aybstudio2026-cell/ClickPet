import { useEffect } from 'react'
import { usePetStore, calcStage } from '../store/petStore'

export function useClickSync() {
  useEffect(() => {
    let unlisten: (() => void) | null = null
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<number>('click-update', (event) => {
        const newTotal = event.payload
        usePetStore.setState((state) => {
          if (!state.activePet) return {}
          const oldStage = state.activePet.current_stage
          const newStage = calcStage(newTotal)
          return {
            justEvolved: newStage > oldStage,
            activePet: {
              ...state.activePet,
              total_clicks: newTotal,
              current_stage: newStage,
            },
          }
        })
      }).then(fn => { unlisten = fn })
    })
    return () => { if (unlisten) unlisten() }
  }, [])
}