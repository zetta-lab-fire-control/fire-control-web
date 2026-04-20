/**
 * useAuth — Hook de autenticação com detecção real de 3 roles
 *
 * Estratégia de role detection (sem alterar o backend):
 *  1. POST /login → access_token (JWT contém apenas sub = user_id)
 *  2. GET /users?limit=1  → 200 = admin
 *  3. PUT /occurrences/{dummy} → 403 = user comum | 404/422 = firefighter
 *  Role é cacheada em localStorage (chave v2) para evitar roundtrips extras.
 */

import { useCallback, useState } from 'react'
import { authApi, adminApi } from '../services/api.js'

const STORAGE_KEY  = 'auth_user_v2'  // v2 — invalida cache com role 'firefighter' hardcoded
const TOKEN_KEY    = 'auth_token'


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
 * Fluxo:
 *  1. GET /users?limit=1  → 200 = admin
 *  2. PUT /occurrences/{dummy} → 404|422 = firefighter (tem permissão mas ID ruim)
 *                              → 403      = user comum  (sem permissão)
 *
 * @param {string} token - Bearer token do usuário
 * @returns {Promise<'admin'|'firefighter'|'user'>}
 */
async function detectRole(token) {
  // Etapa 1 — verifica se é admin
  try {
    await adminApi.listUsers(1, token)
    return 'admin'
  } catch (adminErr) {
    // Qualquer erro aqui significa "não é admin" — continua para etapa 2
    if (adminErr?.status !== 403 && adminErr?.status !== 401) {
      console.warn('[detectRole] Resposta inesperada em /users:', adminErr?.status)
    }
  }

  // Etapa 2 — verifica se é bombeiro
  try {
    const isFirefighter = await adminApi.probeFirefighter(token)
    return isFirefighter ? 'firefighter' : 'user'
  } catch {
    // Erro de rede ou outro problema — assume user por segurança
    return 'user'
  }
}


export function useAuth() {
  const [user, setUser] = useState(() => readStoredUser())

  const isAdmin      = user?.role === 'admin'
  const isFirefighter = user?.role === 'firefighter' || user?.role === 'admin'
  const isUser       = user?.role === 'user' || !user?.role

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

    // Detecta role via chamadas de permissão ao backend
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
