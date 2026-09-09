import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ServiceDetail } from '@/lib/services'

export type PrimeKitchensCard = { title: string; image?: string }

/**
 * "Why Choose Prime Kitchens? / The Prime Difference"
 *
 * The European Kitchen page's bespoke difference section: centered header
 * (eyebrow + title + description), a bold "Our passion for:" line with the
 * site's brass divider, then three cards — image above, title below —
 * matching the WordPress section's three-card grid.
 *
 * Content comes from the Payload `primeKitchens` group on the service.
 */
export function ServicePrimeKitchensSection({
  content,
}: {
  content: NonNullable<ServiceDetail['primeKitchens']>
}) {
  const cards = content.cards?.filter((card) => card.title) ?? []
  if (!cards.length) return null

  return (
    <Section className="bg-white">
      <SectionHeader
        align="center"
        eyebrow={content.eyebrow}
        title={content.title || 'The Prime Difference'}
        description={content.description}
      />

      {content.passionHeading ? (
        <div className="mx-auto mt-12 max-w-4xl">
          <h4 className="text-center font-display text-lg font-semibold text-ink-2">
            {content.passionHeading}
          </h4>
          <div className="mx-auto mt-3 h-px w-20 bg-brass" />
        </div>
      ) : null}

      <div className="mx-auto mt-10 grid max-w-4xl gap-10 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="flex flex-col items-center text-center">
            <div className="relative aspect-square w-full max-w-[260px] overflow-hidden ">
              <Image
                src={card.image || '/services/kitchen-remodeling.jpeg'}
                alt={card.title}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </div>
            <h4 className="mt-5 font-display text-lg font-medium leading-snug text-ink-2">
              {card.title}
            </h4>
          </article>
        ))}
      </div>
    </Section>
  )
}
