import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServiceTemplate } from '@/components/services/ServiceTemplate'
import { resolveServiceDetail, services } from '@/lib/services'

// Service pages are CMS-driven: render on each request so Payload edits
// (sections, copy, SEO) appear without a rebuild.
export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return services.map((service) => ({ serviceSlug: service.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}): Promise<Metadata> {
  const { serviceSlug } = await params
  const service = await resolveServiceDetail(serviceSlug)
  if (!service) return {}
  return {
    title: service.seo?.metaTitle || `${service.title} | Prime Design & Build`,
    description: service.seo?.metaDescription || service.description,
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}) {
  const { serviceSlug } = await params
  const service = await resolveServiceDetail(serviceSlug)
  if (!service) notFound()
  return <ServiceTemplate service={service} />
}
