'use client'

import { Section } from '@/components/ui/Section'
import { GalleryGrid } from './GalleryGrid'

type GalleryItem = { url: string; caption?: string }

export function LandingGallerySection({
  heading,
  items,
}: {
  heading?: string
  items: GalleryItem[]
}) {
  if (!items.length) return null
  return (
    <Section className="bg-white">
      {heading ? (
        <h2 className="max-w-2xl font-display text-3xl font-medium text-ink md:text-4xl">
          {heading}
      </h2>
      ) : null}
      <div className="mt-8">
        <GalleryGrid
          images={items.map((item) => item.url)}
          captions={items.map((item) => item.caption)}
          altPrefix={heading || 'Project'}
        />
      </div>
    </Section>
  )
}
