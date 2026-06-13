import { useState, useEffect, createContext, useContext } from 'react'
import axios from 'axios'

export type AuthState = 'loading' | 'setup' | 'login' | 'authenticated'

export interface AuthContextType {
  state: AuthState
  username: string
  login: (username: string, password: string) => Promise<string | null>
  setup: (username: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  changePassword: (current: string, next: string) => Promise<string | null>
  forceLogout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)
export const useAuth = () => useContext(AuthContext)!

export function useAuthStore(): AuthContextType {
  const [state, setState] = useState<AuthState>('loading')
  const [username, setUsername] = useState('')

  useEffect(() => {
    axios.get('/auth/status').then(r => {
      if (!r.data.setupDone) { setState('setup'); return }
      axios.get('/auth/me').then(r2 => {
        setUsername(r2.data.username)
        setState('authenticated')
      }).catch(() => setState('login'))
    }).catch(() => setState('login'))
  }, [])

  useEffect(() => {
    const handler = () => {
      setState(s => s === 'authenticated' ? 'login' : s)
      setUsername('')
    }
    window.addEventListener('cbs:unauthorized', handler)
    return () => window.removeEventListener('cbs:unauthorized', handler)
  }, [])

  const login = async (u: string, p: string): Promise<string | null> => {
    try {
      await axios.post('/auth/login', { username: u, password: p })
      setUsername(u)
      setState('authenticated')
      return null
    } catch (e: any) {
      return e.response?.data?.error ?? 'Erreur de connexion'
    }
  }

  const setup = async (u: string, p: string): Promise<string | null> => {
    try {
      await axios.post('/auth/setup', { username: u, password: p })
      setUsername(u)
      setState('authenticated')
      return null
    } catch (e: any) {
      return e.response?.data?.error ?? 'Erreur de configuration'
    }
  }

  const logout = async () => {
    await axios.post('/auth/logout')
    setState('login')
    setUsername('')
  }

  const forceLogout = () => {
    setState('login')
    setUsername('')
  }

  const changePassword = async (current: string, next: string): Promise<string | null> => {
    try {
      await axios.post('/auth/change-password', { currentPassword: current, newPassword: next })
      return null
    } catch (e: any) {
      return e.response?.data?.error ?? 'Erreur'
    }
  }

  return { state, username, login, setup, logout, changePassword, forceLogout }
}
