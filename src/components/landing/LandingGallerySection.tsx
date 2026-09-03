import Image from 'next/image'
import { Section } from '@/components/ui/Section'

export function LandingGallerySection({ heading, images }: { heading?: string; images: string[] }) {
  if (!images.length) return null
  return (
    <Section className="bg-white">
      {heading ? (
        <h2 className="max-w-2xl font-display text-3xl font-medium text-ink md:text-4xl">
          {heading}
        </h2>
      ) : null}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative aspect-[4/3] overflow-hidden bg-paper-2"
          >
            <Image
              src={image}
              alt={`${heading || 'Project'} photo ${index + 1}`}
              fill
              className="object-cover"
              unoptimized={image.startsWith('/api/media/file/') || image.includes('/api/media/file/')}
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          </div>
        ))}
      </div>
    </Section>
  )
}
