import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { shouldUseLocalFallback } from './runtime'
import { getWordPressPage } from './wordpressPages'

export type LandingPageBlock = {
  blockType: string
  [key: string]: unknown
}

export type LandingPage = {
  title: string
  slug: string
  status: 'draft' | 'published'
  template: 'default' | 'information'
  hero?: {
    eyebrow?: string
    heading?: string
    lead?: string
    image?: string
  }
  sections: LandingPageBlock[]
  cta?: { text?: string; link?: string; showForm?: boolean }
  campaignTracking?: {
    campaignName?: string
    campaignSource?: string
    campaignMedium?: string
    campaignTerm?: string
    campaignContent?: string
  }
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    canonicalUrl?: string | null
    noIndex?: boolean | null
  }
}

type PayloadLandingPage = {
  title: string
  slug: string
  status?: LandingPage['status']
  template?: LandingPage['template']
  hero?: {
    eyebrow?: string | null
    heading?: string | null
    description?: string | null
    backgroundMedia?: unknown
  } | null
  sections?: Array<Record<string, unknown>> | null
  cta?: LandingPage['cta']
  campaignTracking?: LandingPage['campaignTracking']
  seo?: LandingPage['seo']
}

function mediaUrl(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined

  const record = value as Record<string, unknown>
  if (typeof record.url === 'string') return record.url
  return 'asset' in record ? mediaUrl(record.asset) : undefined
}

function normalizeBlocks(value: PayloadLandingPage['sections']): LandingPageBlock[] {
  if (!Array.isArray(value)) return []

  return value.filter((block): block is LandingPageBlock =>
    Boolean(block && typeof block.blockType === 'string'),
  )
}

function fallbackLandingPage(slug: string): LandingPage | undefined {
  const page = getWordPressPage(slug)
  if (!page) return undefined

  return {
    title: page.title,
    slug: page.slug,
    status: 'published',
    template: 'information',
    hero: {
      heading: page.title,
      lead: page.seoDescription,
    },
    sections: [],
    seo: {
      metaTitle: page.seoTitle,
      metaDescription: page.seoDescription,
    },
  }
}

// These are only the legacy pages available when Payload is not configured.
// With a database, any published landing-pages document is addressable by slug.
const fallbackLandingPageSlugs = [
  'kitchen-remodeling-information',
  'bathroom-remodeling-information',
  'additions-remodeling-information',
  'home-remodeling-information',
  'outdoor-hardscape-outdoor-kitchen-information',
  'siding-installation-replacement-information',
  'comprehensive-home-repair-installation-services-in-silicon-valley',
  'remodeling-information',
] as const

export async function resolveLandingPage(slug: string): Promise<LandingPage | undefined> {
  if (!process.env.DATABASE_URL) {
    if (!(fallbackLandingPageSlugs as readonly string[]).includes(slug)) return undefined
    return shouldUseLocalFallback() ? fallbackLandingPage(slug) : undefined
  }

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'landing-pages',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })
  const record = result.docs[0] as unknown as PayloadLandingPage | undefined
  if (!record) return shouldUseLocalFallback() ? fallbackLandingPage(slug) : undefined

  return {
    title: record.title,
    slug: record.slug,
    status: record.status || 'draft',
    template: record.template || 'information',
    hero: record.hero
      ? {
          eyebrow: record.hero.eyebrow || undefined,
          heading: record.hero.heading || undefined,
          lead: record.hero.description || undefined,
          image: mediaUrl(record.hero.backgroundMedia),
        }
      : undefined,
    sections: normalizeBlocks(record.sections),
    cta: record.cta,
    campaignTracking: record.campaignTracking,
    seo: record.seo,
  }
}

export function listLandingPageSlugs(): string[] {
  return [...fallbackLandingPageSlugs]
}

export async function listPublishedLandingPageSlugs(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [...fallbackLandingPageSlugs]

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'landing-pages',
    where: { status: { equals: 'published' } },
    depth: 0,
    limit: 1000,
  })
  const slugs = result.docs
    .map((record) => (typeof record.slug === 'string' ? record.slug : undefined))
    .filter((slug): slug is string => Boolean(slug))

  return slugs.length || !shouldUseLocalFallback() ? slugs : [...fallbackLandingPageSlugs]
}
