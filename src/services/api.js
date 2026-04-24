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

// Backend cacheia GETs de /occurrences por 180s (FastAPICache + Redis) e
// POST /reports nao invalida o namespace "occurrences". Sem isso, novas
// denuncias demoram ate 3 minutos para aparecer no mapa. O parametro _t
// muda a chave do cache a cada request, garantindo dados frescos.
const bust = () => ({ _t: Date.now() })

export const occurrenceApi = {
  list: (params = {}, config = {}) =>
    http.get('/occurrences', { params: { ...bust(), ...params }, ...config }).then((r) => r.data),

  getById: (id) => http.get(`/occurrences/${id}`, { params: bust() }).then((r) => r.data),

  updateStatus: (id, status) => http.put(`/occurrences/${id}`, { status }).then((r) => r.data),

  getPublicIndicators: () =>
    http.get('/occurrences/indicators/public', { params: bust() }).then((r) => r.data),

  getHistory: (startDate, endDate) =>
    http.get('/occurrences/indicators/history', {
      params: { ...bust(), start_date: startDate, end_date: endDate },
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
   * Chama GET /occurrences/indicators/operational, que é gated por admin-or-firefighter:
   *   - 403 → usuário comum (sem permissão)
   *   - 200 ou 4xx de validação → bombeiro/admin (passou da autorização)
   */
  probeFirefighter: async (token) => {
    try {
      await http.get('/occurrences/indicators/operational', {
        headers: { Authorization: `Bearer ${token}` },
        params: { city: '__probe__', target_date: '2024-01-01' },
      })
      return true
    } catch (err) {
      if (err?.status === 403 || err?.status === 401) return false
      // 404/422/500 = passou da autorização, é firefighter/admin
      return true
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

