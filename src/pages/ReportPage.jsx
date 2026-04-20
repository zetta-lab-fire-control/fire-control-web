/**
 * ReportPage — Registrar Denúncia de Foco de Incêndio
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2, MapPin } from 'lucide-react'
import { reportApi, mediaApi } from '../services/api.js'
import { intensityToApi } from '../services/occurrenceAdapter.js'
import { reportValidationRules } from '../data/mockOccurrences.js'
import { useAuthContext } from '../contexts/AuthContext.jsx'



const intensityOptions = [
  { value: '', label: 'Selecione a intensidade' },
  { value: 'BAIXA', label: 'Baixa — fumaça leve ou odor' },
  { value: 'MEDIA', label: 'Média — chamas visíveis' },
  { value: 'ALTA', label: 'Alta — fogo intenso ou spreading' },
]



export default function ReportPage() {
  const navigate = useNavigate()
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [locationText, setLocationText] = useState('')
  const [locating, setLocating] = useState(false)
  const [intensity, setIntensity] = useState('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  
  const { user } = useAuthContext()

  const [loading, setLoading] = useState(false)
  const [submittedCode, setSubmittedCode] = useState(null)
  const [error, setError] = useState(null)

  // Redireciona para dashboard após 3 segundos de denúncia criada com sucesso
  useEffect(() => {
    if (submittedCode) {
      const timer = setTimeout(() => {
        navigate('/')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [submittedCode, navigate])

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationText('Geolocalização indisponível neste navegador.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLat(coords.latitude.toFixed(6))
        setLng(coords.longitude.toFixed(6))
        setLocationText(`Lat ${coords.latitude.toFixed(5)} | Lng ${coords.longitude.toFixed(5)}`)
        setLocating(false)
      },
      () => {
        setLocationText('Não foi possível detectar localização automaticamente.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmittedCode(null)

    // Validação de campos obrigatórios
    if (!lat || !lng) {
      setError('A localização é obrigatória. Use a detecção automática ou informe manualmente.')
      return
    }
    if (!intensity) {
      setError('Selecione a intensidade percebida do foco.')
      return
    }

    setLoading(true)

    try {
      let mediaList = []

      // Etapa 1 (opcional): upload de foto via MinIO
      if (photoFile) {
        // Obtém URL de upload pré-assinado do backend
        const mediaResponse = await mediaApi.create({
          extension: photoFile.name.split('.').pop().toLowerCase(),
          bucket: 'reports',
          type: 'image', // tipo padrão para fotos
          size: photoFile.size, // tamanho do arquivo em bytes
        })

        // Faz o upload direto para o MinIO com a URL pré-assinada
        await mediaApi.uploadToStorage(mediaResponse.upload_url, photoFile)

        // Guarda o ID da mídia para vincular à denúncia
        mediaList = [mediaResponse.instance_metadata]
      }

      // Etapa 2: cria a denúncia no backend
      const reportData = {
        user_id: user?.id,
        location: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
        intensity: intensityToApi[intensity] ?? 'low',
        type: 'forest_fire', // tipo padrão para o escopo do projeto
      }

      const result = await reportApi.create(reportData, mediaList)

      const occurrenceId = result?.occurrence_id ?? result?.id ?? 'N/D'
      setSubmittedCode(String(occurrenceId))

      setLat('')
      setLng('')
      setLocationText('')
      setIntensity('')
      setDescription('')
      setPhotoFile(null)
    } catch (err) {
      setError(
        err.message || 'Não foi possível registrar a denúncia. Tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }



  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-800/50 backdrop-blur-md p-6 text-zinc-100">
        <h1 className="text-2xl font-semibold">Reportar foco de incêndio</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Envie uma denúncia para acionar alerta comunitário e apoiar resposta rápida dos
          bombeiros.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4" noValidate>
          <div className="grid gap-2 text-sm">
            <span className="text-zinc-300">Localização <span className="text-red-400">*</span></span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                className="flex items-center gap-2 rounded-xl border border-orange-500/50 bg-orange-500/10 px-3 py-2 font-medium text-orange-200 hover:bg-orange-500/20 disabled:opacity-60"
              >
                <MapPin size={15} />
                {locating ? 'Detectando...' : 'Detectar automaticamente'}
              </button>
              <input
                id="report-localizacao"
                className="min-w-[220px] flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 placeholder-zinc-600"
                placeholder="Latitude / Longitude"
                value={locationText}
                onChange={(e) => {
                  setLocationText(e.target.value)
                  // Tenta extrair lat/lng se o usuário digitar manualmente
                  const parts = e.target.value.split(/[,|\/\s]+/).filter(Boolean)
                  if (parts.length >= 2) {
                    setLat(parts[0].replace(/[^\d.-]/g, ''))
                    setLng(parts[1].replace(/[^\d.-]/g, ''))
                  }
                }}
              />
            </div>
            {lat && lng && (
              <p className="text-xs text-zinc-500">
                Coordenadas: {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
              </p>
            )}
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-zinc-300">
              Intensidade percebida <span className="text-red-400">*</span>
            </span>
            <select
              id="report-intensidade"
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
              required
            >
              {intensityOptions.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-zinc-300">Foto do foco (opcional)</span>
            <input
              id="report-foto"
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500/20 file:px-3 file:py-1 file:text-xs file:text-orange-200"
            />
            {photoFile && (
              <p className="text-xs text-zinc-500">
                Arquivo selecionado: {photoFile.name} ({(photoFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-zinc-300">Descrição adicional (opcional)</span>
            <textarea
              id="report-descricao"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 placeholder-zinc-600"
              placeholder="Ex: fumaça escura próxima à área de mata, vento forte..."
            />
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

          {/* Botão de envio */}
          <button
            id="btn-enviar-denuncia"
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Enviando...
              </>
            ) : (
              'Enviar denúncia'
            )}
          </button>
        </form>

        {/* Confirmação de sucesso */}
        {submittedCode && (
          <div className="mt-6 rounded-2xl border border-emerald-700/40 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <CheckCircle size={16} /> Denúncia registrada com sucesso!
            </div>
            <p>
              <span className="text-emerald-300">Código da ocorrência:</span>{' '}
              <span className="font-mono font-semibold">{submittedCode}</span>
            </p>
            <p className="mt-1">
              <span className="text-emerald-300">Status atual:</span> Em análise
            </p>
            <p className="mt-2 text-xs text-emerald-200/70">
              Você pode acompanhar a evolução da ocorrência diretamente no mapa. Caso três
              denúncias sejam registradas na mesma área, o sistema validará automaticamente o
              alerta.
            </p>
          </div>
        )}

        {/* Informativo sobre validação de ocorrências */}
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
          <p className="font-semibold text-zinc-100">Como funciona a validação?</p>
          <ul className="mt-2 grid gap-1 text-zinc-400">
            <li>• {reportValidationRules.firstReport}</li>
            <li>• {reportValidationRules.autoValidation}</li>
            <li>• {reportValidationRules.firefighterConfirmation}</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
