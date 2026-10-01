import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { richTextHasContent, type RichTextValue } from './richText'
import { resolveSharedServiceDefaults, withSharedDefaults } from './sharedSections'

export type Service = {
  slug: string
  title: string
  description: string
  /** Card summary for the services listing (WordPress index-page copy). */
  shortDescription?: string
  /**
   * The shorter one-liner WordPress uses on the homepage "Our Services"
   * cards. Genuinely different copy from `shortDescription`, not a truncation
   * of it, so the two are stored separately.
   */
  excerpt?: string
  image: string
  /**
   * Photo for this service shown as a card. WordPress picks a different
   * image here from the page hero, so this is its own field; falls back to
   * `image` when the CMS has none.
   */
  cardImage?: string
  /** Payload "Featured on homepage" checkbox. */
  featured?: boolean
  showInConsultationForm?: boolean
  /**
   * Services → Page layout: the page's sections, top to bottom, each with its
   * Show switch. Empty means the page has not been laid out in the CMS and
   * falls back to the per-slug tables in code.
   */
  pageSections?: Array<{ section: string; enabled: boolean }>
}

/**
 * The service slug a contact/lead form on this page should pre-select.
 *
 * Usually the page's own service — but the kitchen sub-styles (Shaker,
 * Custom, European) aren't themselves one of the six services the lead
 * forms offer (see `formServices.ts`'s own note: a visitor choosing between
 * "Kitchen Remodeling" and "Shaker Kitchen" is being asked a question the
 * sales call exists to answer), so their own slug never matches a dropdown
 * option and the field would otherwise sit blank. This resolves to their
 * parent service instead, when they have one.
 */
export function bookableServiceSlug(service: ServiceDetail): string {
  return service.parentService?.slug || service.slug
}

export type ServiceDetail = Service & {
  eyebrow: string
  lead: string
  /** Hero H1 (WordPress hero heading) — distinct from the plain `title`. */
  heroHeading?: string
  /** The sub-styles' (Shaker/Custom/European Kitchen) real parent service. */
  parentService?: { slug?: string | null } | null
  keyFeatures: string[]
  benefits: string[]
  processSteps: string[]
  gallery: string[]
  /** The three photos beside the hero blurbs on this service's city pages. */
  locationFeatureImages?: string[]
  introHeading?: string
  heroVideoUrl?: string
  /** Second hero image — when set, the hero renders the two-image crossfade. */
  heroImageSecondary?: string
  /** The FAQs-collection category this page's FAQ section lists (Services → FAQs & SEO). */
  faqCategoryId?: number | string
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
  /**
   * CMS photos for the overview section (stacked beside the Key Features /
   * Benefits lists). WordPress puts two in this section; falls back to the
   * hero image + first gallery shots when empty.
   */
  overviewImages?: string[]
  /** CMS-authored rich text for the "Craftsmanship That Transforms" section. */
  craftsmanship?: RichTextValue
  /**
   * The two photos in the "Craftsmanship That Transforms" section (large +
   * small overlap). Falls back to the hero image when empty.
   */
  craftsmanshipImages?: string[]
  /** Button under the craftsmanship copy (Payload-authored). */
  craftsmanshipCta?: { label?: string; href?: string }
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
  /** Hero copy for this service's city pages; a city may override any field. */
  locationHero?: {
    lede?: string
    body?: string
    formSubject?: string
    blurbs?: string[]
  }
  quote?: { heading?: string; quote?: string; attribution?: string; image?: string }
  /** Structured "Silicon Valley Loves" section content. */
  siliconValleyLoves?: {
    eyebrow?: string
    heading?: string
    body?: string
    image?: string
    stats?: Array<{ value?: string; label?: string; detail?: string; showStars?: boolean }>
    buttons?: Array<{ label: string; url: string; variant?: string }>
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
    ogImage?: PayloadMedia | number | null
  }
}

export type ServiceContentItem = { text: string }
export type ServiceContentStep = { title: string; description: string; image?: string }
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

