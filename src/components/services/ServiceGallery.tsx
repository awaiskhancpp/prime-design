import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { galleryCategories } from '@/lib/gallery'
import type { ServiceDetail } from '@/lib/services'

function galleryImagesFor(service: ServiceDetail) {
  const cmsGallery = service.contentBlocks?.find((block) => block.blockType === 'gallery')
  const fromCms = cmsGallery && cmsGallery.blockType === 'gallery' ? cmsGallery.images : []

  // New pipeline: service.sections[] gallery block(s) — flat items and/or
  // grouped items (e.g. "Kitchens" / "Bathrooms" tabs from WordPress).
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
        return typeof media === 'string' ? media : (media as Record<string, unknown>)?.url
      })
      .filter((url): url is string => typeof url === 'string')
  })

  const category = service.slug.includes('kitchen')
    ? galleryCategories.find((item) => item.slug === 'kitchens')
    : service.slug.includes('bathroom')
      ? galleryCategories.find((item) => item.slug === 'bathrooms')
      : service.slug === 'adu' || service.slug === 'additions'
        ? galleryCategories.find((item) => item.slug === 'adu-additions')
        : undefined

  const combined = [
    ...fromSections,
    ...fromCms,
    ...service.gallery,
    ...(category?.images ?? []),
    service.image,
  ]
  return [...new Set(combined.filter(Boolean))].slice(0, 6)
}

export function ServiceGallery({ service }: { service: ServiceDetail }) {
  const images = galleryImagesFor(service)
  if (!images.length) return null

  return (
    <Section className="bg-white">
      <SectionHeader
        align="center"
        eyebrow="Our gallery"
        title="Get inspired"
        description="See the kind of work we do—from first concept through the finished space—and imagine what the same care would look like in your home."
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
          View our gallery
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </Section>
  )
}
