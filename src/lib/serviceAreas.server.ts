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
          location?: { name?: string | null; slug?: string | null } | number | null
        }
        const location =
          typeof raw.location === 'object' && raw.location !== null ? raw.location : null
        const name = location?.name || raw.city || ''
        return {
          serviceSlug,
          location: { name, slug: location?.slug || '' },
          slug: raw.slug || '',
        } as ServiceLocation
      })
      .filter((area) => Boolean(area.location.name && area.slug))
      // Only the cities WordPress lists in this section, in WP order.
      .filter((area) => cityOrder.includes(area.location.name))
      .sort((a, b) => cityOrder.indexOf(a.location.name) - cityOrder.indexOf(b.location.name))
  } catch {
    return []
  }
}
