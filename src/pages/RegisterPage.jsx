/**
 * RegisterPage — Cadastro de novos usuários (role: user)
 *
 * Campos do UserCreateSchema (POST /users):
 *   firstname, lastname, email, telephone, password
 *
 * Após cadastro bem-sucedido, faz login automático e redireciona para /reportar.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Flame, Loader2, UserPlus, Phone, Mail, User, Lock } from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext.jsx'
import { userApi } from '../services/api.js'

// ─── Campo de formulário reutilizável ─────────────────────────────────────

function Field({ id, label, icon: Icon, type = 'text', value, onChange, placeholder, required, autoComplete, children }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="flex items-center gap-1.5 text-zinc-400">
        {Icon && <Icon size={13} />} {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      {children ?? (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3.5 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
        />
      )}
    </label>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthContext()

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validações client-side
    if (!form.firstname || !form.lastname || !form.email || !form.password) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      // 1. Cria a conta (POST /users — público, sem auth)
      await userApi.create({
        firstname:  form.firstname,
        lastname:   form.lastname,
        email:      form.email,
        telephone:  form.telephone || '00000000000',
        password:   form.password,
      })

      // 2. Faz login automático com as credenciais recém-criadas
      await login(form.email, form.password)

      // 3. Redireciona para reportar
      navigate('/reportar', { replace: true })
    } catch (err) {
      setError(err.message || 'Não foi possível criar a conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
      {/* Glow de fundo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-600/8 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-red-700/8 blur-[100px]" />
      </div>

      {/* Card */}
      <section className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur-2xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.35)]">
            <Flame size={22} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-400/70">
              UAI — Unidade de Apoio Integrado
            </p>
            <h1 className="text-xl font-bold text-zinc-50">Criar conta</h1>
          </div>
        </div>

        <p className="mb-6 text-sm text-zinc-500">
          Cadastre-se para reportar focos de incêndio e acompanhar ocorrências na sua região.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          {/* Nome e Sobrenome lado a lado */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="cadastro-nome"
              label="Nome"
              icon={User}
              value={form.firstname}
              onChange={set('firstname')}
              placeholder="João"
              required
              autoComplete="given-name"
            />
            <Field
              id="cadastro-sobrenome"
              label="Sobrenome"
              icon={User}
              value={form.lastname}
              onChange={set('lastname')}
              placeholder="Silva"
              required
              autoComplete="family-name"
            />
          </div>

          {/* Email */}
          <Field
            id="cadastro-email"
            label="E-mail"
            icon={Mail}
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="joao@exemplo.com"
            required
            autoComplete="email"
          />

          {/* Telefone */}
          <Field
            id="cadastro-telefone"
            label="Telefone"
            icon={Phone}
            type="tel"
            value={form.telephone}
            onChange={set('telephone')}
            placeholder="(31) 99999-9999"
            autoComplete="tel"
          />

          {/* Senha */}
          <Field id="cadastro-senha" label="Senha" icon={Lock} required>
            <div className="relative">
              <input
                id="cadastro-senha"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3.5 py-2.5 pr-10 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
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
          </Field>

          {/* Confirmar senha */}
          <Field
            id="cadastro-confirmar-senha"
            label="Confirmar senha"
            icon={Lock}
            type="password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            placeholder="Repita a senha"
            required
            autoComplete="new-password"
          />

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
            id="btn-cadastrar"
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-[0_0_20px_rgba(249,115,22,0.2)] transition hover:bg-orange-500 hover:shadow-[0_0_28px_rgba(249,115,22,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Criando conta...</>
            ) : (
              <><UserPlus size={16} /> Criar conta</>
            )}
          </button>
        </form>

        {/* Link para login */}
        <p className="mt-5 text-center text-sm text-zinc-500">
          Já tem conta?{' '}
          <Link
            to="/login"
            className="font-medium text-orange-400 underline-offset-2 hover:text-orange-300 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </section>
    </main>
  )
}
