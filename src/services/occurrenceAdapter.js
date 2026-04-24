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
  const { id, location, intensity, status, city, created_at, resolved_at, reports = [] } =
    apiOccurrence

  // Extrai lat/lng do objeto de localização da API (aceita múltiplos formatos)
  const lat = parseFloat(location?.latitude ?? location?.lat ?? 0)
  const lng = parseFloat(location?.longitude ?? location?.lng ?? 0)

  // Coleta URLs de fotos das denúncias vinculadas
  const photos = reports
    .map((r) => r.photo_url || r.photo)
    .filter(Boolean)

  return {
    id: String(id),
    lat,
    lng,
    city: city ?? 'Localização desconhecida',
    district: '', 
    intensity: intensityFromApi[intensity] ?? 'BAIXA',
    status: statusFromApi[status] ?? 'EM_ANALISE',
    reportsCount: reports.length || apiOccurrence.reports_count || 0,
    createdAt: created_at,
    updatedAt: resolved_at ?? created_at,
    photos,

    // Lista de denúncias vinculadas
    reports: reports.map((r) => ({
      id: String(r.id),
      createdAt: r.created_at,
      intensity: intensityFromApi[r.intensity_perceived || r.intensity] ?? 'BAIXA',
      photo: r.photo_url || r.photo || null,
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
    lastUpdate: last_updated ? new Date(last_updated) : null,
  }
}
