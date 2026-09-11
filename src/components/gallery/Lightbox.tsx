'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export function Lightbox({
  images,
  index,
  alt,
  onClose,
  onNavigate,
}: {
  images: string[]
  index: number
  alt: string
  onClose: () => void
  onNavigate: (nextIndex: number) => void
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length)
      if (event.key === 'ArrowRight') onNavigate((index + 1) % images.length)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [index, images.length, onClose, onNavigate])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 sm:p-10"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center border border-white/25 text-white transition-colors hover:border-brass hover:text-brass sm:right-6 sm:top-6"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onNavigate((index - 1 + images.length) % images.length)
        }}
        aria-label="Previous image"
        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/25 text-white transition-colors hover:border-brass hover:text-brass sm:left-6"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      <div
        className="relative aspect-[4/3] w-full max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          key={images[index]}
          src={images[index]}
          alt={alt}
          fill
          className="object-contain"
          sizes="(min-width: 768px) 80vw, 100vw"
          priority
        />
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onNavigate((index + 1) % images.length)
        }}
        aria-label="Next image"
        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/25 text-white transition-colors hover:border-brass hover:text-brass sm:right-6"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60 sm:bottom-6">
        {index + 1} / {images.length}
      </p>
    </div>
  )
}
