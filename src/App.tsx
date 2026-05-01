import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'

const ONBOARDING_KEY = 'clickpet_onboarding_done'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) {
        const done = localStorage.getItem(ONBOARDING_KEY)
        if (!done) setShowOnboarding(true)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        const done = localStorage.getItem(ONBOARDING_KEY)
        if (!done) setShowOnboarding(true)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  function finishOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#1a1a2e', color: '#94a3b8', fontSize: 14,
    }}>
      Cargando...
    </div>
  )

  if (!session) return <Login />

  return (
    <>
      {showOnboarding && <Onboarding onFinish={finishOnboarding} />}
      <Dashboard />
    </>
  )
}