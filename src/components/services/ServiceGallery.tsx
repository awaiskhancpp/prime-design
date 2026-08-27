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

  const category =
    service.slug.includes('kitchen')
      ? galleryCategories.find((item) => item.slug === 'kitchens')
      : service.slug.includes('bathroom')
        ? galleryCategories.find((item) => item.slug === 'bathrooms')
        : service.slug === 'adu' || service.slug === 'additions'
          ? galleryCategories.find((item) => item.slug === 'adu-additions')
          : undefined

  const combined = [...fromCms, ...service.gallery, ...(category?.images ?? []), service.image]
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

      <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2">
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
