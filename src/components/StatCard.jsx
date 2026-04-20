/**
 * StatCard — Card de indicador operacional com glassmorphism avançado
 *
 * Props:
 *   title   {string}   - rótulo do indicador
 *   value   {string|number} - valor principal
 *   note    {string}   - texto secundário
 *   tone    {'red'|'amber'|'emerald'} - cor da borda e glow
 *   icon    {ReactNode} - ícone opcional
 */

export default function StatCard({ title, value, note, tone = 'red', icon }) {
  const tones = {
    red: {
      border: 'border-t-red-500',
      glow:   'shadow-[0_0_24px_rgba(239,68,68,0.12)]',
      text:   'text-red-50',
      badge:  'bg-red-500/10 text-red-400',
    },
    amber: {
      border: 'border-t-amber-500',
      glow:   'shadow-[0_0_24px_rgba(245,158,11,0.12)]',
      text:   'text-amber-50',
      badge:  'bg-amber-500/10 text-amber-400',
    },
    emerald: {
      border: 'border-t-emerald-500',
      glow:   'shadow-[0_0_24px_rgba(16,185,129,0.12)]',
      text:   'text-emerald-50',
      badge:  'bg-emerald-500/10 text-emerald-400',
    },
  }

  const t = tones[tone] ?? tones.red

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-white/10 border-t-[3px] bg-zinc-900/40 backdrop-blur-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/60 ${t.border} ${t.glow}`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</p>
          {icon && (
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${t.badge}`}>
              {icon}
            </span>
          )}
        </div>
        <p className={`mt-3 text-4xl font-bold tracking-tight ${t.text}`}>{value}</p>
        <p className="mt-2 text-xs font-medium text-zinc-600 transition-colors group-hover:text-zinc-400">
          {note}
        </p>
      </div>

      {/* Glow interior decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
    </article>
  )
}
