import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const raw = error.response?.data?.detail

    // FastAPI retorna detail como array de objetos em erros 422 (validação)
    // Ex: [{ loc: ['body', 'email'], msg: 'value is not a valid email address', type: '...' }]
    let message
    if (Array.isArray(raw)) {
      message = raw
        .map((e) => {
          const field = e.loc?.slice(1).join('.') ?? ''
          return field ? `${field}: ${e.msg}` : e.msg
        })
        .join(' | ')
    } else {
      message = raw ?? error.message ?? 'Erro desconhecido na comunicação com a API.'
    }

    const enriched = new Error(message)
    // Preserva o status HTTP original para que helpers de detecção de role possam lê-lo
    enriched.status = error.response?.status ?? 0
    enriched.response = error.response
    return Promise.reject(enriched)
  },
)



export const authApi = {
  login: (credentials) => {
    const formData = new URLSearchParams()
    formData.append('username', credentials.email)
    formData.append('password', credentials.password)

    return http.post('/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then((r) => r.data)
  },

  logout: () => http.post('/logout').then((r) => r.data),
}

export const occurrenceApi = {
  list: (params = {}, config = {}) => http.get('/occurrences', { params, ...config }).then((r) => r.data),

  getById: (id) => http.get(`/occurrences/${id}`).then((r) => r.data),

  updateStatus: (id, status) => http.put(`/occurrences/${id}`, { status }).then((r) => r.data),

  getPublicIndicators: () => http.get('/occurrences/indicators/public').then((r) => r.data),

  getHistory: (startDate, endDate) =>
    http.get('/occurrences/indicators/history', {
      params: { start_date: startDate, end_date: endDate },
    }).then((r) => r.data),
}

export const userApi = {
  /** Cadastro público de usuário comum — POST /users (sem autenticação) */
  create: (data) => http.post('/users', data).then((r) => r.data),
}

export const reportApi = {
  create: (reportData, mediaList = []) =>
    http.post('/reports', { report: reportData, media: mediaList }).then((r) => r.data),
}


export const mediaApi = {
  create: (mediaData) => http.post('/media', mediaData).then((r) => r.data),

  uploadToStorage: (uploadUrl, file) =>
    axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } }),
}

export const adminApi = {
  /**
   * Lista usuários — endpoint restrito a admins (GET /users).
   * Passamos token explicitamente para permitir uso antes de setar no interceptor.
   */
  listUsers: (limit = 20, token = null) => {
    const config = { params: { limit } }
    if (token) config.headers = { Authorization: `Bearer ${token}` }
    return http.get('/users', config).then((r) => r.data)
  },

  /**
   * Sonda se o usuário tem permissão de bombeiro.
   * PUT /occurrences/{dummy-id} com body vazio:
   *   - 403 → usuário comum (sem permissão)
   *   - 404 | 422 → bombeiro (tem permissão, mas ID inválido ou body ruim)
   * Retorna o status HTTP bruto para análise.
   */
  probeFirefighter: async (token) => {
    try {
      await http.put(
        '/occurrences/00000000-0000-0000-0000-000000000000',
        // Usa um valor válido do enum da API para evitar 422 por valor inválido.
        // O objetivo é apenas checar se o usuário tem permissão (não 403):
        //   403 → user comum (sem permissão de bombeiro)
        //   404 → bombeiro (ID não existe, mas autorizou)
        { status: 'pending_confirmation' },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      // 200 inesperado (ID existiu) — tem permissão = firefighter
      return true
    } catch (err) {
      // O interceptor do axios cria um Error customizado com .status já preenchido.
      // Não usar err.cause.status (não existe) nem err.response.status (já foi consumido).
      const httpStatus = err?.status ?? 0
      // 403 = sem permissão = user comum
      // 404 = ID não existe, mas autorizou = firefighter
      return httpStatus !== 403
    }
  },

  getUserById: (id) => http.get(`/users/${id}`).then((r) => r.data),

  /** Cria conta de bombeiro — POST /firefighters (admin-only) */
  createFirefighter: (data) => http.post('/firefighters', data).then((r) => r.data),

  /** Atualiza dados de um usuário — PUT /users/{id} (admin ou owner) */
  updateUser: (id, data) => http.put(`/users/${id}`, data).then((r) => r.data),

  /** Deleta um usuário — DELETE /users/{id} (admin-only) */
  deleteUser: (id) => http.delete(`/users/${id}`).then((r) => r.data),
}