/**
 * The three kitchen style pages live one level deeper, under
 * `/services/kitchen-remodeling/…`. The root catch-all route already treats
 * that as their canonical URL.
 */
const KITCHEN_SUBPAGE_SLUGS = [
  'european-kitchen-silicon-valley',
  'shaker-kitchen-silicon-valley',
  'custom-kitchen-silicon-valley',
]

/**
 * The canonical, redirect-free URL for a service slug.
 *
 * `/services/[serviceSlug]` 308s any slug in `servicePathAliases` to its
 * target, so linking to a raw slug meant the address bar changed under the
 * visitor: a search result for European Kitchen pointed at
 * `/services/european-kitchen` and landed on
 * `/services/european-kitchen-silicon-valley`. Callers use this instead of
 * building `/services/${slug}` by hand, so links go straight to the final
 * URL and no second slug-mapping table is needed alongside this one.
 */
export function serviceHref(slug: string) {
  const target = servicePathAliases[slug] || slug
  return KITCHEN_SUBPAGE_SLUGS.includes(target)
    ? `/services/kitchen-remodeling/${target}`
    : `/services/${target}`
}

type PayloadMedia = { url?: string | null; source_url?: string | null }
type PayloadServiceRecord = {
  title: string
  slug: string
  description?: string | null
  shortDescription?: string | null
  excerpt?: string | null
  /** The Overview section's heading; see the field's note in Services.ts. */
  introHeading?: string | null
  featuredImage?: PayloadMedia | number | null
  featured?: boolean | null
  /** Populated to a full doc at `depth: 2`; a bare id otherwise. */
  parentService?: { slug?: string | null } | number | null
  faqCategory?: { id?: number | string | null } | number | string | null
  /** Rich text overview fields (Key Features / Benefits / Process steps). */
  overview?: {
    keyFeatures?: unknown
    benefits?: unknown
    process?: unknown
    overviewImages?: Array<PayloadMedia | number> | null
  } | null
  /** Rich text for the "Craftsmanship That Transforms" section. */
  craftsmanship?: unknown
  /** Photos for the "Craftsmanship That Transforms" section (upload hasMany). */
  craftsmanshipImages?: Array<PayloadMedia | number> | null
  craftsmanshipCta?: { label?: string | null; href?: string | null } | null
  /** Rich text for the "A Client-Centered Approach to Home Remodeling" section. */
  clientApproach?: unknown
  /** Side image for the "A Client-Centered Approach" section. */
  clientApproachImage?: number | PayloadMedia | null
  galleryImages?: Array<number | PayloadMedia | null> | null
  locationFeatureImages?: Array<number | PayloadMedia | null> | null
  process?: {
    eyebrow?: string | null
    title?: string | null
    description?: string | null
    steps?: Array<{
      title?: string
      description?: string
      image?: number | PayloadMedia | null
    }> | null
  } | null
  locationHero?: {
    lede?: string | null
    body?: string | null
    formSubject?: string | null
    blurbs?: Array<{ text?: string | null }> | null
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
    stats?: Array<{
      value?: string
      label?: string
      detail?: string
      showStars?: boolean | null
    }> | null
    buttons?: Array<{ label?: string; url?: string; variant?: string | null }> | null
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
    images?: Array<{ image?: PayloadMedia | number | null }> | null
  } | null
  imageChecklist?: {
    eyebrow?: string | null
    heading?: string | null
    description?: string | null
    image?: PayloadMedia | number | null
    items?: Array<{ title?: string; description?: string | null }> | null
  } | null
  materialsShowcase?: {
    eyebrow?: string | null
    heading?: string | null
    description?: string | null
    items?: Array<{ image?: PayloadMedia | number | null; title?: string; description?: string | null }> | null
  } | null
  testimonialCards?: {
    /** Testimonials documents; populated at depth 2, a bare id otherwise. */
    testimonials?: Array<
      | number
      | { name?: string | null; quote?: string | null; image?: number | PayloadMedia | null }
    > | null
  } | null
  hero?: {
    eyebrow?: string | null
    heading?: string | null
    lead?: string | null
    image?: number | PayloadMedia | null
    imageSecondary?: number | PayloadMedia | null
    video?: number | PayloadMedia | null
    buttons?: Array<{ label?: string; url?: string }> | null
  } | null
  sections?: Array<Record<string, unknown>> | null
  sectionOrder?: Array<{ section?: string | null; enabled?: boolean | null }> | null
  seo?: ServiceDetail['seo']
  showInConsultationForm?: boolean | null
}

