import { getPayload } from 'payload'

import configPromise from '@payload-config'

export type GalleryCategory = {
  slug: string
  title: string
  images: string[]
}

type PayloadGalleryCategory = {
  title: string
  slug: string
  images?: Array<{ url?: string | null; sourceUrl?: string | null } | number | null> | null
}

const mediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

/**
 * Gallery tabs come from the Payload `gallery-categories` collection (seeded
 * from the WordPress HappyFiles categories). No static fallback images.
 */
export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'gallery-categories',
      depth: 1,
      sort: 'createdAt',
      limit: 20,
    })
    return (result.docs as unknown as PayloadGalleryCategory[])
      .map((category) => ({
        slug: category.slug,
        title: category.title,
        images: (category.images ?? []).map(mediaUrl).filter((url): url is string => Boolean(url)),
      }))
      .filter((category) => category.images.length)
  } catch {
    return []
  }
}
