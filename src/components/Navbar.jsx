/**
 * Navbar — Floating Island premium com role badge e link /admin
 *
 * Comportamento:
 *  - Floating island: sticky mx-4 mt-3 rounded-2xl glassmorphism
 *  - Role badge colorido (admin=orange, firefighter=blue, user=zinc)
 *  - Link "Painel" para bombeiros e admins
 *  - Link "Admin" apenas para admins
 *  - Animação de hover nos links
 */

import { Flame, LogIn, Home, History, Megaphone, LogOut, ShieldCheck, Crown, UserPlus } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext.jsx'

const linkClass = ({ isActive }) =>
  [
    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-orange-500/20 text-orange-300'
      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
  ].join(' ')

function RoleBadge({ role }) {
  if (!role) return null
  const styles = {
    admin:       'border-orange-500/40 bg-orange-500/10 text-orange-400',
    firefighter: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
    user:        'border-zinc-600/40 bg-zinc-800/50 text-zinc-500',
  }
  const labels = { admin: 'Admin', firefighter: 'Bombeiro', user: 'Usuário' }
  return (
    <span
      className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline-flex ${styles[role] ?? styles.user}`}
    >
      {labels[role] ?? role}
    </span>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAdmin, isFirefighter, logout } = useAuthContext()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    /* Floating island */
    <header className="sticky top-3 z-50 mx-3 md:mx-4">
      <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/70 px-4 py-2.5 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] md:px-6">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-600 shadow-[0_0_16px_rgba(249,115,22,0.4)]">
            <Flame size={17} />
          </span>
          <div className="text-left leading-tight">
            <p className="text-[10px] uppercase tracking-widest text-orange-300/80">UAI</p>
            <p className="text-sm font-semibold leading-none">Alerta de Incêndio</p>
          </div>
        </Link>

        {/* Links de navegação */}
        <div className="flex flex-wrap items-center justify-end gap-0.5">
          <NavLink to="/" end className={linkClass}>
            <Home size={15} />
            <span className="hidden sm:inline">Home</span>
          </NavLink>

          <NavLink to="/historico" className={linkClass}>
            <History size={15} />
            <span className="hidden sm:inline">Histórico</span>
          </NavLink>

          <NavLink to="/reportar" className={linkClass}>
            <Megaphone size={15} />
            <span className="hidden sm:inline">Reportar</span>
          </NavLink>

          {/* Painel — bombeiros e admins */}
          {isFirefighter && (
            <NavLink to="/painel" className={linkClass}>
              <ShieldCheck size={15} />
              <span className="hidden sm:inline">Painel</span>
            </NavLink>
          )}

          {/* Admin — apenas admins */}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              <Crown size={15} />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          )}

          {/* Área de autenticação */}
          {user ? (
            <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-3">
              <RoleBadge role={user.role} />
              <span className="hidden max-w-[120px] truncate text-xs text-zinc-500 md:block">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
                title="Sair"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                <LogIn size={15} />
                <span className="hidden sm:inline">Login</span>
              </NavLink>
              <NavLink
                to="/cadastro"
                className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-400 transition-all duration-200 hover:bg-orange-500/20 hover:text-orange-300"
              >
                <UserPlus size={15} />
                <span className="hidden sm:inline">Cadastrar</span>
              </NavLink>
            </>
          )}

        </div>
      </nav>
    </header>
  )
}
