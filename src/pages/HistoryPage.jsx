/**
 * HistoryPage — Histórico de Ocorrências
 *
 * Funcionalidades:
 *  - Seletor de período (30, 60, 90 dias ou 1 ano)
 *  - Gráfico combinado (barras de ocorrências + linha de intensidade média)
 *  - Cards das cidades com mais ocorrências no período
 *  - Dados provindos do endpoint GET /occurrences/indicators/history
 */

import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, ComposedChart, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Loader2 } from 'lucide-react'
import { occurrenceApi } from '../services/api.js'

const periodOptions = [
  { value: '30', label: 'Ultimos 30 dias' },
  { value: '60', label: 'Ultimos 60 dias' },
  { value: '90', label: 'Ultimos 90 dias' },
  { value: 'ano', label: 'Ultimo ano' },
]

export default function HistoryPage() {
  const [period, setPeriod] = useState('30')
  const [historyData, setHistoryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      setError(null)

      try {
        const end = new Date()
        const start = new Date(end)

        if (period === 'ano') {
          start.setFullYear(end.getFullYear() - 1)
        } else {
          start.setDate(end.getDate() - Number(period))
        }

        const startDate = start.toISOString().split('T')[0]
        const endDate = end.toISOString().split('T')[0]

        const response = await occurrenceApi.getHistory(startDate, endDate)
        setHistoryData(response)
      } catch (err) {
        setError(err.message || 'Nao foi possivel carregar o historico da API.')
        setHistoryData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [period])

  const formatPeriodLabel = (value) => {
    if (value === 'ano') return 'Ultimo ano'
    return `Ultimos ${value} dias`
  }

  const intensityWeights = { low: 1, medium: 2, high: 3 }

  const chartData = useMemo(() => {
    if (!historyData) return []

    const counts = historyData.intensity_count?.counts ?? {}
    const total = Number(historyData.occurrences_count ?? 0)
    const weightedSum = Object.entries(counts).reduce((acc, [key, value]) => {
      return acc + (intensityWeights[key] ?? 0) * Number(value ?? 0)
    }, 0)

    return [
      {
        label: formatPeriodLabel(period),
        ocorrencias: total,
        intensidadeMedia: total > 0 ? Number((weightedSum / total).toFixed(2)) : 0,
      },
    ]
  }, [historyData, period])

  const topCities = useMemo(() => {
    if (!historyData?.cities_count) return []
    return [...historyData.cities_count]
      .sort((a, b) => Number(b.count) - Number(a.count))
      .slice(0, 4)
  }, [historyData])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Historico de ocorrencias</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Leitura do periodo selecionado com dados reais da API.
            </p>
          </div>

          <label className="grid gap-2 text-sm">
            Periodo
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2">
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {loading && (
          <div className="mt-5 flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 size={16} className="animate-spin" />
            Carregando historico...
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 h-[380px] w-full">
          <ResponsiveContainer>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="label" stroke="#a1a1aa" />
              <YAxis yAxisId="left" stroke="#a1a1aa" />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="ocorrencias" fill="#ef4444" name="Ocorrencias" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="intensidadeMedia" stroke="#f59e0b" strokeWidth={3} name="Intensidade media" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {topCities.length > 0 ? (
            topCities.map((entry) => (
              <article key={`${period}-${entry.city}`} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm">
                <p className="text-zinc-400">Cidade</p>
                <p className="mt-1 font-medium">{entry.city}</p>
                <p className="text-zinc-300">Ocorrencias: {entry.count}</p>
              </article>
            ))
          ) : (
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-400">
              Sem dados de cidades para o periodo selecionado.
            </article>
          )}
        </div>
      </section>
    </main>
  )
}
