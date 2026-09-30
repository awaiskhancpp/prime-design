import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { resolveServiceDetail, type ServiceDetail } from './services'
import { richTextHasContent, type RichTextValue } from './richText'
import {
  inherit,
  mapDontSettle,
  mapLocationVideo,
  mapPrimeDifference,
  mapQuote,
  mapSiliconValleyLoves,
  mapTestimonialCards,
  resolveSharedCitySections,
} from './sharedSections'
import type {
  Location as PayloadLocation,
  Service as PayloadService,
  ServiceLocation as PayloadServiceLocation,
} from '@/payload-types'

export type Location = {
  name: string
  slug: string
  /** Coverage-map pin. Optional — see `SiteArea` in `lib/siteSettings`. */
  latitude?: number
  longitude?: number
}
export type ServiceLocation = {
  serviceSlug: string
  location: Location
  slug: string
  seoDescription?: string
  featuredImage?: string
  sectionOverrides?: ServiceLocationSectionOverride[]
  /** Location-page section overrides — empty = inherit from the parent service. */
  locationHero?: {
    lede?: string
    body?: string
    formSubject?: string
    blurbs?: string[]
  }
  locationVideo?: {
    eyebrow?: string
    title?: string
    description?: string
    tagline?: string
    videoUrl?: string
    poster?: string
  }
  dontSettle?: {
    eyebrow?: string
    heading?: string
    headingAccent?: string
    body?: string
    ctaLabel?: string
    image?: string
  }
  primeDifference?: {
    eyebrow?: string
    heading?: string
    /** Rich text: the WordPress paragraph emphasises a phrase inside it. */
    body?: RichTextValue
    checklist?: string[]
    /** Mapped to the section's icon/title/body card shape. */
    reasons?: Array<{ icon?: string; title: string; body?: RichTextValue }>
  }
  /** This page's own offerings section: its copy, cards and buttons. */
  offerings?: {
    heading?: string
    description?: string
    cards?: Array<{ title: string; description?: string; image?: string; href?: string }>
    primaryCta?: { label: string; href: string }
    secondaryCta?: { label: string; href: string }
  }
  quote?: {
    heading?: string
    quote?: string
    attribution?: string
    image?: string
  }
  siliconValleyLoves?: {
    eyebrow?: string
    heading?: string
    body?: string
    image?: string
    stats?: Array<{ value?: string; label?: string; detail?: string; showStars?: boolean }>
    buttons?: Array<{ label: string; url: string; variant?: string }>
  }
  testimonialCards?: {
    items?: Array<{ name: string; quote?: string; avatar?: string }>
  }
}

export type ServiceLocationSectionOverride = {
  sectionKey: string
  enabled?: boolean
  image?: string
}

