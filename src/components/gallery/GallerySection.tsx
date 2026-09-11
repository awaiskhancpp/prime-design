import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import type { GalleryCategory } from '@/lib/gallery.server'

export function GallerySection({ category }: { category: GalleryCategory }) {
  return (
    <Section className="bg-white">
      <h2
        id={`${category.slug}-heading`}
        className="mb-5 font-display text-2xl font-medium text-ink-2 md:text-3xl"
      >
        {category.title}
      </h2>
      <div className="grid grid-cols-2 gap-1 md:grid-cols-3">
        {category.images.map((image, index) => (
          <div
            key={`${category.slug}-${index}`}
            className="relative aspect-[4/3] overflow-hidden bg-paper-2"
          >
            <Image
              src={image}
              alt={`${category.title} project photo ${index + 1}`}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-500 ease-out hover:scale-105"
              sizes="(min-width: 768px) 33vw, 50vw"
            />
          </div>
        ))}
      </div>
    </Section>
  )
}

