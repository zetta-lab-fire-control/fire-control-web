import { useCallback, useState } from 'react'
import { authApi } from '../services/api.js'

const STORAGE_KEY = 'auth_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState(() => readStoredUser())

  const isFirefighter = user?.role === 'firefighter' || user?.role === 'admin'

  const login = useCallback(async (email, password) => {
    const result = await authApi.login({ email, password })

    const accessToken = result?.access_token ?? ''
    
    let userId = ''
    let parsedRole = 'firefighter' 
    
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        userId = payload.sub ?? ''
      } catch (e) {
        console.error('Falha ao decodificar JWT', e)
      }
    }

    const userData = {
      token: accessToken,
      id: userId,
      role: parsedRole,
      email,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    if (userData.token) {
      localStorage.setItem('auth_token', userData.token)
    }

    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      console.warn('Sessão indisponível remotamente. Encerrando o cache local.')
    }
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('auth_token')
    setUser(null)
  }, [])

  return { user, isFirefighter, login, logout }
}
