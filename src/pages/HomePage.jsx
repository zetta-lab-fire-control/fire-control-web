import { useMemo, useState } from 'react'
import { Clock3, Filter, Flame, MapPin } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import StatCard from '../components/StatCard.jsx'
import { intensityMeta, mockOccurrences, northMinasCenter, statusMeta } from '../data/mockOccurrences.js'

const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: '7', label: 'Ultimos 7 dias' },
  { value: '30', label: 'Ultimos 30 dias' },
]

const intensityFilterOptions = ['TODOS', 'BAIXA', 'MEDIA', 'ALTA', 'CONTROLADO']

const statusVisibleOnMap = new Set(['EM_ANALISE', 'VALIDADO_AUTO', 'CONFIRMADO_BOMBEIROS', 'EM_ATENDIMENTO', 'SOLUCIONADO'])

const getRiskLevel = (highCount, activeCount) => {
  const index = highCount * 2 + activeCount
  if (index >= 10) return { label: 'Alto', tone: 'red' }
  if (index >= 6) return { label: 'Medio', tone: 'amber' }
  return { label: 'Baixo', tone: 'emerald' }
}

const createFireIcon = (intensity, pulse = false) => {
  const color = intensityMeta[intensity]?.color ?? '#f59e0b'
  return L.divIcon({
    className: 'custom-fire-icon',
    html: `<span class="marker-core ${pulse ? 'pulse' : ''}" style="--marker-color:${color}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

const formatDateTime = (value) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))

export default function HomePage() {
  const [period, setPeriod] = useState('today')
  const [cityQuery, setCityQuery] = useState('')
  const [intensity, setIntensity] = useState('TODOS')
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(mockOccurrences[0]?.id ?? null)

  const visibleOccurrences = useMemo(() => {
    return mockOccurrences.filter((occ) => {
      if (!statusVisibleOnMap.has(occ.status)) {
        return false
      }

      const createdAt = new Date(occ.createdAt)
      const now = new Date()
      const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24)

      if (period === 'today' && createdAt.toDateString() !== now.toDateString()) {
        return false
      }

      if (period !== 'today' && daysDiff > Number(period)) {
        return false
      }

      if (cityQuery && !occ.city.toLowerCase().includes(cityQuery.toLowerCase())) {
        return false
      }

      if (intensity !== 'TODOS' && occ.intensity !== intensity) {
        return false
      }

      return true
    })
  }, [period, cityQuery, intensity])

  const selectedOccurrence = visibleOccurrences.find((item) => item.id === selectedOccurrenceId) ?? visibleOccurrences[0] ?? null

  const stats = useMemo(() => {
    const activeToday = visibleOccurrences.filter((o) => o.status !== 'SOLUCIONADO' && o.status !== 'ALERTA_FALSO').length
    const affectedCities = new Set(visibleOccurrences.map((o) => o.city)).size
    const highCount = visibleOccurrences.filter((o) => o.intensity === 'ALTA').length
    const risk = getRiskLevel(highCount, activeToday)
    const lastUpdate = visibleOccurrences[0]
      ? visibleOccurrences
          .map((o) => new Date(o.updatedAt))
          .sort((a, b) => b - a)[0]
      : null

    return {
      activeToday,
      affectedCities,
      risk,
      lastUpdate,
    }
  }, [visibleOccurrences])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <section className="mb-6 rounded-3xl border border-orange-500/20 bg-gradient-to-r from-amber-950 via-zinc-950 to-emerald-950 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.25em] text-orange-200/80">UAI - ALERTA DE UNIDADE DE INCENDIO</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Mapa de risco de incendios - Norte de Minas</h1>
        <p className="mt-2 max-w-3xl text-sm text-orange-100/85">
          A comunidade reporta sinais de fumaca e focos. O sistema agrupa alertas, mostra risco regional e facilita acao rapida dos brigadistas e do Corpo de Bombeiros.
        </p>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Focos ativos hoje" value={stats.activeToday} note="Numero de focos registrados" tone="red" />
        <StatCard title="Municipios afetados" value={stats.affectedCities} note="Cidades com pelo menos uma ocorrencia" tone="amber" />
        <StatCard title="Nivel de risco da regiao" value={stats.risk.label} note="Baseado na quantidade de focos ativos" tone={stats.risk.tone} />
        <StatCard
          title="Ultima atualizacao"
          value={stats.lastUpdate ? formatDateTime(stats.lastUpdate) : 'Sem dados'}
          note="Horario da ultima atualizacao no sistema"
          tone="emerald"
        />
      </section>

      <section className="mb-6 grid gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm text-zinc-200">
          <span className="inline-flex items-center gap-2 text-zinc-400"><Filter size={14} /> Periodo</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2">
            {periodOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-zinc-200">
          <span className="inline-flex items-center gap-2 text-zinc-400"><MapPin size={14} /> Cidade</span>
          <input
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
            placeholder="Pesquisar municipio"
          />
        </label>

        <label className="grid gap-2 text-sm text-zinc-200 md:col-span-2">
          <span className="inline-flex items-center gap-2 text-zinc-400"><Flame size={14} /> Intensidade do foco</span>
          <select value={intensity} onChange={(e) => setIntensity(e.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2">
            {intensityFilterOptions.map((item) => (
              <option key={item} value={item}>{item === 'TODOS' ? 'Todos' : intensityMeta[item].label}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-2">
          <div className="h-[62vh] min-h-[420px] rounded-2xl">
            <MapContainer center={northMinasCenter} zoom={7} className="h-full w-full rounded-2xl">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MarkerClusterGroup chunkedLoading maxClusterRadius={55}>
                {visibleOccurrences.map((occ) => (
                  <Marker
                    key={occ.id}
                    position={[occ.lat, occ.lng]}
                    icon={createFireIcon(occ.intensity, occ.intensity === 'ALTA')}
                    eventHandlers={{ click: () => setSelectedOccurrenceId(occ.id) }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{occ.id}</p>
                        <p>{occ.city} - {occ.district}</p>
                        <p>Intensidade: {intensityMeta[occ.intensity].label}</p>
                        <p>Status: {statusMeta[occ.status]}</p>
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
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} /> {item.label}
              </span>
            ))}
          </div>
        </div>

        <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-100">
          <h2 className="text-lg font-semibold">Tela do foco de incendio</h2>
          {!selectedOccurrence && <p className="mt-4 text-sm text-zinc-400">Nenhuma ocorrencia no filtro atual.</p>}
          {selectedOccurrence && (
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Localizacao</p>
                <p className="font-medium">{selectedOccurrence.city} - {selectedOccurrence.district}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Horario e data de registro</p>
                <p className="font-medium">{formatDateTime(selectedOccurrence.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Intensidade do foco</p>
                <p className="font-medium" style={{ color: intensityMeta[selectedOccurrence.intensity].color }}>
                  {intensityMeta[selectedOccurrence.intensity].label}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Numero de denuncias</p>
                <p className="font-medium">{selectedOccurrence.reportsCount}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Foto(s) enviadas</p>
                <p className="font-medium">{selectedOccurrence.photos.join(' | ')}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Status da ocorrencia</p>
                <p className="font-medium">{statusMeta[selectedOccurrence.status]}</p>
              </div>
            </div>
          )}
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-xs text-red-200">
            <Clock3 size={14} /> Focos de alta intensidade aparecem com marcador pulsante para alerta rapido.
          </p>
        </aside>
      </section>
    </main>
  )
}
