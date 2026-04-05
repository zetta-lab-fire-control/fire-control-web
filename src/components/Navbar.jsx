import { Flame, Home, History, Megaphone, LogIn } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  [
    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-orange-500/20 text-orange-100' : 'text-orange-100/80 hover:bg-orange-400/20 hover:text-white',
  ].join(' ')

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-orange-500/20 bg-zinc-950/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-white">
          <span className="rounded-xl bg-orange-600 p-2">
            <Flame size={20} />
          </span>
          <div className="text-left leading-tight">
            <p className="text-xs uppercase tracking-widest text-orange-200/80">UAI</p>
            <p className="text-sm font-semibold">Alerta de Unidade de Incendio</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-1">
          <NavLink to="/" className={linkClass}>
            <Home size={16} /> Home
          </NavLink>
          <NavLink to="/historico" className={linkClass}>
            <History size={16} /> Historico
          </NavLink>
          <NavLink to="/reportar" className={linkClass}>
            <Megaphone size={16} /> Reportar foco
          </NavLink>
          <NavLink to="/login" className={linkClass}>
            <LogIn size={16} /> Login
          </NavLink>
        </div>
      </nav>
    </header>
  )
}
