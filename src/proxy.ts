import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Exposes the current request pathname to server components through the
 * `x-pathname` header, so `(frontend)/template.tsx` can decide which pages get
 * the shared site chrome (Google Ads landing pages and service-location pages
 * are excluded).
 *
 * This is `proxy.ts`, not `middleware.ts`. Next 16 deprecated the `middleware`
 * file convention and renamed it to `proxy`; the old name still worked but
 * warned on every build, and when support for it goes the header below simply
 * stops being set. The template treats a missing `x-pathname` as "not a bare
 * page", so that would not fail visibly — it would quietly put the banner,
 * header, CTA and footer back on every landing and service-location page.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  // Everything except Payload admin/API, Next internals and static files.
  matcher: ['/((?!_next|api|admin|favicon.ico|.*\\..*).*)'],
}
