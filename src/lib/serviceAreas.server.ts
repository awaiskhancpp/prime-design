import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { ServiceLocation } from './serviceLocations'

/**
 * The twelve cities every one of these sections lists in the same order.
 *
 * Read off the live service pages, not from a landing page: the order that
 * used to be here came from WordPress post 3261, which is the Kitchen
 * Remodeling *Information* page, a different page with a different list. That
 * is also where the claim that "San Jose is intentionally absent" came from.
 * It is absent there; on `/kitchen-remodeling/`, `/bathroom-remodeling/` and
 * `/home-remodeling/` San Jose is the fourteenth card of fifteen, and
 * filtering by that list was dropping it.
 */
const BASE_CITY_ORDER = [
  'Saratoga', 'Los Gatos', 'Los Altos', 'Milpitas', 'Fremont', 'Redwood City',
  'Menlo Park', 'Cupertino', 'Santa Clara', 'Sunnyvale', 'Mountain View', 'Palo Alto',
]

/**
 * Where each page puts the three cities that move.
 *
 * All three sections list the same fifteen cities and agree on the twelve in
 * the middle; what differs is whether Campbell, San Jose and Silicon Valley
 * sit at the front or the back. Taken from the rendered markup of each live
 * page rather than assumed to be shared.
 */
const cityOrderByService: Record<string, string[]> = {
  'kitchen-remodeling': ['Campbell', ...BASE_CITY_ORDER, 'San Jose', 'Silicon Valley'],
  'bathroom-remodeling': ['Silicon Valley', ...BASE_CITY_ORDER, 'San Jose', 'Campbell'],
  'home-remodeling': ['San Jose', 'Campbell', ...BASE_CITY_ORDER, 'Silicon Valley'],
}

const DEFAULT_CITY_ORDER = cityOrderByService['kitchen-remodeling']

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

    const order = cityOrderByService[normalized] ?? DEFAULT_CITY_ORDER

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
      /**
       * Ordered by the list above, and NOT filtered by it.
       *
       * Filtering is what lost San Jose: a city missing from the order simply
       * stopped rendering, silently, and the section showed fourteen cards
       * where WordPress shows fifteen. A city the list does not name now
       * sorts to the end instead of disappearing, so adding one in the CMS
       * puts it on the page rather than nowhere.
       */
      .sort((a, b) => {
        const rank = (name: string) => {
          const index = order.indexOf(name)
          return index === -1 ? Number.MAX_SAFE_INTEGER : index
        }
        const byRank = rank(a.location.name) - rank(b.location.name)
        return byRank !== 0 ? byRank : a.location.name.localeCompare(b.location.name)
      })
  } catch (error) {
    console.error(`getServiceAreas: could not load service areas for "${serviceSlug}"`, error)
    return []
  }
}
