import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { shouldUseLocalFallback } from './runtime'
import { normalizePayloadBlocks, type ServiceContentBlock } from './services'

export type LandingPageBlock = ServiceContentBlock

export type LandingPage = {
  title: string
  slug: string
  status: 'draft' | 'published'
  template: 'default' | 'information'
  hero?: { eyebrow?: string; heading?: string; lead?: string; image?: string }
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

type PayloadMedia = { url?: string | null }
type PayloadLandingPage = {
  title: string
  slug: string
  status?: LandingPage['status']
  template?: LandingPage['template']
  hero?: {
    eyebrow?: string | null
    heading?: string | null
    lead?: string | null
    image?: number | PayloadMedia | null
  } | null
  sections?: Array<Record<string, unknown>> | null
  cta?: LandingPage['cta']
  campaignTracking?: LandingPage['campaignTracking']
  seo?: LandingPage['seo']
}

const mediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

function normalizeBlocks(value: PayloadLandingPage['sections']): LandingPageBlock[] {
  return normalizePayloadBlocks(value) as LandingPageBlock[]
}

// Real WordPress pages, pulled from wordpressPages.ts — title and SEO
// description are the actual source content. Body copy wasn't captured
// during export (sourceContentLength: 0 for all seven in the original
// extraction), so `sections` is empty until real body content is authored
// or re-extracted from the WXR export.
const fallbackLandingPages: LandingPage[] = [
  {
    title: 'Remodeling Information',
    slug: 'remodeling-information',
    status: 'published',
    template: 'information',
    hero: {
      heading: 'Remodeling Information',
      lead: 'Building dreams through expert craftsmanship. Discover top-quality home remodeling services in Silicon Valley, including kitchen, bathroom, and whole home renovations.',
    },
    sections: [],
    seo: {
      metaDescription:
        'Building dreams through expert craftsmanship. Discover top-quality home remodeling services in Silicon Valley, including kitchen, bathroom, and whole home renovations.',
    },
  },
  {
    title: 'Kitchen Remodeling Information',
    slug: 'kitchen-remodeling-information',
    status: 'published',
    template: 'information',
    hero: {
      heading: 'Kitchen Remodeling Information',
      lead: 'Prime Design & Build offers custom kitchen remodeling in Silicon Valley. Create a kitchen that matches your style and needs with expert craftsmanship.',
    },
    sections: [],
    seo: {
      metaDescription:
        'Prime Design & Build offers custom kitchen remodeling in Silicon Valley. Create a kitchen that matches your style and needs with expert craftsmanship.',
    },
  },
  {
    title: 'Bathroom Remodeling Information',
    slug: 'bathroom-remodeling-information',
    status: 'published',
    template: 'information',
    hero: {
      heading: 'Bathroom Remodeling Information',
      lead: 'Transform your bathroom with Prime Design & Build. Our expert team offers custom designs, quality craftsmanship, and personalized solutions for your dream space.',
    },
    sections: [],
    seo: {
      metaDescription:
        'Transform your bathroom with Prime Design & Build. Our expert team offers custom designs, quality craftsmanship, and personalized solutions for your dream space.',
    },
  },
  {
    title: 'Additions Remodeling Information',
    slug: 'additions-remodeling-information',
    status: 'published',
    template: 'information',
    hero: {
      heading: 'Additions Remodeling Information',
      lead: 'Discover Prime Design & Build, remodeling experts in Silicon Valley specializing in additions remodeling, custom room additions, and quality work.',
    },
    sections: [],
    seo: {
      metaDescription:
        'Discover Prime Design & Build, remodeling experts in Silicon Valley specializing in additions remodeling information, custom room additions, and quality work.',
    },
  },
  {
    title: 'Home Remodeling Information',
    slug: 'home-remodeling-information',
    status: 'published',
    template: 'information',
    hero: {
      heading: 'Home Remodeling Information',
      lead: 'Building dreams through expert craftsmanship. Discover top-quality home remodeling services in Silicon Valley, including kitchen, bathroom, and whole home renovations.',
    },
    sections: [],
    seo: {
      metaDescription:
        'Building dreams through expert craftsmanship. Discover top-quality home remodeling services in Silicon Valley, including kitchen, bathroom, and whole home renovations.',
    },
  },
  {
    title: 'Outdoor Hardscape & Outdoor Kitchen Information',
    slug: 'outdoor-hardscape-outdoor-kitchen-information',
    status: 'published',
    template: 'information',
    hero: { heading: 'Outdoor Hardscape & Outdoor Kitchen Information' },
    sections: [],
    seo: {
      metaDescription:
        'Discover Prime Design & Build, remodeling experts in Silicon Valley specializing in outdoor hardscape and outdoor kitchen work.',
    },
  },
  {
    title: 'Siding Installation & Replacement Information',
    slug: 'siding-installation-replacement-information',
    status: 'published',
    template: 'information',
    hero: { heading: 'Siding Installation & Replacement Information' },
    sections: [],
    seo: {
      metaDescription:
        'Discover Prime Design & Build, remodeling experts in Silicon Valley specializing in siding installation and replacement.',
    },
  },
]

function fallbackLandingPage(slug: string): LandingPage | undefined {
  return fallbackLandingPages.find((page) => page.slug === slug)
}

export async function resolveLandingPage(slug: string): Promise<LandingPage | undefined> {
  if (!process.env.DATABASE_URL) {
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
    template: record.template || 'default',
    hero: record.hero
      ? {
          eyebrow: record.hero.eyebrow || undefined,
          heading: record.hero.heading || undefined,
          lead: record.hero.lead || undefined,
          image: mediaUrl(record.hero.image),
        }
      : undefined,
    sections: normalizeBlocks(record.sections),
    cta: record.cta,
    campaignTracking: record.campaignTracking,
    seo: record.seo,
  }
}

export function listLandingPageSlugs(): string[] {
  return fallbackLandingPages.map((page) => page.slug)
}
