import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { PayloadPage } from '@/components/pages/PayloadPage'
import { LandingPageRenderer } from '@/components/landing/LandingPageRenderer'
import { resolveServiceDetail, servicePathAliases } from '@/lib/services'
import { listLandingPageSlugs, resolveLandingPage } from '@/lib/landingPages'
import { resolvePageBySlug } from '@/lib/pages'
import { buildSeoMetadata } from '@/lib/seo'

/**
 * `/[serviceSlug]` — the catch-all root route for top-level pages. It
 * resolves, in order (Redirects-collection rules are applied before any
 * route, in `src/proxy.ts`):
 *
 *   1. services and service path aliases (aliases render here; canonical
 *      service slugs redirect to `/services/[serviceSlug]`),
 *   2. landing pages (from Payload, rendered on demand),
 *   3. generic Payload pages,
 *   4. 404.
 *
 * Landing pages and generic pages are CMS-driven: rendered on every request,
 * like their `/[serviceSlug]/[pageSlug]` sibling, so a Payload edit — or a
 * brand-new record, such as a page created after the app was built — appears
 * without a rebuild. Without this, an unknown slug like a newly-created page
 * renders once on demand and is then cached indefinitely (Next's default for
 * a route that touches no dynamic API), so every edit after that first hit is
 * invisible until the next deploy.
 */
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export function generateStaticParams() {
  return [
    ...listLandingPageSlugs().map((serviceSlug) => ({ serviceSlug })),
    ...Object.keys(servicePathAliases).map((serviceSlug) => ({ serviceSlug })),
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}): Promise<Metadata> {
  const { serviceSlug } = await params

  // Alias service paths (e.g. `/finance`, `/comprehensive-…`) resolve against
  // the CMS first, exactly like their canonical `/services/…` twins, so the
  // imported hero/SEO from WordPress drives the metadata.
  const aliasTarget = servicePathAliases[serviceSlug]
  const service = await resolveServiceDetail(aliasTarget || serviceSlug)
  if (service) {
    // Alias URLs point their canonical at the `/services/…` twin so the two
    // paths are not indexed as duplicates.
    return buildSeoMetadata(
      service.seo,
      { title: service.title, description: service.description },
      { path: `/services/${aliasTarget || serviceSlug}`, image: service.image },
    )
  }

  const landingPage = await resolveLandingPage(serviceSlug)
  if (landingPage) {
    return buildSeoMetadata(
      landingPage.seo,
      { title: landingPage.title, description: landingPage.hero?.lead },
      { path: `/${serviceSlug}` },
    )
  }

  const page = await resolvePageBySlug(serviceSlug)
  return page
    ? buildSeoMetadata(
        page.seo,
        { title: page.title, description: page.hero?.description },
        { path: `/${serviceSlug}` },
      )
    : {}
}

export default async function ServiceSlugRoute({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}) {
  const { serviceSlug } = await params

  // Service path aliases (WordPress-era URLs like `/finance` and
  // `/comprehensive-…`) all live under `/services/...` as real service pages,
  // so redirect them to their canonical service URL instead of rendering a
  // duplicate copy at the root.
  const aliasTarget = servicePathAliases[serviceSlug]
  if (aliasTarget) {
    const kitchenSubPages = [
      'european-kitchen-silicon-valley',
      'custom-kitchen-silicon-valley',
      'shaker-kitchen-silicon-valley',
    ]
    const canonical = kitchenSubPages.includes(aliasTarget)
      ? `/services/kitchen-remodeling/${aliasTarget}`
      : `/services/${aliasTarget}`
    permanentRedirect(canonical)
  }

  const service = await resolveServiceDetail(serviceSlug)
  // Canonical service slugs live under /services/... — redirect there.
  if (service) {
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
