import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Runs before every page (see `config.matcher`), and does two things.
 *
 * 1. Applies the Redirects collection. Redirects used to be looked up only
 *    inside the two dynamic routes (`[serviceSlug]`, `[serviceSlug]/[pageSlug]`),
 *    so an old URL that matched a static route (`/about/…`, `/blog/…`) or was
 *    three segments deep never redirected, and the second route sent every
 *    redirect as permanent whatever status code the record said. Here every
 *    path is checked, with the record's own status code. The active rules are
 *    held in memory and refreshed at most once a minute, so a page request
 *    normally costs no lookup at all, and a rule saved in the admin is live
 *    within a minute.
 *
 * 2. Exposes the request pathname to server components through the
 *    `x-pathname` header, so `(frontend)/template.tsx` can decide which pages
 *    get the shared site chrome (Google Ads landing pages and service-location
 *    pages are excluded).
 *
 * This is `proxy.ts`, not `middleware.ts`. Next 16 deprecated the `middleware`
 * file convention and renamed it to `proxy`; the old name still worked but
 * warned on every build, and when support for it goes the header below simply
 * stops being set. The template treats a missing `x-pathname` as "not a bare
 * page", so that would not fail visibly — it would quietly put the banner,
 * header, CTA and footer back on every landing and service-location page.
 */

type Rule = { newPath: string; status: 301 | 302 | 307 | 308 }

const REFRESH_MS = 60_000
let rules: Map<string, Rule> = new Map()
let loadedAt = 0
let loading: Promise<void> | null = null

/** `/Old-Page/` and `/old-page` are the same rule. */
const normalise = (path: string) => {
  const trimmed = path.trim().replace(/\/+$/, '')
  return (trimmed || '/').toLowerCase()
}

async function refresh(origin: string) {
  try {
    const response = await fetch(
      `${origin}/api/redirects?limit=1000&depth=0&where[active][equals]=true`,
      { cache: 'no-store' },
    )
    if (!response.ok) return
    const body = (await response.json()) as {
      docs?: Array<{ oldPath?: string; newPath?: string; statusCode?: string }>
    }
    const next = new Map<string, Rule>()
    for (const doc of body.docs ?? []) {
      const status = Number(doc.statusCode)
      if (!doc.oldPath || !doc.newPath) continue
      if (status !== 301 && status !== 302 && status !== 307 && status !== 308) continue
      next.set(normalise(doc.oldPath), { newPath: doc.newPath, status })
    }
    rules = next
    loadedAt = Date.now()
  } catch {
    // Keep the last good rules; try again on a later request.
  }
}

async function currentRules(origin: string) {
  if (Date.now() - loadedAt > REFRESH_MS) {
    loading ??= refresh(origin).finally(() => {
      loading = null
    })
    // The very first request waits for the rules; later refreshes happen in
    // the background while the previous rules keep applying.
    if (!loadedAt) await loading
  }
  return rules
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const rule = (await currentRules(request.nextUrl.origin)).get(normalise(pathname))
  if (rule && normalise(rule.newPath) !== normalise(pathname)) {
    return NextResponse.redirect(new URL(rule.newPath, request.url), rule.status)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  // Everything except Payload admin/API, Next internals and static files.
  matcher: ['/((?!_next|api|admin|favicon.ico|.*\\..*).*)'],
}
