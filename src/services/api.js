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
    const message = error.response?.data?.detail ?? error.message ?? 'Erro desconhecido na comunicação com a API.'
    return Promise.reject(new Error(message))
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
  list: (params = {}) => http.get('/occurrences', { params }).then((r) => r.data),
  
  getById: (id) => http.get(`/occurrences/${id}`).then((r) => r.data),
  
  updateStatus: (id, status) => http.put(`/occurrences/${id}`, { status }).then((r) => r.data),
  
  getPublicIndicators: () => http.get('/occurrences/indicators/public').then((r) => r.data),
  
  getHistory: (startDate, endDate) =>
    http.get('/occurrences/indicators/history', {
      params: { start_date: startDate, end_date: endDate },
    }).then((r) => r.data),
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
