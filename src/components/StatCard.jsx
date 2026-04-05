export default function StatCard({ title, value, note, tone = 'red' }) {
  const tones = {
    red: 'border-red-400/30 bg-red-500/10 text-red-100',
    amber: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
  }

  return (
    <article className={`rounded-2xl border p-4 shadow-lg shadow-black/10 ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wider opacity-80">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs opacity-80">{note}</p>
    </article>
  )
}
