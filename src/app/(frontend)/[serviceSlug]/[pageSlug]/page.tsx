import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ServiceLocationPage } from '@/components/services/ServiceLocationPage'
import { resolveServiceDetail } from '@/lib/services'
import { getServiceLocation, serviceLocations } from '@/lib/serviceLocations'
import { resolveRedirect } from '@/lib/redirects'
import { buildSeoMetadata, serviceMetadata } from '@/lib/seo'

/**
 * `/[serviceSlug]/[pageSlug]` — second-level routes, resolved in order:
 *
 *   1. legacy WordPress redirects (permanent),
 *   2. service-location pages (e.g. `/kitchen-remodeling/san-jose`),
 *   3. kitchen style sub-pages, which redirect to their canonical
 *      `/services/kitchen-remodeling/[pageSlug]` URL,
 *   4. 404.
 *
 * Service-location pages are CMS-driven: render on each request so Payload
 * edits (SEO, featured image, section overrides) appear without a rebuild.
 */
export const dynamic = 'force-dynamic'

/** Kitchen style pages that also resolve at the root two-level path. */
const KITCHEN_DETAIL_SLUGS = [
  'european-kitchen-silicon-valley',
  'shaker-kitchen-silicon-valley',
  'custom-kitchen-silicon-valley',
]

export function generateStaticParams() {
  const locations = serviceLocations.map(({ serviceSlug, slug }) => ({
    serviceSlug,
    pageSlug: slug,
  }))
  const kitchenDetails = KITCHEN_DETAIL_SLUGS.map((pageSlug) => ({
    serviceSlug: 'kitchen-remodeling',
    pageSlug,
  }))
  return [...locations, ...kitchenDetails]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string; pageSlug: string }>
}): Promise<Metadata> {
  const { serviceSlug, pageSlug } = await params

  const legacyRedirect = await resolveRedirect(`/${serviceSlug}/${pageSlug}`)
  if (legacyRedirect) permanentRedirect(legacyRedirect.newPath)

  const location = await getServiceLocation(serviceSlug, pageSlug)
  if (location) {
    const seo = 'seo' in location ? location.seo : undefined
    return buildSeoMetadata(seo, {
      title: `${location.service.title} in ${location.location.name}`,
      description: location.seoDescription,
    })
  }

  return serviceMetadata(await resolveServiceDetail(pageSlug))
}

export default async function ServiceChildRoute({
  params,
}: {
  params: Promise<{ serviceSlug: string; pageSlug: string }>
}) {
  const { serviceSlug, pageSlug } = await params

  // 1. Service-location page (e.g. `/bathroom-remodeling/palo-alto`).
  const location = await getServiceLocation(serviceSlug, pageSlug)
  if (location) return <ServiceLocationPage entry={location} />

  // 2. Kitchen style sub-page — redirect to its canonical URL.
  const service = await resolveServiceDetail(pageSlug)
  if (!service || serviceSlug !== 'kitchen-remodeling') notFound()
  permanentRedirect(`/services/${serviceSlug}/${pageSlug}`)
}
