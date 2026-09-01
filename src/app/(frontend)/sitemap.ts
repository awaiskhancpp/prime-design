import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { services } from '@/lib/services'
import { serviceLocations } from '@/lib/serviceLocations'
import { shouldUseLocalFallback } from '@/lib/runtime'
import { blogPosts } from '@/lib/blog'
import { projects } from '@/lib/projects'

const siteUrl = 'https://primedesignandbuild.com'

type SitemapRecord = {
  slug?: string | null
  service?: { slug?: string | null } | number | null
  location?: { slug?: string | null } | number | null
  seo?: { noIndex?: boolean | null } | null
}

const entry = (url: string, priority: number): MetadataRoute.Sitemap[number] => ({
  url,
  changeFrequency: 'monthly',
  priority,
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '',
    'about',
    'services',
    'our-projects',
    'gallery',
    'faq',
    'testimonials',
    'blog',
    'contact',
  ].map((path) => entry(`${siteUrl}/${path}`, path === '' ? 1 : 0.7))

  let servicePages = services.map((service) => entry(`${siteUrl}/services/${service.slug}`, 0.8))

  const kitchenPages = [
    'european-kitchen-silicon-valley',
    'shaker-kitchen-silicon-valley',
    'custom-kitchen-silicon-valley',
  ].map((slug) => entry(`${siteUrl}/services/kitchen-remodeling/${slug}`, 0.75))

  let locationPages = serviceLocations.map((location) =>
    entry(`${siteUrl}/services/${location.serviceSlug}/${location.slug}`, 0.65),
  )

  if (process.env.DATABASE_URL) {
    const payload = await getPayload({ config: configPromise })
    const [payloadServices, payloadLocations, payloadPages, payloadPosts, payloadProjects] =
      await Promise.all([
        payload.find({ collection: 'services', depth: 1, limit: 100 }),
        payload.find({ collection: 'service-locations', depth: 2, limit: 200 }),
        payload.find({ collection: 'pages', depth: 0, limit: 200 }),
        payload.find({ collection: 'blog', depth: 0, limit: 200 }),
        payload.find({ collection: 'projects', depth: 0, limit: 200 }),
      ])
    const cmsServices = (payloadServices.docs as unknown as SitemapRecord[])
      .filter((record) => record.seo?.noIndex !== true && record.slug)
      .map((record) => entry(`${siteUrl}/services/${record.slug}`, 0.8))
    const cmsLocations = (payloadLocations.docs as unknown as SitemapRecord[]).flatMap((record) => {
      const service = typeof record.service === 'object' ? record.service?.slug : undefined
      const location = typeof record.location === 'object' ? record.location?.slug : undefined
      return record.seo?.noIndex !== true && record.slug && service && location
        ? [entry(`${siteUrl}/services/${service}/${record.slug}`, 0.65)]
        : []
    })
    if (cmsServices.length || !shouldUseLocalFallback()) servicePages = cmsServices
    if (cmsLocations.length || !shouldUseLocalFallback()) locationPages = cmsLocations

    const cmsPages = (payloadPages.docs as unknown as SitemapRecord[])
      .filter((record) => record.seo?.noIndex !== true && record.slug)
      .map((record) => entry(`${siteUrl}/${record.slug}`, 0.7))
    const cmsPosts = (payloadPosts.docs as unknown as SitemapRecord[])
      .filter((record) => record.seo?.noIndex !== true && record.slug)
      .map((record) => entry(`${siteUrl}/blog/${record.slug}`, 0.6))
    const cmsProjects = (payloadProjects.docs as unknown as SitemapRecord[])
      .filter((record) => record.seo?.noIndex !== true && record.slug)
      .map((record) => entry(`${siteUrl}/our-projects/${record.slug}`, 0.6))

    if (cmsPages.length || !shouldUseLocalFallback()) staticPages.push(...cmsPages)
    if (cmsPosts.length || !shouldUseLocalFallback()) {
      const postEntries = cmsPosts.length
        ? cmsPosts
        : blogPosts.map((post) => entry(`${siteUrl}/blog/${post.slug}`, 0.6))
      staticPages.push(...postEntries)
    }
    if (cmsProjects.length || !shouldUseLocalFallback()) {
      const projectEntries = cmsProjects.length
        ? cmsProjects
        : projects.map((project) => entry(`${siteUrl}/our-projects/${project.slug}`, 0.6))
      staticPages.push(...projectEntries)
    }
  }

  return [...staticPages, ...servicePages, ...kitchenPages, ...locationPages]
}
