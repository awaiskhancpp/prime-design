import { LandingServiceAreasSection } from '@/components/landing/LandingServiceAreasSection'
import { getServiceAreas } from '@/lib/serviceAreas.server'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

/**
 * "Areas we service" strip (city pills) — matches the WordPress template:
 * every city pill links to the kitchen-remodeling city page
 * (`/kitchen-remodeling/kitchen-remodeling-in-{city}`) no matter which
 * service page renders the strip, and the list ends with the
 * "And surrounding cities!" pill linking to /contact.
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
  const items = areas.map((area) => ({
    label: area.location.name,
    href: `/kitchen-remodeling/kitchen-remodeling-in-${slugify(area.location.name)}`,
  }))
  items.push({ label: 'And surrounding cities!', href: '/contact' })
  return <LandingServiceAreasSection heading={heading || 'Areas we service'} areas={items} />
}
