import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * A review as the Testimonials page renders it.
 *
 * This is the Payload equivalent of the WordPress query loop: the Bricks
 * slider on the `testimonials` page binds `{post_title}` / `{post_content}`
 * over the `testimonial` post type, so the individual reviews are collection
 * records, never page content. Sections that show reviews store only their own
 * copy and receive this list.
 */
export type CollectionTestimonial = {
  id: number
  name: string
  quote: string
  rating?: number
  source?: string
  timeAgo?: string
  location?: string
  image?: string
}

type TestimonialDoc = {
  id: number
  name?: string | null
  quote?: string | null
  rating?: number | null
  source?: string | null
  timeAgo?: string | null
  location?: string | null
  image?: { url?: string | null } | number | null
}

const imageUrl = (value: TestimonialDoc['image']) =>
  value && typeof value === 'object' && typeof value.url === 'string' ? value.url : undefined

/**
 * Featured testimonials in `sortOrder`, for the Testimonials page sections.
 * Returns an empty list when there is no database or nothing is marked
 * featured — the sections then render their own copy with no cards rather than
 * falling back to hardcoded reviews.
 */
export async function resolveFeaturedTestimonials(limit = 50): Promise<CollectionTestimonial[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'testimonials',
      where: { featured: { equals: true } },
      sort: 'sortOrder',
      depth: 1,
      limit,
    })
    return (result.docs as TestimonialDoc[])
      .filter((doc) => doc.name && doc.quote)
      .map((doc) => ({
        id: doc.id,
        name: doc.name as string,
        quote: doc.quote as string,
        rating: doc.rating ?? undefined,
        source: doc.source ?? undefined,
        timeAgo: doc.timeAgo ?? undefined,
        location: doc.location ?? undefined,
        image: imageUrl(doc.image),
      }))
  } catch {
    return []
  }
}
