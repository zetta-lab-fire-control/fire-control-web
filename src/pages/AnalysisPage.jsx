import { useEffect, useState, useCallback } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts'
import {
  BrainCircuit, Database, Flame, Loader2, AlertTriangle,
  TrendingUp, Droplets, Wind, Search, ChevronDown,
} from 'lucide-react'
import { dataScienceApi } from '../features/data-science/dsApi.js'

// ─── helpers ────────────────────────────────────────────────────────────────

function avg(arr, key) {
  if (!arr?.length) return null
  const vals = arr.map((r) => parseFloat(r[key])).filter((v) => !isNaN(v))
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function StatCard({ icon, label, value, sub, accent = 'zinc' }) {
  const colors = {
    orange:  'border-orange-800/30 bg-orange-500/10 text-orange-400',
    violet:  'border-violet-800/30 bg-violet-500/10 text-violet-400',
    emerald: 'border-emerald-800/30 bg-emerald-500/10 text-emerald-400',
    blue:    'border-blue-800/30 bg-blue-500/10 text-blue-400',
    red:     'border-red-800/30 bg-red-500/10 text-red-400',
    zinc:    'border-zinc-700/30 bg-zinc-800/40 text-zinc-400',
  }
  return (
    <div className={`rounded-2xl border p-4 ${colors[accent]}`}>
      <p className="flex items-center gap-1.5 text-xs opacity-75 mb-2">{icon}{label}</p>
      <p className="text-2xl font-bold text-zinc-100">{value ?? '—'}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  )
}

function SectionTitle({ icon, title, badge }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {icon}
      <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
      {badge && (
        <span className="ml-auto rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
          {badge}
        </span>
      )}
    </div>
  )
}

// ─── Seção 1: visão geral ────────────────────────────────────────────────────

function DatasetOverview({ info }) {
  if (!info) return null
  const inicio = info.periodo_inicio?.slice(0, 10) ?? '—'
  const fim    = info.periodo_fim?.slice(0, 10)    ?? '—'

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<Database size={14} />}
        label="Registros INPE"
        value={info.linhas?.toLocaleString('pt-BR')}
        accent="violet"
      />
      <StatCard
        icon={<TrendingUp size={14} />}
        label="Período coberto"
        value={`${inicio} → ${fim}`}
        accent="blue"
      />
      <StatCard
        icon={<Flame size={14} />}
        label="Biomas"
        value={info.biomas_presentes?.length}
        sub={info.biomas_presentes?.join(', ')}
        accent="orange"
      />
      <StatCard
        icon={<Wind size={14} />}
        label="Estados (UFs)"
        value={info.ufs_presentes?.length}
        accent="emerald"
      />
    </div>
  )
}

// ─── Seção 2: explorador + predição ─────────────────────────────────────────

