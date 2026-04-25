import { useMemo, useState, useEffect } from 'react'
import { Clock3, Filter, Flame, Loader2, MapPin, RefreshCw, WifiOff } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import StatCard from '../components/StatCard.jsx'
import { intensityMeta, northMinasCenter, statusMeta } from '../data/mockOccurrences.js'
import { useOccurrences } from '../hooks/useOccurrences.js'
import { occurrenceApi } from '../services/api.js'
import { adaptPublicIndicators } from '../services/occurrenceAdapter.js'
import { formatDateTime } from '../utils/formatters.js'

const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
]

const intensityFilterOptions = ['TODOS', 'BAIXA', 'MEDIA', 'ALTA']

const statusVisibleOnMap = new Set(['EM_ANALISE', 'VALIDADO_AUTO', 'SOLUCIONADO'])

const createFireIcon = (intensity, pulse = false) => {
  const color = intensityMeta[intensity]?.color ?? '#f59e0b'
  return L.divIcon({
    className: 'custom-fire-icon',
    html: `<span class="marker-core ${pulse ? 'pulse' : ''}" style="--marker-color:${color}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount()
  const size = count < 10 ? 36 : count < 50 ? 42 : 48
  return L.divIcon({
    html: `<div class="cluster-bubble" style="width:${size}px;height:${size}px;">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function HomePage() {
  const [period, setPeriod] = useState('today')
  const [cityQuery, setCityQuery] = useState('')
  const [intensity, setIntensity] = useState('TODOS')
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null)
  const [publicStats, setPublicStats] = useState(null)

  const { data: occurrences, loading, isUsingMock, refetch } = useOccurrences()

  useEffect(() => {
    occurrenceApi
      .getPublicIndicators()
      .then((raw) => setPublicStats(adaptPublicIndicators(raw)))
      .catch(() => setPublicStats(null))
  }, [])

  const visibleOccurrences = useMemo(() => {
    return occurrences.filter((occ) => {
      if (!statusVisibleOnMap.has(occ.status)) return false

      const createdAt = new Date(occ.createdAt)
      const now = new Date()
      const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24)

      if (period === 'today' && createdAt.toDateString() !== now.toDateString()) return false
      if (period !== 'today' && daysDiff > Number(period)) return false
      if (cityQuery && !occ.city.toLowerCase().includes(cityQuery.toLowerCase())) return false
      if (intensity !== 'TODOS' && occ.intensity !== intensity) return false

      return true
    })
  }, [occurrences, period, cityQuery, intensity])

  const selectedOccurrence =
    visibleOccurrences.find((item) => item.id === selectedOccurrenceId) ??
    visibleOccurrences[0] ??
    null

  const stats = useMemo(() => {
    if (publicStats) return publicStats

    const activeToday = visibleOccurrences.filter(
      (o) => o.status !== 'SOLUCIONADO' && o.status !== 'ALERTA_FALSO',
    ).length
    const affectedCities = new Set(visibleOccurrences.map((o) => o.city)).size
    const highCount = visibleOccurrences.filter((o) => o.intensity === 'ALTA').length
    const index = highCount * 2 + activeToday

    const risk =
      index >= 10
        ? { label: 'Alto', tone: 'red' }
        : index >= 6
          ? { label: 'Médio', tone: 'amber' }
          : { label: 'Baixo', tone: 'emerald' }

    const lastUpdate = visibleOccurrences.length
      ? visibleOccurrences.map((o) => new Date(o.updatedAt)).sort((a, b) => b - a)[0]
      : null

    return { activeToday, affectedCities, risk, lastUpdate }
  }, [publicStats, visibleOccurrences])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      {isUsingMock && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-500/50 bg-red-500/10 px-5 py-4 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
              <WifiOff size={20} />
            </span>
            <div>
              <p className="font-bold text-base">Atenção: sistema operando com dados de simulação</p>
              <p className="text-sm text-red-200/70">A API principal não respondeu. As informações abaixo não são reais.</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-400 transition-all shadow-lg active:scale-95"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Reconectar
          </button>
        </div>
      )}

      <section className="mb-6 rounded-3xl border border-orange-500/20 bg-gradient-to-r from-amber-950 via-zinc-950 to-emerald-950 p-6 text-white overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-2 w-2 rounded-full ${loading ? 'bg-zinc-500 animate-pulse' : (isUsingMock ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]')}`} />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-200/80">
              {loading ? 'Sincronizando...' : (isUsingMock ? 'UAI — modo de simulação' : 'UAI — monitoramento em tempo real')}
            </p>
          </div>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Mapa de risco de incêndios — Norte de Minas
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-orange-100/85">
            A comunidade reporta sinais de fumaça e focos. O sistema agrupa alertas, mostra risco
            regional e facilita ação rápida dos brigadistas e do Corpo de Bombeiros.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] -mr-32 -mt-32" />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Focos denunciados"
          value={loading && !occurrences.length ? '...' : stats.activeToday}
          note="Total de ocorrências em aberto no sistema"
          tone="red"
        />
        <StatCard
          title="Municípios afetados"
          value={loading && !occurrences.length ? '...' : stats.affectedCities}
          note="Cidades com pelo menos uma ocorrência"
          tone="amber"
        />
        <StatCard
          title="Nível de risco da região"
          value={loading && !occurrences.length ? '...' : stats.risk.label}
          note="Baseado na quantidade de focos ativos"
          tone={stats.risk?.tone ?? 'emerald'}
        />
        <StatCard
          title="Última atualização"
          value={
            loading && !occurrences.length ? '...' : stats.lastUpdate ? formatDateTime(stats.lastUpdate) : 'Sem dados'
          }
          note="Horário da última atualização no sistema"
          tone="emerald"
        />
      </section>

      <section className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-zinc-800/50 backdrop-blur-md p-4">
        <label className="grid flex-1 min-w-[140px] gap-2 text-sm text-zinc-200">
          <span className="inline-flex items-center gap-2 text-zinc-400">
            <Filter size={14} /> Período
          </span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none"
          >
            {periodOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="grid flex-2 min-w-[180px] gap-2 text-sm text-zinc-200">
          <span className="inline-flex items-center gap-2 text-zinc-400">
            <MapPin size={14} /> Cidade
          </span>
          <input
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none"
            placeholder="Pesquisar município"
          />
        </label>

        <label className="grid flex-2 min-w-[200px] gap-2 text-sm text-zinc-200">
          <span className="inline-flex items-center gap-2 text-zinc-400">
            <Flame size={14} /> Intensidade do foco
          </span>
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none"
          >
            {intensityFilterOptions.map((item) => (
              <option key={item} value={item}>
                {item === 'TODOS' ? 'Todos' : intensityMeta[item]?.label}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => refetch()}
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50"
          title="Recarregar dados"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </section>

      {loading && occurrences.length === 0 && (
        <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/50 p-12 text-center">
          <Loader2 size={32} className="animate-spin text-orange-500 mb-4" />
          <p className="text-zinc-300 font-medium">Buscando informações de focos...</p>
          <p className="text-xs text-zinc-500 mt-1">Isso pode levar alguns segundos.</p>
        </div>
      )}

      {!loading && visibleOccurrences.length === 0 && (
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
          Nenhum resultado para os filtros aplicados.
        </div>
      )}

      {/* relative z-0 isola o z-index do Leaflet da Navbar sticky */}
      <section className="relative z-0 grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-800/50 backdrop-blur-md p-2">
          <div className="h-[62vh] min-h-[420px] rounded-2xl">
            <MapContainer center={northMinasCenter} zoom={7} className="h-full w-full rounded-2xl">
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={60}
                iconCreateFunction={createClusterIcon}
                showCoverageOnHover={false}
              >
                {visibleOccurrences.map((occ) => (
                  <Marker
                    key={occ.id}
                    position={[occ.lat, occ.lng]}
                    icon={createFireIcon(occ.intensity, occ.intensity === 'ALTA')}
                    eventHandlers={{ click: () => setSelectedOccurrenceId(occ.id) }}
                  >
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <p className="font-semibold text-zinc-800 mb-1">{occ.city}</p>
                        <p className="text-zinc-600 text-xs mb-1">{formatDateTime(occ.createdAt)}</p>
                        <p>
                          <span className="text-zinc-500">Intensidade:</span>{' '}
                          <span style={{ color: intensityMeta[occ.intensity]?.color }} className="font-medium">
                            {intensityMeta[occ.intensity]?.label}
                          </span>
                        </p>
                        <p>
                          <span className="text-zinc-500">Status:</span>{' '}
                          {statusMeta[occ.status]}
                        </p>
                        {occ.reportsCount > 0 && (
                          <p className="text-zinc-500 text-xs mt-1">{occ.reportsCount} denúncia{occ.reportsCount !== 1 ? 's' : ''}</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300">
            {Object.entries(intensityMeta).map(([key, item]) => (
              <span key={key} className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-zinc-800/50 backdrop-blur-md p-5 text-zinc-100">
          <h2 className="text-lg font-semibold">Detalhes do foco</h2>

          {!selectedOccurrence && (
            <p className="mt-4 text-sm text-zinc-400">
              {visibleOccurrences.length === 0
                ? 'Nenhuma ocorrência no filtro atual.'
                : 'Clique em um marcador no mapa para ver os detalhes.'}
            </p>
          )}

          {selectedOccurrence && (
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Localização</p>
                <p className="font-medium">{selectedOccurrence.city}</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Horário e data de registro</p>
                <p className="font-medium">{formatDateTime(selectedOccurrence.createdAt)}</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Intensidade do foco</p>
                <p className="font-medium" style={{ color: intensityMeta[selectedOccurrence.intensity]?.color }}>
                  {intensityMeta[selectedOccurrence.intensity]?.label}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Denúncias vinculadas</p>
                <p className="font-medium">{selectedOccurrence.reportsCount || '—'}</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Status da ocorrência</p>
                <p className="font-medium">{statusMeta[selectedOccurrence.status]}</p>
              </div>
            </div>
          )}

          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-xs text-red-200">
            <Clock3 size={14} /> Focos de alta intensidade aparecem com marcador pulsante.
          </p>
        </aside>
      </section>
    </main>
  )
}
