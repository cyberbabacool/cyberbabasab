import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App'
import './index.css'

// Global axios interceptor: on 401, notify the app to show the login screen
axios.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('cbs:unauthorized'))
    }
    return Promise.reject(error)
  }
)

// Apply stored preferences before first render
function applyStoredPrefs() {
  try {
    const raw = localStorage.getItem('cyberbabasab_prefs')
    if (!raw) return
    const prefs = JSON.parse(raw)

    if (prefs.appName) {
      document.title = prefs.appName
    }

    const logoUrl = prefs.logoUrl || '/logo.png'
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
      || document.createElement('link') as HTMLLinkElement
    link.rel = 'icon'
    link.href = logoUrl
    document.head.appendChild(link)

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

    if (prefs.theme === 'light') {
      document.documentElement.classList.add('light-mode')
    }
  } catch {}
}

applyStoredPrefs()

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
