import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'
import { resolveServiceDetail, services } from '@/lib/services'

export function generateStaticParams() {
  return services.map((service) => ({ serviceSlug: service.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ serviceSlug: string }> }): Promise<Metadata> {
  const { serviceSlug } = await params
  const service = await resolveServiceDetail(serviceSlug)
  if (!service) return {}

  return {
    title: service.seo?.metaTitle || `${service.title} | Prime Design & Build`,
    description: service.seo?.metaDescription || service.description,
    alternates: service.seo?.canonicalUrl ? { canonical: service.seo.canonicalUrl } : undefined,
    robots: service.seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}

export default async function ServiceSlugRoute({ params }: { params: Promise<{ serviceSlug: string }> }) {
  const { serviceSlug } = await params
  const service = await resolveServiceDetail(serviceSlug)
  if (!service) notFound()

  return <ServiceDetailPage service={service} />
}
