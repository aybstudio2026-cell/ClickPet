import { useState, useEffect } from 'react'

const STORAGE_KEY = 'clickpet_onboarding_done'

export interface OnboardingStep {
  emoji: string
  tag: string
  title: string
  desc: string
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    emoji: '🐾',
    tag: 'Paso 1 de 4',
    title: '¡Bienvenido a ClickPet!',
    desc: 'Tu mascota virtual vive encima de todas tus ventanas y crece con cada click que haces mientras trabajas, estudias o navegas.',
  },
  {
    emoji: '🖱️',
    tag: 'Paso 2 de 4',
    title: 'Cada click cuenta',
    desc: 'Haz click en cualquier parte de la pantalla y tu mascota lo contará automáticamente. No necesitas hacer nada especial, solo usa tu computadora.',
  },
  {
    emoji: '✨',
    tag: 'Paso 3 de 4',
    title: '5 stages de evolución',
    desc: 'Tu mascota evoluciona al alcanzar 1K, 5K, 25K y 50K clicks. ¡Llega al stage Legendario para desbloquear su forma final!',
  },
  {
    emoji: '🧪',
    tag: 'Paso 4 de 4',
    title: 'Pociones y mascotas',
    desc: 'Usa pociones para sumar clicks extra y desbloquea nuevas mascotas con las monedas de la tienda. ¡Colecciónalas todas!',
  },
]

export function useOnboarding() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setShow(true)
  }, [])

  function next() {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(s => s + 1)
    }
  }

  function back() {
    if (step > 0) setStep(s => s - 1)
  }

  function finish() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShow(false)
    setStep(0)
  }

  function skip() {
    finish()
  }

  // Para abrirlo manualmente desde Ajustes
  function openTutorial() {
    setStep(0)
    setShow(true)
  }

  const isLast = step === ONBOARDING_STEPS.length - 1
  const currentStep = ONBOARDING_STEPS[step]

  return {
    show, step, isLast,
    currentStep, totalSteps: ONBOARDING_STEPS.length,
    next, back, finish, skip, openTutorial,
  }
}