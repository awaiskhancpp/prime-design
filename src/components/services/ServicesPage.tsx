import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import { services } from '@/lib/services'

const kitchenSubpageHrefs: Record<string, string> = {
  'european-kitchen': '/kitchen-remodeling/european-kitchen-silicon-valley',
  'shaker-kitchens': '/kitchen-remodeling/shaker-kitchen-silicon-valley',
  'custom-kitchens': '/kitchen-remodeling/custom-kitchen-silicon-valley',
}

function serviceHref(slug: string) {
  return kitchenSubpageHrefs[slug] || `/${slug}`
}

export function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader tone="light" />

      <Section className="bg-white mt-22 text-center md:mt-32">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">Our services</p>
        <h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
          Take charge of your remodeling experience
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-2/70">
          Now is the perfect time to choose the area in your home that deserves a remarkable
          transformation.
        </p>
      </Section>

      <main>
        <Section className="bg-white pt-0">
          <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-10 sm:grid-cols-2">
            {services.map((service) => {
              const href = serviceHref(service.slug)

              return (
                <article key={service.slug} id={service.slug} className="group flex h-full flex-col">
                  <Link
                    href={href}
                    className="relative block aspect-[4/3] overflow-hidden bg-paper-2"
                  >
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col pt-5">
                    <h2 className="font-display text-2xl font-medium leading-tight text-ink-2 md:text-3xl">
                      {service.title}
                    </h2>
                    <p className="mt-3 line-clamp-2 text-base leading-7 text-ink-2/70">
                      {service.description}
                    </p>
                    <div className="mt-auto pt-5">
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 border border-brass px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:bg-brass hover:text-white"
                      >
                        Discover <ArrowRight />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </Section>
      </main>

      <ProjectsReviews />
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
