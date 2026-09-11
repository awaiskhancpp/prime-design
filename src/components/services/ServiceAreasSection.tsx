import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { getServiceAreas } from '@/lib/serviceAreas.server'
import type { ServiceDetail } from '@/lib/services'

const serviceAreaLabels: Record<string, string> = {
  'kitchen-remodeling': 'Kitchen remodeling',
  'bathroom-remodeling': 'Bathroom remodeling',
  'home-remodeling': 'Home remodeling',
  adu: 'ADU & garage conversions',
  additions: 'Room additions',
  'complete-renovation': 'Complete home renovation',
  'european-kitchen': 'European kitchen remodeling',
  'custom-kitchen': 'Custom kitchen remodeling',
  'shaker-kitchen': 'Shaker kitchen remodeling',
}

export async function ServiceAreasSection({ service }: { service: ServiceDetail }) {
  const locations = await getServiceAreas(service.slug)
  if (!locations.length) return null

  const serviceLabel = serviceAreaLabels[service.slug] || service.title

  return (
    <Section className="bg-white">
      <SectionHeader
        align="center"
        // WordPress 3261: "We offer top {post_title} in the following areas".
        title={`We offer top ${service.title} in the following areas`}
      />

      <div className=" mt-12 grid  gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {locations.map((entry) => {
          const href = `/${entry.serviceSlug}/${entry.slug}`
          const description = `Bring ${serviceLabel.toLowerCase()} in ${entry.location.name} to life with thoughtful design, quality craftsmanship, and a process built around your home.`

          return (
            <article key={entry.slug} className="group flex h-full flex-col">
              <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-paper-2">
                <Image
                  src={service.image}
                  alt={`${serviceLabel} in ${entry.location.name}`}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </Link>

              <div className="flex flex-1 flex-col pt-5">
                <h3 className="font-display text-2xl font-medium leading-tight text-ink-2 md:text-3xl">
                  {entry.location.name}
                </h3>
                <p className="mt-3 line-clamp-2 text-base leading-7 text-ink-2/70">{description}</p>
                <div className="mt-auto pt-5">
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 border border-brass px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:bg-brass hover:text-white"
                  >
                    {serviceLabel} in {entry.location.name}
                    <ArrowRight />
                  </Link>
                </div>
              </div>
            </article>
          )
        })}

        {/* "And all surrounding cities!" card — matches the WordPress pill. */}
        <article className="group flex h-full flex-col">
          <div className="flex flex-1 flex-col border border-line bg-paper p-6">
            <h3 className="mt-3 font-display text-2xl font-medium leading-tight text-ink-2 md:text-3xl">
              And all surrounding cities!
            </h3>
            <div className="mt-auto pt-5">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-brass px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:bg-brass hover:text-white"
              >
                Contact us
                <ArrowRight />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </Section>
  )
}
