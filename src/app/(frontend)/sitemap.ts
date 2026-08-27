import type { MetadataRoute } from 'next'
import { services } from '@/lib/services'
import { serviceLocations } from '@/lib/serviceLocations'

const siteUrl = 'https://primedesignandbuild.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    'about',
    'services',
    'our-projects',
    'gallery',
    'faq',
    'testimonials',
    'blog',
  ].map((path) => ({
    url: `${siteUrl}/${path}`,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.7,
  }))

  const servicePages = services.map((service) => ({
    url: `${siteUrl}/services/${service.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const kitchenPages = [
    'european-kitchen-silicon-valley',
    'shaker-kitchen-silicon-valley',
    'custom-kitchen-silicon-valley',
  ].map((slug) => ({
    url: `${siteUrl}/services/kitchen-remodeling/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const locationPages = serviceLocations.map((location) => ({
    url: `${siteUrl}/${location.serviceSlug}/${location.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }))

  return [...staticPages, ...servicePages, ...kitchenPages, ...locationPages]
}
