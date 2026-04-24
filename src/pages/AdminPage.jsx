/**
 * AdminPage — Painel de Administração do Sistema
 *
 * Funcionalidades:
 *  - Listagem paginada de usuários (GET /users)
 *  - Criação de contas de bombeiro (POST /firefighters)
 *  - Deleção de usuários (DELETE /users/{id})
 *  - Design glassmorphism premium com cards flutuantes
 *
 * Acesso: apenas admins autenticados (protegido via ProtectedRoute).
 */

import { useCallback, useEffect, useState } from 'react'
import {
  Loader2,
  Plus,
  Trash2,
  Shield,
  Users,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Mail,
  Lock,
} from 'lucide-react'
import { adminApi } from '../services/api.js'

// ─── Componente de Modal ────────────────────────────────────────────────────

function CreateFirefighterModal({ onClose, onSuccess }) {
  const [firstname, setFirstname]   = useState('')
  const [lastname, setLastname]     = useState('')
  const [email, setEmail]           = useState('')
  const [telephone, setTelephone]   = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!firstname.trim() || !lastname.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos obrigatórios (nome, sobrenome, e-mail e senha).')
      return
    }

    setLoading(true)
    try {
      await adminApi.createFirefighter({
        firstname,
        lastname,
        email,
        telephone: telephone.trim() || '00000000000',
        password,
        role: 'firefighter',
      })
      onSuccess()
    } catch (err) {
      setError(err.message || 'Erro ao criar bombeiro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/90 backdrop-blur-2xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400">
              <UserCheck size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-zinc-100">Novo Bombeiro</h2>
              <p className="text-xs text-zinc-500">Cria conta com acesso ao painel operacional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          {/* Nome e Sobrenome */}
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Users size={13} /> Nome <span className="text-red-400">*</span>
              </span>
              <input
                id="admin-novo-bombeiro-nome"
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                placeholder="João"
                className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Users size={13} /> Sobrenome <span className="text-red-400">*</span>
              </span>
              <input
                id="admin-novo-bombeiro-sobrenome"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Silva"
                className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
                required
              />
            </label>
          </div>

          {/* Email */}
          <label className="grid gap-1.5 text-sm">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Mail size={13} /> E-mail profissional <span className="text-red-400">*</span>
            </span>
            <input
              id="admin-novo-bombeiro-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bombeiro@cbmmg.mg.gov.br"
              className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
              required
            />
          </label>

          {/* Telefone */}
          <label className="grid gap-1.5 text-sm">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Lock size={13} /> Telefone
            </span>
            <input
              id="admin-novo-bombeiro-telefone"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="(31) 99999-9999"
              className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
            />
          </label>

          {/* Senha */}
          <label className="grid gap-1.5 text-sm">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Lock size={13} /> Senha provisória <span className="text-red-400">*</span>
            </span>
            <input
              id="admin-novo-bombeiro-senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
              required
            />
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-700/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-700/60 px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
            >
              Cancelar
            </button>
            <button
              id="admin-btn-criar-bombeiro"
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Criando...</>
              ) : (
                <><Plus size={15} /> Criar bombeiro</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────

export default function AdminPage() {
  const [users, setUsers]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [showModal, setShowModal]     = useState(false)
  const [toast, setToast]             = useState(null)
  const [deletingId, setDeletingId]   = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.listUsers(50)
      setUsers(Array.isArray(data) ? data : data?.items ?? data?.users ?? [])
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão deste usuário?')) return
    setDeletingId(id)
    try {
      await adminApi.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      showToast('Usuário removido com sucesso.')
    } catch (err) {
      showToast(err.message || 'Erro ao remover usuário.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCreated = () => {
    setShowModal(false)
    showToast('Conta de bombeiro criada com sucesso!')
    fetchUsers()
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      {/* Toast global */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm shadow-2xl backdrop-blur-xl transition-all ${
            toast.type === 'error'
              ? 'border-red-700/40 bg-red-500/10 text-red-200'
              : 'border-emerald-700/40 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CreateFirefighterModal
          onClose={() => setShowModal(false)}
          onSuccess={handleCreated}
        />
      )}

      {/* Header do painel */}
      <section className="mb-8 overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-zinc-900/60 to-zinc-900/60 p-7 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400 shadow-[0_0_24px_rgba(249,115,22,0.3)]">
              <Shield size={26} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-orange-400/80">
                Administração
              </p>
              <h1 className="text-2xl font-bold text-zinc-50">Painel do Administrador</h1>
              <p className="text-sm text-zinc-400">
                Gerencie usuários e crie contas de bombeiro
              </p>
            </div>
          </div>

          <button
            id="admin-btn-abrir-modal"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-[0_0_20px_rgba(249,115,22,0.25)] transition hover:bg-orange-500 hover:shadow-[0_0_28px_rgba(249,115,22,0.4)]"
          >
            <Plus size={18} />
            Novo Bombeiro
          </button>
        </div>
      </section>

      {/* Stat card único (a API /users não expõe role, então evitamos contagens derivadas) */}
      <section className="mb-8">
        <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-2xl p-5 shadow-xl admin-stat-card--blue">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Total de usuários cadastrados
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
              <Users size={20} />
            </span>
          </div>
          <p className="mt-4 text-4xl font-bold tracking-tight text-zinc-100">
            {loading ? '—' : users.length}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            A API atual não expõe a role por usuário — use a ação de criar bombeiro para atribuir perfil.
          </p>
        </article>
      </section>

      {/* Tabela de usuários */}
      <section className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">
            Usuários do sistema
          </h2>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-40"
            title="Recarregar"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-700/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="flex items-center gap-2 py-8 text-sm text-zinc-500">
            <Loader2 size={16} className="animate-spin" />
            Carregando usuários...
          </div>
        )}

        {/* Tabela */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/70 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="pb-3 pl-3 pr-4">Nome</th>
                  <th className="pb-3 px-4">E-mail</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="group border-b border-zinc-800/40 transition hover:bg-zinc-800/30"
                  >
                    <td className="py-3 pl-3 pr-4 font-medium text-zinc-200">
                      {[u.firstname, u.lastname].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deletingId === u.id}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                        title="Remover usuário"
                      >
                        {deletingId === u.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

// ─── Role badge ────────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const map = {
    admin:       'bg-orange-500/15 text-orange-400 border-orange-500/30',
    firefighter: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    user:        'bg-zinc-700/50 text-zinc-400 border-zinc-600/30',
  }
  const labels = {
    admin:       'Admin',
    firefighter: 'Bombeiro',
    user:        'Usuário',
  }
  // A API pública de /users atualmente não devolve role — mostramos "—" em vez
  // de forjar "Usuário" como se fosse a role conhecida.
  if (!role) {
    return (
      <span className="inline-flex items-center rounded-full border border-zinc-700/40 bg-zinc-800/40 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
        —
      </span>
    )
  }
  const cls = map[role] ?? map.user
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {labels[role] ?? role}
    </span>
  )
}
