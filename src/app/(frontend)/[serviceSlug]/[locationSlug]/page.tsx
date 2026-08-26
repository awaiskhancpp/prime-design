import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ServiceLocationPage } from '@/components/services/ServiceLocationPage'
import { getServiceLocation, serviceLocations } from '@/lib/serviceLocations'

export function generateStaticParams() {
  return serviceLocations.map(({ serviceSlug, slug }) => ({ serviceSlug, locationSlug: slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string; locationSlug: string }>
}): Promise<Metadata> {
  const { serviceSlug, locationSlug } = await params
  const entry = await getServiceLocation(serviceSlug, locationSlug)
  const seo = entry && 'seo' in entry ? entry.seo : undefined
  return {
    title: seo?.metaTitle || (entry ? `${entry.service.title} | Prime Design & Build` : 'Remodeling Services | Prime Design & Build'),
    description: seo?.metaDescription || entry?.seoDescription,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: seo?.ogTitle || seo?.ogDescription
      ? { title: seo.ogTitle || undefined, description: seo.ogDescription || undefined }
      : undefined,
  }
}

export default async function ServiceLocationRoute({
  params,
}: {
  params: Promise<{ serviceSlug: string; locationSlug: string }>
}) {
  const { serviceSlug, locationSlug } = await params
  const entry = await getServiceLocation(serviceSlug, locationSlug)
  if (!entry) notFound()
  return <ServiceLocationPage entry={entry} />
}
