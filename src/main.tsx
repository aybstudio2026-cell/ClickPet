import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import PetOverlay from './components/pet/PetOverlay'

const params = new URLSearchParams(window.location.search)
const label = params.get('window') ?? 'dashboard'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {label === 'overlay' ? <PetOverlay /> : <App />}
  </React.StrictMode>
)