/**
 * ReportPage — Registrar Denúncia de Foco de Incêndio
 *
 * Campos obrigatórios: localização (lat/lng) e intensidade.
 * O upload de foto foi removido — o MinIO não está disponível no ambiente atual.
 * Quando o backend estiver pronto, reintegrar via mediaApi (comentado em api.js).
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2, MapPin } from 'lucide-react'
import { reportApi } from '../services/api.js'
import { intensityToApi } from '../services/occurrenceAdapter.js'
import { northMinasCenter, reportValidationRules } from '../data/mockOccurrences.js'
import { useAuthContext } from '../contexts/AuthContext.jsx'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

/** Componente interno para capturar clique no mapa e posicionar marcador */
function MapClickMarker({ lat, lng, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return lat && lng ? <Marker position={[lat, lng]} /> : null
}

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

  const { user } = useAuthContext()

  const [loading, setLoading] = useState(false)
  const [submittedCode, setSubmittedCode] = useState(null)
  const [error, setError] = useState(null)

  // Redireciona para home após 3 segundos de denúncia criada com sucesso
  useEffect(() => {
    if (submittedCode) {
      const timer = setTimeout(() => navigate('/'), 3000)
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

    if (!lat || !lng) {
      setError('A localização é obrigatória. Use a detecção automática ou clique no mapa.')
      return
    }
    if (!intensity) {
      setError('Selecione a intensidade percebida do foco.')
      return
    }
    if (!user?.id) {
      setError('Sessão expirada. Faça login novamente para enviar a denúncia.')
      return
    }

    setLoading(true)

    try {
      const reportData = {
        user_id: user.id,
        location: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
        intensity: intensityToApi[intensity] ?? 'low',
        type: 'forest_fire',
      }

      // Sem mídia — passa lista vazia
      const result = await reportApi.create(reportData, [])

      const occurrenceId = result?.occurrence_id ?? result?.id ?? 'N/D'
      setSubmittedCode(String(occurrenceId))

      setLat('')
      setLng('')
      setLocationText('')
      setIntensity('')
      setDescription('')
    } catch (err) {
      setError(err.message || 'Não foi possível registrar a denúncia. Tente novamente.')
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
          {/* Localização */}
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
                  const parts = e.target.value.split(/[,|\/\s]+/).filter(Boolean)
                  if (parts.length >= 2) {
                    setLat(parts[0].replace(/[^\d.-]/g, ''))
                    setLng(parts[1].replace(/[^\d.-]/g, ''))
                  }
                }}
              />
            </div>

            {/* Mapa interativo para seleção de localização */}
            <div className="mt-2 h-64 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-inner">
              <MapContainer center={northMinasCenter} zoom={6} className="h-full w-full">
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickMarker
                  lat={lat}
                  lng={lng}
                  onSelect={(newLat, newLng) => {
                    setLat(newLat.toFixed(6))
                    setLng(newLng.toFixed(6))
                    setLocationText(`Lat ${newLat.toFixed(5)} | Lng ${newLng.toFixed(5)}`)
                  }}
                />
              </MapContainer>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 italic">
              Dica: Clique no mapa para selecionar a localização exata do foco.
            </p>

            {lat && lng && (
              <p className="text-xs text-zinc-500">
                Coordenadas: {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
              </p>
            )}
          </div>

          {/* Intensidade */}
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

          {/* Descrição */}
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

        {/* Informativo sobre validação */}
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
