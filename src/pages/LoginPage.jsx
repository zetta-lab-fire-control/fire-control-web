/**
 * LoginPage — Tela de Login Unificada
 *
 * Funcionalidades (Épico EXTRA — Login redefinido):
 *  - Tela única para todos os tipos de usuário
 *  - Validação de campos obrigatórios antes do envio
 *  - Autenticação via POST /api/auth/login
 *  - Redirecionamento por perfil:
 *      • firefighter / admin → /painel (Painel dos Bombeiros)
 *      • user               → /reportar (Reportar Foco)
 *  - Mensagem de erro para credenciais inválidas
 *  - Responsivo
 *
 * TODO (integração pendente com backend):
 *   O endpoint POST /api/auth/login atualmente retorna `true` hardcoded.
 *   Quando o backend implementar JWT e roles, remover o mock de role abaixo
 *   e usar o valor retornado diretamente em `result.role`.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Flame, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ------------------------------------------------------------
  // Submit — chama a API de autenticação
  // TODO: quando o backend retornar JWT com role real, o redirect
  // por perfil funcionará automaticamente via userData.role
  // ------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setLoading(true)

    try {
      const userData = await login(email, password)
      const isFirefighter = userData.role === 'firefighter' || userData.role === 'admin'
      navigate(isFirefighter ? '/painel' : '/reportar', { replace: true })
    } catch (err) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.')
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <main className="mx-auto flex w-full max-w-md px-4 py-10">
      <section className="w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-100 shadow-2xl shadow-black/20">
        {/* Logo e título */}
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-xl bg-orange-600 p-2">
            <Flame size={22} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-200/80">UAI</p>
            <h1 className="text-xl font-semibold">Acesso ao sistema</h1>
          </div>
        </div>

        <p className="mb-6 text-sm text-zinc-400">
          Use suas credenciais para acessar o sistema. Bombeiros são redirecionados ao painel
          operacional.
        </p>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          {/* Email */}
          <label className="grid gap-2 text-sm">
            <span className="text-zinc-300">E-mail</span>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
              placeholder="usuario@exemplo.com"
              autoComplete="email"
              required
            />
          </label>

          {/* Senha */}
          <label className="grid gap-2 text-sm">
            <span className="text-zinc-300">Senha</span>
            <div className="relative">
              <input
                id="login-senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 pr-10 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {/* Mensagem de erro */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-700/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* Botão de entrar */}
          <button
            id="btn-login"
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Link direto para o painel — mantido enquanto o backend não entrega JWT */}
        <Link
          to="/painel"
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-100 hover:bg-orange-500/20"
        >
          Entrar no painel dos bombeiros
        </Link>
      </section>
    </main>
  )
}
