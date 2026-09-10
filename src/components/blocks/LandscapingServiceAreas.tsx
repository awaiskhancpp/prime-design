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
 * Only these three services have their own location pages; every other
 * page's city links go to the kitchen-remodeling location pages.
 */
const LOCATION_SERVICES = ['kitchen-remodeling', 'bathroom-remodeling', 'home-remodeling']

const locationPrefix = (serviceSlug?: string) =>
  serviceSlug && LOCATION_SERVICES.includes(serviceSlug) ? serviceSlug : 'kitchen-remodeling'

/**
 * "Areas we service" strip. City links always point at real location pages:
 * Kitchen / Bathroom / Home Remodeling keep their own prefix, every other
 * page uses the kitchen-remodeling prefix. Only the city name changes.
 */
export async function LandscapingServiceAreas({
  serviceSlug,
  heading: headingProp,
}: { serviceSlug?: string; heading?: string } = {}) {
  const { heading, cities, trailingLabel, trailingHref } = website.serviceAreas
  const configuredAreas = await resolveSiteAreas()

  const prefix = locationPrefix(serviceSlug)
  const hrefFor = (city: string) => `/${prefix}/${prefix}-in-${citySlug(city)}`

  // Resolve the city list.
  let areaNames: string[] = []
  if (serviceSlug) {
    const areas = await getServiceAreas(serviceSlug)
    if (areas.length) {
      areaNames = areas.map((area) => area.location.name)
    } else {
      areaNames = configuredAreas.length ? configuredAreas.map((area) => area.name) : cities
    }
  } else {
    areaNames = configuredAreas.length ? configuredAreas.map((area) => area.name) : cities
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
