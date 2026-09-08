import { testimonials } from './testimonials'

export type FeaturedTestimonial = {
  author: string
  source: string
  rating: number
  summary: string
}

export async function getFeaturedTestimonials(): Promise<FeaturedTestimonial[]> {
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
      collection: 'testimonials',
      where: { featured: { equals: true } },
      sort: 'sortOrder',
      depth: 0,
      limit: 20,
    })
    const docs = (result.docs as Array<{
      name?: string
      quote?: string
      rating?: number
      source?: string
    }>).filter((doc) => doc.name && doc.quote)
    if (docs.length) {
      return docs.map((doc) => ({
        author: doc.name as string,
        source: (doc.source || 'Google').toString(),
        rating: doc.rating ?? 5,
        summary: doc.quote as string,
      }))
    }
    return []
  } catch {
    return []
  }
}
