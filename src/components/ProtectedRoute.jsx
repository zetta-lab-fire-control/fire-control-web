/**
 * ProtectedRoute — Guarda de rota com verificação de autenticação e role
 *
 * Props:
 *   requireAdmin       {boolean} - apenas admins
 *   requireFirefighter {boolean} - bombeiros e admins
 *
 * Comportamento:
 *   - Não autenticado           → redireciona para /login
 *   - Sem permissão suficiente  → exibe tela "Acesso restrito" (não redireciona silenciosamente)
 */

import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext.jsx'
import { ShieldOff, LogOut, Home } from 'lucide-react'

function AccessDenied({ requiredRole }) {
  const { logout, user } = useAuthContext()

  const roleLabel = { admin: 'Administrador', firefighter: 'Bombeiro' }[requiredRole] ?? 'autorizado'

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-red-500/20 bg-zinc-900/60 backdrop-blur-2xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <ShieldOff size={26} />
        </span>
        <h1 className="text-lg font-bold text-zinc-100">Acesso restrito</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Esta página é exclusiva para <strong className="text-zinc-300">{roleLabel}s</strong>.
          {' '}Você entrou como <span className="font-mono text-orange-400">{user?.email}</span>{' '}
          com perfil <span className="capitalize text-zinc-400">{user?.role ?? '—'}</span>.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <a
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
          >
            <Home size={15} /> Ir para a Home
          </a>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={15} /> Sair e trocar conta
          </button>
        </div>
      </div>
    </main>
  )
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireFirefighter = false,
  redirectTo = '/login',  // rota de destino quando não autenticado
}) {
  const { user, isAdmin, isFirefighter } = useAuthContext()

  // Não autenticado → redireciona para redirectTo (ex: /cadastro, /login)
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  // Requer admin, mas não é admin
  if (requireAdmin && !isAdmin) {
    return <AccessDenied requiredRole="admin" />
  }

  // Requer bombeiro/admin, mas é apenas user comum
  if (requireFirefighter && !isFirefighter) {
    return <AccessDenied requiredRole="firefighter" />
  }

  return children

}

