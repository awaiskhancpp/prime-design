import { LandingServiceAreasSection } from '@/components/landing/LandingServiceAreasSection'
import { getServiceAreas } from '@/lib/serviceAreas.server'
import { resolveSiteAreas } from '@/lib/siteSettings'

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
 *
 * Pages without their own location records use the shared areas list from
 * Site Settings (Payload) — the same CMS source the rest of the site uses.
 */
export async function ServiceAreasStrip({
  serviceSlug,
  heading,
}: {
  serviceSlug: string
  heading?: string
}) {
  const own = await getServiceAreas(serviceSlug)
  const prefix = LOCATION_SERVICES.includes(serviceSlug) ? serviceSlug : 'kitchen-remodeling'

  let names = own.map((area) => area.location.name)
  if (!names.length) {
    const shared = await resolveSiteAreas()
    names = shared.map((area) => area.name)
  }
  if (!names.length) return null

  const items = names.map((name) => ({
    label: name,
    href: `/${prefix}/${prefix}-in-${slugify(name)}`,
  }))
  items.push({ label: 'And surrounding cities!', href: '/contact' })
  // The heading is passed through exactly as Payload has it (the service's
  // `areasWeService.heading`). No default — an empty heading here means the
  // CMS field is empty, and that should be visible rather than papered over.
  return <LandingServiceAreasSection heading={heading} areas={items} />
}
