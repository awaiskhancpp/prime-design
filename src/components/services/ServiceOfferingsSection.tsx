import Image from 'next/image'
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
  cards: ServiceOfferingCard[]
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

const kitchenImage = '/services/kitchen-remodeling.jpeg'
const bathroomImage = '/before-after/bathroom_remodeling_after.jpeg'

export function ServiceOfferingsSection({
  eyebrow,
  title,
  description,
  cards,
  primaryCta,
  secondaryCta,
  embedded = false,
  city,
}: ServiceOfferingsContent & { embedded?: boolean; city?: string }) {
  if (!cards.length) return null

  // WordPress location pages put the city in the section heading, the card
  // headings and link the cards to #contact ("Custom Kitchen Remodeling in
  // {City}" — WP template 1495 Feature Section Juliet). The kitchen heading
  // is rebuilt with the city; the bathroom heading already matches WP.
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
      <SectionHeader align="center" eyebrow={eyebrow} title={shownTitle} description={description} />

      {(primaryCta || secondaryCta) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
            <Button href={secondaryCta.href} variant="outline" size="md">
              {secondaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      )}

      <div className=" mt-12 grid  gap-x-8 gap-y-10 sm:grid-cols-3">
        {shownCards.map((card) => (
          <article key={card.title} className="group flex h-full flex-col">
            <Link
              href={card.href}
              className="relative block aspect-[4/3] overflow-hidden bg-paper-2"
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </Link>

            <div className="flex flex-1 flex-col pt-5">
              <h3 className="font-display text-2xl font-medium leading-tight text-ink-2 md:text-3xl">
                {card.title}
              </h3>
              <p className="mt-3 line-clamp-2 text-base leading-7 text-ink-2/70">
                {card.description}
              </p>
              <div className="mt-auto pt-5">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-2 border border-brass px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:bg-brass hover:text-white"
                >
                  Learn more <ArrowRight />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  )

  if (embedded) return content

  return <Section className="bg-white">{content}</Section>
}
