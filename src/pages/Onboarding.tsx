import { useState } from 'react'

interface Props {
  onFinish: () => void
}

const steps = [
  {
    emoji: '🐾',
    title: '¡Bienvenido a Click Pet!',
    desc: 'Tu mascota virtual vive encima de todas tus ventanas y crece con cada click que haces mientras trabajas o navegas.',
  },
  {
    emoji: '🖱️',
    title: 'Cada click cuenta',
    desc: 'Haz click en cualquier parte de la pantalla y tu mascota lo contará. No necesitas hacer nada especial, solo usa tu computadora normalmente.',
  },
  {
    emoji: '✨',
    title: '5 stages de evolución',
    desc: 'Tu mascota evoluciona al alcanzar 1K, 5K, 25K y 50K clicks. ¡Llega al stage Legendario para desbloquear su forma final!',
  },
  {
    emoji: '🧪',
    title: 'Pociones y mascotas',
    desc: 'Compra pociones para activar animaciones especiales y desbloquea nuevas mascotas con las monedas de la tienda.',
  },
]

export default function Onboarding({ onFinish }: Props) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.emoji}>{current.emoji}</div>
        <h2 style={s.title}>{current.title}</h2>
        <p style={s.desc}>{current.desc}</p>

        {/* Dots */}
        <div style={s.dots}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                ...s.dot,
                background: i === step ? '#4ade80' : '#0f3460',
                transform: i === step ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        <div style={s.btnRow}>
          {step > 0 && (
            <button style={s.btnBack} onClick={() => setStep(s => s - 1)}>
              ← Atrás
            </button>
          )}
          <button
            style={{ ...s.btnNext, flex: step === 0 ? 1 : undefined }}
            onClick={() => isLast ? onFinish() : setStep(s => s + 1)}
          >
            {isLast ? '¡Empezar! 🚀' : 'Siguiente →'}
          </button>
        </div>

        {!isLast && (
          <button style={s.skip} onClick={onFinish}>
            Saltar introducción
          </button>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000,
  },
  card: {
    background: '#16213e', borderRadius: 20, padding: '2rem',
    width: '90%', maxWidth: 360, textAlign: 'center',
    border: '1px solid #0f3460',
    display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  emoji: { fontSize: 56, lineHeight: 1 },
  title: { fontSize: 20, fontWeight: 600, color: '#e2e8f0', margin: 0 },
  desc: { fontSize: 14, color: '#94a3b8', lineHeight: 1.7, margin: 0 },
  dots: { display: 'flex', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: '50%', transition: 'all 0.2s' },
  btnRow: { display: 'flex', gap: 8 },
  btnNext: {
    padding: '10px 20px', borderRadius: 10, border: 'none',
    background: '#4ade80', color: '#1a1a2e',
    fontWeight: 700, fontSize: 14, cursor: 'pointer',
  },
  btnBack: {
    padding: '10px 16px', borderRadius: 10,
    border: '1px solid #0f3460', background: 'transparent',
    color: '#94a3b8', fontSize: 14, cursor: 'pointer',
  },
  skip: {
    background: 'none', border: 'none',
    color: '#64748b', fontSize: 12, cursor: 'pointer',
    textDecoration: 'underline',
  },
}