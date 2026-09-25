import React from 'react'
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'

import { JsonLd } from '@/components/seo/JsonLd'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { graph, organizationSchema, websiteSchema } from '@/lib/structuredData'
import { resolveSiteAreas, resolveSiteSettings } from '@/lib/siteSettings'

import './styles.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
})

/**
 * `metadataBase` is what turns the relative image paths used throughout the
 * CMS into the absolute URLs Open Graph and Twitter require. Without it Next
 * resolved them against the dev origin, so every social card in production
 * would have pointed at `http://localhost:3000`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s`,
  },
  description: 'Prime Design & Build — thoughtful spaces, carefully built in Silicon Valley.',
  /**
   * The WordPress site icon, at the exact sizes WordPress publishes.
   *
   * The files in `public/` are the originals, downloaded unchanged from
   * `wp-content/uploads/2023/05/cropped-Prime-Kitchens-Logo-512-×-512-px-1`
   * — the square 512px mark, which is what a favicon needs. The previous
   * value pointed at media 218 (`cropped-Prime-Kitchens-Logo-1.png`), the
   * 461×289 landscape logo: a different crop that browsers letterbox into
   * a 16px box, so the wordmark was unreadable in a tab. The square version
   * was never imported into the Media collection.
   *
   * These stay in `public/` rather than the Media collection on purpose: a
   * favicon is requested before anything else on the page, and serving it
   * through `/api/media/file/…` puts a database round-trip in front of it.
   */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32 192x192' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  other: {
    // WordPress emits this for pinned Windows tiles; mirrored here so the
    // migrated site presents the same icon set.
    'msapplication-TileImage': '/mstile-270x270.png',
  },
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: true, address: true, email: true },
}

/**
 * The document shell. Deciding which pages get the shared site chrome is
 * path-dependent, so it lives in `template.tsx` next to this file — a layout
 * is never re-rendered on client-side navigation, which made the chrome stick
 * to city and Google Ads pages until the visitor refreshed.
 *
 * The site-wide JSON-LD graph (the business node plus the WebSite node) is
 * emitted here rather than per page: it is identical everywhere, and both
 * nodes carry stable `@id` values that per-page schema references instead of
 * repeating.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, areas] = await Promise.all([resolveSiteSettings(), resolveSiteAreas()])
  const siteGraph = graph(
    organizationSchema(
      settings,
      areas.map((area) => area.name),
    ),
    websiteSchema(),
  )

  return (
    <html lang="en" className={outfit.variable}>
      <body>
        {children}
        <JsonLd data={siteGraph} />
      </body>
    </html>
  )
}
