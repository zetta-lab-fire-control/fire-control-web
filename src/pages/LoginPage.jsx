import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md px-4 py-10">
      <section className="w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl shadow-black/20">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-zinc-400">Acesso da plataforma para acompanhamento e operacao.</p>

        <form className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            Email
            <input type="email" className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="usuario@exemplo.com" />
          </label>

          <label className="grid gap-2 text-sm">
            Senha
            <input type="password" className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="********" />
          </label>

          <button type="button" className="w-fit text-sm text-orange-300 hover:text-orange-200">
            Esqueceu a senha?
          </button>

          <button type="button" className="rounded-xl bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-600">
            Entrar
          </button>
        </form>

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
