export default function StatCard({ title, value, note, tone = 'red' }) {
  const tones = {
    red: 'border-t-red-500 from-red-500/5 to-transparent text-red-50',
    amber: 'border-t-amber-500 from-amber-500/5 to-transparent text-amber-50',
    emerald: 'border-t-emerald-500 from-emerald-500/5 to-transparent text-emerald-50',
  }

  return (
    <article className={`group relative overflow-hidden rounded-2xl border border-white/10 border-t-[3px] bg-gradient-to-b bg-zinc-800/60 p-5 shadow-xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-black/20 ${tones[tone]}`}>
      <div className="relative z-10">
        <p className="text-xs tracking-wider text-zinc-400 font-medium uppercase">{title}</p>
        <p className="mt-3 text-4xl font-bold tracking-tight">{value}</p>
        <p className="mt-2 text-xs font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">{note}</p>
      </div>
    </article>
  )
}
