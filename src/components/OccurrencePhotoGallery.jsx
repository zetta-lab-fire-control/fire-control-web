/**
 * OccurrencePhotoGallery
 *
 * Exibe a galeria de fotos de uma ocorrência.
 * Permite:
 *  - Navegar entre múltiplas fotos (setas anterior / próxima)
 *  - Expandir a imagem em tamanho ampliado (lightbox simples)
 *  - Fechar o lightbox clicando no botão ou fora da imagem
 *
 * @param {{ photos: string[] }} props
 */

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

export default function OccurrencePhotoGallery({ photos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (photos.length === 0) return null

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  const goToPrevious = () => setCurrentIndex((i) => Math.max(0, i - 1))
  const goToNext = () => setCurrentIndex((i) => Math.min(photos.length - 1, i + 1))

  const currentPhoto = photos[currentIndex]

  return (
    <>
      {/* Miniatura com navegação */}
      <div className="relative overflow-hidden rounded-xl">
        {/* Imagem atual */}
        <div
          className="group relative cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
          title="Clique para ampliar"
        >
          <img
            src={currentPhoto}
            alt={`Foto da ocorrência ${currentIndex + 1}`}
            className="h-40 w-full rounded-xl object-cover transition-opacity group-hover:opacity-90"
            onError={(e) => {
              // Substitui por placeholder se a imagem não carregar
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          {/* Placeholder caso a imagem falhe — escondido por padrão */}
          <div
            className="hidden h-40 w-full items-center justify-center rounded-xl bg-zinc-800 text-xs text-zinc-500"
            style={{ display: 'none' }}
          >
            Imagem indisponível
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn size={24} className="text-white drop-shadow" />
          </div>
        </div>

        {/* Navegação entre fotos */}
        {photos.length > 1 && (
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={!hasPrevious}
              className="rounded-lg border border-zinc-700 bg-zinc-800 p-1 text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs text-zinc-500">
              {currentIndex + 1} / {photos.length}
            </span>

            <button
              onClick={goToNext}
              disabled={!hasNext}
              className="rounded-lg border border-zinc-700 bg-zinc-800 p-1 text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Próxima foto"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox — imagem expandida */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentPhoto}
              alt={`Foto ampliada ${currentIndex + 1}`}
              className="max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
