import { Section } from '@/components/ui/Section'
import type { GalleryCategory } from '@/lib/gallery.server'
import { GalleryGrid } from '@/components/landing/GalleryGrid'

export function GallerySection({ category }: { category: GalleryCategory }) {
  return (
    <Section className="bg-white">
      <h2
        id={`${category.slug}-heading`}
        className="mb-5 font-display text-2xl font-medium text-ink-2 md:text-3xl"
      >
        {category.title}
      </h2>
      <GalleryGrid images={category.images} altPrefix={`${category.title} project`} hoverZoom />
    </Section>
  )
}

