import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getServiceDetail, resolveServiceDetail, type ServiceDetail } from './services'
import type {
  Location as PayloadLocation,
  Service as PayloadService,
  ServiceLocation as PayloadServiceLocation,
} from '@/payload-types'
import { shouldUseLocalFallback } from './runtime'

export type Location = { name: string; slug: string }
export type ServiceLocation = {
  serviceSlug: string
  location: Location
  slug: string
  seoDescription?: string
  heroHeading?: string
  heroDescription?: string
  intro?: string
  featuredImage?: string
  sectionOverrides?: ServiceLocationSectionOverride[]
  /** Location-page section overrides — empty = inherit from the parent service. */
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
  }
  primeDifference?: {
    eyebrow?: string
    heading?: string
    body?: string
    checklist?: string[]
    /** Mapped to the section's icon/title/body card shape. */
    reasons?: Array<{ icon?: string; title: string; body?: string }>
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
    stats?: Array<{ value?: string; label?: string; detail?: string }>
  }
  testimonialCards?: {
    items?: Array<{ name: string; quote?: string; avatar?: string }>
  }
}

export type ServiceLocationSectionOverride = {
  sectionKey: string
  enabled?: boolean
  heading?: string
  body?: string
  image?: string
  videoUrl?: string
}

export const serviceLocationCities = [
  'Campbell',
  'Cupertino',
  'Fremont',
  'Los Altos',
  'Los Gatos',
  'Menlo Park',
  'Milpitas',
  'Mountain View',
  'Palo Alto',
  'Redwood City',
  'San Jose',
  'Santa Clara',
  'Saratoga',
  'Silicon Valley',
  'Sunnyvale',
]

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
const locationSlug = (serviceSlug: string, city: string) => `${serviceSlug}-in-${slugify(city)}`

export const serviceLocations: ServiceLocation[] = [
  'kitchen-remodeling',
  'bathroom-remodeling',
  'home-remodeling',
  'adu',
  'additions',
  'complete-renovation',
  'european-kitchen',
  'custom-kitchen',
  'shaker-kitchen',
].flatMap((serviceSlug) =>
  serviceLocationCities.map((name) => ({
    serviceSlug,
    location: { name, slug: slugify(name) },
    slug: locationSlug(serviceSlug, name),
    seoDescription: `${serviceSlug.replaceAll('-', ' ')} in ${name} by Prime Design & Build.`,
  })),
)

export function getFallbackServiceLocation(serviceSlug: string, locationSlugValue: string) {
  const entry = serviceLocations.find(
    (item) => item.serviceSlug === serviceSlug && item.slug === locationSlugValue,
  )
  if (!entry) return undefined
  const service = getServiceDetail(serviceSlug)
  if (!service) return undefined
  return { ...entry, service: getServiceLocationDetail(service, entry.location.name) }
}

