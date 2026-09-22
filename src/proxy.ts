import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Exposes the current request pathname to server components through the
 * `x-pathname` header, so the (frontend) root layout can decide which pages
 * get the shared site chrome (Google Ads landing pages and service-location
 * pages are excluded).
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  // Everything except Payload admin/API, Next internals and static files.
  matcher: ['/((?!_next|api|admin|favicon.ico|.*\\..*).*)'],
}
