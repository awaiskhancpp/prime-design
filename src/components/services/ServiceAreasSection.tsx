import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { serviceLocations } from '@/lib/serviceLocations'
import type { ServiceDetail } from '@/lib/services'

const cityOrder = [
  'Campbell',
  'Saratoga',
  'Los Gatos',
  'Los Altos',
  'Milpitas',
  'Fremont',
  'Redwood City',
  'Menlo Park',
  'Cupertino',
  'Santa Clara',
  'Sunnyvale',
  'Mountain View',
  'Palo Alto',
  'San Jose',
  'Silicon Valley',
]

const serviceAreaLabels: Record<string, string> = {
  'kitchen-remodeling': 'Kitchen remodeling',
  'bathroom-remodeling': 'Bathroom remodeling',
  'home-remodeling': 'Home remodeling',
}

export function getServiceAreaLocations(serviceSlug: string) {
  return serviceLocations
    .filter((entry) => entry.serviceSlug === serviceSlug)
    .sort(
      (a, b) => cityOrder.indexOf(a.location.name) - cityOrder.indexOf(b.location.name),
    )
}

export function ServiceAreasSection({ service }: { service: ServiceDetail }) {
  const locations = getServiceAreaLocations(service.slug)
  if (!locations.length) return null

  const serviceLabel = serviceAreaLabels[service.slug] || service.title

  return (
    <Section className="bg-white">
      <SectionHeader
        align="center"
        eyebrow="Service areas"
        title={`We offer ${serviceLabel.toLowerCase()} in the following areas`}
        description="Prime Design & Build works across Silicon Valley. Choose your city to see how we approach this work in your neighborhood."
      />

      <div className="mx-auto mt-12 grid max-w-6xl gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </Section>
  )
}
