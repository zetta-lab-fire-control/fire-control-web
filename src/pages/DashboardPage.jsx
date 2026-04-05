import { useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import StatCard from '../components/StatCard.jsx'
import { intensityMeta, mockOccurrences, northMinasCenter, statusMeta } from '../data/mockOccurrences.js'

const statuses = [
  'EM_ANALISE',
  'VALIDADO_AUTO',
  'CONFIRMADO_BOMBEIROS',
  'EM_ATENDIMENTO',
  'SOLUCIONADO',
  'ALERTA_FALSO',
]

const hiddenAfter24hStatuses = new Set(['SOLUCIONADO', 'ALERTA_FALSO'])

const formatDateTime = (value) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))

const createOperationalIcon = (intensity) =>
  L.divIcon({
    className: 'custom-fire-icon',
    html: `<span class="marker-core" style="--marker-color:${intensityMeta[intensity].color}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })

export default function DashboardPage() {
  const [occurrences, setOccurrences] = useState(mockOccurrences)
  const [search, setSearch] = useState('')
  const [selectedIntensity, setSelectedIntensity] = useState('TODOS')
  const [selectedStatus, setSelectedStatus] = useState('TODOS')
  const [selectedId, setSelectedId] = useState(mockOccurrences[0]?.id ?? null)

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter((item) => {
      const searchTarget = `${item.id} ${item.city} ${item.district}`.toLowerCase()
      if (search && !searchTarget.includes(search.toLowerCase())) {
        return false
      }
      if (selectedIntensity !== 'TODOS' && item.intensity !== selectedIntensity) {
        return false
      }
      if (selectedStatus !== 'TODOS' && item.status !== selectedStatus) {
        return false
      }
      return true
    })
  }, [occurrences, search, selectedIntensity, selectedStatus])

  const selectedOccurrence = filteredOccurrences.find((item) => item.id === selectedId) ?? filteredOccurrences[0] ?? null

  const visibleOnMap = useMemo(() => {
    const now = Date.now()
    return filteredOccurrences.filter((item) => {
      if (!hiddenAfter24hStatuses.has(item.status)) {
        return true
      }
      const updated = new Date(item.updatedAt).getTime()
      return now - updated < 24 * 60 * 60 * 1000
    })
  }, [filteredOccurrences])

  const summary = useMemo(() => {
    const emAnalise = occurrences.filter((o) => o.status === 'EM_ANALISE' || o.status === 'VALIDADO_AUTO').length
    const emAtendimento = occurrences.filter((o) => o.status === 'EM_ATENDIMENTO').length
    const controladasHoje = occurrences.filter((o) => o.status === 'SOLUCIONADO' && new Date(o.updatedAt).toDateString() === new Date().toDateString()).length
    return { emAnalise, emAtendimento, controladasHoje }
  }, [occurrences])

  const updateStatus = (id, nextStatus) => {
    setOccurrences((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: nextStatus,
              intensity: hiddenAfter24hStatuses.has(nextStatus) ? 'CONTROLADO' : item.intensity,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
        <h1 className="text-2xl font-semibold">Painel Bombeiros</h1>
        <p className="mt-2 text-sm text-zinc-400">Visao operacional para triagem, atendimento e encerramento das ocorrencias.</p>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard title="Ocorrencias em analise" value={summary.emAnalise} note="Aguardando confirmacao operacional" tone="amber" />
        <StatCard title="Em atendimento" value={summary.emAtendimento} note="Equipes em deslocamento ou acao" tone="red" />
        <StatCard title="Controladas hoje" value={summary.controladasHoje} note="Encerradas pelas equipes" tone="emerald" />
      </section>

      <section className="mb-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-2">
        <div className="h-[46vh] min-h-[320px] rounded-2xl">
          <MapContainer center={northMinasCenter} zoom={7} className="h-full w-full rounded-2xl">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup chunkedLoading maxClusterRadius={52}>
              {visibleOnMap.map((occ) => (
                <Marker key={occ.id} position={[occ.lat, occ.lng]} icon={createOperationalIcon(occ.intensity)} eventHandlers={{ click: () => setSelectedId(occ.id) }}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{occ.id}</p>
                      <p>{occ.city} - {occ.district}</p>
                      <p>Denuncias: {occ.reportsCount}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </section>

      <section className="mb-6 grid gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por ID ou localizacao"
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm md:col-span-2"
        />

        <select value={selectedIntensity} onChange={(e) => setSelectedIntensity(e.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm">
          <option value="TODOS">Intensidade: todos</option>
          {Object.entries(intensityMeta).map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>

        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm">
          <option value="TODOS">Status: todos</option>
          {Object.entries(statusMeta).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </section>

      <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
        <h2 className="text-lg font-semibold">Lista de ocorrencias (historico completo)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Localizacao</th>
                <th className="px-3 py-2 text-left">Denuncias</th>
                <th className="px-3 py-2 text-left">Intensidade</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOccurrences.map((item) => (
                <tr key={item.id} className="cursor-pointer border-b border-zinc-900 hover:bg-zinc-900/50" onClick={() => setSelectedId(item.id)}>
                  <td className="px-3 py-2">{item.id}</td>
                  <td className="px-3 py-2">{item.city} - {item.district}</td>
                  <td className="px-3 py-2">{item.reportsCount}</td>
                  <td className="px-3 py-2" style={{ color: intensityMeta[item.intensity].color }}>{intensityMeta[item.intensity].label}</td>
                  <td className="px-3 py-2">{statusMeta[item.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
        <h2 className="text-lg font-semibold">Detalhe da ocorrencia</h2>
        {!selectedOccurrence && <p className="mt-3 text-sm text-zinc-400">Selecione uma ocorrencia na tabela para visualizar os detalhes.</p>}
        {selectedOccurrence && (
          <div className="mt-4 grid gap-6 xl:grid-cols-[1.1fr,1fr]">
            <div className="grid gap-3 text-sm">
              <p><span className="text-zinc-400">Localizacao:</span> {selectedOccurrence.city} - {selectedOccurrence.district}</p>
              <p><span className="text-zinc-400">Intensidade media:</span> {intensityMeta[selectedOccurrence.intensity].label}</p>
              <p><span className="text-zinc-400">Denuncias recebidas:</span> {selectedOccurrence.reportsCount}</p>
              <p><span className="text-zinc-400">Horario da ocorrencia:</span> {formatDateTime(selectedOccurrence.createdAt)}</p>

              <label className="grid gap-2">
                <span className="text-zinc-400">Status</span>
                <select
                  value={selectedOccurrence.status}
                  onChange={(e) => updateStatus(selectedOccurrence.id, e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{statusMeta[status]}</option>
                  ))}
                </select>
              </label>

              <p className="rounded-xl border border-emerald-700/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                Se o status for Solucionado ou Alerta falso, o foco muda para controlado e some do mapa apos 24h, permanecendo no banco de ocorrencias.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-300">Denuncias</h3>
              <div className="mt-3 grid gap-2">
                {selectedOccurrence.reports.map((report) => (
                  <article key={report.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm">
                    <p><span className="text-zinc-400">ID da denuncia:</span> {report.id}</p>
                    <p><span className="text-zinc-400">Horario:</span> {formatDateTime(report.createdAt)}</p>
                    <p><span className="text-zinc-400">Intensidade:</span> {intensityMeta[report.intensity].label}</p>
                    <p><span className="text-zinc-400">Foto:</span> {report.photo}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
