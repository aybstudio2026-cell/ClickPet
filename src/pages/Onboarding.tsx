import { onboardingStyles as s } from '../styles/onboarding'
import { OnboardingStep } from '../hooks/useOnboarding'

interface Props {
  show: boolean
  step: number
  totalSteps: number
  currentStep: OnboardingStep
  isLast: boolean
  onNext: () => void
  onBack: () => void
  onFinish: () => void
  onSkip: () => void
}

export default function Onboarding({
  show, step, totalSteps, currentStep,
  isLast, onNext, onBack, onFinish, onSkip,
}: Props) {
  if (!show) return null

  return (
    <div style={s.overlay}>
      <div style={s.card}>

        {/* Panel superior */}
        <div style={s.topPanel}>
          <span style={s.stepNumber}>{currentStep.tag}</span>
          <div style={s.stepEmoji}>{currentStep.emoji}</div>
        </div>

        {/* Panel inferior */}
        <div style={s.bottomPanel}>
          <h2 style={s.stepTitle}>{currentStep.title}</h2>
          <p style={s.stepDesc}>{currentStep.desc}</p>

          {/* Dots */}
          <div style={s.dotsRow}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                ...s.dot,
                width: i === step ? '20px' : '6px',
                background: i === step
                  ? '#3D4B9E'
                  : i < step
                    ? '#B8C0FF'
                    : '#E8E7F0',
              }} />
            ))}
          </div>

          {/* Botones */}
          <div style={s.btnRow}>
            {step > 0 && (
              <button style={s.btnBack} onClick={onBack}>← Atrás</button>
            )}
            {isLast ? (
              <button style={s.btnFinish} onClick={onFinish}>
                ¡Empezar! 🚀
              </button>
            ) : (
              <button style={s.btnNext} onClick={onNext}>
                Siguiente →
              </button>
            )}
          </div>

          {!isLast && (
            <button style={s.skipBtn} onClick={onSkip}>
              Saltar tutorial
            </button>
          )}
        </div>

      </div>
    </div>
  )
}