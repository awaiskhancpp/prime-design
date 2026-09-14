import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { toPageSections, type PageSection } from './pageSections'
import { getWordPressPage } from './wordpressPages'
import { shouldUseLocalFallback } from './runtime'

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
  layout: PageSection[]
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
    layout: toPageSections(record.layout),
    isGoogleAdsPage: Boolean(record.isGoogleAdsPage),
    seo: record.seo,
  }
}
