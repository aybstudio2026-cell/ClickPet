import { usePetStore } from '../../store/petStore'
import { petCardStyles as pc } from '../../styles/dashboard/petCard'
import { layoutStyles as l } from '../../styles/dashboard/layout'
import { OwnedPet, PET_EMOJIS, PET_STAGE_NAMES, STAGES_REQUIRED } from '../../hooks/usePetData'
import { usePetImage } from '../../hooks/usePetImage'

interface Props {
  activePetSlug: string
  petName: string
  ownedPets: OwnedPet[]
  switchingPet: boolean
  onToggleOverlay: () => void
  onSwitchPet: (pet: OwnedPet) => void
  onGoShop: () => void
}

// Componente para imagen de mascota en el chip pequeño
function PetChipImage({ slug, stage }: { slug: string; stage: number }) {
  const src = usePetImage(slug, stage, 'idle')
  const fallback = (PET_EMOJIS[slug] ?? PET_EMOJIS.slime)[stage - 1]
  if (src) return <img src={src} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
  return <span style={{ fontSize: '28px' }}>{fallback}</span>
}

export default function PetsView({
  activePetSlug, petName, ownedPets,
  switchingPet, onToggleOverlay, onSwitchPet, onGoShop,
}: Props) {
  const { activePet, isOverlayVisible, downloadingPets } = usePetStore()

  const currentStage = activePet?.current_stage ?? 1
  const totalClicks = activePet?.total_clicks ?? 0
  const nextRequired = STAGES_REQUIRED[currentStage] ?? 50000
  const progress = currentStage >= 5 ? 100 : Math.min((totalClicks / nextRequired) * 100, 100)
  const stageNames = PET_STAGE_NAMES[activePetSlug] ?? PET_STAGE_NAMES.slime
  const fallbackEmoji = (PET_EMOJIS[activePetSlug] ?? PET_EMOJIS.slime)[currentStage - 1]
  const otherPets = ownedPets.filter(p => p.id !== activePet?.id)

  const activePetImageSrc = usePetImage(activePetSlug, currentStage, 'idle')

  return (
    <div style={pc.petsGrid}>
      {/* Mascota activa */}
      <div style={pc.activePetBig}>
        <div style={pc.activePetImageBox}>
          {activePetImageSrc
            ? <img src={activePetImageSrc} style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
            : <span style={{ fontSize: '80px' }}>{fallbackEmoji}</span>
          }
        </div>
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
              const downloading = downloadingPets?.find(d => d.petId === pet.id)
              const isDownloading = downloading?.progress === 'downloading'
              const justDone = downloading?.progress === 'done'

              return (
                <div key={pet.id}
                  style={{
                    ...pc.otherPetChip,
                    opacity: (switchingPet || isDownloading) ? 0.6 : 1,
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onClick={() => !isDownloading && onSwitchPet(pet)}>

                  {/* Barra de descarga animada */}
                  {isDownloading && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: '3px', background: '#E8E7F0', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #B8C0FF, #3D4B9E)',
                        animation: 'downloadBar 1.5s ease-in-out infinite',
                        width: '60%',
                      }} />
                    </div>
                  )}

                  <div style={pc.otherPetEmoji}>
                    {isDownloading
                      ? <span style={{ fontSize: '20px' }}>⏳</span>
                      : <PetChipImage slug={slug} stage={pet.current_stage} />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>
                      {pet.pet?.name ?? 'Mascota'}
                    </div>
                    <div style={{ fontSize: '11px', color: isDownloading ? '#B8C0FF' : '#78767B' }}>
                      {isDownloading
                        ? '⬇️ Descargando assets...'
                        : justDone
                          ? '✅ ¡Lista!'
                          : `Stage ${pet.current_stage} · ${pet.total_clicks.toLocaleString()} clicks`
                      }
                    </div>
                  </div>
                  {!isDownloading && <span style={{ fontSize: '12px', color: '#B8C0FF' }}>→</span>}
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