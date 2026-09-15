import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ServiceTemplate } from '@/components/services/ServiceTemplate'
import { resolveServiceDetail, servicePathAliases } from '@/lib/services'
import { buildSeoMetadata } from '@/lib/seo'

// Service pages are CMS-driven: render on each request so Payload edits
// (sections, copy, SEO) appear without a rebuild.
export const dynamic = 'force-dynamic'

// Old internal service slugs (e.g. `/services/financing`, `/services/
// home-repair-installation-services`) now redirect to their WordPress slugs.
const targetOf = (slug: string) => servicePathAliases[slug] || slug

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}): Promise<Metadata> {
  const { serviceSlug } = await params
  const service = await resolveServiceDetail(targetOf(serviceSlug))
  if (!service) return {}

  // The migrated WordPress (Rank Math) SEO drives the metadata — title,
  // description, canonical and the no-index flag.
  return buildSeoMetadata(service.seo, {
    title: service.title,
    description: service.description,
  })
}

/** `/services/[serviceSlug]` — a CMS-driven service detail page. */
export default async function ServicePage({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}) {
  const { serviceSlug } = await params
  const target = targetOf(serviceSlug)
  if (target !== serviceSlug) permanentRedirect(`/services/${target}`)
  const service = await resolveServiceDetail(target)
  if (!service) notFound()
  return <ServiceTemplate service={service} />
}
