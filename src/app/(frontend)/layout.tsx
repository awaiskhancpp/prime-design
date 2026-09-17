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
