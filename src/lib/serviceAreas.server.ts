import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { shouldUseLocalFallback } from './runtime'
import { serviceLocations, type ServiceLocation } from './serviceLocations'

// Static fallback order (matches the original section).
const cityOrder = [
  'Campbell', 'Saratoga', 'Los Gatos', 'Los Altos', 'Milpitas', 'Fremont',
  'Redwood City', 'Menlo Park', 'Cupertino', 'Santa Clara', 'Sunnyvale',
  'Mountain View', 'Palo Alto', 'San Jose', 'Silicon Valley',
]

function staticAreas(serviceSlug: string): ServiceLocation[] {
  return serviceLocations
    .filter((entry) => entry.serviceSlug === serviceSlug)
    .slice()
    .sort((a, b) => cityOrder.indexOf(a.location.name) - cityOrder.indexOf(b.location.name))
}

/**
 * Server-side fetch of a service's city pages from Payload. The cities are
 * real `service-locations` records that link a `service` to a `location`, so
 * each card links to its own location page. Falls back to the static list
 * when Payload is unavailable or has no records for the service.
 */
export async function getServiceAreas(serviceSlug: string): Promise<ServiceLocation[]> {
  const fallback = staticAreas(serviceSlug)
  if (!process.env.DATABASE_URL) return shouldUseLocalFallback() ? fallback : []
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
    if (!serviceId) return fallback

    const slResult = await payload.find({
      collection: 'service-locations',
      where: { service: { equals: serviceId } },
      depth: 2,
      limit: 100,
    })

    const areas = slResult.docs
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

    return areas.length ? areas : fallback
  } catch {
    return fallback
  }
}
