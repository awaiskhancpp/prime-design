import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo'

/**
 * robots.txt. The WordPress site served one via Rank Math; nothing replaced it
 * after the migration, so crawlers had no sitemap reference and no rule for
 * the Payload admin and API routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Never worth crawling: the CMS admin, the REST/GraphQL endpoints and
        // Next's internal asset routes.
        disallow: ['/admin', '/api/', '/_next/', '/my-route'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
