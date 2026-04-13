/**
 * Hook useOccurrences
 *
 * Busca ocorrências da API REST. Se a API estiver indisponível,
 * cai automaticamente para os dados de mock local (fallback silencioso).
 *
 * @param {object} options - Opções { filters, pollInterval }
 *   - filters: filtros opcionais { city, status, skip, limit }
 *   - pollInterval: intervalo em ms para recarregar dados (0 = desabilita)
 * @returns {{ data: object[], loading: boolean, error: string|null, refetch: Function }}
 */

import { useCallback, useEffect, useState } from 'react'
import { occurrenceApi } from '../services/api.js'
import { adaptOccurrenceList } from '../services/occurrenceAdapter.js'
import { mockOccurrences } from '../data/mockOccurrences.js'

export function useOccurrences({ filters = {}, pollInterval = 5000 } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOccurrences = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Cache-busting: adiciona timestamp para invalidar cache de 180s do backend
      const requestFilters = {
        skip: filters.skip ?? 0,
        limit: filters.limit ?? 200,
        ...filters,
        _t: Date.now(), // Muda cada requisição, por isso backend vê cache miss
      }
      const response = await occurrenceApi.list(requestFilters)

      // A API retorna { items, total, skip, limit }
      const rawList = response.items ?? response ?? []
      const adaptedList = adaptOccurrenceList(rawList).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setData(adaptedList)
    } catch (err) {
      // Fallback para mock quando a API não está disponível (ex: desenvolvimento sem Docker)
      console.warn('[useOccurrences] API indisponível, usando dados de mock:', err.message)
      setData(mockOccurrences)
      setError(err.message ?? 'Falha ao buscar ocorrencias na API.')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)]) // Reexecuta quando os filtros mudarem

  // Carrega dados inicial
  useEffect(() => {
    fetchOccurrences()
  }, [fetchOccurrences])

  // Polling opcional: recarrega dados periodicamente
  useEffect(() => {
    if (!pollInterval || pollInterval <= 0) return

    const interval = setInterval(() => {
      fetchOccurrences()
    }, pollInterval)

    return () => clearInterval(interval)
  }, [fetchOccurrences, pollInterval])

  return { data, loading, error, refetch: fetchOccurrences }
}
