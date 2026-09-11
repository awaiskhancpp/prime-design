import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
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
        <Section className="bg-white pt-0">
          <div className=" grid gap-x-4 gap-y-8 sm:grid-cols-3">
            {services.map((service) => {
              const href = serviceHref(service.slug)

              return (
                <article
                  key={service.slug}
                  id={service.slug}
                  className="group flex h-full flex-col"
                >
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

                  <div className="flex flex-1 flex-col pt-4">
                    <h2 className="font-display text-2xl font-medium leading-tight text-ink-2 md:text-3xl line-clamp-1">
                      <a href={href}>{service.title}</a>
                    </h2>
                    <p className="mt-1 line-clamp-2 text-base leading-7 text-ink-2/70">
                      {service.shortDescription || service.description}
                    </p>
                    <div className="mt-auto pt-4">
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

      <LandscapingServiceAreas />
    </div>
  )
}
