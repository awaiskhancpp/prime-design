import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { WordPressPageShell } from '@/components/pages/WordPressPageShell'
import { resolveServiceDetail, services } from '@/lib/services'
import { getWordPressPage, wordpressPages } from '@/lib/wordpressPages'

export function generateStaticParams() {
  return [
    ...services.map((service) => ({ serviceSlug: service.slug })),
    ...wordpressPages.map((page) => ({ serviceSlug: page.slug })),
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}): Promise<Metadata> {
  const { serviceSlug } = await params
  const service = await resolveServiceDetail(serviceSlug)
  if (!service) {
    const page = getWordPressPage(serviceSlug)
    return page
      ? {
          title: page.seoTitle || `${page.title} | Prime Design & Build`,
          description: page.seoDescription,
        }
      : {}
  }

  return {
    title: service.seo?.metaTitle || `${service.title} | Prime Design & Build`,
    description: service.seo?.metaDescription || service.description,
    alternates: service.seo?.canonicalUrl ? { canonical: service.seo.canonicalUrl } : undefined,
    robots: service.seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}

export default async function ServiceSlugRoute({
  params,
}: {
  params: Promise<{ serviceSlug: string }>
}) {
  const { serviceSlug } = await params
  if (services.some((service) => service.slug === serviceSlug)) {
    redirect(`/services/${serviceSlug}`)
  }

  const page = getWordPressPage(serviceSlug)
  if (!page) notFound()
  return <WordPressPageShell page={page} />
}
