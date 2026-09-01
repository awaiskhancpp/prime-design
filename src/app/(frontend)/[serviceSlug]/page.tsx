import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { PayloadPage } from '@/components/pages/PayloadPage'
import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'
import { resolveServiceDetail, services } from '@/lib/services'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveRedirect } from '@/lib/redirects'

export function generateStaticParams() {
  return services.map((service) => ({ serviceSlug: service.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}): Promise<Metadata> {
  const { serviceSlug } = await params
  const legacyRedirect = await resolveRedirect(`/${serviceSlug}`)
  if (legacyRedirect) {
    if (legacyRedirect.statusCode === '301' || legacyRedirect.statusCode === '308') {
      permanentRedirect(legacyRedirect.newPath)
    }
    redirect(legacyRedirect.newPath)
  }

  const service = await resolveServiceDetail(serviceSlug)
  if (service) {
    return {
      title: service.seo?.metaTitle || `${service.title} | Prime Design & Build`,
      description: service.seo?.metaDescription || service.description,
      alternates: service.seo?.canonicalUrl ? { canonical: service.seo.canonicalUrl } : undefined,
      robots: service.seo?.noIndex ? { index: false, follow: false } : undefined,
    }
  }

  const page = await resolvePageBySlug(serviceSlug)
  return page
    ? {
        title: page.seo?.metaTitle || `${page.title} | Prime Design & Build`,
        description: page.seo?.metaDescription || page.hero?.description,
        alternates: page.seo?.canonicalUrl ? { canonical: page.seo.canonicalUrl } : undefined,
        robots: page.seo?.noIndex ? { index: false, follow: false } : undefined,
      }
    : {}
}

export default async function ServiceSlugRoute({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}) {
  const { serviceSlug } = await params
  const service = await resolveServiceDetail(serviceSlug)
  if (service?.pageTemplate === 'google-ads') {
    return <ServiceDetailPage service={service} />
  }
  if (service || services.some((item) => item.slug === serviceSlug)) {
    permanentRedirect(`/services/${serviceSlug}`)
  }

  const page = await resolvePageBySlug(serviceSlug)
  if (!page) notFound()
  return <PayloadPage page={page} />
}
