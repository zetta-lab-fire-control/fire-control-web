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
  const hasRealDataRef = useRef(false)

  const filtersString = JSON.stringify(filters)

  const fetchOccurrences = useCallback(async (retryCount = 0) => {
    // Cancela a requisição anterior se ainda estiver pendente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const currentFilters = JSON.parse(filtersString)
      const requestFilters = {
        skip: currentFilters.skip ?? 0,
        limit: currentFilters.limit ?? 200,
        ...currentFilters,
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
      hasRealDataRef.current = true
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return
      }

      // Erros "de aplicação" (4xx) são erros reais da API — não mascara com mock,
      // mostra a mensagem para o usuário corrigir (login expirado, payload inválido…).
      const status = err.status ?? 0
      const isServerOrNetwork = status === 0 || status >= 500

      if (isServerOrNetwork && retryCount < 2) {
        setTimeout(() => fetchOccurrences(retryCount + 1), 1000 * (retryCount + 1))
        return
      }

      setError(err.message ?? 'Falha ao buscar ocorrências na API.')

      // Só cai em mock quando a API está genuinamente inacessível (rede/5xx)
      // E apenas se nunca tivemos dados reais. Se já tínhamos, mantém o que
      // estava em tela e mostra apenas o erro — não vira mock.
      if (isServerOrNetwork && !hasRealDataRef.current) {
        console.warn('[useOccurrences] API indisponível, usando dados de mock:', err.message)
        setData(mockOccurrences)
        setIsUsingMock(true)
      }
    } finally {
      setLoading(false)
    }
  }, [filtersString])

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
