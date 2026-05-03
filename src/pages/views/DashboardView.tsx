import { usePetStore } from '../../store/petStore'
import { petCardStyles as pc } from '../../styles/dashboard/petCard'
import { statsStyles as st } from '../../styles/dashboard/stats'
import { PET_EMOJIS, PET_STAGE_NAMES, STAGES_REQUIRED } from '../../hooks/usePetData'
import { usePetImage } from '../../hooks/usePetImage'

interface Props {
  activePetSlug: string
  petName: string
  onToggleOverlay: () => void
  onGoShop: () => void
  onUsePotion: () => void
}

export default function DashboardView({
  activePetSlug, petName, onToggleOverlay,
}: Props) {
  const { activePet, isOverlayVisible } = usePetStore()

  const currentStage = activePet?.current_stage ?? 1
  const totalClicks = activePet?.total_clicks ?? 0
  const nextRequired = STAGES_REQUIRED[currentStage] ?? 50000
  const progress = currentStage >= 5 ? 100 : Math.min((totalClicks / nextRequired) * 100, 100)
  const stageNames = PET_STAGE_NAMES[activePetSlug] ?? PET_STAGE_NAMES.slime
  const fallbackEmoji = (PET_EMOJIS[activePetSlug] ?? PET_EMOJIS.slime)[currentStage - 1]

  const petImageSrc = usePetImage(activePetSlug, currentStage, 'idle')

  return (
    <>
      <div style={pc.petCard}>
        <div style={pc.petImageBox}>
          {petImageSrc
            ? <img src={petImageSrc} style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
            : <span style={{ fontSize: '64px' }}>{fallbackEmoji}</span>
          }
        </div>
        <div style={pc.petCardInfo}>
          <div style={pc.petCardTop}>
            <h3 style={pc.petCardName}>{petName}</h3>
            <span style={pc.stageBadge}>Stage {currentStage}</span>
          </div>
          <div style={pc.clicksRow}>
            🖱️ <strong>{totalClicks.toLocaleString()}</strong> clicks totales
          </div>
          <div style={pc.progressLabel}>
            <span>Evolution Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={pc.progressBg}>
            <div style={{ ...pc.progressFill, width: `${progress}%` }} />
          </div>
          {currentStage < 5 && (
            <div style={pc.progressHint}>
              {stageNames[currentStage - 1]} → {stageNames[currentStage]}
              {' · '}{(nextRequired - totalClicks).toLocaleString()} clicks restantes
            </div>
          )}
          <button style={isOverlayVisible ? pc.btnHide : pc.btnShow} onClick={onToggleOverlay}>
            {isOverlayVisible ? `⏸ Ocultar ${petName}` : `▶ Mostrar ${petName}`}
          </button>
        </div>
      </div>

      <div style={st.statsRow}>
        {[
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), sub: 'desde el inicio' },
          { label: 'Stage Actual', value: `${currentStage}/5`, sub: stageNames[currentStage - 1] },
          { label: 'Progreso', value: `${Math.round(progress)}%`, sub: `hacia stage ${Math.min(currentStage + 1, 5)}` },
        ].map(item => (
          <div key={item.label} style={st.statCard}>
            <div style={st.statLabel}>{item.label}</div>
            <div style={st.statValue}>{item.value}</div>
            <div style={st.statSub}>{item.sub}</div>
          </div>
        ))}
      </div>
    </>
  )
}