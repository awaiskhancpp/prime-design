import React from 'react'
import { headers } from 'next/headers'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandingHeader } from '@/components/landing/LandingHeader'
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
 *     collection record flagged `isGoogleAdsPage`) — they get the slim
 *     `LandingHeader` (call / get-a-quote) instead, and
 *   - service-location pages (`/[service]/[city]`) — they stay truly bare
 *     with their own minimal chrome.
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
 *
 * This is the ONLY place the chrome is rendered. A page component must never
 * render its own `SiteHeader`/`LandscapingCta`/`SiteFooter`: `PayloadPage` did
 * exactly that for Google Ads pages, handing back the very chrome this file
 * had just withheld from them.
 *
 * The whole decision rests on `x-pathname`, set by `src/proxy.ts`. If that
 * header ever goes missing the pathname is empty, no branch matches, `bare`
 * stays false and every landing and service-location page silently grows the
 * chrome back. That is a failure worth shouting about rather than absorbing,
 * so it is logged below instead of being quietly treated as a normal page.
 */
export default async function FrontendTemplate({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-url') || ''
  const segments = pathname.split('/').filter(Boolean)

  if (!pathname) {
    // Not recoverable here — without a path there is nothing to look up — but
    // it must not be silent. Every bare page is about to be given the chrome.
    console.error(
      '[FrontendTemplate] no `x-pathname` header on this request, so no page can be ' +
        'identified as a Google Ads landing page or a service-location page, and all of ' +
        'them will render the shared chrome. Check that src/proxy.ts is running and that ' +
        'its matcher covers this path.',
    )
  }

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
    // Google Ads landing pages keep a slim, conversion-only header — the two
    // actions an ad visitor takes (call / get a quote) — over their dark hero.
    // Service-location pages (`segments.length === 2`) stay truly bare.
    return (
      <div className="relative">
        {segments.length === 1 ? <LandingHeader /> : null}
        {children}
      </div>
    )
  }

  // Pages that open on a white hero need the ink header; every other page
  // opens with a dark hero that the white header overlays. `thank-you` joined
  // this list when its hero moved to `UtilityHero`, which is white — the
  // desktop header is `text-white` in the dark tone and would have been
  // invisible against it.
  //
  // `not-found` is deliberately NOT in this list. `notFound()` renders at
  // whatever URL was actually requested — there is no real request whose path
  // is literally `/not-found` — so a segment match against it can never fire.
  // NotFoundPage instead marks itself with `data-light-chrome`, which the
  // `styles.css` override recolours regardless of the (necessarily wrong)
  // tone guessed here. See the comment there.
  const lightChromePaths = ['team', 'search', 'thank-you']
  const headerTone =
    segments.length === 1 && lightChromePaths.includes(segments[0]) ? 'light' : 'dark'

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
