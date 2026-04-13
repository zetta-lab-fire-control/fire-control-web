/**
 * Adapter de ocorrências: converte o formato da API para o formato
 * usado pelos componentes React.
 *
 * A API retorna:
 *   - IDs como UUID string
 *   - Localização como { latitude, longitude }
 *   - Intensidade como 'low' | 'medium' | 'high'
 *   - Status como 'pending_confirmation' | 'validated' | 'executing' | 'resolved' | 'invalidated'
 *   - Campos em snake_case (created_at, resolved_at…)
 *
 * Os componentes esperam:
 *   - lat / lng como números
 *   - Intensidade como 'BAIXA' | 'MEDIA' | 'ALTA' | 'CONTROLADO'
 *   - Status como 'EM_ANALISE' | 'VALIDADO_AUTO' | …
 *   - reportsCount, createdAt, updatedAt em camelCase
 */

// Mapeamentos de enum: API → componentes internos

/** Converte intensidade da API para o formato interno usado nos componentes */
export const intensityFromApi = {
  low: 'BAIXA',
  medium: 'MEDIA',
  high: 'ALTA',
}

/** Converte intensidade do formato interno para o formato esperado pela API */
export const intensityToApi = {
  BAIXA: 'low',
  MEDIA: 'medium',
  ALTA: 'high',
  CONTROLADO: 'low', // fallback — controlado não existe na API, usamos low
}

/** Converte status da API para o formato interno */
export const statusFromApi = {
  pending_confirmation: 'EM_ANALISE',
  validated: 'VALIDADO_AUTO',
  executing: 'EM_ATENDIMENTO',
  resolved: 'SOLUCIONADO',
  invalidated: 'ALERTA_FALSO',
}

/** Converte status do formato interno para o formato esperado pela API */
export const statusToApi = {
  EM_ANALISE: 'pending_confirmation',
  VALIDADO_AUTO: 'validated',
  CONFIRMADO_BOMBEIROS: 'executing', // mapeado para executing (mais próximo)
  EM_ATENDIMENTO: 'executing',
  SOLUCIONADO: 'resolved',
  ALERTA_FALSO: 'invalidated',
}

// Funções de conversão

/**
 * Converte uma ocorrência retornada pela API para o formato
 * consumido pelos componentes React.
 *
 * @param {object} apiOccurrence - Objeto retornado pelo endpoint GET /occurrences
 * @returns {object} Ocorrência no formato interno
 */
export function adaptOccurrence(apiOccurrence) {
  const { id, location, intensity, status, city, created_at, resolved_at, reports = [] } =
    apiOccurrence

  // Extrai lat/lng do objeto de localização da API
  const lat = location?.latitude ?? 0
  const lng = location?.longitude ?? 0

  // Coleta URLs de fotos das denúncias vinculadas
  const photos = reports
    .map((r) => r.photo_url)
    .filter(Boolean)

  return {
    id,
    lat,
    lng,
    city: city ?? 'Localização desconhecida',
    district: '', // API não retorna distrito — mantido vazio
    intensity: intensityFromApi[intensity] ?? 'BAIXA',
    status: statusFromApi[status] ?? 'EM_ANALISE',
    reportsCount: reports.length,
    createdAt: created_at,
    updatedAt: resolved_at ?? created_at,
    photos,

    // Lista de denúncias vinculadas (para exibição no painel)
    reports: reports.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      intensity: intensityFromApi[r.intensity_perceived] ?? 'BAIXA',
      photo: r.photo_url ?? null,
    })),
  }
}

/**
 * Converte uma lista de ocorrências da API.
 * @param {object[]} apiList
 * @returns {object[]}
 */
export function adaptOccurrenceList(apiList = []) {
  return apiList
    .filter((occ) => {
      // Valida coordenadas geográficas antes de renderizar no mapa
      const lat = occ.location?.latitude
      const lng = occ.location?.longitude
      const latValido = typeof lat === 'number' && lat >= -90 && lat <= 90
      const lngValido = typeof lng === 'number' && lng >= -180 && lng <= 180
      return latValido && lngValido
    })
    .map(adaptOccurrence)
}

/**
 * Converte indicadores públicos da API para o formato dos StatCards.
 * @param {object} apiIndicators
 * @returns {{ activeToday, affectedCities, risk, lastUpdate }}
 */
export function adaptPublicIndicators(apiIndicators) {
  const { active_occurrences, affected_municipalities_count, risk_level, last_updated } =
    apiIndicators

  // Mapeia o nível de risco da API para o tom de cor dos cards
  const riskToneMap = { low: 'emerald', medium: 'amber', high: 'red' }
  const riskLabelMap = { low: 'Baixo', medium: 'Médio', high: 'Alto' }

  return {
    activeToday: active_occurrences ?? 0,
    affectedCities: affected_municipalities_count ?? 0,
    risk: {
      label: riskLabelMap[risk_level] ?? 'Baixo',
      tone: riskToneMap[risk_level] ?? 'emerald',
    },
    lastUpdate: last_updated ? new Date(last_updated) : null,
  }
}
