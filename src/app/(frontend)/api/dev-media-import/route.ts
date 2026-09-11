import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import configPromise from '@payload-config'

/**
 * TEMPORARY dev-only helper (delete after the WP image backfill):
 * downloads a WordPress media file server-side and writes it into the
 * Payload media collection (which uploads it to blob storage), either
 * updating an existing media row or creating a new one.
 *
 * POST body: { mediaId?: number, wpUrl: string, filename: string, alt: string }
 */
export const dynamic = 'force-dynamic'

const ALLOWED_HOSTS = new Set([
  'primedesignandbuild.com',
  'prime.tagmediaspace.dev',
  'tagmediaspace.b-cdn.net',
])

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'disabled in production' }, { status: 404 })
  }
  const { list } = await import('@vercel/blob')
  const url = new URL(request.url)
  const probe = url.searchParams.get('probe')
  if (probe) {
    try {
      const res = await fetch(probe, {
        method: 'HEAD',
        headers: { Origin: 'http://localhost:3000' },
      })
      return NextResponse.json({
        ok: true,
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
      })
    } catch (err) {
      return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
    }
  }
  const prefix = url.searchParams.get('prefix') || ''
  try {
    const { blobs } = await list({ prefix, limit: 1000 })
    return NextResponse.json({
      ok: true,
      blobs: blobs.map((b) => ({ pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt })),
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'disabled in production' }, { status: 404 })
  }
  const url = new URL(request.url)
  const mediaId = Number(url.searchParams.get('mediaId') || 0)
  const blobPath = url.searchParams.get('blobPath') || ''
  try {
    const { del } = await import('@vercel/blob')
    if (blobPath) {
      await del(decodeURIComponent(blobPath))
      return NextResponse.json({ ok: true, deleted: blobPath })
    }
    if (mediaId) {
      const payload = await getPayload({ config: configPromise })
      await payload.delete({ collection: 'media', id: mediaId })
      return NextResponse.json({ ok: true, deletedMediaId: mediaId })
    }
    return NextResponse.json({ ok: false, error: 'mediaId or blobPath required' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'disabled in production' }, { status: 404 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    mediaId?: number
    wpUrl?: string
    filename?: string
    alt?: string
  }
  const wpUrl = String(body.wpUrl || '')
  const filename = String(body.filename || '')
  const alt = String(body.alt || '')

  try {
    const host = new URL(wpUrl).host
    if (!ALLOWED_HOSTS.has(host)) throw new Error(`host not allowed: ${host}`)

    const userAgents = [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    ]
    let res: Response | null = null
    let lastStatus = ''
    for (const ua of userAgents) {
      const attempt = await fetch(wpUrl, {
        headers: {
          'User-Agent': ua,
          Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })
      lastStatus = `${attempt.status} ${attempt.statusText}`
      if (attempt.ok) {
        res = attempt
        break
      }
    }
    if (!res) throw new Error(`wp fetch failed: ${lastStatus}`)

    const bytes = Buffer.from(await res.arrayBuffer())
    if (!bytes.length) throw new Error('empty response body')
    const mimetype = res.headers.get('content-type') || 'application/octet-stream'

    const payload = await getPayload({ config: configPromise })
    const file = { data: bytes, mimetype, name: filename, size: bytes.length }

    if (body.mediaId) {
      const doc = await payload.update({
        collection: 'media',
        id: body.mediaId,
        data: { alt },
        file,
      })
      return NextResponse.json({ ok: true, id: doc.id, url: doc.url })
    }

    const doc = await payload.create({
      collection: 'media',
      data: { alt, sourceUrl: wpUrl },
      file,
    })
    return NextResponse.json({ ok: true, id: doc.id, url: doc.url })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
