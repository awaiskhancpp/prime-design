import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getServiceDetail, type ServiceDetail } from './services'
import type { Location as PayloadLocation, Service as PayloadService, ServiceLocation as PayloadServiceLocation } from '@/payload-types'

export type Location = { name: string; slug: string }
export type ServiceLocation = {
  serviceSlug: string
  location: Location
  slug: string
  seoDescription?: string
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
  return { ...entry, service }
}

export async function getServiceLocation(serviceSlug: string, locationSlugValue: string) {
  if (!process.env.DATABASE_URL) return getFallbackServiceLocation(serviceSlug, locationSlugValue)

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
  const relatedService = typeof doc?.service === 'object' ? doc.service as PayloadService : null
  const relatedLocation = typeof doc?.location === 'object' ? doc.location as PayloadLocation : null
  if (doc && relatedService?.slug === serviceSlug && relatedLocation) {
    const baseService = getServiceDetail(relatedService.slug)
    if (!baseService) return undefined

    const city = relatedLocation.name || doc.city || 'San Jose'
    const serviceDetail = getServiceLocationDetail(baseService, city)
    const mediaUrl = (value: unknown) => typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string' ? value.url : undefined

    return {
      serviceSlug: relatedService.slug,
      location: { name: city, slug: relatedLocation.slug },
      slug: doc.slug,
      seoDescription: doc.seo?.metaDescription || relatedLocation.seo?.metaDescription || relatedLocation.seoDescription || serviceDetail.lead,
      seo: doc.seo || relatedLocation.seo || relatedService.seo,
      service: {
        ...serviceDetail,
        title: doc.heroHeading || serviceDetail.title,
        eyebrow: doc.heroHeading || serviceDetail.eyebrow,
        lead: doc.heroDescription || doc.intro || serviceDetail.lead,
        image: mediaUrl(doc.featuredImage) || mediaUrl(relatedLocation.featuredImage) || mediaUrl(relatedService.hero?.image) || serviceDetail.image,
      },
    }
  }

  // A valid Payload connection with no matching record is the only fallback case.
  return getFallbackServiceLocation(serviceSlug, locationSlugValue)
}

export function getServiceLocationDetail(service: ServiceDetail, city: string): ServiceDetail {
  return {
    ...service,
    title: `${service.title} in ${city}`,
    eyebrow: `${service.title} in ${city}`,
    lead: `Create a more functional, beautiful ${service.title.toLowerCase()} in ${city} with Prime Design & Build. Our team combines thoughtful design, quality craftsmanship, and clear communication from start to finish.`,
  }
}
