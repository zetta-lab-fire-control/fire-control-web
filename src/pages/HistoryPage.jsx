import { useMemo, useState } from 'react'
import { ResponsiveContainer, ComposedChart, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { historyByPeriod } from '../data/mockOccurrences.js'

const periodOptions = [
  { value: '30', label: 'Ultimos 30 dias' },
  { value: '60', label: 'Ultimos 60 dias' },
  { value: '90', label: 'Ultimos 90 dias' },
  { value: 'ano', label: 'Ultimo ano' },
]

export default function HistoryPage() {
  const [period, setPeriod] = useState('30')

  const chartData = useMemo(() => historyByPeriod[period] ?? historyByPeriod['30'], [period])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Historico de ocorrencias</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Leitura dos ultimos periodos com ocorrencias, intensidade media e cidade com maior foco.
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
          {chartData.map((entry) => (
            <article key={`${period}-${entry.label}`} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm">
              <p className="text-zinc-400">{entry.label}</p>
              <p className="mt-1 font-medium">Cidade com maior foco: {entry.cidadeMaiorFoco}</p>
              <p className="text-zinc-300">Ocorrencias: {entry.ocorrencias}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
