import { useCallback, useEffect, useRef, useState } from 'react'
import { occurrenceApi } from '../services/api.js'
import { adaptOccurrenceList } from '../services/occurrenceAdapter.js'
import { mockOccurrences } from '../data/mockOccurrences.js'

export function useOccurrences({ filters = {}, pollInterval = 60000 } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUsingMock, setIsUsingMock] = useState(false)
  const abortControllerRef = useRef(null)

  const fetchOccurrences = useCallback(async (retryCount = 0) => {
    // Cancela a requisição anterior se ainda estiver pendente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const requestFilters = {
        skip: filters.skip ?? 0,
        limit: filters.limit ?? 200,
        ...filters,
        _t: Date.now(),
      }

      const response = await occurrenceApi.list(requestFilters, {
        signal: abortControllerRef.current.signal,
      })

      const rawList = response.items ?? response ?? []
      const adaptedList = adaptOccurrenceList(rawList).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )

      setData(adaptedList)
      setIsUsingMock(false)
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        // Ignora erros de cancelamento (outra requisição já começou)
        return
      }

      // Tenta novamente se for erro de rede/servidor (máximo 2 retentativas)
      if (retryCount < 2) {
        setTimeout(() => fetchOccurrences(retryCount + 1), 1000 * (retryCount + 1))
        return
      }

      console.warn('[useOccurrences] API indisponível, usando dados de mock:', err.message)
      setData(mockOccurrences)
      setIsUsingMock(true)
      setError(err.message ?? 'Falha ao buscar ocorrências na API.')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchOccurrences()
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [fetchOccurrences])

  useEffect(() => {
    if (!pollInterval || pollInterval <= 0) return

    const interval = setInterval(() => {
      if (document.hidden || loading) return
      fetchOccurrences()
    }, pollInterval)

    return () => clearInterval(interval)
  }, [fetchOccurrences, pollInterval, loading])

  return { data, loading, error, isUsingMock, refetch: fetchOccurrences }
}
