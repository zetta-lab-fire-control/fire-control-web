/**
 * AuthContext — Contexto global de autenticação
 *
 * Envolve a aplicação para que qualquer componente possa consumir
 * o estado de autenticação sem prop-drilling.
 *
 * Uso:
 *   const { user, isAdmin, isFirefighter, login, logout } = useAuthContext()
 */

import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>')
  return ctx
}
