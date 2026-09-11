import React from 'react'
import { Fraunces, Outfit } from 'next/font/google'
import { headers } from 'next/headers'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { TopBanner } from '@/components/layout/TopBanner'
import { listPublishedLandingPageSlugs } from '@/lib/landingPages'
import { resolvePageBySlug } from '@/lib/pages'
import { getServiceLocation } from '@/lib/serviceLocations'

import './styles.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata = {
  description: 'Prime Design & Build — thoughtful spaces, carefully built in Silicon Valley.',
  title: 'Prime Design & Build',
}

/**
 * Shared page chrome: TopBanner + SiteHeader at the top, LandscapingCta +
 * SiteFooter at the bottom. Every page in this group gets it EXCEPT:
 *
 *   - Google Ads landing pages (landing-pages records, and any pages
 *     collection record flagged `isGoogleAdsPage`) — they stay bare, and
 *   - service-location pages (`/[service]/[city]`) — they keep their own
 *     minimal chrome.
 */
export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-url') || ''
  const segments = pathname.split('/').filter(Boolean)

  let bare = false
  if (segments.length === 2) {
    bare = Boolean(await getServiceLocation(segments[0], segments[1]))
  } else if (segments.length === 1 && segments[0]) {
    const [landingSlugs, page] = await Promise.all([
      listPublishedLandingPageSlugs(),
      resolvePageBySlug(segments[0]),
    ])
    bare = landingSlugs.includes(segments[0]) || Boolean(page?.isGoogleAdsPage)
  }

  if (bare) {
    return (
      <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
        <body>{children}</body>
      </html>
    )
  }

  // The two light-header pages keep their existing light tone; every other
  // page opens with a dark hero the white header overlays.
  const headerTone =
    segments.length === 1 && (segments[0] === 'team' || segments[0] === 'search')
      ? 'light'
      : 'dark'

  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body>
        <TopBanner />
        <div className="relative">
          <SiteHeader tone={headerTone} />
          {children}
        </div>
        <LandscapingCta />
        <SiteFooter />
      </body>
    </html>
  )
}
