/**
 * Hook useOccurrences
 *
 * Busca ocorrências da API REST. Se a API estiver indisponível,
 * cai automaticamente para os dados de mock local (fallback silencioso).
 *
 * @param {object} filters - Filtros opcionais { city, status, skip, limit }
 * @returns {{ data: object[], loading: boolean, error: string|null, refetch: Function }}
 */

import { useCallback, useEffect, useState } from 'react'
import { occurrenceApi } from '../services/api.js'
import { adaptOccurrenceList } from '../services/occurrenceAdapter.js'
import { mockOccurrences } from '../data/mockOccurrences.js'

export function useOccurrences(filters = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOccurrences = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await occurrenceApi.list(filters)

      // A API retorna { items, total, skip, limit }
      const rawList = response.items ?? response ?? []
      setData(adaptOccurrenceList(rawList))
    } catch (err) {
      // Fallback para mock quando a API não está disponível (ex: desenvolvimento sem Docker)
      console.warn('[useOccurrences] API indisponível, usando dados de mock:', err.message)
      setData(mockOccurrences)
      setError(null) // Não exibe erro ao usuário quando há fallback disponível
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)]) // Reexecuta quando os filtros mudarem

  useEffect(() => {
    fetchOccurrences()
  }, [fetchOccurrences])

  return { data, loading, error, refetch: fetchOccurrences }
}
