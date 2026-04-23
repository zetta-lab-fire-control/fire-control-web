/**
 * useAuth — Hook de autenticação com detecção real de 3 roles
 *
 * Estratégia de role detection (sem alterar o backend):
 *  1. POST /login → access_token (JWT contém apenas sub = user_id)
 *  2. GET /users?limit=1 (admin-only) → 200 = admin, 403 = segue
 *  3. GET /occurrences/indicators/operational (admin/firefighter) → 403 = user
 *  Role é cacheada em localStorage (chave v3) para invalidar caches antigos.
 */

import { useCallback, useState } from 'react'
import { authApi, adminApi } from '../services/api.js'

const STORAGE_KEY = 'auth_user_v3'  // v3 — novo probe de firefighter
const TOKEN_KEY = 'auth_token'


function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Detecta a role exata do usuário recém-autenticado.
 *
 * @param {string} token - Bearer token do usuário
 * @returns {Promise<'admin'|'firefighter'|'user'>}
 */
async function detectRole(token) {
  // Etapa 1 — admin consegue listar usuários
  try {
    await adminApi.listUsers(1, token)
    return 'admin'
  } catch (adminErr) {
    if (adminErr?.status !== 403 && adminErr?.status !== 401) {
      console.warn('[detectRole] Resposta inesperada em /users:', adminErr?.status)
    }
  }

  // Etapa 2 — probe em endpoint admin-or-firefighter
  try {
    const isFirefighter = await adminApi.probeFirefighter(token)
    return isFirefighter ? 'firefighter' : 'user'
  } catch {
    return 'user'
  }
}

export function useAuth() {
  const [user, setUser] = useState(() => readStoredUser())

  const isAdmin = user?.role === 'admin'
  const isFirefighter = user?.role === 'firefighter' || user?.role === 'admin'
  const isUser = user?.role === 'user' || !user?.role

  const login = useCallback(async (email, password) => {
    const result = await authApi.login({ email, password })

    const accessToken = result?.access_token ?? ''

    let userId = ''
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        userId = payload.sub ?? ''
      } catch (e) {
        console.error('Falha ao decodificar JWT', e)
      }
    }

    const role = accessToken ? await detectRole(accessToken) : 'user'

    const userData = {
      token: accessToken,
      id: userId,
      role,
      email,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    if (userData.token) {
      localStorage.setItem(TOKEN_KEY, userData.token)
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
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  return { user, isAdmin, isFirefighter, isUser, login, logout }
}
