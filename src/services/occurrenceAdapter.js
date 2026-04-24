/**
 * Adapter de ocorrências: converte o formato da API para o formato
 * usado pelos componentes React.
 *
 * A API retorna:
 *   - IDs como UUID string
 *   - Localização como { latitude, longitude }
 *   - Intensidade como 'low' | 'medium' | 'high'
 *   - Status como 'pending_confirmation' | 'validated' | 'resolved' | 'invalidated'
 *   - Campos em snake_case (resolved_at, resolved_by)
 *
 * Os componentes esperam:
 *   - lat / lng como números
 *   - Intensidade como 'BAIXA' | 'MEDIA' | 'ALTA'
 *   - Status como 'EM_ANALISE' | 'VALIDADO_AUTO' | 'SOLUCIONADO' | 'ALERTA_FALSO'
 */

import { parseApiDate } from '../utils/formatters.js'

export const intensityFromApi = {
  low: 'BAIXA',
  medium: 'MEDIA',
  high: 'ALTA',
}

export const intensityToApi = {
  BAIXA: 'low',
  MEDIA: 'medium',
  ALTA: 'high',
}

export const statusFromApi = {
  pending_confirmation: 'EM_ANALISE',
  validated:            'VALIDADO_AUTO',
  resolved:             'SOLUCIONADO',
  invalidated:          'ALERTA_FALSO',
}

export const statusToApi = {
  EM_ANALISE:    'pending_confirmation',
  VALIDADO_AUTO: 'validated',
  SOLUCIONADO:   'resolved',
  ALERTA_FALSO:  'invalidated',
}

export function adaptOccurrence(apiOccurrence) {
  const { id, location, intensity, status, city, created_at, resolved_at, description, reports = [] } =
    apiOccurrence

  // Extrai lat/lng do objeto de localização da API (aceita múltiplos formatos)
  const lat = parseFloat(location?.latitude ?? location?.lat ?? 0)
  const lng = parseFloat(location?.longitude ?? location?.lng ?? 0)

  // OccurrenceReadSchema do backend ainda nao expoe created_at/updated_at.
  // Sem fallback, new Date(undefined) vira Invalid Date e o filtro temporal
  // do HomePage descarta todas as ocorrencias. Ate o backend adicionar o
  // campo, usamos "agora" para que o ponto aparecca pelo menos no filtro
  // "hoje".
  const fallbackNow = new Date().toISOString()
  const createdAt = created_at ?? fallbackNow
  const updatedAt = resolved_at ?? created_at ?? fallbackNow

  return {
    id: String(id),
    lat,
    lng,
    city: city ?? 'Localização desconhecida',
    district: '',
    intensity: intensityFromApi[intensity] ?? 'BAIXA',
    status: statusFromApi[status] ?? 'EM_ANALISE',
    reportsCount: reports.length || apiOccurrence.reports_count || 0,
    createdAt,
    updatedAt,
    description: description ?? null,

    // Lista de denúncias vinculadas (a API publica atualmente nao traz)
    reports: reports.map((r) => ({
      id: String(r.id),
      createdAt: r.created_at,
      intensity: intensityFromApi[r.intensity_perceived || r.intensity] ?? 'BAIXA',
      description: r.description ?? null,
    })),
  }
}

export function adaptOccurrenceList(apiList = []) {
  const list = Array.isArray(apiList) ? apiList : (apiList.items ?? [])

  return list
    .map(adaptOccurrence)
    .filter((occ) => {
      const latOk = !isNaN(occ.lat) && occ.lat !== 0
      const lngOk = !isNaN(occ.lng) && occ.lng !== 0
      if (!latOk || !lngOk) {
        console.warn('[adapter] Ocorrência descartada por coordenadas inválidas:', occ.id, occ.lat, occ.lng)
      }
      return latOk && lngOk
    })
}

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
    lastUpdate: parseApiDate(last_updated),
  }
}
