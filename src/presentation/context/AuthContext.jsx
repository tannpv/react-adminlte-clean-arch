import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (raw) {
      try { setUser(JSON.parse(raw)) } catch {}
    }
    const onUnauthorized = () => setUser(null)
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, setUser, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