export async function getServiceLocation(serviceSlug: string, locationSlugValue: string) {
  if (!process.env.DATABASE_URL) {
    return shouldUseLocalFallback()
      ? getFallbackServiceLocation(serviceSlug, locationSlugValue)
      : undefined
  }

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
    const compact = <T extends object>(value: T) =>
      Object.values(value).some((entry) =>
        Array.isArray(entry) ? entry.length > 0 : entry !== undefined,
      )
        ? value
        : undefined
    const locationVideo = compact({
      eyebrow: textOr(doc.locationVideo?.eyebrow),
      title: textOr(doc.locationVideo?.title),
      description: textOr(doc.locationVideo?.description),
      tagline: textOr(doc.locationVideo?.tagline),
      videoUrl: textOr(doc.locationVideo?.videoUrl),
      poster: textOr(doc.locationVideo?.poster),
    })
    const dontSettle = compact({
      eyebrow: textOr(doc.dontSettle?.eyebrow),
      heading: textOr(doc.dontSettle?.heading),
      headingAccent: textOr(doc.dontSettle?.headingAccent),
      body: textOr(doc.dontSettle?.body),
      ctaLabel: textOr(doc.dontSettle?.ctaLabel),
    })
    const primeDifference = compact({
      eyebrow: textOr(doc.primeDifference?.eyebrow),
      heading: textOr(doc.primeDifference?.heading),
      body: textOr(doc.primeDifference?.body),
      checklist: (doc.primeDifference?.checklist ?? [])
        .map((item) => textOr(item.text))
        .filter((item): item is string => Boolean(item)),
      reasons: (doc.primeDifference?.reasons ?? [])
        .filter((reason) => Boolean(reason.title))
        .map((reason) => ({
          icon: reason.image ?? undefined,
          title: reason.title,
          body: textOr(reason.description),
        })),
    })
    const quote = compact({
      heading: textOr(doc.quote?.heading),
      quote: textOr(doc.quote?.quote),
      attribution: textOr(doc.quote?.attribution),
      image: textOr(doc.quote?.image),
    })
    const siliconValleyLoves = compact({
      eyebrow: textOr(doc.siliconValleyLoves?.eyebrow),
      heading: textOr(doc.siliconValleyLoves?.heading),
      body: textOr(doc.siliconValleyLoves?.body),
      image: textOr(doc.siliconValleyLoves?.image),
      stats: (doc.siliconValleyLoves?.stats ?? [])
        .map((stat) => ({
          value: textOr(stat.value),
          label: textOr(stat.label),
          detail: textOr(stat.detail),
        }))
        .filter((stat) => Boolean(stat.value || stat.label || stat.detail)),
    })
    const testimonialCards = compact({
      items: (doc.testimonialCards?.items ?? [])
        .filter((item) => Boolean(item.name))
        .map((item) => ({
          name: item.name,
          quote: textOr(item.quote),
          avatar: textOr(item.avatar),
        })),
    })
    const sectionOverrides = Array.isArray((doc as unknown as { sectionOverrides?: unknown }).sectionOverrides)
      ? ((doc as unknown as { sectionOverrides: Array<Record<string, unknown>> }).sectionOverrides)
          .map((override) => ({
            sectionKey: String(override.sectionKey || ''),
            enabled: override.enabled !== false,
            heading: typeof override.heading === 'string' ? override.heading : undefined,
            body: typeof override.body === 'string' ? override.body : undefined,
            image: mediaUrl(override.image),
            videoUrl: typeof override.videoUrl === 'string' ? override.videoUrl : undefined,
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
      seo: doc.seo || relatedLocation.seo || relatedService.seo,
      heroHeading: doc.heroHeading || undefined,
      heroDescription: doc.heroDescription || undefined,
      intro: doc.intro || undefined,
      featuredImage: mediaUrl(doc.featuredImage),
      sectionOverrides,
      locationVideo,
      dontSettle,
      primeDifference,
      quote,
      siliconValleyLoves,
      testimonialCards,
      service: {
        ...serviceDetail,
        title: doc.heroHeading || serviceDetail.title,
        eyebrow: doc.heroHeading || serviceDetail.eyebrow,
        lead: doc.heroDescription || doc.intro || serviceDetail.lead,
        image:
          mediaUrl(doc.featuredImage) ||
          mediaUrl(relatedLocation.featuredImage) ||
          mediaUrl(relatedService.hero?.image) ||
          serviceDetail.image,
      },
    }
  }

  // A valid Payload connection with no matching record is the only fallback case.
  return shouldUseLocalFallback()
    ? getFallbackServiceLocation(serviceSlug, locationSlugValue)
    : undefined
}

export function getServiceLocationDetail(service: ServiceDetail, city: string): ServiceDetail {
  return {
    ...service,
    title: `${service.title} in ${city}`,
    eyebrow: `${service.title} in ${city}`,
    lead: `Create a more functional, beautiful ${service.title.toLowerCase()} in ${city} with Prime Design & Build. Our team combines thoughtful design, quality craftsmanship, and clear communication from start to finish.`,
  }
}
