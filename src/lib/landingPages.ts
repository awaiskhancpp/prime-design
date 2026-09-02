import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { shouldUseLocalFallback } from './runtime'
import { normalizePayloadBlocks, type ServiceContentBlock } from './services'
import { galleryCategories } from './gallery'
import { faqCategories } from './faq'

export type LandingPageBlock = ServiceContentBlock

export type LandingPageTabs = {
  estimate?: { enabled?: boolean; heading?: string; body?: string; link?: string }
  intro?: { enabled?: boolean; eyebrow?: string; heading?: string; body?: string; image?: string }
  subServices?: {
    enabled?: boolean
    heading?: string
    body?: string
    items?: Array<{ title: string; description?: string; image?: string; link?: string }>
  }
  primeDifference?: {
    enabled?: boolean
    eyebrow?: string
    heading?: string
    headingAccent?: string
    body?: string
    checklist?: string[]
  }
  projectGallery?: { enabled?: boolean; heading?: string; images?: string[] }
  reflectionGallery?: { enabled?: boolean; heading?: string; images?: string[] }
  projects?: {
    enabled?: boolean
    eyebrow?: string
    heading?: string
    description?: string
    items?: Array<{ title: string; description?: string; image?: string; link?: string }>
  }
  video?: {
    enabled?: boolean
    eyebrow?: string
    heading?: string
    description?: string
    videoUrl?: string
    videoFile?: string
    poster?: string
    videos?: Array<{ url: string; poster?: string; caption?: string }>
  }
  whyChoose?: { enabled?: boolean }
  serviceAreas?: { enabled?: boolean }
  faq?: {
    enabled?: boolean
    heading?: string
    items?: Array<{ question: string; answer: string }>
    categories?: Array<{ title: string; items: Array<{ question: string; answer: string }> }>
  }
  testimonials?: { enabled?: boolean }
  booking?: { enabled?: boolean; heading?: string; description?: string }
  contactForm?: { enabled?: boolean; heading?: string; description?: string }
  luxuryCta?: {
    enabled?: boolean
    eyebrow?: string
    heading?: string
    body?: string
    link?: string
  }
  findUs?: { enabled?: boolean; heading?: string; phone?: string; email?: string; address?: string }
}

export type LandingPage = {
  title: string
  slug: string
  status: 'draft' | 'published'
  template: 'default' | 'information'
  hero?: { eyebrow?: string; heading?: string; lead?: string; image?: string }
  sections: LandingPageBlock[]
  tabs?: LandingPageTabs
  sectionOrder?: string[]
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
  sectionOrder?: Array<{ section?: string | null }> | null
  estimate?: LandingPageTabs['estimate'] | null
  intro?: LandingPageTabs['intro'] | null
  subServices?: LandingPageTabs['subServices'] | null
  primeDifference?: LandingPageTabs['primeDifference'] | null
  projectGallery?: { enabled?: boolean; heading?: string | null; images?: unknown[] | null } | null
  reflectionGallery?: {
    enabled?: boolean
    heading?: string | null
    images?: unknown[] | null
  } | null
  projects?: {
    enabled?: boolean
    eyebrow?: string | null
    heading?: string | null
    description?: string | null
    items?: unknown[] | null
  } | null
  video?: {
    enabled?: boolean
    eyebrow?: string | null
    heading?: string | null
    description?: string | null
    videoUrl?: string | null
    videoFile?: unknown
    poster?: unknown
    videos?: Array<{
      videoUrl?: string | null
      videoFile?: unknown
      poster?: unknown
      caption?: string | null
    }> | null
  } | null
  whyChoose?: { enabled?: boolean } | null
  serviceAreas?: { enabled?: boolean } | null
  faq?: LandingPageTabs['faq'] | null
  testimonials?: { enabled?: boolean } | null
  booking?: LandingPageTabs['booking'] | null
  contactForm?: LandingPageTabs['contactForm'] | null
  luxuryCta?: LandingPageTabs['luxuryCta'] | null
  findUs?: LandingPageTabs['findUs'] | null
  cta?: LandingPage['cta']
  campaignTracking?: LandingPage['campaignTracking']
  seo?: LandingPage['seo']
  estimateEnabled?: boolean | null
  introEnabled?: boolean | null
  subServicesEnabled?: boolean | null
  primeDifferenceEnabled?: boolean | null
  projectGalleryEnabled?: boolean | null
  reflectionGalleryEnabled?: boolean | null
  projectsEnabled?: boolean | null
  videoEnabled?: boolean | null
  whyChooseEnabled?: boolean | null
  serviceAreasEnabled?: boolean | null
  faqEnabled?: boolean | null
  testimonialsEnabled?: boolean | null
  bookingEnabled?: boolean | null
  luxuryCtaEnabled?: boolean | null
  findUsEnabled?: boolean | null
  contactFormEnabled?: boolean | null
}

const mediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

const mediaUrls = (value: unknown) =>
  Array.isArray(value) ? value.map(mediaUrl).filter((url): url is string => Boolean(url)) : []

function tabsFromRecord(record: PayloadLandingPage): LandingPageTabs {
  return {
    estimate: record.estimate
      ? { ...record.estimate, enabled: record.estimateEnabled ?? true }
      : undefined,
    intro: record.intro
      ? {
          ...record.intro,
          enabled: record.introEnabled ?? true,
          image: mediaUrl((record.intro as Record<string, unknown>).image),
        }
      : undefined,
    subServices: record.subServices
      ? {
          ...record.subServices,
          enabled: record.subServicesEnabled ?? true,
          items: (record.subServices.items || []).map((item) => ({
            ...item,
            image: mediaUrl((item as Record<string, unknown>).image),
          })),
        }
      : undefined,
    primeDifference: record.primeDifference
      ? {
          ...record.primeDifference,
          enabled: record.primeDifferenceEnabled ?? true,
          checklist: (record.primeDifference.checklist || []).map((item) =>
            typeof item === 'string' ? item : (item as { text?: string }).text || '',
          ),
        }
      : undefined,
    projectGallery: record.projectGallery
      ? {
          enabled: record.projectGalleryEnabled ?? true,
          heading: record.projectGallery.heading || undefined,
          images: mediaUrls(record.projectGallery.images),
        }
      : undefined,
    reflectionGallery: record.reflectionGallery
      ? {
          enabled: record.reflectionGalleryEnabled ?? false,
          heading: record.reflectionGallery.heading || undefined,
          images: mediaUrls(record.reflectionGallery.images),
        }
      : undefined,
    projects: record.projects
      ? {
          enabled: record.projectsEnabled ?? true,
          eyebrow: record.projects.eyebrow || undefined,
          heading: record.projects.heading || undefined,
          description: record.projects.description || undefined,
          items: (record.projects.items || []).map((item) => {
            const value = item as Record<string, unknown>
            return {
              title: String(value.title || ''),
              description: typeof value.description === 'string' ? value.description : undefined,
              image: mediaUrl(value.image),
              link: typeof value.link === 'string' ? value.link : undefined,
            }
          }),
        }
      : undefined,
    video: record.video
      ? {
          enabled: record.videoEnabled ?? false,
          eyebrow: record.video.eyebrow || undefined,
          heading: record.video.heading || undefined,
          description: record.video.description || undefined,
          videoUrl: record.video.videoUrl || mediaUrl(record.video.videoFile),
          poster: mediaUrl(record.video.poster),
          videos: (() => {
            const fromArray = (record.video.videos || [])
              .map((entry) => ({
                url: entry.videoUrl || mediaUrl(entry.videoFile) || '',
                poster: mediaUrl(entry.poster),
                caption: entry.caption || undefined,
              }))
              .filter((entry) => entry.url)
            if (fromArray.length) return fromArray
            const legacyUrl = record.video.videoUrl || mediaUrl(record.video.videoFile)
            return legacyUrl ? [{ url: legacyUrl, poster: mediaUrl(record.video.poster) }] : []
          })(),
        }
      : undefined,
    whyChoose: record.whyChoose ? { enabled: record.whyChooseEnabled ?? true } : undefined,
    serviceAreas: record.serviceAreas ? { enabled: record.serviceAreasEnabled ?? true } : undefined,
    faq: record.faq ? { ...record.faq, enabled: record.faqEnabled ?? true } : undefined,
    testimonials: record.testimonials ? { enabled: record.testimonialsEnabled ?? true } : undefined,
    luxuryCta: record.luxuryCta
      ? { ...record.luxuryCta, enabled: record.luxuryCtaEnabled ?? true }
      : undefined,
    booking: record.booking
      ? { ...record.booking, enabled: record.bookingEnabled ?? false }
      : undefined,
    findUs: record.findUs ? { ...record.findUs, enabled: record.findUsEnabled ?? true } : undefined,
    contactForm: record.contactForm
      ? { ...record.contactForm, enabled: record.contactFormEnabled ?? true }
      : undefined,
  }
}

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
  const page = fallbackLandingPages.find((item) => item.slug === slug)
  if (!page) return undefined
  return { ...page, tabs: defaultLandingTabs(page) }
}