/** Keep already-published media relations pointed at the replacement asset
 * until the media-reference migration has run in the deployed database. */
export const normalizeMediaUrl = (url: string) => {
  const match = url.match(/Custom-Kitchen\.png([?#].*)?$/i)
  return match ? `/api/media/file/Custom-Kitchen-new.png${match[1] || ''}` : url
}

const payloadImageUrl = (value: unknown) => {
  if (typeof value !== 'object' || value === null) return undefined
  const obj = value as { url?: string | null; source_url?: string | null }
  // Prefer the file's own URL (Vercel Blob or local upload); fall back to
  // the original WordPress source URL for media that was never uploaded.
  const url = obj.url || obj.source_url
  return url ? normalizeMediaUrl(url) : undefined
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
    (await findRecord(slug)) || (normalized !== slug ? await findRecord(normalized) : undefined)
  if (!record) return undefined
  // Values every service shares, used wherever this record leaves its own
  // empty (Settings → Shared Sections → Service pages).
  const shared = await resolveSharedServiceDefaults()
  // Content comes from Payload only — no static fallback copy.
  const base = {
    slug: record.slug,
    title: record.title,
    description: record.description || record.shortDescription || '',
    image: payloadImageUrl(record.hero?.image) || '',
    eyebrow: record.hero?.eyebrow || '',
    lead: record.hero?.lead || record.description || record.shortDescription || '',
    heroVideoUrl: payloadImageUrl(record.hero?.video),
    heroImageSecondary: payloadImageUrl(record.hero?.imageSecondary),
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
    // The Overview section's own heading, now that there is a field for it.
    // Empty leaves `ServiceOverview` on its title-based fallback.
    introHeading: record.introHeading || undefined,
    heroHeading: record.hero?.heading || undefined,
    parentService:
      record.parentService && typeof record.parentService === 'object'
        ? { slug: record.parentService.slug }
        : undefined,
    // Migrated WordPress (Rank Math) SEO — services previously fell back to
    // the generated title/description because nothing mapped this through.
    seo: record.seo
      ? {
          metaTitle: record.seo.metaTitle ?? undefined,
          metaDescription: record.seo.metaDescription ?? undefined,
          canonicalUrl: record.seo.canonicalUrl ?? undefined,
          noIndex: record.seo.noIndex ?? undefined,
          ogTitle: record.seo.ogTitle ?? undefined,
          ogDescription: record.seo.ogDescription ?? undefined,
          ogImage: (record.seo.ogImage as PayloadMedia | number | null | undefined) ?? undefined,
        }
      : undefined,
    description: record.description || base.description,
    lead: record.hero?.lead || base.lead,
    // Only show a hero eyebrow when WordPress actually authored one — never
    // invent "… in Silicon Valley" or reuse the page title as an eyebrow.
    eyebrow: record.hero?.eyebrow || '',
    image: payloadImageUrl(record.hero?.image) || base.image,
    heroVideoUrl: payloadImageUrl(record.hero?.video) || base.heroVideoUrl,
    faqCategoryId:
      record.faqCategory && typeof record.faqCategory === 'object'
        ? record.faqCategory.id ?? undefined
        : record.faqCategory ?? undefined,
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
    overviewImages: (
      record.overview?.overviewImages as Array<PayloadMedia | number> | undefined | null
    )
      ?.map((image) => payloadImageUrl(image))
      .filter((url): url is string => Boolean(url)),
    craftsmanship: richTextHasContent(record.craftsmanship as RichTextValue)
      ? (record.craftsmanship as RichTextValue)
      : undefined,
    craftsmanshipImages: (
      record.craftsmanshipImages as Array<PayloadMedia | number> | undefined | null
    )
      ?.map((image) => payloadImageUrl(image))
      .filter((url): url is string => Boolean(url)),
    craftsmanshipCta: record.craftsmanshipCta
      ? {
          label: record.craftsmanshipCta.label ?? undefined,
          href: record.craftsmanshipCta.href ?? undefined,
        }
      : undefined,
    clientApproach: richTextHasContent(record.clientApproach as RichTextValue)
      ? (record.clientApproach as RichTextValue)
      : undefined,
    clientApproachImage: payloadImageUrl(record.clientApproachImage) || shared.clientApproachImage,
    // WordPress sets these on the family template (kitchen/bathroom/home), so
    // they live on the service and every city page in that family shares them.
    locationFeatureImages: record.locationFeatureImages
      ?.map(payloadImageUrl)
      .filter((url): url is string => Boolean(url)),
    gallery: record.galleryImages?.map(payloadImageUrl).filter((url): url is string => Boolean(url))
      .length
      ? (record.galleryImages?.map(payloadImageUrl).filter((url): url is string => Boolean(url)) ??
        base.gallery)
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
    locationHero: record.locationHero
      ? {
          lede: record.locationHero.lede ?? undefined,
          body: record.locationHero.body ?? undefined,
          formSubject: record.locationHero.formSubject ?? undefined,
          blurbs: record.locationHero.blurbs
            ?.map((blurb) => blurb.text)
            .filter((text): text is string => Boolean(text)),
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
            showStars: Boolean((stat as { showStars?: boolean | null }).showStars),
          })),
          buttons: record.siliconValleyLoves.buttons?.flatMap((button) =>
            button?.label && button?.url
              ? [{ label: button.label, url: button.url, variant: button.variant ?? undefined }]
              : [],
          ),
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
    areasWeService: {
      heading: record.areasWeService?.heading || shared.areasHeading,
    },
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
            image: card.image ? normalizeMediaUrl(card.image) : undefined,
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
            ?.map((item) => payloadImageUrl(item.image))
            .filter((url): url is string => Boolean(url)),
        }
      : undefined,
    imageChecklist: record.imageChecklist
      ? {
          eyebrow: record.imageChecklist.eyebrow ?? undefined,
          heading: record.imageChecklist.heading ?? undefined,
          description: record.imageChecklist.description ?? undefined,
          image: payloadImageUrl(record.imageChecklist.image),
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
            image: payloadImageUrl(item.image),
            title: item.title || '',
            description: item.description ?? undefined,
          })),
        }
      : undefined,
    testimonialCards: record.testimonialCards
      ? {
          // Linked Testimonials documents, populated at depth 2; a bare id
          // (not populated) carries nothing to show and is skipped.
          items: record.testimonialCards.testimonials
            ?.filter((item): item is Exclude<typeof item, number> => typeof item === 'object')
            .map((item) => ({
              name: item.name || '',
              quote: item.quote ?? undefined,
              avatar:
                item.image && typeof item.image === 'object'
                  ? (item.image.url ? normalizeMediaUrl(item.image.url) : undefined)
                  : undefined,
            })),
        }
      : undefined,
    sections: record.sections
      ?.filter((block): block is { blockType: string; [key: string]: unknown } =>
        Boolean(block && typeof block.blockType === 'string'),
      )
      // A free-estimate band fills its empty fields from Shared Sections.
      .map((block) =>
        block.blockType === 'cta' && block.layout === 'estimate'
          ? withSharedDefaults(block, shared.estimateBand)
          : block,
      ),
    pageSections: record.sectionOrder?.flatMap((item) =>
      item.section ? [{ section: item.section, enabled: item.enabled !== false }] : [],
    ),
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
    // Homepage card copy — the shorter WordPress one-liner.
    excerpt: record.excerpt || undefined,
    image: payloadImageUrl(record.hero?.image) || '',
    cardImage: payloadImageUrl(record.featuredImage) || undefined,
    featured: Boolean(record.featured),
    showInConsultationForm: record.showInConsultationForm ?? true,
  }))
}