export async function getServiceLocation(serviceSlug: string, locationSlugValue: string) {
  if (!process.env.DATABASE_URL) return undefined

  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'service-locations',
    where: {
      slug: {
        equals: locationSlugValue,
      },
    },
    depth: 2,
    limit: 1,
  })

  const doc = docs[0] as PayloadServiceLocation | undefined
  const relatedService = typeof doc?.service === 'object' ? (doc.service as PayloadService) : null
  const relatedLocation =
    typeof doc?.location === 'object' ? (doc.location as PayloadLocation) : null
  if (doc && relatedService?.slug === serviceSlug && relatedLocation) {
    // Payload-resolved service detail so the location page's shared
    // sections (quote, Silicon Valley Loves, testimonial cards) come from
    // the CMS, not the static fallback.
    const baseService = await resolveServiceDetail(relatedService.slug)
    if (!baseService) return undefined

    const city = relatedLocation.name || doc.city || 'San Jose'
    const serviceDetail = getServiceLocationDetail(baseService, city)
    const mediaUrl = (value: unknown) =>
      typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
        ? value.url
        : undefined

    // Map the "Location Page Sections" override groups (empty groups come
    // back as null/undefined from Payload and are left undefined so the
    // page falls back to the parent service, then the built-in template).
    const textOr = (value: string | null | undefined) =>
      typeof value === 'string' && value.trim() ? value : undefined
    /** A rich-text field, or undefined when it holds only an empty paragraph. */
    const richTextOr = (value: unknown): RichTextValue | undefined =>
      richTextHasContent(value as RichTextValue) ? (value as RichTextValue) : undefined
    /** A button, only when it has both halves — a label with no target is a
     *  dead control, and a target with no label is invisible. */
    const ctaOr = (value: { label?: string | null; href?: string | null } | null | undefined) => {
      const label = textOr(value?.label)
      const href = textOr(value?.href)
      return label && href ? { label, href } : undefined
    }
    const compact = <T extends object>(value: T) =>
      Object.values(value).some((entry) =>
        Array.isArray(entry) ? entry.length > 0 : entry !== undefined,
      )
        ? value
        : undefined
    const locationHero = compact({
      lede: textOr(doc.locationHero?.lede),
      body: textOr(doc.locationHero?.body),
      formSubject: textOr(doc.locationHero?.formSubject),
      blurbs: (doc.locationHero?.blurbs ?? [])
        .map((blurb) => textOr(blurb.text))
        .filter((text): text is string => Boolean(text)),
    })
    // Six sections resolve field by field: this city's own value, then its
    // service's (the kitchen / bathroom / home family), then the Shared
    // Sections global. See `lib/sharedSections.ts`.
    const shared = await resolveSharedCitySections()
    const serviceRaw = relatedService as unknown as Record<string, Record<string, unknown> | null>
    const locationVideo = inherit(
      mapLocationVideo(doc.locationVideo as never),
      mapLocationVideo(serviceRaw.locationVideo),
      shared.locationVideo,
    )
    const dontSettle = inherit(
      mapDontSettle(doc.dontSettle as never),
      mapDontSettle(serviceRaw.dontSettle),
      shared.dontSettle,
    )
    const primeDifference = inherit(
      mapPrimeDifference(doc.primeDifference as never),
      shared.primeDifference,
    )
    const offerings = compact({
      heading: textOr(doc.offerings?.heading),
      description: textOr(doc.offerings?.description),
      // Only cards that have a title; a card with no photo still renders,
      // because the words are the content and the image is a reference to it.
      cards: (doc.offerings?.cards ?? [])
        .filter((card) => Boolean(card.title))
        .map((card) => ({
          title: card.title as string,
          description: textOr(card.description),
          image: mediaUrl(card.image),
          href: textOr(card.href),
        })),
      primaryCta: ctaOr(doc.offerings?.primaryCta),
      secondaryCta: ctaOr(doc.offerings?.secondaryCta),
    })
    const quote = inherit(mapQuote(doc.quote as never), serviceDetail.quote, shared.quote)
    const siliconValleyLoves = inherit(
      mapSiliconValleyLoves(doc.siliconValleyLoves as never),
      serviceDetail.siliconValleyLoves,
      shared.siliconValleyLoves,
    )
    const testimonialCards = inherit(
      mapTestimonialCards(doc.testimonialCards as never),
      serviceDetail.testimonialCards,
      shared.testimonialCards,
    )
    const sectionOverrides = Array.isArray(
      (doc as unknown as { sectionOverrides?: unknown }).sectionOverrides,
    )
      ? (doc as unknown as { sectionOverrides: Array<Record<string, unknown>> }).sectionOverrides
          .map((override) => ({
            sectionKey: String(override.sectionKey || ''),
            enabled: override.enabled !== false,
            image: mediaUrl(override.image),
          }))
          .filter((override) => Boolean(override.sectionKey))
      : undefined

    return {
      serviceSlug: relatedService.slug,
      location: { name: city, slug: relatedLocation.slug },
      slug: doc.slug,
      seoDescription:
        doc.seo?.metaDescription ||
        relatedLocation.seo?.metaDescription ||
        relatedLocation.seoDescription ||
        serviceDetail.lead,
      // The city page's own SEO only. Every one of the 45 records carries a
      // title, description and canonical of its own; the old
      // `doc.seo || location.seo || service.seo` never fell through anyway
      // (Payload returns the group as an object even when it is empty), and
      // inheriting would hand a city page the service's canonical URL.
      seo: doc.seo,
      featuredImage: mediaUrl(doc.featuredImage),
      sectionOverrides,
      locationHero,
      locationVideo,
      dontSettle,
      primeDifference,
      offerings,
      quote,
      siliconValleyLoves,
      testimonialCards,
      service: {
        ...serviceDetail,
        image:
          mediaUrl(doc.featuredImage) ||
          mediaUrl(relatedLocation.featuredImage) ||
          mediaUrl(relatedService.hero?.image) ||
          serviceDetail.image,
      },
    }
  }

  // No matching Payload record — the location page does not exist.
  return undefined
}

export function getServiceLocationDetail(service: ServiceDetail, city: string): ServiceDetail {
  return {
    ...service,
    // Keep the plain service title — consumers that need "… in {City}"
    // (hero H1, metadata) add the city themselves; appending it here made
    // every downstream use read "… in Campbell in Campbell".
    eyebrow: `${service.title} in ${city}`,
    // Lead copy comes from Payload — no generated fallback text.
  }
}