const ANOS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
const MESES = [
  { value: '', label: 'Todos os meses' },
  { value: 1,  label: 'Janeiro' },  { value: 2,  label: 'Fevereiro' },
  { value: 3,  label: 'Março' },    { value: 4,  label: 'Abril' },
  { value: 5,  label: 'Maio' },     { value: 6,  label: 'Junho' },
  { value: 7,  label: 'Julho' },    { value: 8,  label: 'Agosto' },
  { value: 9,  label: 'Setembro' }, { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
]

function Explorer({ biomas, ufs, models }) {
  const [bioma, setBioma]   = useState('')
  const [uf, setUf]         = useState('')
  const [ano, setAno]       = useState('')
  const [mes, setMes]       = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [error, setError]   = useState(null)

  const firstModel = models?.[0] ?? null

  const handleSearch = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setPrediction(null)

    try {
      const filterBody = {
        ...(bioma && { bioma }),
        ...(uf    && { nome_uf: uf }),
        ...(ano   && { ano: Number(ano) }),
        ...(mes   && { mes: Number(mes) }),
        n_linhas: 2000,
      }

      const [filtered, pred] = await Promise.all([
        dataScienceApi.filterData(filterBody),
        firstModel
          ? dataScienceApi.predictOnDataset({
              nomeModelo:  firstModel.nome,
              tipoModelo:  firstModel.tipo,
              filtroAno:   ano   || undefined,
              filtroBioma: bioma || undefined,
              filtroUf:    uf    || undefined,
              nLinhas:     1000,
            }).catch(() => null)
          : Promise.resolve(null),
      ])

      setResult(filtered)
      setPrediction(pred)
    } catch (err) {
      setError(err?.message ?? 'Erro ao buscar dados.')
    } finally {
      setLoading(false)
    }
  }, [bioma, uf, ano, mes, firstModel])

  const rows   = result?.dados ?? []
  const avgRisco    = avg(rows, 'RiscoFogo')
  const avgSemChuva = avg(rows, 'DiaSemChuva')
  const avgChuva    = avg(rows, 'Precipitacao')
  const avgFRP      = avg(rows, 'FRP')

  // Distribuição de predições para classificação
  const predChart = (() => {
    if (!prediction?.predicoes?.length) return null
    const counts = {}
    prediction.predicoes.forEach((p) => {
      const k = String(p)
      counts[k] = (counts[k] ?? 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  })()

  const inputCls = 'rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30'

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-4">
        <div className="grid gap-1.5">
          <label className="text-xs text-zinc-400">Bioma</label>
          <select value={bioma} onChange={(e) => setBioma(e.target.value)} className={inputCls}>
            <option value="">Todos</option>
            {biomas.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-zinc-400">Estado (UF)</label>
          <select value={uf} onChange={(e) => setUf(e.target.value)} className={inputCls}>
            <option value="">Todos</option>
            {ufs.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-zinc-400">Ano</label>
          <select value={ano} onChange={(e) => setAno(e.target.value)} className={inputCls}>
            <option value="">Todos</option>
            {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-zinc-400">Mês</label>
          <select value={mes} onChange={(e) => setMes(e.target.value)} className={inputCls}>
            {MESES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-60 transition"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        {loading ? 'Analisando...' : 'Analisar'}
      </button>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-700/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {result && (
        <div className="mt-6 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Database size={14} />}
              label="Registros encontrados"
              value={result.total_linhas?.toLocaleString('pt-BR')}
              sub={`Amostra: ${rows.length} linhas`}
              accent="violet"
            />
            <StatCard
              icon={<Flame size={14} />}
              label="Risco de fogo médio"
              value={avgRisco != null ? `${(avgRisco * 100).toFixed(1)}%` : '—'}
              accent={avgRisco > 0.6 ? 'red' : avgRisco > 0.3 ? 'orange' : 'emerald'}
            />
            <StatCard
              icon={<Wind size={14} />}
              label="Dias sem chuva (média)"
              value={avgSemChuva != null ? `${avgSemChuva.toFixed(1)} dias` : '—'}
              accent="blue"
            />
            <StatCard
              icon={<Droplets size={14} />}
              label="Precipitação média"
              value={avgChuva != null ? `${avgChuva.toFixed(2)} mm` : '—'}
              accent="emerald"
            />
          </div>

          {avgFRP != null && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300">
              <span className="text-zinc-500">FRP médio (Fire Radiative Power):</span>{' '}
              <span className="font-semibold text-orange-300">{avgFRP.toFixed(2)} MW</span>
              <span className="ml-2 text-xs text-zinc-600">— intensidade radiativa média dos focos</span>
            </div>
          )}

          {predChart && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="mb-1 text-sm font-semibold text-zinc-100">
                Predição do modelo —{' '}
                <span className="font-normal text-zinc-400">{firstModel?.nome?.replace('.joblib', '')}</span>
              </p>
              <p className="mb-4 text-xs text-zinc-500">
                Distribuição das classes previstas para {prediction.total_linhas?.toLocaleString('pt-BR')} registros filtrados.
              </p>
              <div className="h-48">
                <ResponsiveContainer>
                  <BarChart data={predChart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }}
                      labelStyle={{ color: '#e4e4e7' }}
                    />
                    <Bar dataKey="count" name="Registros" radius={[6, 6, 0, 0]}>
                      {predChart.map((_, i) => (
                        <Cell key={i} fill={['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'][i % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Seção 3: modelos ────────────────────────────────────────────────────────

function ModelCard({ model }) {
  const [open, setOpen] = useState(false)
  const isClass = model.tipo === 'classificacao'
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-zinc-100 text-sm">{model.nome?.replace('.joblib', '')}</p>
          <p className="text-xs text-zinc-500 capitalize mt-0.5">{model.tipo}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${isClass ? 'border-violet-500/30 bg-violet-500/10 text-violet-400' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'}`}>
            {isClass ? 'Classificação' : 'Regressão'}
          </span>
          <span className="text-xs text-zinc-600">{model.tamanho_mb?.toFixed(1)} MB</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
        <span><span className="text-zinc-600">Features:</span> {model.num_features}</span>
        {isClass && <span><span className="text-zinc-600">Classes:</span> {model.num_classes}</span>}
      </div>

      {isClass && model.classes?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {model.classes.map((c) => (
            <span key={c} className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
              {c}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition"
      >
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        {open ? 'Ocultar features' : 'Ver features'}
      </button>

      {open && model.feature_names?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {model.feature_names.map((f) => (
            <span key={f} className="rounded border border-zinc-700/50 bg-zinc-800/50 px-1.5 py-0.5 text-[10px] text-zinc-500">
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const [info, setInfo]       = useState(null)
  const [models, setModels]   = useState([])
  const [biomas, setBiomas]   = useState([])
  const [ufs, setUfs]         = useState([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      dataScienceApi.getInfo().catch(() => null),
      dataScienceApi.listModels().catch(() => null),
      dataScienceApi.getUniqueValues('Bioma').catch(() => null),
      dataScienceApi.getUniqueValues('Nome_UF').catch(() => null),
    ]).then(([dsInfo, dsModels, biomasData, ufsData]) => {
      setOffline(!dsInfo && !dsModels)
      setInfo(dsInfo)
      setModels(dsModels?.modelos ?? [])
      setBiomas(biomasData?.valores ?? [])
      setUfs(ufsData?.valores ?? [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-800/50 backdrop-blur-md p-6 text-zinc-100">

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit size={20} className="text-violet-400" />
              <h1 className="text-2xl font-semibold">Análise preditiva</h1>
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                Data Science
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              Dados históricos INPE/QUEIMADAS processados pelo ZettaLab — explore focos por região e
              veja as predições dos modelos treinados.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 size={15} className="animate-spin" /> Conectando à API de Ciência de Dados...
          </div>
        )}

        {!loading && offline && (
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-5 text-sm text-zinc-400">
            <AlertTriangle size={18} className="shrink-0 text-amber-500/70" />
            <div>
              <p className="font-medium text-zinc-300">API de Ciência de Dados não está acessível.</p>
              <p className="text-xs mt-0.5">Certifique-se que o serviço <code className="text-violet-400">fire-control-data-science-main</code> está rodando na porta 8001.</p>
            </div>
          </div>
        )}

        {!loading && !offline && (
          <div className="grid gap-10">

            {/* Dataset overview */}
            <div>
              <SectionTitle
                icon={<Database size={16} className="text-violet-400" />}
                title="Visão geral do dataset"
                badge="INPE / QUEIMADAS"
              />
              <DatasetOverview info={info} />
            </div>

            {/* Explorer */}
            <div>
              <SectionTitle
                icon={<Search size={16} className="text-orange-400" />}
                title="Explorador de focos históricos"
              />
              <p className="mb-4 text-sm text-zinc-400">
                Filtre os registros INPE e veja estatísticas de risco para a região. O modelo preditivo
                roda automaticamente sobre os dados filtrados.
              </p>
              <Explorer biomas={biomas} ufs={ufs} models={models} />
            </div>

            {/* Models */}
            {models.length > 0 && (
              <div>
                <SectionTitle
                  icon={<BrainCircuit size={16} className="text-violet-400" />}
                  title={`Modelos treinados (${models.length})`}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {models.map((m) => <ModelCard key={m.nome} model={m} />)}
                </div>
              </div>
            )}

          </div>
        )}
      </section>
    </main>
  )
}
