import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { ServiceLocation } from './serviceLocations'

// The WordPress 3261 "Areas we service" city list, in its exact order.
// San Jose is intentionally absent — WordPress doesn't list it in this
// section (its location page still exists and stays reachable).
const cityOrder = [
  'Palo Alto', 'Los Gatos', 'Los Altos', 'Saratoga', 'Fremont', 'Santa Clara',
  'Menlo Park', 'Milpitas', 'Mountain View', 'Silicon Valley', 'Sunnyvale',
  'Campbell', 'Redwood City', 'Cupertino',
]

/** `numeric` columns can arrive as strings through some driver paths. */
const numberOr = (value: number | string | null | undefined) => {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined
}

/**
 * Server-side fetch of a service's city pages from Payload. The cities are
 * real `service-locations` records that link a `service` to a `location`, so
 * each card links to its own location page. Content comes from Payload only.
 */
export async function getServiceAreas(serviceSlug: string): Promise<ServiceLocation[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const payload = await getPayload({ config: configPromise })

    // Sub-service pages (e.g. european-kitchen-silicon-valley) are published
    // under the unsuffixed slug in the CMS — same normalization as
    // `resolveServiceDetail`.
    const normalized = serviceSlug.replace(/-silicon-valley$/, '')
    const candidates = normalized !== serviceSlug ? [serviceSlug, normalized] : [serviceSlug]

    let serviceId: number | string | undefined
    for (const candidate of candidates) {
      const serviceResult = await payload.find({
        collection: 'services',
        where: { slug: { equals: candidate } },
        depth: 0,
        limit: 1,
      })
      serviceId = (serviceResult.docs[0] as { id?: number | string } | undefined)?.id
      if (serviceId) break
    }
    if (!serviceId) return []

    const slResult = await payload.find({
      collection: 'service-locations',
      where: { service: { equals: serviceId } },
      depth: 2,
      limit: 100,
    })

    return slResult.docs
      .map((doc) => {
        const raw = doc as {
          slug?: string
          city?: string | null
          location?:
            | {
                name?: string | null
                slug?: string | null
                latitude?: number | null
                longitude?: number | null
              }
            | number
            | null
          featuredImage?: { url?: string | null } | number | null
        }
        const location =
          typeof raw.location === 'object' && raw.location !== null ? raw.location : null
        const name = location?.name || raw.city || ''
        // Each city card shows its own WordPress image (e.g.
        // "Kitchen-Remodeling-in-Campbell.png") — the per-location featured
        // image, not the service's hero photo. Falls back to nothing; the
        // section decides its own fallback.
        const featuredImage =
          typeof raw.featuredImage === 'object' && raw.featuredImage?.url
            ? raw.featuredImage.url
            : undefined
        return {
          serviceSlug,
          location: {
            name,
            slug: location?.slug || '',
            // Carried through so the coverage map can place this city from
            // Payload rather than a hardcoded name lookup.
            latitude: numberOr(location?.latitude),
            longitude: numberOr(location?.longitude),
          },
          slug: raw.slug || '',
          featuredImage,
        } as ServiceLocation
      })
      .filter((area) => Boolean(area.location.name && area.slug))
      // Only the cities WordPress lists in this section, in WP order.
      .filter((area) => cityOrder.includes(area.location.name))
      .sort((a, b) => cityOrder.indexOf(a.location.name) - cityOrder.indexOf(b.location.name))
  } catch (error) {
    console.error(`getServiceAreas: could not load service areas for "${serviceSlug}"`, error)
    return []
  }
}
