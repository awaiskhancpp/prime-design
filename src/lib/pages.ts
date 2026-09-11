import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { getWordPressPage } from './wordpressPages'
import { shouldUseLocalFallback } from './runtime'

export type PageBlock =
  | { blockType: 'content'; eyebrow?: string; heading: string; body: string }
  | {
      blockType: 'image-text'
      eyebrow?: string
      heading: string
      body: string
      image?: string
      imageSide?: 'left' | 'right'
    }
  | { blockType: 'gallery'; heading?: string; images: string[] }
  | { blockType: 'cta'; heading: string; body?: string; label?: string; href?: string }

export type Page = {
  title: string
  slug: string
  hero?: {
    eyebrow?: string
    heading?: string
    description?: string
    image?: string
    cta?: { label?: string; href?: string }
  }
  layout: PageBlock[]
  isGoogleAdsPage: boolean
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    canonicalUrl?: string | null
    noIndex?: boolean | null
    ogTitle?: string | null
    ogDescription?: string | null
  }
}

type PayloadMedia = { url?: string | null }
type PayloadPage = {
  title: string
  slug: string
  hero?: {
    eyebrow?: string | null
    heading?: string | null
    description?: string | null
    image?: number | PayloadMedia | null
    cta?: { label?: string | null; href?: string | null } | null
  } | null
  layout?: Array<Record<string, unknown>> | null
  isGoogleAdsPage?: boolean | null
  seo?: Page['seo']
}

const mediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

function normalizeBlocks(value: PayloadPage['layout']): PageBlock[] {
  if (!value) return []

  return value.flatMap((block): PageBlock[] => {
    if (block.blockType === 'content') {
      return [
        {
          blockType: 'content',
          eyebrow: typeof block.eyebrow === 'string' ? block.eyebrow : undefined,
          heading: String(block.heading || ''),
          body: String(block.body || ''),
        },
      ]
    }

    if (block.blockType === 'image-text') {
      return [
        {
          blockType: 'image-text',
          eyebrow: typeof block.eyebrow === 'string' ? block.eyebrow : undefined,
          heading: String(block.heading || ''),
          body: String(block.body || ''),
          image: mediaUrl(block.image),
          imageSide: block.imageSide === 'left' ? 'left' : 'right',
        },
      ]
    }

    if (block.blockType === 'gallery') {
      return [
        {
          blockType: 'gallery',
          heading: typeof block.heading === 'string' ? block.heading : undefined,
          images: Array.isArray(block.images)
            ? block.images.map(mediaUrl).filter((image): image is string => Boolean(image))
            : [],
        },
      ]
    }

    if (block.blockType === 'cta') {
      return [
        {
          blockType: 'cta',
          heading: String(block.heading || ''),
          body: typeof block.body === 'string' ? block.body : undefined,
          label: typeof block.label === 'string' ? block.label : undefined,
          href: typeof block.href === 'string' ? block.href : undefined,
        },
      ]
    }

    return []
  })
}

function fallbackPage(slug: string): Page | undefined {
  const page = getWordPressPage(slug)
  if (!page) return undefined
  return {
    title: page.title,
    slug: page.slug,
    hero: {
      eyebrow: 'Prime Design & Build',
      heading: page.title,
      description: page.seoDescription,
      image: '/services/home-remodeling.jpeg',
    },
    layout: [],
    isGoogleAdsPage: false,
    seo: { metaTitle: page.seoTitle, metaDescription: page.seoDescription },
  }
}

export async function resolvePageBySlug(slug: string): Promise<Page | undefined> {
  if (!process.env.DATABASE_URL) return shouldUseLocalFallback() ? fallbackPage(slug) : undefined

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  const record = result.docs[0] as unknown as PayloadPage | undefined
  if (!record) return shouldUseLocalFallback() ? fallbackPage(slug) : undefined

  return {
    title: record.title,
    slug: record.slug,
    hero: record.hero
      ? {
          eyebrow: record.hero.eyebrow || undefined,
          heading: record.hero.heading || undefined,
          description: record.hero.description || undefined,
          image: mediaUrl(record.hero.image),
          cta: record.hero.cta?.label
            ? {
                label: record.hero.cta.label,
                href: record.hero.cta.href || undefined,
              }
            : undefined,
        }
      : undefined,
    layout: normalizeBlocks(record.layout),
    isGoogleAdsPage: Boolean(record.isGoogleAdsPage),
    seo: record.seo,
  }
}
