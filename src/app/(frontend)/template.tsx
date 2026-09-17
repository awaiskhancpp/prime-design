import React from 'react'
import { headers } from 'next/headers'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { TopBanner } from '@/components/layout/TopBanner'
import { listPublishedLandingPageSlugs } from '@/lib/landingPages'
import { resolvePageBySlug } from '@/lib/pages'
import { getServiceLocation } from '@/lib/serviceLocations'

/**
 * Shared page chrome: TopBanner + SiteHeader at the top, LandscapingCta +
 * SiteFooter at the bottom. Every page in this group gets it EXCEPT:
 *
 *   - Google Ads landing pages (landing-pages records, and any pages
 *     collection record flagged `isGoogleAdsPage`) — they stay bare, and
 *   - service-location pages (`/[service]/[city]`) — they keep their own
 *     minimal chrome.
 *
 * This lives in `template.tsx`, NOT `layout.tsx`, and that is the whole point.
 * A root layout renders once and then persists for the lifetime of the tab:
 * React reuses it across client-side navigations and never re-runs it, so the
 * `headers()` lookup below kept returning the pathname of whichever page was
 * loaded first. Clicking through to a city or Google Ads page therefore
 * carried the previous page's chrome along with it, and only a hard refresh —
 * which re-runs the layout on the server — cleared it.
 *
 * A template is re-rendered on every navigation, so the branch is re-evaluated
 * against the real destination path each time. The trade-off is that the
 * chrome remounts per navigation instead of persisting; that is acceptable
 * here because the decision is data-dependent (is this slug a landing page? a
 * service-location?) and cannot be expressed as a static route group — the
 * same dynamic routes serve both bare and chromed pages.
 */
export default async function FrontendTemplate({ children }: { children: React.ReactNode }) {
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

  if (bare) return <>{children}</>

  // The two light-header pages keep their existing light tone; every other
  // page opens with a dark hero the white header overlays.
  const headerTone =
    segments.length === 1 && (segments[0] === 'team' || segments[0] === 'search')
      ? 'light'
      : 'dark'

  return (
    <>
      <TopBanner />
      <div className="relative">
        <SiteHeader tone={headerTone} />
        {children}
      </div>
      <LandscapingCta />
      <SiteFooter />
    </>
  )
}
