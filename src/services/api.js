/**
 * Camada de serviço centralizada para comunicação com a API REST.
 *
 * Base URL: https://localhost:8000
 * Nota: em desenvolvimento, o certificado SSL é autoassinado.
 * Acesse https://localhost:8000/docs uma vez no navegador para aceitar.
 *
 * Todos os erros da API são capturados aqui e relançados com mensagem legível.
 */

import axios from 'axios'

// ------------------------------------------------------------
// Instância base do axios
// ------------------------------------------------------------

const http = axios.create({
  baseURL: 'https://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// Interceptor: injeta o token JWT armazenado no localStorage em toda requisição
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: tratamento global de erros de resposta
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ?? error.message ?? 'Erro desconhecido na comunicação com a API.'
    return Promise.reject(new Error(message))
  },
)

// ------------------------------------------------------------
// Autenticação — POST /api/auth/login
// Retorna: { token, role } (quando backend implementar JWT)
// ------------------------------------------------------------

export const authApi = {
  /**
   * Realiza login com email e senha.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string, role: 'admin'|'user'|'firefighter' }>}
   *
   * TODO (integração pendente): atualmente o backend retorna `true`.
   * Quando JWT for implementado, o objeto retornado conterá { token, role }.
   */
  login: (credentials) => http.post('/api/auth/login', credentials).then((r) => r.data),

  /** Encerra a sessão do usuário no backend. */
  logout: () => http.post('/api/auth/logout').then((r) => r.data),
}

// ------------------------------------------------------------
// Ocorrências
// ------------------------------------------------------------

export const occurrenceApi = {
  /**
   * Lista ocorrências paginadas.
   * Rota protegida — requer perfil ADMIN ou FIREFIGHTER.
   * @param {{ city?: string, status?: string, skip?: number, limit?: number }} params
   */
  list: (params = {}) =>
    http.get('/occurrences', { params }).then((r) => r.data),

  /**
   * Busca os detalhes completos de uma ocorrência pelo ID.
   * Inclui denúncias vinculadas e URLs de imagens.
   * @param {string} id - UUID da ocorrência
   */
  getById: (id) => http.get(`/occurrences/${id}`).then((r) => r.data),

  /**
   * Atualiza o status de uma ocorrência.
   * Rota protegida — exclusiva para bombeiros/admin.
   * @param {string} id - UUID da ocorrência
   * @param {string} status - Novo status (ex: 'resolved', 'executing')
   */
  updateStatus: (id, status) =>
    http.put(`/occurrences/${id}`, { status }).then((r) => r.data),

  /**
   * Retorna os indicadores públicos para a página inicial.
   * Campos: active_occurrences, affected_municipalities_count, risk_level, last_updated.
   */
  getPublicIndicators: () =>
    http.get('/occurrences/indicators/public').then((r) => r.data),

  /**
   * Retorna o histórico de ocorrências por período para o gráfico.
   * @param {string} startDate - ISO date string (YYYY-MM-DD)
   * @param {string} endDate - ISO date string (YYYY-MM-DD)
   */
  getHistory: (startDate, endDate) =>
    http
      .get('/occurrences/indicators/history', {
        params: { start_date: startDate, end_date: endDate },
      })
      .then((r) => r.data),
}

// ------------------------------------------------------------
// Denúncias — POST /reports
// ------------------------------------------------------------

export const reportApi = {
  /**
   * Registra uma nova denúncia de foco de incêndio.
   * Rota protegida — requer autenticação.
   *
   * Fluxo esperado quando há foto:
   *   1. POST /media      → recebe { upload_url, instance_metadata }
   *   2. PUT upload_url   → envia o arquivo diretamente para o MinIO
   *   3. POST /reports    → envia os dados da denúncia com a lista de IDs de mídia
   *
   * @param {object} reportData - Dados da denúncia
   * @param {Array}  mediaList  - Lista de objetos de mídia já criados (pode ser vazia)
   */
  create: (reportData, mediaList = []) =>
    http.post('/reports', reportData, { params: { media: mediaList } }).then((r) => r.data),
}

// ------------------------------------------------------------
// Mídia — upload de fotos via MinIO (URL pré-assinada)
// ------------------------------------------------------------

export const mediaApi = {
  /**
   * Cria um registro de mídia e obtém a URL de upload pré-assinada do MinIO.
   * @param {{ extension: string, bucket: string }} mediaData
   * @returns {Promise<{ instance_metadata, upload_url }>}
   */
  create: (mediaData) => http.post('/media', mediaData).then((r) => r.data),

  /**
   * Faz o upload direto do arquivo para o MinIO usando a URL pré-assinada.
   * Usa axios puro sem a instância base (URL externa).
   * @param {string} uploadUrl - URL pré-assinada retornada pelo backend
   * @param {File} file - Arquivo de imagem do usuário
   */
  uploadToStorage: (uploadUrl, file) =>
    axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } }),
}
