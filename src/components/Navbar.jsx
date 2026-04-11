/**
 * Navbar — Barra de navegação global
 *
 * Comportamento:
 *  - Exibe links principais para todos os visitantes (Home, Histórico, Reportar)
 *  - Exibe o link "Painel" apenas para bombeiros/admin autenticados
 *  - Exibe nome e botão de logout quando o usuário está logado
 *  - Exibe botão "Login" quando não há usuário autenticado
 */

import { Flame, LogIn, Home, History, Megaphone, LogOut, ShieldCheck } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

const linkClass = ({ isActive }) =>
  [
    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-orange-500/20 text-orange-100' : 'text-orange-100/80 hover:bg-orange-400/20 hover:text-white',
  ].join(' ')

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isFirefighter, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-orange-500/20 bg-zinc-950/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 text-white">
          <span className="rounded-xl bg-orange-600 p-2">
            <Flame size={20} />
          </span>
          <div className="text-left leading-tight">
            <p className="text-xs uppercase tracking-widest text-orange-200/80">UAI</p>
            <p className="text-sm font-semibold">Alerta de Unidade de Incêndio</p>
          </div>
        </Link>

        {/* Links de navegação */}
        <div className="flex flex-wrap items-center justify-end gap-1">
          <NavLink to="/" end className={linkClass}>
            <Home size={16} /> Home
          </NavLink>

          <NavLink to="/historico" className={linkClass}>
            <History size={16} /> Histórico
          </NavLink>

          <NavLink to="/reportar" className={linkClass}>
            <Megaphone size={16} /> Reportar foco
          </NavLink>

          {/* Link do painel — visível apenas para bombeiros/admin */}
          {isFirefighter && (
            <NavLink to="/painel" className={linkClass}>
              <ShieldCheck size={16} /> Painel
            </NavLink>
          )}

          {/* Área de autenticação */}
          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden text-xs text-zinc-400 sm:block">{user.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                title="Sair"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={linkClass}>
              <LogIn size={16} /> Login
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}
