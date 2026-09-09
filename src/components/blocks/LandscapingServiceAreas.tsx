import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import website from '../../../website.json'
import { Section } from '@/components/ui/Section'
import { getServiceAreas } from '@/lib/serviceAreas.server'
import { resolveSiteAreas } from '@/lib/siteSettings'
import { Button } from '../ui/Button'

const citySlug = (city: string) =>
  city
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

/**
 * "Areas we service" strip. When a `serviceSlug` is passed, the city links come
 * from Payload's `service-locations` records (each links a service to a real
 * location page). Otherwise it falls back to the site settings / website.json
 * city list.
 */
export async function LandscapingServiceAreas({
  serviceSlug,
  heading: headingProp,
}: { serviceSlug?: string; heading?: string } = {}) {
  const { heading, cities, trailingLabel, trailingHref } = website.serviceAreas
  const configuredAreas = await resolveSiteAreas()

  // Resolve the city list + link builder.
  let areaNames: string[] = []
  let hrefFor: (city: string) => string

  if (serviceSlug) {
    const areas = await getServiceAreas(serviceSlug)
    if (areas.length) {
      areaNames = areas.map((area) => area.location.name)
      hrefFor = (city) => {
        const area = areas.find((entry) => entry.location.name === city)
        return area ? `/${area.serviceSlug}/${area.slug}` : '/contact'
      }
    } else {
      areaNames = configuredAreas.length ? configuredAreas.map((area) => area.name) : cities
      hrefFor = (city) => `/kitchen-remodeling/kitchen-remodeling-in-${citySlug(city)}`
    }
  } else {
    areaNames = configuredAreas.length ? configuredAreas.map((area) => area.name) : cities
    hrefFor = (city) => `/kitchen-remodeling/kitchen-remodeling-in-${citySlug(city)}`
  }

  const headingText = headingProp || heading

  return (
    <Section className="bg-white text-ink">
      <div className="grid gap-10  pt-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
        <div>
          <h2 className="mt-3 max-w-sm font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            {headingText}
          </h2>
          <Button href={trailingHref} variant="line" className="mt-6 text-ink">
            {trailingLabel}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {areaNames.map((city) => (
            <Link
              key={city}
              href={hrefFor(city)}
              className="border border-line px-4 py-2 text-sm text-ink/75 transition-colors hover:border-brass hover:text-brass-deep"
            >
              {city}
            </Link>
          ))}
        </div>
      </div>
    </Section>
  )
}
