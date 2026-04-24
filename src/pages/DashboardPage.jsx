/**
 * DashboardPage — Painel Operacional dos Bombeiros
 *
 * Funcionalidades (Épico 6):
 *  - Listagem de ocorrências com filtros (busca, intensidade, status)
 *  - Mapa operacional com todos os focos
 *  - Visualização completa dos detalhes de uma ocorrência
 *  - Atualização do status via API (PUT /occurrences/{id})
 *  - Galeria de fotos das denúncias vinculadas
 *  - Indicadores operacionais (em análise, em atendimento, controladas hoje)
 *
 * Acesso: apenas bombeiros/admin autenticados.
 */

import { useMemo, useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import StatCard from '../components/StatCard.jsx'
import { intensityMeta, northMinasCenter, statusMeta } from '../data/mockOccurrences.js'
import { occurrenceApi } from '../services/api.js'
import { statusToApi } from '../services/occurrenceAdapter.js'
import { useOccurrences } from '../hooks/useOccurrences.js'
import { formatDateTime } from '../utils/formatters.js'

// Configurações estáticas

/** Statuses disponíveis para o select do painel (refletem o enum do backend) */
const availableStatuses = [
  'EM_ANALISE',
  'VALIDADO_AUTO',
  'SOLUCIONADO',
  'ALERTA_FALSO',
]

/** Statuses que somem do mapa após 24h */
const hiddenAfter24hStatuses = new Set(['SOLUCIONADO', 'ALERTA_FALSO'])

/** Cria ícone operacional (sem pulsar) */
const createOperationalIcon = (intensity) =>
  L.divIcon({
    className: 'custom-fire-icon',
    html: `<span class="marker-core" style="--marker-color:${intensityMeta[intensity]?.color ?? '#f59e0b'}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })

// Componente principal

export default function DashboardPage() {
  const [search, setSearch] = useState('')
  const [selectedIntensity, setSelectedIntensity] = useState('TODOS')
  const [selectedStatus, setSelectedStatus] = useState('TODOS')
  const [selectedId, setSelectedId] = useState(null)

  // Estado de feedback da atualização de status
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false)
  const [statusUpdateError, setStatusUpdateError] = useState(null)

  // Busca ocorrências da API com polling (recarrega a cada 60 segundos)
  // Isso garante que novas denúncias apareçam no mapa
  const { data: occurrences, loading, refetch } = useOccurrences({ pollInterval: 60000 })

  // Filtros locais na tabela

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter((item) => {
      const searchTarget = `${item.id} ${item.city} ${item.district}`.toLowerCase()
      if (search && !searchTarget.includes(search.toLowerCase())) return false
      if (selectedIntensity !== 'TODOS' && item.intensity !== selectedIntensity) return false
      if (selectedStatus !== 'TODOS' && item.status !== selectedStatus) return false
      return true
    })
  }, [occurrences, search, selectedIntensity, selectedStatus])

  const selectedOccurrence =
    filteredOccurrences.find((item) => item.id === selectedId) ??
    filteredOccurrences[0] ??
    null

  // Ocorrências visíveis no mapa (esconde SOLUCIONADO/ALERTA_FALSO após 24h)
  const visibleOnMap = useMemo(() => {
    const now = Date.now()
    return filteredOccurrences.filter((item) => {
      if (!hiddenAfter24hStatuses.has(item.status)) return true
      const updated = new Date(item.updatedAt).getTime()
      return now - updated < 24 * 60 * 60 * 1000
    })
  }, [filteredOccurrences])

  // Indicadores do topo dos cards
  const summary = useMemo(() => {
    const emAnalise = occurrences.filter((o) => o.status === 'EM_ANALISE').length
    const validadas = occurrences.filter((o) => o.status === 'VALIDADO_AUTO').length
    const solucionadasHoje = occurrences.filter(
      (o) =>
        o.status === 'SOLUCIONADO' &&
        new Date(o.updatedAt).toDateString() === new Date().toDateString(),
    ).length
    return { emAnalise, validadas, solucionadasHoje }
  }, [occurrences])

  // Atualização de status via API

  /**
   * Envia o novo status para a API e atualiza o estado local.
   * Nota: para não apagar a ocorrência, apenas o campo `status` é alterado
   * — a ocorrência permanece no banco de dados.
   */
  const handleStatusChange = async (id, nextStatusInternal) => {
    setStatusUpdateLoading(true)
    setStatusUpdateSuccess(false)
    setStatusUpdateError(null)

    // Converte o status do formato interno para o formato da API
    const apiStatus = statusToApi[nextStatusInternal] ?? nextStatusInternal

    try {
      await occurrenceApi.updateStatus(id, apiStatus)
      setStatusUpdateSuccess(true)
      // Recarrega a lista para refletir a mudança em toda a aplicação
      await refetch()
      setTimeout(() => setStatusUpdateSuccess(false), 3000)
    } catch (err) {
      setStatusUpdateError(err.message)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Render

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      {/* Cabeçalho */}
      <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
        <h1 className="text-2xl font-semibold">Painel dos Bombeiros</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Visão operacional para triagem, atendimento e encerramento das ocorrências.
        </p>
      </section>

      {/* Cards de resumo */}
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Ocorrências em análise"
          value={loading ? '—' : summary.emAnalise}
          note="Aguardando confirmação operacional"
          tone="amber"
        />
        <StatCard
          title="Validadas / em atendimento"
          value={loading ? '—' : summary.validadas}
          note="Confirmadas e ainda ativas"
          tone="red"
        />
        <StatCard
          title="Solucionadas hoje"
          value={loading ? '—' : summary.solucionadasHoje}
          note="Encerradas pelas equipes hoje"
          tone="emerald"
        />
      </section>

      {/* Loading */}
      {loading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 size={16} className="animate-spin" />
          Carregando ocorrências...
        </div>
      )}

      {/* Mapa operacional */}
      {/* relative z-0 isola o z-index do Leaflet, impedindo que sobreponha a Navbar sticky */}
      <section className="relative z-0 mb-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-800/50 backdrop-blur-md p-2">
        <div className="h-[46vh] min-h-[320px] rounded-2xl">
          <MapContainer center={northMinasCenter} zoom={7} className="h-full w-full rounded-2xl">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup chunkedLoading maxClusterRadius={52}>
              {visibleOnMap.map((occ) => (
                <Marker
                  key={occ.id}
                  position={[occ.lat, occ.lng]}
                  icon={createOperationalIcon(occ.intensity)}
                  eventHandlers={{ click: () => setSelectedId(occ.id) }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{occ.id}</p>
                      <p>{occ.city}</p>
                      <p>Denúncias: {occ.reportsCount}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </section>

      {/* Filtros da tabela */}
      <section className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-zinc-800/50 backdrop-blur-md p-4 md:grid-cols-4">
        <input
          id="dashboard-busca"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por ID ou localização"
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm md:col-span-2"
        />

        <select
          id="dashboard-filtro-intensidade"
          value={selectedIntensity}
          onChange={(e) => setSelectedIntensity(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        >
          <option value="TODOS">Intensidade: todos</option>
          {Object.entries(intensityMeta).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>

        <select
          id="dashboard-filtro-status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        >
          <option value="TODOS">Status: todos</option>
          {Object.entries(statusMeta).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </section>

      {/* Tabela de ocorrências */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-zinc-800/50 backdrop-blur-md p-6 text-zinc-100">
        <h2 className="text-lg font-semibold">Lista de ocorrências</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Localização</th>
                <th className="px-3 py-2 text-left">Denúncias</th>
                <th className="px-3 py-2 text-left">Intensidade</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOccurrences.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                    Nenhuma ocorrência encontrada.
                  </td>
                </tr>
              )}
              {filteredOccurrences.map((item) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer border-b border-zinc-900 hover:bg-zinc-900/50 ${
                    item.id === selectedOccurrence?.id ? 'bg-zinc-900/70' : ''
                  }`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <td className="px-3 py-2 font-mono text-xs">{item.id}</td>
                  <td className="px-3 py-2">{item.city}</td>
                  <td className="px-3 py-2">{item.reportsCount}</td>
                  <td
                    className="px-3 py-2"
                    style={{ color: intensityMeta[item.intensity]?.color }}
                  >
                    {intensityMeta[item.intensity]?.label}
                  </td>
                  <td className="px-3 py-2">{statusMeta[item.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detalhe da ocorrência selecionada */}
      <section className="rounded-2xl border border-white/10 bg-zinc-800/50 backdrop-blur-md p-6 text-zinc-100">
        <h2 className="text-lg font-semibold">Detalhe da ocorrência</h2>

        {!selectedOccurrence && (
          <p className="mt-3 text-sm text-zinc-400">
            Selecione uma ocorrência na tabela ou no mapa para visualizar os detalhes.
          </p>
        )}

        {selectedOccurrence && (
          <div className="mt-4 grid gap-6 xl:grid-cols-[1.1fr,1fr]">
            {/* Coluna esquerda — informações + atualização de status */}
            <div className="grid gap-3 text-sm">
              <p>
                <span className="text-zinc-400">ID da ocorrência:</span>{' '}
                <span className="font-mono">{selectedOccurrence.id}</span>
              </p>
              <p>
                <span className="text-zinc-400">Localização:</span> {selectedOccurrence.city}
              </p>
              <p>
                <span className="text-zinc-400">Intensidade:</span>{' '}
                <span style={{ color: intensityMeta[selectedOccurrence.intensity]?.color }}>
                  {intensityMeta[selectedOccurrence.intensity]?.label}
                </span>
              </p>
              <p>
                <span className="text-zinc-400">Denúncias recebidas:</span>{' '}
                {selectedOccurrence.reportsCount}
              </p>
              <p>
                <span className="text-zinc-400">Horário da ocorrência:</span>{' '}
                {formatDateTime(selectedOccurrence.createdAt)}
              </p>

              {/* Descrição — mostra a primeira descrição preenchida pelas denúncias,
                  ou a propria descrição da ocorrência se o backend devolver. */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-zinc-400">Observações da denúncia</p>
                {(() => {
                  const desc =
                    selectedOccurrence.description ||
                    selectedOccurrence.reports.find((r) => r.description)?.description
                  return desc ? (
                    <p className="mt-1 whitespace-pre-wrap text-zinc-200">{desc}</p>
                  ) : (
                    <p className="mt-1 text-xs italic text-zinc-500">
                      Sem observações cadastradas.
                    </p>
                  )
                })()}
              </div>

              {/* Select de atualização de status */}
              <label className="grid gap-2">
                <span className="text-zinc-400">Status</span>
                <select
                  id="select-status-ocorrencia"
                  value={selectedOccurrence.status}
                  onChange={(e) => handleStatusChange(selectedOccurrence.id, e.target.value)}
                  disabled={statusUpdateLoading}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 disabled:opacity-60"
                >
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusMeta[status]}
                    </option>
                  ))}
                </select>
              </label>

              {/* Feedback de atualização */}
              {statusUpdateLoading && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Loader2 size={14} className="animate-spin" /> Atualizando status...
                </div>
              )}
              {statusUpdateSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-700/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  <CheckCircle size={14} /> Status atualizado com sucesso.
                </div>
              )}
              {statusUpdateError && (
                <div className="rounded-xl border border-red-700/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  Erro: {statusUpdateError}
                </div>
              )}

              {/* Regra de negócio explicada */}
              <p className="rounded-xl border border-emerald-700/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                Se o status for <strong>Solucionado</strong> ou <strong>Alerta falso</strong>, o
                foco some do mapa após 24h, mas permanece registrado no sistema.
              </p>
            </div>

            {/* Coluna direita — denúncias e fotos */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-300">
                Denúncias vinculadas ({selectedOccurrence.reports.length})
              </h3>

              {selectedOccurrence.reports.length === 0 && (
                <p className="mt-3 text-sm text-zinc-500">
                  Nenhuma denúncia detalhada disponível.
                </p>
              )}

              <div className="mt-3 grid gap-2">
                {selectedOccurrence.reports.map((report) => (
                  <article
                    key={report.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm"
                  >
                    <p>
                      <span className="text-zinc-400">ID da denúncia:</span>{' '}
                      <span className="font-mono text-xs">{report.id}</span>
                    </p>
                    <p>
                      <span className="text-zinc-400">Horário:</span>{' '}
                      {formatDateTime(report.createdAt)}
                    </p>
                    <p>
                      <span className="text-zinc-400">Intensidade:</span>{' '}
                      {intensityMeta[report.intensity]?.label}
                    </p>
                    {report.description && (
                      <p className="mt-1 whitespace-pre-wrap text-zinc-300">
                        <span className="text-zinc-400">Observações:</span>{' '}
                        {report.description}
                      </p>
                    )}
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
