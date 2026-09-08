import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServiceTemplate } from '@/components/services/ServiceTemplate'
import { resolveServiceDetail } from '@/lib/services'
import { serviceMetadata } from '@/lib/seo'

// Sub-service pages are CMS-driven: render on each request.
export const dynamic = 'force-dynamic'

/**
 * Kitchen style pages that live under `/services/kitchen-remodeling/...`
 * (e.g. `/services/kitchen-remodeling/european-kitchen`). Other services do
 * not use this two-level URL shape.
 */
const KITCHEN_DETAIL_SLUGS = [
  'european-kitchen',
  'shaker-kitchen',
  'custom-kitchen',
  'european-kitchen-silicon-valley',
  'shaker-kitchen-silicon-valley',
  'custom-kitchen-silicon-valley',
]

export function generateStaticParams() {
  return KITCHEN_DETAIL_SLUGS.map((pageSlug) => ({ serviceSlug: 'kitchen-remodeling', pageSlug }))
}

/** Resolve the page only when it sits under kitchen-remodeling. */
async function resolveSubService(serviceSlug: string, pageSlug: string) {
  return serviceSlug === 'kitchen-remodeling' ? await resolveServiceDetail(pageSlug) : undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string; pageSlug: string }>
}): Promise<Metadata> {
  const { serviceSlug, pageSlug } = await params
  return serviceMetadata(await resolveSubService(serviceSlug, pageSlug))
}

/** `/services/[serviceSlug]/[pageSlug]` — a sub-service detail page. */
export default async function ServiceSubpage({
  params,
}: {
  params: Promise<{ serviceSlug: string; pageSlug: string }>
}) {
  const { serviceSlug, pageSlug } = await params
  const service = await resolveSubService(serviceSlug, pageSlug)
  if (!service) notFound()
  return <ServiceTemplate service={service} />
}
