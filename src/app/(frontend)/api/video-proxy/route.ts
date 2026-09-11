import { NextRequest, NextResponse } from 'next/server'

/**
 * Same-origin streaming proxy for the WordPress/CDN project videos. The
 * videos themselves are hosted on the tagmediaspace CDN, which does not
 * send CORS headers — proxying them through our own origin lets the
 * homepage capture real video frames for the thumbnail posters.
 *
 * Range requests are forwarded so browsers only fetch the bytes they need
 * (metadata + first frame) instead of the full file.
 */
export const dynamic = 'force-dynamic'

const ALLOWED_HOSTS = new Set(['tagmediaspace.b-cdn.net', 'primedesignandbuild.com'])

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url') || ''
  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return new NextResponse('bad url', { status: 400 })
  }
  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return new NextResponse('host not allowed', { status: 403 })
  }

  const range = request.headers.get('range')
  const upstream = await fetch(target, {
    headers: range ? { range } : {},
  })
  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse('upstream error', { status: upstream.status || 502 })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const contentLength = upstream.headers.get('content-length')
  if (contentLength) headers.set('content-length', contentLength)
  const contentRange = upstream.headers.get('content-range')
  if (contentRange) headers.set('content-range', contentRange)
  headers.set('accept-ranges', upstream.headers.get('accept-ranges') || 'bytes')
  headers.set('cache-control', 'public, max-age=31536000, immutable')

  return new NextResponse(upstream.body, { status: upstream.status, headers })
}
