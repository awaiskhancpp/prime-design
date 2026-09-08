import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ServiceLocationPage } from '@/components/services/ServiceLocationPage'
import { resolveServiceDetail } from '@/lib/services'
import { getServiceLocation, serviceLocations } from '@/lib/serviceLocations'
import { resolveRedirect } from '@/lib/redirects'

// Service-location pages are CMS-driven: render on each request so Payload
// edits (SEO, featured image, section overrides) appear without a rebuild.
export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  const locations = serviceLocations.map(({ serviceSlug, slug }) => ({
    serviceSlug,
    pageSlug: slug,
  }))
  const detailSlugs = [
    'european-kitchen-silicon-valley',
    'shaker-kitchen-silicon-valley',
    'custom-kitchen-silicon-valley',
  ].map((pageSlug) => ({ serviceSlug: 'kitchen-remodeling', pageSlug }))

  return [...locations, ...detailSlugs]
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
    return {
      title:
        seo?.metaTitle ||
        `${location.service.title} in ${location.location.name} | Prime Design & Build`,
      description: seo?.metaDescription || location.seoDescription,
      alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
      robots: seo?.noIndex ? { index: false, follow: false } : undefined,
    }
  }

  const service = await resolveServiceDetail(pageSlug)
  return service
    ? {
        title: service.seo?.metaTitle || `${service.title} | Prime Design & Build`,
        description: service.seo?.metaDescription || service.description,
      }
    : {}
}

export default async function ServiceChildRoute({
  params,
}: {
  params: Promise<{ serviceSlug: string; pageSlug: string }>
}) {
  const { serviceSlug, pageSlug } = await params
  const location = await getServiceLocation(serviceSlug, pageSlug)
  if (location) return <ServiceLocationPage entry={location} />

  const service = await resolveServiceDetail(pageSlug)
  if (!service || serviceSlug !== 'kitchen-remodeling') notFound()
  permanentRedirect(`/services/${serviceSlug}/${pageSlug}`)
}
