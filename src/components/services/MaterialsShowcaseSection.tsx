import Image from 'next/image'

import { Section } from '@/components/ui/Section'

export type MaterialShowcaseItem = {
  title: string
  description?: string
  image: string
}

export type MaterialsShowcaseSectionProps = {
  eyebrow?: string
  heading?: string
  /**
   * Plain text. Pass `boldTerms` to have specific words/phrases rendered in
   * bold within it (matching the reference design's "premium materials" /
   * "custom kitchen" emphasis) without needing raw HTML from the CMS.
   */
  description?: string
  boldTerms?: string[]
  items: MaterialShowcaseItem[]
}

function descriptionWithEmphasis(description: string, boldTerms: string[]) {
  if (!boldTerms.length) return description
  const pattern = new RegExp(
    `(${boldTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi',
  )
  const parts = description.split(pattern)
  return parts.map((part, index) =>
    boldTerms.some((term) => term.toLowerCase() === part.toLowerCase()) ? (
      <strong key={index} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

/**
 * A section header (eyebrow + heading + description) followed by a 2-column
 * grid of full-bleed image cards with a bottom-anchored dark gradient and
 * white overlay text. Renders only what's passed in — no rating badges, no
 * chat widget, no other page chrome; those are unrelated floating elements
 * layered on top of the page, not part of this section.
 */
export function MaterialsShowcaseSection({
  eyebrow,
  heading,
  description,
  boldTerms = [],
  items,
}: MaterialsShowcaseSectionProps) {
  if (!items.length) return null

  return (
    <Section className="bg-white">
      {(eyebrow || heading || description) && (
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow ? (
            <p className="font-display text-lg italic text-brass-deep">{eyebrow}</p>
          ) : null}
          {heading ? (
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
              {heading}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-5 text-base leading-7 text-ink-2/75">
              {descriptionWithEmphasis(description, boldTerms)}
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-12 grid gap-px overflow-hidden sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="relative aspect-[4/3] overflow-hidden bg-ink"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
              unoptimized={item.image.includes('/api/media/file/')}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <h3 className="font-display text-3xl font-semibold text-white md:text-4xl">
                {item.title}
              </h3>
              {item.description ? (
                <p className="mt-3 max-w-md text-sm leading-6 text-white/90 md:text-base">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
