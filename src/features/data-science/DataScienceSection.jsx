import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, Flame, BrainCircuit, Database, AlertTriangle } from 'lucide-react'
import { dataScienceApi } from './dsApi.js'

function StatTile({ icon, label, value, accent = 'zinc', small = false }) {
  const accents = {
    violet:  'text-violet-400 bg-violet-500/10 border-violet-800/30',
    orange:  'text-orange-400 bg-orange-500/10 border-orange-800/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-800/30',
    blue:    'text-blue-400 bg-blue-500/10 border-blue-800/30',
    zinc:    'text-zinc-400 bg-zinc-800/40 border-zinc-700/30',
  }
  return (
    <div className={`rounded-2xl border p-4 ${accents[accent]}`}>
      <p className="flex items-center gap-1.5 text-xs opacity-80 mb-2">{icon} {label}</p>
      <p className={`font-bold ${small ? 'text-base' : 'text-2xl'} text-zinc-100`}>{value}</p>
    </div>
  )
}

export default function DataScienceSection() {
  const [dsInfo, setDsInfo]       = useState(null)
  const [dsModels, setDsModels]   = useState(null)
  const [dsLoading, setDsLoading] = useState(true)
  const [dsError, setDsError]     = useState(false)

  useEffect(() => {
    setDsLoading(true)
    Promise.all([
      dataScienceApi.getInfo().catch(() => null),
      dataScienceApi.listModels().catch(() => null),
    ]).then(([info, models]) => {
      setDsInfo(info)
      setDsModels(models)
      setDsError(!info && !models)
    }).finally(() => setDsLoading(false))
  }, [])

  if (dsLoading) {
    return (
      <div className="mt-8 flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 size={15} className="animate-spin" />
        Conectando à API de Ciência de Dados...
      </div>
    )
  }

  if (dsError) {
    return (
      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-4 text-sm text-zinc-500">
        <AlertTriangle size={16} className="shrink-0 text-amber-500/70" />
        <span>API de dados históricos INPE/QUEIMADAS não está acessível no momento.</span>
      </div>
    )
  }

  const rows      = dsInfo?.linhas ?? dsInfo?.rows ?? null
  const period    = dsInfo?.periodo ?? dsInfo?.period ?? null
  const biomas    = dsInfo?.biomas ?? dsInfo?.biomes ?? []
  const modelList = Array.isArray(dsModels) ? dsModels : (dsModels?.modelos ?? [])

  return (
    <div className="mt-10 border-t border-zinc-800 pt-8">
      <div className="flex items-center gap-2 mb-5">
        <BrainCircuit size={18} className="text-violet-400" />
        <h2 className="text-base font-semibold text-zinc-100">
          Dados históricos — INPE / QUEIMADAS
        </h2>
        <span className="ml-auto rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
          Data Science
        </span>
      </div>

      <p className="mb-5 text-sm text-zinc-400">
        Dados coletados e processados pela equipe de Ciência de Dados do ZettaLab a partir do banco
        INPE/QUEIMADAS. Os modelos preditivos treinados sobre esse dataset alimentam o sistema de
        risco de fogo exibido no mapa.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-5">
        <StatTile
          icon={<Database size={15} />}
          label="Registros no dataset"
          value={rows != null ? rows.toLocaleString('pt-BR') : '—'}
          accent="violet"
        />
        <StatTile
          icon={<Flame size={15} />}
          label="Biomas cobertos"
          value={Array.isArray(biomas) ? biomas.length : (biomas || '—')}
          accent="orange"
        />
        <StatTile
          icon={<TrendingUp size={15} />}
          label="Período de cobertura"
          value={period ?? '—'}
          accent="emerald"
          small
        />
        <StatTile
          icon={<BrainCircuit size={15} />}
          label="Modelos treinados"
          value={modelList.length || '—'}
          accent="blue"
        />
      </div>

      {modelList.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Modelos disponíveis
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {modelList.map((model, i) => {
              const name   = model.nome ?? model.name ?? model ?? `Modelo ${i + 1}`
              const type   = model.tipo ?? model.type ?? '—'
              const sizeKb = model.tamanho_kb ?? model.size_kb
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{String(name).replace('.joblib', '')}</p>
                    <p className="text-xs text-zinc-500 capitalize">{type}</p>
                  </div>
                  {sizeKb != null && (
                    <span className="text-xs text-zinc-600">{(sizeKb / 1024).toFixed(1)} MB</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {Array.isArray(biomas) && biomas.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Biomas no dataset
          </h3>
          <div className="flex flex-wrap gap-2">
            {biomas.map((b) => (
              <span
                key={b}
                className="rounded-full border border-emerald-800/40 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-300"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