function defaultLandingTabs(page: LandingPage): LandingPageTabs {
  const image =
    page.hero?.image ||
    (page.slug.includes('bathroom')
      ? '/before-after/bathroom_remodeling_after.jpeg'
      : '/services/kitchen-remodeling.jpeg')
  const isKitchen = page.slug.includes('kitchen')
  return {
    estimate: {
      enabled: true,
      heading: 'Ready to schedule your free estimate?',
      body: 'Contact us here or reach us at (650) 235-4863 →',
      link: '/contact',
    },
    intro: {
      enabled: true,
      eyebrow: isKitchen
        ? 'Kitchen remodeling company in Silicon Valley'
        : 'Prime Design & Build in Silicon Valley',
      heading: isKitchen
        ? 'Choose a kitchen that reflects your unique style and vision.'
        : `Transform your ${page.title.replace(/ information/i, '').toLowerCase()} with Prime Design & Build.`,
      body:
        page.hero?.lead ||
        'Thoughtful design, quality craftsmanship, and a clear process from concept through completion.',
      image,
    },
    subServices: {
      enabled: true,
      heading: isKitchen
        ? 'Choose a kitchen that reflects your unique style and vision.'
        : 'Explore your remodeling possibilities',
      body: 'Explore our specialized services and find the right direction for your project.',
      items: isKitchen
        ? [
            {
              title: 'Custom Kitchen',
              description: 'Create a kitchen that reflects your unique style and vision.',
              image,
              link: '/services/kitchen-remodeling/custom-kitchen-silicon-valley',
            },
            {
              title: 'European Kitchen',
              description: 'Experience the perfect blend of sophistication and functionality.',
              image,
              link: '/services/kitchen-remodeling/european-kitchen-silicon-valley',
            },
            {
              title: 'Shaker Kitchen',
              description: 'Discover the classic beauty and versatility of Shaker kitchens.',
              image,
              link: '/services/kitchen-remodeling/shaker-kitchen-silicon-valley',
            },
          ]
        : [],
    },
    primeDifference: {
      enabled: true,
      eyebrow: 'Why Choose Prime Design & Build?',
      heading: 'The',
      headingAccent: 'Prime Difference',
      body: 'Our experienced team combines thoughtful design, quality materials, and careful attention to detail to create spaces made for the way you live.',
      checklist: [
        'Experts on-site for accurate solutions',
        'Wide range of construction and remodel services',
        'Customer satisfaction is a priority',
        'Competitive pricing for our services',
        'Quick response for customer satisfaction',
      ],
    },
    video: {
      enabled: false,
      eyebrow: 'See our work',
      heading: 'A closer look at our craftsmanship',
      description: 'See how our team brings each project from concept to completion.',
      videoUrl:
        'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/09.04.2024%20Ilay%20Prime%20Kitchen%20700%20Alice%20Ave%20Mountain%20View.mp4',
      poster: image,
    },
    projectGallery: {
      enabled: false,
      heading: `Showcasing ${page.title.replace(/ information/i, '').toLowerCase()} projects in Silicon Valley`,
      images: [],
    },
    reflectionGallery: {
      enabled: true,
      heading: 'A reflection of remodeling projects in Silicon Valley',
      images: (page.slug.includes('kitchen')
        ? galleryCategories[0].images
        : galleryCategories[1].images
      ).slice(6, 18),
    },
    projects: {
      enabled: true,
      eyebrow: 'Our Projects',
      heading: `Showcasing ${page.title.replace(/ information/i, '').toLowerCase()} projects in Silicon Valley`,
      description: 'Inspiring makeovers shaped around each homeowner’s style and lifestyle.',
      items: (page.slug.includes('kitchen')
        ? galleryCategories[0].images
        : galleryCategories[1].images
      )
        .slice(0, 4)
        .map((item, index) => ({
          title: `${page.title.replace(/ information/i, '')} Project ${index + 1}`,
          image: item,
          description: 'Thoughtful design and quality craftsmanship from concept to completion.',
          link: '/our-projects',
        })),
    },
    whyChoose: { enabled: true },
    serviceAreas: { enabled: true },
    faq: {
      enabled: true,
      heading: 'Frequently asked questions',
      categories: faqCategories.filter((category) => {
        if (isKitchen)
          return [
            'Custom Kitchen Questions',
            'European Kitchen Questions',
            'Kitchen Remodel Questions',
            'Shaker Kitchen Questions',
          ].includes(category.title)
        if (page.slug.includes('bathroom'))
          return ['Bathroom Remodel Questions', 'General Questions', 'Finance Questions'].includes(
            category.title,
          )
        if (page.slug.includes('addition'))
          return [
            'Room Additions Questions',
            'Complete Renovations Questions',
            'General Questions',
          ].includes(category.title)
        if (page.slug.includes('outdoor'))
          return [
            'Outdoor Hardscape Questions',
            'Outdoor Kitchen Questions',
            'General Questions',
          ].includes(category.title)
        if (page.slug.includes('siding'))
          return ['Siding Questions', 'General Questions'].includes(category.title)
        return [
          'Home Remodel Questions',
          'Complete Renovations Questions',
          'General Questions',
        ].includes(category.title)
      }),
    },
    testimonials: { enabled: true },
    booking: {
      enabled: true,
      heading: 'Schedule your consultation',
      description: 'Choose a convenient time to speak with our team.',
    },
    contactForm: {
      enabled: true,
      heading: 'Receive a free estimate',
      description: 'Tell us about your project and our team will get back to you.',
    },
    luxuryCta: {
      enabled: true,
      eyebrow: 'Need a new renovation?',
      heading: "Silicon Valley's Luxury Home Contractor",
      body: 'At Prime Design & Build, we stand proudly as one of Silicon Valley’s premier remodeling and construction authorities.',
      link: '/contact',
    },
    findUs: { enabled: true },
  }
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

  const resolvedTabs = tabsFromRecord(record)
  const hasConfiguredTabs = Object.values(resolvedTabs).some((tab) => {
    if (!tab) return false
    return Object.entries(tab).some(([key, value]) => {
      if (key === 'enabled' || value === undefined || value === null || value === '') return false
      return !Array.isArray(value) || value.length > 0
    })
  })
  const resolvedPage: LandingPage = {
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
    tabs: resolvedTabs,
    sectionOrder: (record.sectionOrder || [])
      .map((item) => item.section)
      .filter((value): value is string => Boolean(value)),
    cta: record.cta,
    campaignTracking: record.campaignTracking,
    seo: record.seo,
  }

  return hasConfiguredTabs
    ? resolvedPage
    : { ...resolvedPage, tabs: defaultLandingTabs(resolvedPage) }
}

export function listLandingPageSlugs(): string[] {
  return fallbackLandingPages.map((page) => page.slug)
}
