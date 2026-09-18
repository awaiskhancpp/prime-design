import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { resolveServices } from '@/lib/services'

const kitchenSubpageHrefs: Record<string, string> = {
  'european-kitchen': '/services/kitchen-remodeling/european-kitchen-silicon-valley',
  'shaker-kitchens': '/services/kitchen-remodeling/shaker-kitchen-silicon-valley',
  'custom-kitchens': '/services/kitchen-remodeling/custom-kitchen-silicon-valley',
}

function serviceHref(slug: string) {
  return kitchenSubpageHrefs[slug] || `/services/${slug}`
}

export async function ServicesPage() {
  const services = await resolveServices()
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Our services"
        title="Take charge of your remodeling experience"
        description="Now is the perfect time to choose the area in your home that deserves a remarkable transformation."
        image="/services/home-remodeling.jpeg"
        imageAlt="Home remodeling project by Prime Design & Build"
      />

      <main>
        <Section className="bg-white">
          <div className="grid gap-2  sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const href = serviceHref(service.slug)

              return (
                <article key={service.slug} id={service.slug} className="group relative bg-white">
                  <Link
                    href={href}
                    aria-label={service.title}
                    className="block focus-visible:outline-2 focus-visible:outline-brass"
                  >
                    {/* Image container — portrait, matching the offerings
                        cards, so the card is tall enough for the overlay to
                        carry the full card description without clamping it.
                        Overflow hidden serves both the zoom and the ink
                        overlay that rises from inside it. */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-paper-2">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />

                      {/* Ink overlay — at rest: hidden below the image.
                          On hover: rises to cover the lower half, carrying the
                          description + cta link. The description stays hidden
                          at rest and fades in as the overlay arrives. */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 max-h-full translate-y-full overflow-y-auto bg-ink/90 px-5 pb-5 pt-4 transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0"
                      >
                        {/* No clamp — the WordPress card copy runs to a full
                            paragraph and is meant to be read in full. */}
                        <p className="text-sm leading-6 text-white/85 opacity-0 transition-opacity delay-150 duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                          {service.shortDescription || service.description}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brass opacity-0 transition-opacity delay-200 duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                          Discover <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>

                    {/* Below-image label — always visible, clean at rest */}
                    <div className="px-1 py-4">
                      <h2 className="font-display text-xl font-medium leading-tight text-ink-2 transition-colors duration-200 group-hover:text-brass-deep md:text-2xl">
                        {service.title}
                      </h2>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        </Section>
      </main>

      <LandscapingServiceAreas />
    </div>
  )
}
