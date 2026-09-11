import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { richTextHasContent, type RichTextValue } from './richText'

export type Service = {
  slug: string
  title: string
  description: string
  /** Card summary for the services listing (WordPress index-page copy). */
  shortDescription?: string
  image: string
  showInConsultationForm?: boolean
  sectionOrder?: string[]
}

export type ServiceDetail = Service & {
  eyebrow: string
  lead: string
  /** Hero H1 (WordPress hero heading) — distinct from the plain `title`. */
  heroHeading?: string
  keyFeatures: string[]
  benefits: string[]
  processSteps: string[]
  gallery: string[]
  introHeading?: string
  heroVideoUrl?: string
  contentBlocks?: ServiceContentBlock[]
  sections?: Array<{ blockType: string; [key: string]: unknown }>
  /**
   * CMS-authored rich text for the overview lists (Key Features / Benefits /
   * Process). When present, these render instead of the static string
   * lists above.
   */
  overviewRich?: {
    keyFeatures?: RichTextValue
    benefits?: RichTextValue
    process?: RichTextValue
  }
  /** CMS-authored rich text for the "Craftsmanship That Transforms" section. */
  craftsmanship?: RichTextValue
  /** CMS-authored rich text for the "A Client-Centered Approach" section. */
  clientApproach?: RichTextValue
  /** Side image for the "A Client-Centered Approach" section. */
  clientApproachImage?: string
  /** Structured process section content (header + steps). */
  process?: {
    eyebrow?: string
    title?: string
    description?: string
    steps?: Array<{ title?: string; description?: string; image?: string }>
  }
  /** Structured quote section content. */
  quote?: { heading?: string; quote?: string; attribution?: string; image?: string }
  /** Structured "Silicon Valley Loves" section content. */
  siliconValleyLoves?: {
    eyebrow?: string
    heading?: string
    body?: string
    image?: string
    stats?: Array<{ value?: string; label?: string; detail?: string }>
  }
  /** Structured "Why Choose" section (heading + items). */
  whyChooseUs?: {
    eyebrow?: string
    heading?: string
    items?: Array<{ title: string; description?: string }>
  }
  /** Structured "Real Homes, Real Stories" section. */
  realHomes?: {
    eyebrow?: string
    heading?: string
    headingAccent?: string
    description?: string
    testimonials?: Array<{ quote: string; attribution: string }>
    cta?: { label?: string; href?: string }
  }
  /** Structured "Areas we service" section content. */
  areasWeService?: { heading?: string }
  /** Hero call-to-action buttons (Payload-authored; built-in pair when empty). */
  heroButtons?: Array<{ label: string; href: string }>
  /** "Why Choose Prime Kitchens? / The Prime Difference" three-card section. */
  primeKitchens?: {
    eyebrow?: string
    title?: string
    description?: string
    passionHeading?: string
    cards?: Array<{ title: string; image?: string }>
  }
  /** "Discover Your Signature Style" — icon cards with a photo gallery. */
  iconChecklistGallery?: {
    eyebrow?: string
    heading?: string
    items?: Array<{ icon?: string; title: string; description?: string }>
    images?: string[]
  }
  /** "The Power of Customization" — side image with a checklist. */
  imageChecklist?: {
    eyebrow?: string
    heading?: string
    description?: string
    image?: string
    items?: Array<{ title: string; description?: string }>
  }
  /** "Materials Crafted to Perfection" — four-card materials grid. */
  materialsShowcase?: {
    eyebrow?: string
    heading?: string
    description?: string
    items?: Array<{ image?: string; title: string; description?: string }>
  }
  /** Three review cards (name + quote + avatar) — Shaker Kitchen page. */
  testimonialCards?: {
    items?: Array<{ name: string; quote?: string; avatar?: string }>
  }
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    canonicalUrl?: string | null
    noIndex?: boolean | null
    ogTitle?: string | null
    ogDescription?: string | null
  }
}

