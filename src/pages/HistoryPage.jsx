/**
 * HistoryPage — Histórico de Ocorrências
 */

import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { Loader2, TrendingUp, Flame, MapPin, BarChart2 } from 'lucide-react'
import { occurrenceApi } from '../services/api.js'
import { historyByPeriod } from '../data/mockOccurrences.js'

const periodOptions = [
  { value: '30', label: 'Últimos 30 dias' },
  { value: '60', label: 'Últimos 60 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: 'ano', label: 'Último ano' },
]

const intensityWeights = { low: 1, medium: 2, high: 3 }

export default function HistoryPage() {
  const [period, setPeriod] = useState('30')
  const [historyData, setHistoryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      setError(null)
      setUsingMock(false)

      try {
        const end = new Date()
        // Empurra para o fim do dia para incluir ocorrências de hoje.
        end.setHours(23, 59, 59, 999)

        const start = new Date(end)
        if (period === 'ano') {
          start.setFullYear(end.getFullYear() - 1)
        } else {
          start.setDate(end.getDate() - Number(period))
        }
        start.setHours(0, 0, 0, 0)

        // ISO completo (com timezone) — evita ambiguidade de fuso.
        const startDate = start.toISOString()
        const endDate = end.toISOString()

        const response = await occurrenceApi.getHistory(startDate, endDate)
        setHistoryData(response)
      } catch (err) {
        // Só cai em mock se a API realmente falhou (rede/5xx).
        const status = err?.status ?? 0
        if (status === 0 || status >= 500) {
          setUsingMock(true)
          setHistoryData({ isMock: true, periodId: period })
        } else {
          setError(err?.message ?? 'Falha ao carregar histórico.')
          setHistoryData(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [period])

  // ─── FIX 1 & 2: mapeamento correto dos dados da API ──────────────────────────
  const chartData = useMemo(() => {
    if (!historyData) return []

    // Fallback para mock
    if (historyData.isMock) return historyByPeriod[historyData.periodId] || []

    // A API retorna um objeto agregado. Montamos barras por intensidade
    // quando o breakdown estiver disponível, senão 1 barra total.
    const counts = historyData.intensity_count?.counts ?? {}
    const total = Number(historyData.occurrences_count ?? 0)
    const lowCount = Number(counts.low ?? 0)
    const mediumCount = Number(counts.medium ?? 0)
    const highCount = Number(counts.high ?? 0)

    const weightedSum =
      lowCount * intensityWeights.low +
      mediumCount * intensityWeights.medium +
      highCount * intensityWeights.high

    const periodLabel = period === 'ano' ? 'Último ano' : `Últimos ${period} dias`

    // Se temos breakdown por intensidade, criamos um ponto rico
    const point = {
      label: periodLabel,
      ocorrencias: total,
      baixa: lowCount,
      media: mediumCount,
      alta: highCount,
      intensidadeMedia: total > 0 ? Number((weightedSum / total).toFixed(2)) : 0,
    }

    // Se a API também retornar série temporal em `daily` ou `weekly`, usamos
    if (Array.isArray(historyData.daily) && historyData.daily.length > 0) {
      return historyData.daily.map((d) => ({
        label: d.date ?? d.label ?? '—',
        ocorrencias: Number(d.count ?? d.occurrences_count ?? 0),
        intensidadeMedia: Number(d.avg_intensity ?? 0),
        baixa: Number(d.low ?? 0),
        media: Number(d.medium ?? 0),
        alta: Number(d.high ?? 0),
      }))
    }

    if (Array.isArray(historyData.weekly) && historyData.weekly.length > 0) {
      return historyData.weekly.map((w) => ({
        label: w.week ?? w.label ?? '—',
        ocorrencias: Number(w.count ?? w.occurrences_count ?? 0),
        intensidadeMedia: Number(w.avg_intensity ?? 0),
        baixa: Number(w.low ?? 0),
        media: Number(w.medium ?? 0),
        alta: Number(w.high ?? 0),
      }))
    }

    return [point]
  }, [historyData, period])

  // ─── FIX 2 & 3: normaliza campo do nome da cidade ────────────────────────────
  const topCities = useMemo(() => {
    if (!historyData) return []

    if (historyData.isMock) {
      const mockArr = historyByPeriod[historyData.periodId] || []
      // Deduplica cidades do mock pelo campo cidadeMaiorFoco
      const cityMap = {}
      mockArr.forEach((w) => {
        const city = w.cidadeMaiorFoco
        if (city) cityMap[city] = (cityMap[city] ?? 0) + w.ocorrencias
      })
      return Object.entries(cityMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([city, count]) => ({ city, count }))
    }

    if (!Array.isArray(historyData.cities_count)) return []

    return [...historyData.cities_count]
      .map((entry) => ({
        // A API pode usar 'city' ou 'municipality' como chave do nome
        city: entry.city ?? entry.municipality ?? entry.name ?? 'Desconhecida',
        count: Number(entry.count ?? entry.occurrences_count ?? 0),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [historyData])

  // ─── Totais do período para os cards de resumo ────────────────────────────
  const totals = useMemo(() => {
    if (!historyData || historyData.isMock) return null
    return {
      total: Number(historyData.occurrences_count ?? 0),
      baixa: Number(historyData.intensity_count?.counts?.low ?? 0),
      media: Number(historyData.intensity_count?.counts?.medium ?? 0),
      alta: Number(historyData.intensity_count?.counts?.high ?? 0),
    }
  }, [historyData])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-800/50 backdrop-blur-md p-6 text-zinc-100">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Histórico de ocorrências</h1>
            <p className="mt-2 text-sm text-zinc-400">
              {usingMock
                ? 'API indisponível — exibindo dados de demonstração.'
                : 'Dados reais do período selecionado via API.'}
            </p>
          </div>

          <label className="grid gap-2 text-sm">
            Período
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && (
          <div className="mt-5 flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 size={16} className="animate-spin" />
            Carregando histórico...
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Cards de resumo do período — FIX 4 */}
        {!loading && totals && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total no período', value: totals.total, icon: <BarChart2 size={16} />, color: 'text-zinc-200' },
              { label: 'Baixa intensidade', value: totals.baixa, icon: <Flame size={16} />, color: 'text-green-400' },
              { label: 'Média intensidade', value: totals.media, icon: <Flame size={16} />, color: 'text-amber-400' },
              { label: 'Alta intensidade', value: totals.alta, icon: <Flame size={16} />, color: 'text-red-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className={color}>{icon}</span>
                  {label}
                </p>
                <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Gráfico ou empty-state */}
        {!loading && totals && totals.total === 0 && (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-12 text-center text-sm text-zinc-400">
            <BarChart2 size={28} className="mb-3 text-zinc-600" />
            <p className="font-medium text-zinc-300">Sem ocorrências registradas nesse período.</p>
            <p className="mt-1 text-xs">Tente um intervalo maior ou aguarde novas denúncias.</p>
          </div>
        )}

        {!loading && (!totals || totals.total > 0) && (
          <div className="mt-6 h-[380px] w-full">
            <ResponsiveContainer>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="label" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" stroke="#a1a1aa" />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" domain={[0, 3]} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="ocorrencias" fill="#ef4444" name="Total" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="left" dataKey="baixa" fill="#22c55e" name="Baixa" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="media" fill="#f59e0b" name="Média" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="alta" fill="#f97316" name="Alta" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="intensidadeMedia"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="Intensidade média"
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cards das cidades */}
        <div className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <MapPin size={15} className="text-orange-400" />
            Cidades com mais ocorrências no período
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {topCities.length > 0 ? (
              topCities.map((entry) => (
                <article
                  key={`${period}-${entry.city}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm"
                >
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin size={13} />
                    <p>Cidade</p>
                  </div>
                  <p className="mt-1 font-semibold text-zinc-100">{entry.city}</p>
                  <p className="mt-1 flex items-center gap-1 text-orange-400">
                    <TrendingUp size={13} />
                    {entry.count} ocorrência{entry.count !== 1 ? 's' : ''}
                  </p>
                </article>
              ))
            ) : (
              !loading && (
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-400">
                  Sem dados de cidades para o período selecionado.
                </article>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  )
}