import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Ukryj splash screen gdy React się załaduje
const splash = document.getElementById('splash')
if (splash) {
  splash.classList.add('hidden')
  setTimeout(() => splash.remove(), 500)
}