export type ServiceContentItem = { text: string }
export type ServiceContentStep = { title: string; description: string; image?: string }
export type ServiceContentBlock =
  | {
      blockType: 'intro'
      eyebrow?: string
      heading: string
      body: string
      image?: string
      imageSide?: 'left' | 'right'
      items?: ServiceContentItem[]
    }
  | {
      blockType: 'image-text'
      eyebrow?: string
      heading: string
      body: string
      image?: string
      imageSide?: 'left' | 'right'
      items?: ServiceContentItem[]
    }
  | { blockType: 'feature-list'; heading: string; items: ServiceContentItem[] }
  | { blockType: 'benefits'; heading: string; items: ServiceContentItem[] }
  | { blockType: 'process'; heading: string; steps: ServiceContentStep[] }
  | { blockType: 'gallery'; heading?: string; images: string[] }
  | {
      blockType: 'sub-services'
      heading: string
      items: Array<{ title: string; description: string; image?: string; link?: string }>
    }
  | { blockType: 'video'; heading?: string; videoUrl: string; poster?: string }
  | { blockType: 'quote'; quote: string; attribution?: string }
  | {
      blockType: 'icon-feature-list'
      heading: string
      intro?: string
      image?: string
      imageSide?: 'left' | 'right'
      items: Array<{ title: string; description: string }>
    }
  | {
      blockType: 'checklist'
      eyebrow?: string
      heading: string
      description?: string
      image?: string
      imageSide?: 'left' | 'right'
      items: ServiceContentItem[]
    }

export const servicePathAliases: Record<string, string> = {
  'shaker-kitchen': 'shaker-kitchen-silicon-valley',
  'shaker-kitchens': 'shaker-kitchen-silicon-valley',
  'custom-kitchen': 'custom-kitchen-silicon-valley',
  'custom-kitchens': 'custom-kitchen-silicon-valley',
  'european-kitchen': 'european-kitchen-silicon-valley',
  'european-kitchens': 'european-kitchen-silicon-valley',
  // The Home Repair service lives at its WordPress slug
  // `comprehensive-home-repair-installation-services-in-silicon-valley`;
  // keep the older internal slug redirecting to it.
  'home-repair-installation-services':
    'comprehensive-home-repair-installation-services-in-silicon-valley',
  // The Finance service lives at its WordPress slug `finance`; keep the older
  // internal slug redirecting to it.
  financing: 'finance',
}

type PayloadMedia = { url?: string | null; source_url?: string | null }
type PayloadServiceRecord = {
  title: string
  slug: string
  description?: string | null
  shortDescription?: string | null
  /** Rich text overview fields (Key Features / Benefits / Process steps). */
  overview?: {
    keyFeatures?: unknown
    benefits?: unknown
    process?: unknown
  } | null
  /** Rich text for the "Craftsmanship That Transforms" section. */
  craftsmanship?: unknown
  /** Rich text for the "A Client-Centered Approach to Home Remodeling" section. */
  clientApproach?: unknown
  /** Side image for the "A Client-Centered Approach" section. */
  clientApproachImage?: number | PayloadMedia | null
  galleryImages?: Array<number | PayloadMedia | null> | null
  process?: {
    eyebrow?: string | null
    title?: string | null
    description?: string | null
    steps?: Array<{ title?: string; description?: string; image?: number | PayloadMedia | null }> | null
  } | null
  quote?: {
    heading?: string | null
    quote?: string | null
    attribution?: string | null
    image?: number | PayloadMedia | null
  } | null
  siliconValleyLoves?: {
    eyebrow?: string | null
    heading?: string | null
    body?: string | null
    image?: number | PayloadMedia | null
    stats?: Array<{ value?: string; label?: string; detail?: string }> | null
  } | null
  whyChooseUs?: {
    eyebrow?: string | null
    heading?: string | null
    items?: Array<{ title?: string; description?: string | null }> | null
  } | null
  realHomes?: {
    eyebrow?: string | null
    heading?: string | null
    headingAccent?: string | null
    description?: string | null
    testimonials?: Array<{ quote?: string; attribution?: string }> | null
    cta?: { label?: string | null; href?: string | null } | null
  } | null
  areasWeService?: { heading?: string | null } | null
  primeKitchens?: {
    eyebrow?: string | null
    title?: string | null
    description?: string | null
    passionHeading?: string | null
    cards?: Array<{ title?: string; image?: string | null }> | null
  } | null
  iconChecklistGallery?: {
    eyebrow?: string | null
    heading?: string | null
    items?: Array<{ icon?: string | null; title?: string; description?: string | null }> | null
    images?: Array<{ url?: string | null }> | null
  } | null
  imageChecklist?: {
    eyebrow?: string | null
    heading?: string | null
    description?: string | null
    image?: string | null
    items?: Array<{ title?: string; description?: string | null }> | null
  } | null
  materialsShowcase?: {
    eyebrow?: string | null
    heading?: string | null
    description?: string | null
    items?: Array<{ image?: string | null; title?: string; description?: string | null }> | null
  } | null
  testimonialCards?: {
    items?: Array<{ name?: string; quote?: string | null; avatar?: string | null }> | null
  } | null
  hero?: {
    eyebrow?: string | null
    heading?: string | null
    lead?: string | null
    image?: number | PayloadMedia | null
    video?: number | PayloadMedia | null
    buttons?: Array<{ label?: string; url?: string }> | null
  } | null
  contentBlocks?: Array<Record<string, unknown>> | null
  sections?: Array<Record<string, unknown>> | null
  sectionOrder?: Array<{ section?: string | null }> | null
  seo?: ServiceDetail['seo']
  showInConsultationForm?: boolean | null
}

