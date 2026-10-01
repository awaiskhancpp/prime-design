'use client'

import { useState } from 'react'
import Image from '@/components/ui/Image'

import { Button } from '@/components/ui/Button'
import { Lightbox } from '@/components/gallery/Lightbox'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ServiceDetail } from '@/lib/services'

function galleryContentFor(service: ServiceDetail) {
  // Payload sections[] gallery block(s) — flat items and/or grouped items
  // (e.g. "Kitchens" / "Bathrooms" tabs from WordPress).
  const sectionGalleries = (service.sections || []).filter(
    (section) => section && section.blockType === 'gallery',
  )
  const fromSections = sectionGalleries.flatMap((section) => {
    const flatItems = Array.isArray(section.items) ? section.items : []
    const groupItems = Array.isArray(section.groups)
      ? (section.groups as Record<string, unknown>[]).flatMap((group) =>
          Array.isArray(group.items) ? group.items : [],
        )
      : []
    return [...flatItems, ...groupItems]
      .map((item) => {
        const value = item as Record<string, unknown>
        const media = value.media as Record<string, unknown> | string | undefined
        const url = typeof media === 'string' ? media : (media as Record<string, unknown>)?.url
        // WordPress gallery items keep their original URL in `sourceUrl` when
        // no media record was uploaded for them.
        const sourceUrl = typeof value.sourceUrl === 'string' ? value.sourceUrl : undefined
        return url || sourceUrl
      })
      .filter((url): url is string => typeof url === 'string')
  })

  // Gallery images come from Payload only — no static category fallback.
  // When the page has real gallery content (its section galleries), show
  // exactly those images — WordPress authors the count
  // (e.g. 8 on Home Remodeling), so there is no cap and no extra hero-image
  // filler. The hero/gallery-record fallbacks only apply when the page has
  // no gallery content at all.
  const authored = fromSections
  const combined = authored.length
    ? authored
    : [...service.gallery, service.image].filter(Boolean)

  // The section's own eyebrow/heading/description — identical WordPress copy
  // ("Our Gallery" / "Get Inspired" / the professionalism paragraph) on every
  // page that has this block, but read from the CMS record rather than
  // hardcoded here, so an edit to one of these fields actually shows up.
  const gallerySection = sectionGalleries[0] as Record<string, unknown> | undefined
  const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined)

  return {
    images: [...new Set(combined)],
    eyebrow: text(gallerySection?.eyebrow),
    heading: text(gallerySection?.heading),
    description: text(gallerySection?.description),
  }
}

export function ServiceGallery({ service }: { service: ServiceDetail }) {
  const { images, eyebrow, heading, description } = galleryContentFor(service)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  if (!images.length) return null

  return (
    <Section className="bg-white">
      <SectionHeader
        align="center"
        eyebrow={eyebrow}
        title={heading || 'Get Inspired'}
        description={description}
      />

      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="relative aspect-[4/3] overflow-hidden bg-paper-2"
          >
            <Image
              src={image}
              alt={`${service.title} project photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </button>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button href="/gallery" variant="outline" arrow>
          Visit our gallery
        </Button>
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          images={images}
          index={lightboxIndex}
          alt={`${service.title} project photo`}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </Section>
  )
}
