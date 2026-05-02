import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import { useOnboarding } from './hooks/useOnboarding'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    show, step, isLast, currentStep, totalSteps,
    next, back, finish, skip, openTutorial,
  } = useOnboarding()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#F4F3FA', color: '#78767B', fontSize: 14,
      fontFamily: '"Plus Jakarta Sans", sans-serif',
    }}>
      Cargando...
    </div>
  )

  if (!session) return <Login />

  return (
    <>
      <Onboarding
        show={show}
        step={step}
        totalSteps={totalSteps}
        currentStep={currentStep}
        isLast={isLast}
        onNext={next}
        onBack={back}
        onFinish={finish}
        onSkip={skip}
      />
      <Dashboard openTutorial={openTutorial} />
    </>
  )
}