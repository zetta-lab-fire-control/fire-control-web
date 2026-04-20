/**
 * LoginPage — Tela de Login
 *
 * Design: glassmorphism profundo com gradient animado no background.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Flame, Loader2 } from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, login } = useAuthContext()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  // Se já logado, redireciona
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

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
      navigate(isFirefighter ? '/painel' : '/', { replace: true })
    } catch {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
      {/* Glow de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-red-700/8 blur-[100px]" />
      </div>

      {/* Card */}
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur-2xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.35)]">
            <Flame size={22} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-400/70">
              UAI — Unidade de Apoio Integrado
            </p>
            <h1 className="text-xl font-bold text-zinc-50">Acesso ao sistema</h1>
          </div>
        </div>

        <p className="mb-6 text-sm text-zinc-500">
          Use suas credenciais institucionais. Bombeiros e admins são redirecionados ao painel
          operacional.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
          {/* Email */}
          <label className="grid gap-1.5 text-sm">
            <span className="text-zinc-400">E-mail</span>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3.5 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
              placeholder="usuario@exemplo.com"
              autoComplete="email"
              required
            />
          </label>

          {/* Senha */}
          <label className="grid gap-1.5 text-sm">
            <span className="text-zinc-400">Senha</span>
            <div className="relative">
              <input
                id="login-senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3.5 py-2.5 pr-10 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-300"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {/* Erro */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-700/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="btn-login"
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-[0_0_20px_rgba(249,115,22,0.2)] transition hover:bg-orange-500 hover:shadow-[0_0_28px_rgba(249,115,22,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Entrando...</>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 border-t border-zinc-800" />
          <span className="text-xs text-zinc-600">ou</span>
          <div className="flex-1 border-t border-zinc-800" />
        </div>

        {/* CTA cadastro */}
        <Link
          to="/cadastro"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-zinc-700/60 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-orange-500/40 hover:bg-orange-500/5 hover:text-orange-400"
        >
          Não tem conta? <span className="font-semibold text-orange-400">Cadastre-se</span>
        </Link>

        <p className="mt-4 text-center text-xs text-zinc-700">
          <Link to="/" className="underline-offset-2 hover:text-zinc-500 hover:underline">
            Voltar ao início
          </Link>
        </p>
      </section>
    </main>
  )
}
