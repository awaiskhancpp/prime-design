import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServiceTemplate } from '@/components/services/ServiceTemplate'
import { resolveServiceDetail } from '@/lib/services'

const kitchenDetails = [
  'european-kitchen-silicon-valley',
  'shaker-kitchen-silicon-valley',
  'custom-kitchen-silicon-valley',
]

export function generateStaticParams() {
  return kitchenDetails.map((pageSlug) => ({ serviceSlug: 'kitchen-remodeling', pageSlug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string; pageSlug: string }>
}): Promise<Metadata> {
  const { serviceSlug, pageSlug } = await params
  const service =
    serviceSlug === 'kitchen-remodeling' ? await resolveServiceDetail(pageSlug) : undefined
  if (!service) return {}
  return {
    title: service.seo?.metaTitle || `${service.title} | Prime Design & Build`,
    description: service.seo?.metaDescription || service.description,
  }
}

export default async function ServiceSubpage({
  params,
}: {
  params: Promise<{ serviceSlug: string; pageSlug: string }>
}) {
  const { serviceSlug, pageSlug } = await params
  const service =
    serviceSlug === 'kitchen-remodeling' ? await resolveServiceDetail(pageSlug) : undefined
  if (!service) notFound()
  return <ServiceTemplate service={service} />
}
