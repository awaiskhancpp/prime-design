import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { shouldUseLocalFallback } from './runtime'
import { getWordPressPage } from './wordpressPages'

export type LandingPageBlock = {
  blockType: string
  [key: string]: unknown
}

/** The service a landing page advertises, as its forms need it. */
export type LandingPageService = {
  slug: string
  /** The service's contact-page card label, e.g. "Kitchen Remodeling Consultation". */
  consultationLabel?: string
}

export type LandingPage = {
  title: string
  slug: string
  /** Set on the landing page record; see `LandingPages.service`. */
  service?: LandingPageService
  status: 'draft' | 'published'
  /**
   * The page's headline and copy, for metadata fallbacks. With a database it
   * is read from the page's first `hero` section — the one that renders.
   * There used to be a separate Hero group as well, which nothing rendered
   * and which had already drifted from the block on one page.
   */
  hero?: {
    heading?: string
    lead?: string
  }
  sections: LandingPageBlock[]
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
  sections?: Array<Record<string, unknown>> | null
  service?: { slug?: string | null; consultationLabel?: string | null } | number | null
  seo?: LandingPage['seo']
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
  'remodeling-information',
] as const

function heroFromSections(sections: PayloadLandingPage['sections']): LandingPage['hero'] {
  const hero = sections?.find((section) => section?.blockType === 'hero')
  if (!hero) return undefined
  const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined)
  return { heading: text(hero.heading), lead: text(hero.description) }
}

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
    hero: heroFromSections(record.sections),
    sections: normalizeBlocks(record.sections),
    service:
      record.service && typeof record.service === 'object' && record.service.slug
        ? {
            slug: record.service.slug,
            consultationLabel: record.service.consultationLabel || undefined,
          }
        : undefined,
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
