import { LandingServiceAreasSection } from '@/components/landing/LandingServiceAreasSection'
import { getServiceAreas } from '@/lib/serviceAreas.server'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

/**
 * Only these three services have their own location pages; every other
 * page's city pills link to the kitchen-remodeling location pages.
 */
const LOCATION_SERVICES = ['kitchen-remodeling', 'bathroom-remodeling', 'home-remodeling']

/**
 * "Areas we service" strip (city pills) — matches the WordPress pages:
 * Kitchen, Bathroom and Home Remodeling keep their own name before the
 * city (`/{service}/...-in-{city}`); every other page starts with
 * `kitchen-remodeling`. The list ends with the "And surrounding cities!"
 * pill linking to /contact.
 */
export async function ServiceAreasStrip({
  serviceSlug,
  heading,
}: {
  serviceSlug: string
  heading?: string
}) {
  const areas = await getServiceAreas(serviceSlug)
  if (!areas.length) return null
  const prefix = LOCATION_SERVICES.includes(serviceSlug) ? serviceSlug : 'kitchen-remodeling'
  const items = areas.map((area) => ({
    label: area.location.name,
    href: `/${prefix}/${prefix}-in-${slugify(area.location.name)}`,
  }))
  items.push({ label: 'And surrounding cities!', href: '/contact' })
  return <LandingServiceAreasSection heading={heading || 'Areas we service'} areas={items} />
}
