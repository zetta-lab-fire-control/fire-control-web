import axios from 'axios'

export const dataScienceApi = {
  _http: axios.create({
    baseURL: import.meta.env.VITE_DS_API_URL ?? 'http://localhost:8001',
    headers: { 'Content-Type': 'application/json' },
    timeout: 8_000,
  }),

  getInfo() {
    return this._http.get('/dados/info').then((r) => r.data)
  },

  getStats() {
    return this._http.get('/dados/estatisticas').then((r) => r.data)
  },

  filterData(params = {}) {
    return this._http.post('/dados/filtrar', params).then((r) => r.data)
  },

  listModels() {
    return this._http.get('/modelos/listar').then((r) => r.data)
  },
}
