import { testimonials } from './testimonials'
import { POSITIVE_REVIEWS } from './testimonialsCollection.server'

export type FeaturedTestimonial = {
  author: string
  source: string
  rating: number
  summary: string
  /** Relative date as the review platform shows it, e.g. "5 months ago". */
  timeAgo?: string
  /** Where the listing the review was left on is, e.g. "San Jose, CA". */
  location?: string
}

/**
 * At least this many reviews must be tagged with a service before its page
 * shows only its own reviews. Below it (Finance, Home Repair, New
 * Construction) the page shows every review rather than a near-empty
 * carousel.
 */
const MIN_SERVICE_REVIEWS = 3

type ReviewDoc = {
  name?: string
  quote?: string
  rating?: number
  source?: string
  timeAgo?: string
  location?: string
  services?: (number | { id: number })[] | null
}

const serviceIds = (doc: ReviewDoc) =>
  (doc.services ?? []).map((service) => (typeof service === 'object' ? service.id : service))

/**
 * The reviews for the "See what people are saying about us" carousel.
 *
 * With no `serviceSlug` — a main page (Our Projects, Blog) — every review
 * rated 4★ or more. On a service page, the reviews tagged with that service
 * (`reviews.services`) plus the general ones tagged with nothing, since those
 * praise the company rather than a trade. A sub-service page (European,
 * Custom, Shaker Kitchen) uses its parent's reviews. A service with fewer than
 * `MIN_SERVICE_REVIEWS` tagged reviews gets the full set. Featured reviews
 * lead, then `sortOrder`.
 */
export async function getSectionReviews({
  serviceSlug,
}: { serviceSlug?: string } = {}): Promise<FeaturedTestimonial[]> {
  if (!process.env.DATABASE_URL) {
    return testimonials.slice(0, 8).map((t) => ({
      author: t.name,
      source: t.source === 'google' ? 'Google' : 'Yelp',
      rating: t.rating,
      summary: t.text,
    }))
  }
  try {
    const { getPayload } = await import('payload')
    const configPromise = (await import('@payload-config')).default
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'reviews',
      where: POSITIVE_REVIEWS,
      sort: ['-featured', 'sortOrder'],
      depth: 0,
      pagination: false,
    })
    let docs = (result.docs as ReviewDoc[]).filter((doc) => doc.name && doc.quote)

    if (serviceSlug) {
      // Location and legacy records carry a `-silicon-valley` suffix.
      const slug = serviceSlug.replace(/-silicon-valley$/, '')
      const { docs: services } = await payload.find({
        collection: 'services',
        where: { slug: { equals: slug } },
        depth: 0,
        limit: 1,
      })
      const service = services[0] as { id: number; parentService?: number | { id: number } | null } | undefined
      const parent = service?.parentService
      const id = parent ? (typeof parent === 'object' ? parent.id : parent) : service?.id
      if (id !== undefined) {
        const tagged = docs.filter((doc) => serviceIds(doc).includes(id))
        if (tagged.length >= MIN_SERVICE_REVIEWS) {
          docs = docs.filter((doc) => {
            const ids = serviceIds(doc)
            return ids.length === 0 || ids.includes(id)
          })
        }
      }
    }

    return docs.map((doc) => ({
      author: doc.name as string,
      source: (doc.source || 'Google').toString(),
      rating: doc.rating ?? 5,
      summary: doc.quote as string,
      timeAgo: doc.timeAgo || undefined,
      location: doc.location || undefined,
    }))
  } catch (error) {
    console.error('getSectionReviews: could not load reviews', error)
    return []
  }
}
