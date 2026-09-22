import Image from '@/components/ui/Image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

export type ServiceOfferingCard = {
  title: string
  description: string
  image: string
  href: string
}

export type ServiceOfferingsContent = {
  eyebrow?: string
  title: string
  description?: string
  /**
   * The banner between the intro and the cards. In the WordPress family
   * templates this image element is bound to `{featured_image}`, so it shows
   * the current page's own featured image rather than a fixed asset — the
   * attachment ids baked into the templates (1546 Saratoga, 1582 Campbell)
   * are only the Bricks editor's preview. Omitted on pages that have no
   * featured image, which renders the section exactly as it did before.
   */
  image?: string
  cards: ServiceOfferingCard[]
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export function ServiceOfferingsSection({
  eyebrow,
  title,
  description,
  image,
  cards,
  primaryCta,
  secondaryCta,
  embedded = false,
  city,
}: ServiceOfferingsContent & { embedded?: boolean; city?: string }) {
  if (!cards.length) return null

  const shownTitle =
    city && /kitchen/i.test(title)
      ? `Kitchen Remodeling in ${city} That Reflects Your Unique Style and Vision.`
      : title
  const shownCards = city
    ? cards.map((card) => ({
        ...card,
        title: `${card.title} Remodeling in ${city}`,
        href: '#contact',
      }))
    : cards

  const content = (
    <>
      {/* Header — copy on the left, the section's two calls to action on the
          right, sharing one baseline. `items-end` rather than `items-center`
          so the buttons sit on the last line of the copy instead of floating
          against the middle of a three-line heading. Below `lg` the pair
          drops under the copy and aligns left with it, because a right-hand
          column has nothing to align to once the row is stacked. */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <SectionHeader eyebrow={eyebrow} title={shownTitle} description={description} />

        {primaryCta || secondaryCta ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end lg:pb-1">
            {primaryCta && (
              <Button
                href={primaryCta.href}
                size="md"
                className="border-brass bg-brass text-white hover:border-brass-deep hover:bg-brass-deep"
              >
                {primaryCta.label}
              </Button>
            )}
            {secondaryCta && (
              <Button href={secondaryCta.href} variant="outline" size="md" className="group">
                {secondaryCta.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {image ? (
        <div className="relative mx-auto mt-10 aspect-[40/21] w-full max-w-3xl overflow-hidden bg-paper-2">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 768px) 768px, 92vw"
          />
        </div>
      ) : null}


      {/* Cards — portrait ratio, full-bleed image, all content lives inside */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shownCards.map((card) => (
          <article key={card.title} className="group relative">
            <Link
              href={card.href}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2"
              aria-label={card.title}
            >
              {/* Portrait image — tall enough to feel editorial, not thumbnails */}
              <div className="relative aspect-[3/4] overflow-hidden bg-paper-2">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.04]"
                  // Mirrors the grid below: 3 columns >=1024px, 2 columns >=640px,
                  // 1 column below that. Without this, `fill` falls back to 100vw
                  // and the srcset runs all the way to w=3840 for a card that is
                  // never wider than a third of the viewport.
                  // sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />

                {/* Persistent bottom gradient — title is always readable */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/50 via-ink/20 to-transparent transition-opacity duration-500 group-hover:opacity-100"
                />

                {/* Content pinned inside the image at the bottom */}
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  {/* Brass rule — grows left→right on hover */}
                  <div className="mb-2 h-px w-full overflow-hidden">
                    <div className="h-full w-full -translate-x-full bg-brass transition-transform duration-500 ease-out group-hover:translate-x-0" />
                  </div>

                  <h3 className="font-display text-xl font-medium leading-tight text-white md:text-2xl">
                    {card.title}
                  </h3>

                  {/* Description + CTA — hidden at rest, fade + slide up on hover */}
                  <div className="grid transition-all duration-500 ease-out [grid-template-rows:0fr] group-hover:[grid-template-rows:1fr]">
                    <div className="overflow-hidden">
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80 opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
                        {card.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brass opacity-0 transition-opacity delay-150 duration-300 group-hover:opacity-100">
                        Learn More
                        <ArrowRight
                          className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </>
  )

  if (embedded) return content

  return <Section className="bg-white">{content}</Section>
}
