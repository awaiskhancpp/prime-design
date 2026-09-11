import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ServiceDetail } from '@/lib/services'

function galleryImagesFor(service: ServiceDetail) {
  const cmsGallery = service.contentBlocks?.find((block) => block.blockType === 'gallery')
  const fromCms = cmsGallery && cmsGallery.blockType === 'gallery' ? cmsGallery.images : []

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
  const combined = [...fromSections, ...fromCms, ...service.gallery, service.image]
  return [...new Set(combined.filter(Boolean))].slice(0, 6)
}

export function ServiceGallery({ service }: { service: ServiceDetail }) {
  const images = galleryImagesFor(service)
  if (!images.length) return null

  return (
    <Section className="bg-white">
      <SectionHeader
        align="center"
        eyebrow="Our Gallery"
        title="Get Inspired"
        // WordPress gallery section copy (obvious "rake on" typo corrected).
        description="Client satisfaction is our #1 priority. No matter the type of project we take on, the entire process, from the consultation to the finishing touches, is handled with a high level of professionalism."
      />

      <div className=" mt-10 grid gap-5 sm:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative aspect-[4/3] overflow-hidden bg-paper-2"
          >
            <Image
              src={image}
              alt={`${service.title} project photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button href="/gallery" variant="outline">
          Visit our gallery
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </Section>
  )
}
