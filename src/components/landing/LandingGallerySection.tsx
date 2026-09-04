'use client'

import { Section } from '@/components/ui/Section'
import { GalleryGrid } from './GalleryGrid'

export function LandingGallerySection({ heading, images }: { heading?: string; images: string[] }) {
  if (!images.length) return null
  return (
    <Section className="bg-white">
      {heading ? (
        <h2 className="max-w-2xl font-display text-3xl font-medium text-ink md:text-4xl">
          {heading}
        </h2>
      ) : null}
      <div className="mt-8">
        <GalleryGrid images={images} altPrefix={heading || 'Project'} />
      </div>
    </Section>
  )
}
