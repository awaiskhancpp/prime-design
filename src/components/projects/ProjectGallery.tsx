'use client'

import { useState } from 'react'
import Image from 'next/image'

import { Lightbox } from '@/components/gallery/Lightbox'

/**
 * Project photo grid with the shared gallery Lightbox — clicking a photo
 * opens the viewer at that image, with prev/next and keyboard navigation.
 */
export function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <div className="grid gap-2 md:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden bg-paper-2"
            aria-label={`Open ${title} project image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${title} project image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          images={images}
          index={lightboxIndex}
          alt={title}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </>
  )
}
