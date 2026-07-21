import { useState, useEffect, createContext, useContext } from 'react'
import type { Lang } from '../i18n'
import { translations } from '../i18n'

export type AccentColor = 'cyan' | 'violet' | 'green' | 'orange' | 'rose'
export type ThemeMode = 'dark' | 'light'
export type SpeedUnit = 'MB/s' | 'KB/s'

export interface Prefs {
  theme: ThemeMode
  accent: AccentColor
  lang: Lang
  appName: string
  logoUrl: string
  refreshInterval: number
  dashJobs: number
  compact: boolean
  speedUnit: SpeedUnit
  notifComplete: boolean
  notifFail: boolean
  gaugeType: number
  historyLimit: number
  maxSpeedMbps: number
}

const DEFAULT_PREFS: Prefs = {
  theme: 'dark',
  accent: 'cyan',
  lang: 'fr',
  appName: 'CyberbabaSAB',
  logoUrl: '/logo.png',
  refreshInterval: 2000,
  dashJobs: 6,
  compact: false,
  speedUnit: 'MB/s',
  notifComplete: false,
  notifFail: false,
  gaugeType: 1,
  historyLimit: 25,
  maxSpeedMbps: 150,
}

const STORAGE_KEY = 'cyberbabasab_prefs'

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_PREFS
}

export const ACCENT_VARS: Record<AccentColor, { primary: string; bg: string; border: string; text: string }> = {
  cyan:   { primary: '#22d3ee', bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.2)',  text: '#22d3ee'  },
  violet: { primary: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', text: '#a78bfa'  },
  green:  { primary: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.2)',  text: '#4ade80'  },
  orange: { primary: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.2)',  text: '#fb923c'  },
  rose:   { primary: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)', text: '#fb7185'  },
}

export function usePrefsStore() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    applyTheme(prefs)
  }, [prefs])

  const update = (patch: Partial<Prefs>) => setPrefs(p => ({ ...p, ...patch }))
  const reset = () => setPrefs(DEFAULT_PREFS)
  const t = translations[prefs.lang]

  return { prefs, update, reset, t }
}

function applyTheme(prefs: Prefs) {
  // Update page title
  document.title = prefs.appName || 'CyberbabaSAB'

  // Update favicon
  const logoUrl = prefs.logoUrl || '/logo.png'
  let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  if (!link) {
    link = document.createElement('link') as HTMLLinkElement
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = logoUrl

  const root = document.documentElement
  const accent = ACCENT_VARS[prefs.accent]
  root.style.setProperty('--accent', accent.primary)
  root.style.setProperty('--accent-bg', accent.bg)
  root.style.setProperty('--accent-border', accent.border)
  root.style.setProperty('--accent-text', accent.text)
  if (prefs.theme === 'light') {
    root.classList.add('light-mode')
  } else {
    root.classList.remove('light-mode')
  }
}

// Context
export interface PrefsContextType { prefs: Prefs; update: (p: Partial<Prefs>) => void; reset: () => void; t: ReturnType<typeof usePrefsStore>['t'] }
export const PrefsContext = createContext<PrefsContextType | null>(null)
export const usePrefs = () => useContext(PrefsContext)!