const payloadImageUrl = (value: unknown) => {
  if (typeof value !== 'object' || value === null) return undefined
  const obj = value as { url?: string | null; source_url?: string | null }
  // Prefer the file's own URL (Vercel Blob or local upload); fall back to
  // the original WordPress source URL for media that was never uploaded.
  return obj.url || obj.source_url || undefined
}

export function normalizePayloadBlocks(
  value: PayloadServiceRecord['contentBlocks'],
): ServiceContentBlock[] | undefined {
  if (!value?.length) return undefined
  return value.flatMap((block): ServiceContentBlock[] => {
    const blockType = block.blockType
    if (blockType === 'intro' || blockType === 'image-text')
      return [
        {
          blockType,
          eyebrow: typeof block.eyebrow === 'string' ? block.eyebrow : undefined,
          heading: String(block.heading || ''),
          body: String(block.body || ''),
          image: payloadImageUrl(block.image),
          imageSide: block.imageSide === 'left' ? 'left' : 'right',
        },
      ] as ServiceContentBlock[]
    if (blockType === 'feature-list' || blockType === 'benefits')
      return [
        {
          blockType,
          heading: String(block.heading || ''),
          items: Array.isArray(block.items)
            ? block.items.map((item) => ({
                text: String((item as Record<string, unknown>).text || ''),
              }))
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'process')
      return [
        {
          blockType,
          heading: String(block.heading || ''),
          steps: Array.isArray(block.steps)
            ? block.steps.map((step) => {
                const item = step as Record<string, unknown>
                return {
                  title: String(item.title || ''),
                  description: String(item.description || ''),
                  image: payloadImageUrl(item.image),
                }
              })
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'gallery')
      return [
        {
          blockType,
          heading: typeof block.heading === 'string' ? block.heading : undefined,
          images: Array.isArray(block.images)
            ? block.images.map(payloadImageUrl).filter((image): image is string => Boolean(image))
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'sub-services')
      return [
        {
          blockType,
          heading: String(block.heading || ''),
          items: Array.isArray(block.items)
            ? block.items.map((item) => {
                const entry = item as Record<string, unknown>
                return {
                  title: String(entry.title || ''),
                  description: String(entry.description || ''),
                  image: payloadImageUrl(entry.image),
                  link: typeof entry.link === 'string' ? entry.link : undefined,
                }
              })
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'video') {
      const videoUrl =
        payloadImageUrl(block.video) || (typeof block.videoUrl === 'string' ? block.videoUrl : '')
      if (!videoUrl) return []
      return [
        {
          blockType,
          heading: typeof block.heading === 'string' ? block.heading : undefined,
          videoUrl,
          poster: payloadImageUrl(block.poster),
        },
      ] as ServiceContentBlock[]
    }
    if (blockType === 'icon-feature-list')
      return [
        {
          blockType,
          heading: String(block.heading || ''),
          intro: typeof block.intro === 'string' ? block.intro : undefined,
          image: payloadImageUrl(block.image),
          imageSide: block.imageSide === 'right' ? 'right' : 'left',
          items: Array.isArray(block.items)
            ? block.items.map((item) => {
                const entry = item as Record<string, unknown>
                return {
                  title: String(entry.title || ''),
                  description: String(entry.description || ''),
                }
              })
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'checklist')
      return [
        {
          blockType,
          eyebrow: typeof block.eyebrow === 'string' ? block.eyebrow : undefined,
          heading: String(block.heading || ''),
          description: typeof block.description === 'string' ? block.description : undefined,
          image: payloadImageUrl(block.image),
          imageSide: block.imageSide === 'right' ? 'right' : 'left',
          items: Array.isArray(block.items)
            ? block.items.map((item) => ({
                text: String((item as Record<string, unknown>).text || ''),
              }))
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'quote')
      return [
        {
          blockType,
          quote: String(block.quote || ''),
          attribution: typeof block.attribution === 'string' ? block.attribution : undefined,
        },
      ] as ServiceContentBlock[]
    return []
  }) as unknown as ServiceContentBlock[]
}

export async function resolveServiceDetail(slug: string): Promise<ServiceDetail | undefined> {
  if (!process.env.DATABASE_URL) return undefined
  const payload = await getPayload({ config: configPromise })

  // Sub-service pages (e.g. /services/kitchen-remodeling/european-kitchen-silicon-valley)
  // are published under the unsuffixed slug in the CMS (european-kitchen), so look the
  // record up by the exact slug first and fall back to the "-silicon-valley"-stripped slug.
  const findRecord = async (candidate: string) => {
    const result = await payload.find({
      collection: 'services',
      where: { slug: { equals: candidate } },
      depth: 2,
      limit: 1,
    })
    return result.docs[0] as unknown as PayloadServiceRecord | undefined
  }
  const normalized = slug.replace(/-silicon-valley$/, '')
  const record =
    (await findRecord(slug)) ||
    (normalized !== slug ? await findRecord(normalized) : undefined)
  if (!record) return undefined
  // Content comes from Payload only — no static fallback copy.
  const base = {
    slug: record.slug,
    title: record.title,
    description: record.description || record.shortDescription || '',
    image: payloadImageUrl(record.hero?.image) || '',
    eyebrow: record.hero?.eyebrow || '',
    lead: record.hero?.lead || record.description || record.shortDescription || '',
    heroVideoUrl: payloadImageUrl(record.hero?.video),
    keyFeatures: [],
    benefits: [],
    processSteps: [],
    gallery: [],
  }
  return {
    ...base,
    // `title` stays the plain service name; the WordPress hero heading is
    // exposed separately so consumers like the location hero form (which
    // builds "Kitchen Remodeling in Campbell") never get the slogan.
    title: record.title,
    heroHeading: record.hero?.heading || undefined,
    description: record.description || base.description,
    lead: record.hero?.lead || base.lead,
    // Only show a hero eyebrow when WordPress actually authored one — never
    // invent "… in Silicon Valley" or reuse the page title as an eyebrow.
    eyebrow: record.hero?.eyebrow || '',
    image: payloadImageUrl(record.hero?.image) || base.image,
    heroVideoUrl: payloadImageUrl(record.hero?.video) || base.heroVideoUrl,
    contentBlocks: normalizePayloadBlocks(record.contentBlocks),
    // Rich text overview lists: only include fields with real content so
    // empty editor states keep the static fallback lists.
    overviewRich: record.overview
      ? {
          keyFeatures: richTextHasContent(record.overview.keyFeatures as RichTextValue)
            ? (record.overview.keyFeatures as RichTextValue)
            : undefined,
          benefits: richTextHasContent(record.overview.benefits as RichTextValue)
            ? (record.overview.benefits as RichTextValue)
            : undefined,
          process: richTextHasContent(record.overview.process as RichTextValue)
            ? (record.overview.process as RichTextValue)
            : undefined,
        }
      : undefined,
    craftsmanship: richTextHasContent(record.craftsmanship as RichTextValue)
      ? (record.craftsmanship as RichTextValue)
      : undefined,
    clientApproach: richTextHasContent(record.clientApproach as RichTextValue)
      ? (record.clientApproach as RichTextValue)
      : undefined,
    clientApproachImage: payloadImageUrl(record.clientApproachImage),
    gallery: record.galleryImages?.map(payloadImageUrl).filter((url): url is string => Boolean(url))
      .length
      ? (record.galleryImages
          ?.map(payloadImageUrl)
          .filter((url): url is string => Boolean(url)) ?? base.gallery)
      : base.gallery,
    process: record.process
      ? {
          eyebrow: record.process.eyebrow ?? undefined,
          title: record.process.title ?? undefined,
          description: record.process.description ?? undefined,
          steps: record.process.steps?.map((step) => ({
            title: step.title,
            description: step.description,
            image: payloadImageUrl(step.image),
          })),
        }
      : undefined,
    quote: record.quote
      ? {
          heading: record.quote.heading ?? undefined,
          quote: record.quote.quote ?? undefined,
          attribution: record.quote.attribution ?? undefined,
          image: payloadImageUrl(record.quote.image),
        }
      : undefined,
    siliconValleyLoves: record.siliconValleyLoves
      ? {
          eyebrow: record.siliconValleyLoves.eyebrow ?? undefined,
          heading: record.siliconValleyLoves.heading ?? undefined,
          body: record.siliconValleyLoves.body ?? undefined,
          image: payloadImageUrl(record.siliconValleyLoves.image),
          stats: record.siliconValleyLoves.stats?.map((stat) => ({
            value: stat.value,
            label: stat.label,
            detail: stat.detail,
          })),
        }
      : undefined,
    whyChooseUs: record.whyChooseUs
      ? {
          eyebrow: record.whyChooseUs.eyebrow ?? undefined,
          heading: record.whyChooseUs.heading ?? undefined,
          items: record.whyChooseUs.items?.map((item) => ({
            title: item.title || '',
            description: item.description ?? undefined,
          })),
        }
      : undefined,
    realHomes: record.realHomes
      ? {
          eyebrow: record.realHomes.eyebrow ?? undefined,
          heading: record.realHomes.heading ?? undefined,
          headingAccent: record.realHomes.headingAccent ?? undefined,
          description: record.realHomes.description ?? undefined,
          testimonials: record.realHomes.testimonials?.map((item) => ({
            quote: item.quote || '',
            attribution: item.attribution || '',
          })),
          cta:
            record.realHomes.cta?.label || record.realHomes.cta?.href
              ? {
                  label: record.realHomes.cta.label ?? undefined,
                  href: record.realHomes.cta.href ?? undefined,
                }
              : undefined,
        }
      : undefined,
    areasWeService: record.areasWeService
      ? { heading: record.areasWeService.heading ?? undefined }
      : undefined,
    heroButtons: record.hero?.buttons?.length
      ? record.hero.buttons.map((button) => ({
          label: button.label || '',
          href: button.url || '#contact',
        }))
      : undefined,
    primeKitchens: record.primeKitchens
      ? {
          eyebrow: record.primeKitchens.eyebrow ?? undefined,
          title: record.primeKitchens.title ?? undefined,
          description: record.primeKitchens.description ?? undefined,
          passionHeading: record.primeKitchens.passionHeading ?? undefined,
          cards: record.primeKitchens.cards?.map((card) => ({
            title: card.title || '',
            image: card.image || undefined,
          })),
        }
      : undefined,
    iconChecklistGallery: record.iconChecklistGallery
      ? {
          eyebrow: record.iconChecklistGallery.eyebrow ?? undefined,
          heading: record.iconChecklistGallery.heading ?? undefined,
          items: record.iconChecklistGallery.items?.map((item) => ({
            icon: item.icon ?? undefined,
            title: item.title || '',
            description: item.description ?? undefined,
          })),
          images: record.iconChecklistGallery.images
            ?.map((image) => image.url)
            .filter((url): url is string => Boolean(url)),
        }
      : undefined,
    imageChecklist: record.imageChecklist
      ? {
          eyebrow: record.imageChecklist.eyebrow ?? undefined,
          heading: record.imageChecklist.heading ?? undefined,
          description: record.imageChecklist.description ?? undefined,
          image: record.imageChecklist.image ?? undefined,
          items: record.imageChecklist.items?.map((item) => ({
            title: item.title || '',
            description: item.description ?? undefined,
          })),
        }
      : undefined,
    materialsShowcase: record.materialsShowcase
      ? {
          eyebrow: record.materialsShowcase.eyebrow ?? undefined,
          heading: record.materialsShowcase.heading ?? undefined,
          description: record.materialsShowcase.description ?? undefined,
          items: record.materialsShowcase.items?.map((item) => ({
            image: item.image ?? undefined,
            title: item.title || '',
            description: item.description ?? undefined,
          })),
        }
      : undefined,
    testimonialCards: record.testimonialCards
      ? {
          items: record.testimonialCards.items?.map((item) => ({
            name: item.name || '',
            quote: item.quote ?? undefined,
            avatar: item.avatar ?? undefined,
          })),
        }
      : undefined,
    sections: record.sections?.filter(
      (block): block is { blockType: string; [key: string]: unknown } =>
        Boolean(block && typeof block.blockType === 'string'),
    ),
    sectionOrder: record.sectionOrder
      ?.map((item) => item.section)
      .filter((item): item is string => Boolean(item)),
  }
}

export async function resolveServices(): Promise<Service[]> {
  if (!process.env.DATABASE_URL) return []

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'services',
    sort: 'sortOrder',
    depth: 2,
    limit: 100,
  })

  if (!result.docs.length) return []

  // Content comes from Payload only — no static fallback copy.
  return (result.docs as unknown as PayloadServiceRecord[]).map((record) => ({
    slug: record.slug,
    title: record.title,
    description: record.description || record.shortDescription || '',
    // Card summary for the services listing — WordPress index-page copy.
    shortDescription: record.shortDescription || undefined,
    image: payloadImageUrl(record.hero?.image) || '',
    showInConsultationForm: record.showInConsultationForm ?? true,
  }))
}

