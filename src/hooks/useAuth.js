/**
 * Hook useAuth
 *
 * Gerencia o estado de autenticação do usuário via localStorage.
 * Expõe funções de login e logout, e os dados do usuário logado.
 *
 * Estrutura salva no localStorage (chave 'auth_user'):
 * {
 *   token: string,       // JWT — preenchido quando backend implementar
 *   role: string,        // 'admin' | 'user' | 'firefighter'
 *   email: string,
 * }
 *
 * TODO (integração pendente): quando o backend retornar JWT real,
 * substituir o objeto mockado pelo payload decodificado do token.
 */

import { useCallback, useState } from 'react'
import { authApi } from '../services/api.js'

const STORAGE_KEY = 'auth_user'

/** Lê o usuário salvo no localStorage ou retorna null */
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

  /** Retorna true se o usuário logado é bombeiro ou admin */
  const isFirefighter = user?.role === 'firefighter' || user?.role === 'admin'

  /**
   * Realiza login via API e persiste o usuário no localStorage.
   * Redireciona automaticamente conforme o perfil.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ role: string }>}
   */
  const login = useCallback(async (email, password) => {
    const result = await authApi.login({ email, password })

    /*
     * TODO (integração pendente): o backend ainda retorna `true` hardcoded.
     * Quando JWT for implementado, `result` conterá { token, role, email }.
     * Por enquanto, lemos o role da resposta ou usamos 'user' como padrão.
     */
    const userData = {
      token: result?.token ?? '',
      role: result?.role ?? 'user',
      email,
    }

    // Persiste token e dados do usuário para uso nas próximas requisições
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    if (userData.token) {
      localStorage.setItem('auth_token', userData.token)
    }

    setUser(userData)
    return userData
  }, [])

  /** Encerra sessão e limpa localStorage */
  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignora erros de logout no backend — limpa localmente de qualquer forma
    }
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('auth_token')
    setUser(null)
  }, [])

  return { user, isFirefighter, login, logout }
}
