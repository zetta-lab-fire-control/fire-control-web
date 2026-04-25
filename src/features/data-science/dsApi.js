import axios from 'axios'

const _http = axios.create({
  baseURL: import.meta.env.VITE_DS_API_URL ?? 'http://localhost:8001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

export const dataScienceApi = {
  getInfo() {
    return _http.get('/dados/info').then((r) => r.data)
  },

  getStats() {
    return _http.get('/dados/estatisticas').then((r) => r.data)
  },

  getUniqueValues(coluna) {
    return _http.get(`/dados/valores-unicos/${coluna}`).then((r) => r.data)
  },

  filterData(params = {}) {
    return _http.post('/dados/filtrar', params).then((r) => r.data)
  },

  listModels() {
    return _http.get('/modelos/listar').then((r) => r.data)
  },

  predictOnDataset({ nomeModelo, tipoModelo, filtroAno, filtroBioma, filtroUf, nLinhas = 1000 }) {
    return _http.post('/predicao/dataset', null, {
      params: {
        nome_modelo: nomeModelo,
        tipo_modelo: tipoModelo,
        ...(filtroAno   && { filtro_ano:   filtroAno }),
        ...(filtroBioma && { filtro_bioma: filtroBioma }),
        ...(filtroUf    && { filtro_uf:    filtroUf }),
        n_linhas: nLinhas,
      },
    }).then((r) => r.data)
  },
}
