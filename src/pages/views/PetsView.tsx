import { usePetStore } from '../../store/petStore'
import { petCardStyles as pc } from '../../styles/dashboard/petCard'
import { layoutStyles as l } from '../../styles/dashboard/layout'
import { OwnedPet, PET_EMOJIS, PET_STAGE_NAMES, STAGES_REQUIRED } from '../../hooks/usePetData'

interface Props {
  activePetSlug: string
  petName: string
  ownedPets: OwnedPet[]
  switchingPet: boolean
  onToggleOverlay: () => void
  onSwitchPet: (pet: OwnedPet) => void
  onGoShop: () => void
}

export default function PetsView({
  activePetSlug, petName, ownedPets,
  switchingPet, onToggleOverlay, onSwitchPet, onGoShop,
}: Props) {
  const { activePet, isOverlayVisible } = usePetStore()

  const currentStage = activePet?.current_stage ?? 1
  const totalClicks = activePet?.total_clicks ?? 0
  const nextRequired = STAGES_REQUIRED[currentStage] ?? 50000
  const progress = currentStage >= 5 ? 100 : Math.min((totalClicks / nextRequired) * 100, 100)
  const petEmojis = PET_EMOJIS[activePetSlug] ?? PET_EMOJIS.slime
  const stageNames = PET_STAGE_NAMES[activePetSlug] ?? PET_STAGE_NAMES.slime
  const otherPets = ownedPets.filter(p => p.id !== activePet?.id)

  return (
    <div style={pc.petsGrid}>
      {/* Mascota activa */}
      <div style={pc.activePetBig}>
        <div style={pc.activePetImageBox}>{petEmojis[currentStage - 1]}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={pc.petCardTop}>
            <h3 style={pc.petCardName}>{petName}</h3>
            <span style={pc.stageBadge}>Stage {currentStage}</span>
            <span style={pc.activeBadge}>Activa</span>
          </div>
          <div style={pc.clicksRow}>
            🖱️ <strong>{totalClicks.toLocaleString()}</strong> clicks
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
              {(nextRequired - totalClicks).toLocaleString()} clicks para evolucionar
            </div>
          )}
        </div>
        <button style={isOverlayVisible ? pc.btnHide : pc.btnShow} onClick={onToggleOverlay}>
          {isOverlayVisible ? '⏸ Ocultar' : '▶ Mostrar mascota'}
        </button>
      </div>

      {/* Otras mascotas */}
      <div style={pc.otherPetsPanel}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#78767B',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Otras mascotas
        </div>

        {otherPets.length === 0 ? (
          <div style={pc.emptyPetsMsg}>
            <div style={{ fontSize: '32px' }}>🐣</div>
            <div style={{ fontSize: '12px', color: '#78767B', lineHeight: 1.5 }}>
              No tienes más mascotas.
            </div>
            <button style={{ ...l.btnAccent, marginTop: '4px', fontSize: '12px',
              padding: '6px 14px', borderRadius: '999px' }} onClick={onGoShop}>
              Comprar en Tienda
            </button>
          </div>
        ) : (
          <>
            {otherPets.map(pet => {
              const slug = pet.pet?.slug ?? 'slime'
              const emojis = PET_EMOJIS[slug] ?? PET_EMOJIS.slime
              return (
                <div key={pet.id}
                  style={{ ...pc.otherPetChip, opacity: switchingPet ? 0.6 : 1 }}
                  onClick={() => onSwitchPet(pet)}>
                  <div style={pc.otherPetEmoji}>{emojis[pet.current_stage - 1]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>
                      {pet.pet?.name ?? 'Mascota'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#78767B' }}>
                      Stage {pet.current_stage} · {pet.total_clicks.toLocaleString()} clicks
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#B8C0FF' }}>→</span>
                </div>
              )
            })}
            <div style={{ fontSize: '11px', color: '#B8C0FF', textAlign: 'center',
              marginTop: '8px', cursor: 'pointer' }} onClick={onGoShop}>
              + Conseguir más mascotas
            </div>
          </>
        )}
      </div>
    </div>
  )
}