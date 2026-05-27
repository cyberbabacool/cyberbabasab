import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Apply stored preferences before first render
function applyStoredPrefs() {
  try {
    const raw = localStorage.getItem('cyberbabasab_prefs')
    if (!raw) return
    const prefs = JSON.parse(raw)

    // Title
    if (prefs.appName) {
      document.title = prefs.appName
    }

    // Favicon
    const logoUrl = prefs.logoUrl || '/logo.png'
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
      || document.createElement('link') as HTMLLinkElement
    link.rel = 'icon'
    link.href = logoUrl
    document.head.appendChild(link)

    // Accent color
    if (prefs.accent) {
      const accents: Record<string, string[]> = {
        cyan:   ['#22d3ee', 'rgba(34,211,238,0.1)',  'rgba(34,211,238,0.2)'],
        violet: ['#a78bfa', 'rgba(167,139,250,0.1)', 'rgba(167,139,250,0.2)'],
        green:  ['#4ade80', 'rgba(74,222,128,0.1)',  'rgba(74,222,128,0.2)'],
        orange: ['#fb923c', 'rgba(251,146,60,0.1)',  'rgba(251,146,60,0.2)'],
        rose:   ['#fb7185', 'rgba(251,113,133,0.1)', 'rgba(251,113,133,0.2)'],
      }
      const a = accents[prefs.accent]
      if (a) {
        document.documentElement.style.setProperty('--accent', a[0])
        document.documentElement.style.setProperty('--accent-bg', a[1])
        document.documentElement.style.setProperty('--accent-border', a[2])
      }
    }

    // Light mode
    if (prefs.theme === 'light') {
      document.documentElement.classList.add('light-mode')
    }
  } catch {}
}

applyStoredPrefs()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
