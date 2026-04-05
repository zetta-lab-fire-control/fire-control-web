import { useState } from 'react'
import { reportValidationRules } from '../data/mockOccurrences.js'

const generateOccurrenceCode = () => {
  const value = Math.floor(100 + Math.random() * 900)
  return `OCC-${value}`
}

export default function ReportPage() {
  const [submittedCode, setSubmittedCode] = useState('')
  const [locationText, setLocationText] = useState('')
  const [locating, setLocating] = useState(false)

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationText('Geolocalizacao indisponivel neste navegador.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocationText(`Lat ${latitude.toFixed(5)} | Lng ${longitude.toFixed(5)}`)
        setLocating(false)
      },
      () => {
        setLocationText('Nao foi possivel detectar localizacao automaticamente.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmittedCode(generateOccurrenceCode())
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
        <h1 className="text-2xl font-semibold">Reportar foco</h1>
        <p className="mt-2 text-sm text-zinc-400">Envie uma denuncia para acionar alerta comunitario e apoiar resposta rapida.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            Email de login
            <input type="email" className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="seuemail@exemplo.com" required />
          </label>

          <label className="grid gap-2 text-sm">
            Senha
            <input type="password" className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="********" required />
          </label>

          <div className="grid gap-2 text-sm">
            <span>Localizacao</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleDetectLocation} className="rounded-xl border border-orange-500/50 bg-orange-500/10 px-3 py-2 font-medium text-orange-200 hover:bg-orange-500/20">
                {locating ? 'Detectando...' : 'Detectar localizacao automaticamente'}
              </button>
              <input
                className="min-w-[220px] flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
                placeholder="Latitude / Longitude ou endereco"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                required
              />
            </div>
          </div>

          <label className="grid gap-2 text-sm">
            Intensidade percebida
            <select className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2" required>
              <option value="">Selecione</option>
              <option>Baixa</option>
              <option>Media</option>
              <option>Alta</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            Foto
            <input type="file" accept="image/*" className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2" />
          </label>

          <label className="grid gap-2 text-sm">
            Descricao do foco
            <textarea rows={4} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="Ex: fumaca escura proxima a area de mata" />
          </label>

          <button className="mt-2 rounded-xl bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-600" type="submit">
            Enviar
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
          <p className="font-semibold text-zinc-100">Validacao das ocorrencias</p>
          <p className="mt-1">{reportValidationRules.firstReport}</p>
          <p>{reportValidationRules.autoValidation}</p>
          <p>{reportValidationRules.firefighterConfirmation}</p>
        </div>

        {submittedCode && (
          <div className="mt-4 rounded-xl border border-emerald-700/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <p>Ocorrencia registrada com sucesso.</p>
            <p>Codigo da ocorrencia: {submittedCode}</p>
            <p>Status atual: Em analise.</p>
            <p>
              Voce pode acompanhar a evolucao da ocorrencia diretamente no mapa.
              Caso tres denuncias sejam registradas na mesma area, o sistema validara automaticamente o alerta.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
