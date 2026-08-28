import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, type AuthUser } from '../api/client'

const STORAGE_KEY = 'resumeiq_auth'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStored(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStored())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      const stored = loadStored()
      if (!stored?.token) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const me = await api.me(stored.token)
        if (!cancelled) {
          const next = { ...stored, email: me.email, name: me.name }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          setUser(next)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const next = await api.login({ email, password })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        setUser(next)
      },
      async register(name, email, password) {
        const next = await api.register({ name, email, password })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        setUser(next)
      },
      async logout() {
        if (user?.token) {
          try {
            await api.logout(user.token)
          } catch {
            /* ignore */
          }
        }
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
