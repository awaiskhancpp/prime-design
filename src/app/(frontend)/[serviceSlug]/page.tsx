import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { PayloadPage } from '@/components/pages/PayloadPage'
import { LandingPageRenderer } from '@/components/landing/LandingPageRenderer'
import { ServiceTemplate } from '@/components/services/ServiceTemplate'
import { getServiceDetailForPath, servicePathAliases, services } from '@/lib/services'
import { listLandingPageSlugs, resolveLandingPage } from '@/lib/landingPages'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveRedirect } from '@/lib/redirects'

export function generateStaticParams() {
  return [
    ...services.map((service) => ({ serviceSlug: service.slug })),
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
  const legacyRedirect = await resolveRedirect(`/${serviceSlug}`)
  if (legacyRedirect) {
    if (legacyRedirect.statusCode === '301' || legacyRedirect.statusCode === '308') {
      permanentRedirect(legacyRedirect.newPath)
    }
    redirect(legacyRedirect.newPath)
  }

  const service = await getServiceDetailForPath(serviceSlug)
  if (service) {
    return {
      title: service.seo?.metaTitle || `${service.title} | Prime Design & Build`,
      description: service.seo?.metaDescription || service.description,
      alternates: service.seo?.canonicalUrl ? { canonical: service.seo.canonicalUrl } : undefined,
      robots: service.seo?.noIndex ? { index: false, follow: false } : undefined,
    }
  }

  const landingPage = await resolveLandingPage(serviceSlug)
  if (landingPage) {
    return {
      title: landingPage.seo?.metaTitle || `${landingPage.title} | Prime Design & Build`,
      description: landingPage.seo?.metaDescription || landingPage.hero?.lead,
      alternates: landingPage.seo?.canonicalUrl
        ? { canonical: landingPage.seo.canonicalUrl }
        : undefined,
      robots: landingPage.seo?.noIndex ? { index: false, follow: false } : undefined,
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
  const service = await getServiceDetailForPath(serviceSlug)
  if (servicePathAliases[serviceSlug]) {
    if (!service) notFound()
    return <ServiceTemplate service={service} />
  }
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
