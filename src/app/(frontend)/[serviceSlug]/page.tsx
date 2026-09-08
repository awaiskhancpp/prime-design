import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { PayloadPage } from '@/components/pages/PayloadPage'
import { LandingPageRenderer } from '@/components/landing/LandingPageRenderer'
import { ServiceTemplate } from '@/components/services/ServiceTemplate'
import { getServiceDetailForPath, servicePathAliases, services } from '@/lib/services'
import { listLandingPageSlugs, resolveLandingPage } from '@/lib/landingPages'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveRedirect } from '@/lib/redirects'
import { buildSeoMetadata } from '@/lib/seo'

/**
 * `/[serviceSlug]` — the catch-all root route for top-level pages. It
 * resolves, in order:
 *
 *   1. legacy WordPress redirects (301/308 → permanent, else temporary),
 *   2. services and service path aliases (aliases render here; canonical
 *      service slugs redirect to `/services/[serviceSlug]`),
 *   3. landing pages (from Payload, rendered on demand),
 *   4. generic Payload pages,
 *   5. 404.
 *
 * Landing pages created in Payload are rendered on demand even when their
 * slugs were not known when the application was built.
 */
export const dynamicParams = true

export function generateStaticParams() {
  return [
    ...services.map((service) => ({ serviceSlug: service.slug })),
    ...listLandingPageSlugs().map((serviceSlug) => ({ serviceSlug })),
    ...Object.keys(servicePathAliases).map((serviceSlug) => ({ serviceSlug })),
  ]
}

/**
 * Apply a legacy redirect if one matches the path: permanent status codes
 * issue a 301/308, everything else a temporary redirect.
 */
async function applyLegacyRedirect(path: string) {
  const legacyRedirect = await resolveRedirect(path)
  if (!legacyRedirect) return
  if (legacyRedirect.statusCode === '301' || legacyRedirect.statusCode === '308') {
    permanentRedirect(legacyRedirect.newPath)
  }
  redirect(legacyRedirect.newPath)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}): Promise<Metadata> {
  const { serviceSlug } = await params
  await applyLegacyRedirect(`/${serviceSlug}`)

  const service = await getServiceDetailForPath(serviceSlug)
  if (service) {
    return buildSeoMetadata(service.seo, {
      title: service.title,
      description: service.description,
    })
  }

  const landingPage = await resolveLandingPage(serviceSlug)
  if (landingPage) {
    return buildSeoMetadata(landingPage.seo, {
      title: landingPage.title,
      description: landingPage.hero?.lead,
    })
  }

  const page = await resolvePageBySlug(serviceSlug)
  return page
    ? buildSeoMetadata(page.seo, { title: page.title, description: page.hero?.description })
    : {}
}

export default async function ServiceSlugRoute({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}) {
  const { serviceSlug } = await params
  const service = await getServiceDetailForPath(serviceSlug)

  // Aliased service paths render the service page here, at their own URL.
  if (servicePathAliases[serviceSlug]) {
    if (!service) notFound()
    return <ServiceTemplate service={service} />
  }
  // Canonical service slugs live under /services/... — redirect there.
  if (service || services.some((item) => item.slug === serviceSlug)) {
    permanentRedirect(`/services/${serviceSlug}`)
  }

  const landingPage = await resolveLandingPage(serviceSlug)
  if (landingPage) {
    return <LandingPageRenderer page={landingPage} />
  }

  const page = await resolvePageBySlug(serviceSlug)
  if (!page) notFound()
  return <PayloadPage page={page} />
}
