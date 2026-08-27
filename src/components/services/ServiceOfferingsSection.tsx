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

const kitchenOfferings: ServiceOfferingsContent = {
  eyebrow: 'Kitchen remodeling',
  title: 'Choose a kitchen that reflects your unique style and vision',
  description:
    'Our experts never want you to feel limited when it comes to picking your dream kitchen. Explore our most popular designs, or work with us to create your own.',
  primaryCta: { label: 'View our gallery', href: '/gallery' },
  secondaryCta: { label: 'Talk to an expert', href: '/contact' },
  cards: [
    {
      title: 'Custom Kitchen',
      description: 'Create a kitchen that reflects your unique style and vision.',
      image: kitchenImage,
      href: '/services/kitchen-remodeling/custom-kitchen-silicon-valley',
    },
    {
      title: 'European Kitchen',
      description: 'Experience the perfect blend of sophistication and functionality.',
      image: kitchenImage,
      href: '/services/kitchen-remodeling/european-kitchen-silicon-valley',
    },
    {
      title: 'Shaker Kitchen',
      description: 'Discover the classic beauty and versatility of Shaker kitchens.',
      image: kitchenImage,
      href: '/services/kitchen-remodeling/shaker-kitchen-silicon-valley',
    },
  ],
}

const bathroomOfferings: ServiceOfferingsContent = {
  eyebrow: 'Bathroom remodeling',
  title: 'Witness the beauty of our bathroom transformations',
  description:
    'Browse our portfolio to see the results of our bathroom remodeling projects, and experience the Prime Design & Build difference.',
  primaryCta: { label: 'View our gallery', href: '/gallery' },
  secondaryCta: { label: 'Talk to an expert', href: '/contact' },
  cards: [
    {
      title: 'Custom Bathtubs',
      description: 'Create a bathroom that reflects your unique style and vision.',
      image: bathroomImage,
      href: '/gallery',
    },
    {
      title: 'Custom Showers',
      description: 'Experience the perfect blend of sophistication and functionality.',
      image: bathroomImage,
      href: '/gallery',
    },
    {
      title: 'Custom Layouts',
      description: 'See what we can do to transform your layout.',
      image: bathroomImage,
      href: '/gallery',
    },
  ],
}

const offeringsBySlug: Record<string, ServiceOfferingsContent> = {
  'kitchen-remodeling': kitchenOfferings,
  'bathroom-remodeling': bathroomOfferings,
}

export function getServiceOfferings(slug: string) {
  return offeringsBySlug[slug]
}

export function ServiceOfferingsSection({
  eyebrow,
  title,
  description,
  cards,
  primaryCta,
  secondaryCta,
  embedded = false,
}: ServiceOfferingsContent & { embedded?: boolean }) {
  if (!cards.length) return null

  const content = (
    <>
      <SectionHeader align="center" eyebrow={eyebrow} title={title} description={description} />

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

      <div className="mx-auto mt-12 grid max-w-6xl gap-x-8 gap-y-10 sm:grid-cols-2">
        {cards.map((card) => (
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
