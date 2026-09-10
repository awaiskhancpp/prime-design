import 'dotenv/config'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import {
  convertHTMLToLexical,
  defaultEditorConfig,
  sanitizeServerEditorConfig,
} from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import configPromise from '../src/payload.config'

const xmlPath =
  process.argv[2] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-28.xml'
const uploadsPath = process.argv[3]

// ---------------------------------------------------------------------------
// Lightweight XML field/meta helpers — matches the regex-based approach
// already used in transform-wordpress-service-locations.ts. Blog posts are
// plain HTML content, not Bricks page-builder data, so the heavier
// wordpress-migration/xmlParser + bricksParser pipeline (built for pages)
// isn't needed here.
// ---------------------------------------------------------------------------

const field = (item: string, tag: string) =>
  item
    .match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1]
    .replace(/^<!\[CDATA\[|\]\]>$/g, '')
    .trim()

const metaValue = (item: string, key: string) => {
  const matches = [
    ...item.matchAll(
      /<wp:postmeta>[\s\S]*?<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>[\s\S]*?<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>[\s\S]*?<\/wp:postmeta>/g,
    ),
  ]
  return matches.find((match) => match[1] === key)?.[2]?.trim()
}

const categoriesOf = (item: string) =>
  [...item.matchAll(/<category domain="category"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g)].map(
    (match) => match[1].trim(),
  )

const formatSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

type WordPressBlogPost = {
  id: number
  title: string
  slug: string
  date: string
  content: string
  categories: string[]
  thumbnailId?: number
  /** Direct featured-image URL (REST source) — preferred over thumbnailId. */
  thumbnailUrl?: string
  excerptFromRankMath?: string
  sourceUrl?: string
}

function parseBlogPosts(xml: string): WordPressBlogPost[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap((match) => {
    const item = match[1]
    if (field(item, 'wp:post_type') !== 'post' || field(item, 'wp:status') !== 'publish') return []
    const title = field(item, 'title')
    const id = Number(field(item, 'wp:post_id'))
    const content = field(item, 'content:encoded') || ''
    if (!title || !id || !content) return []
    const thumb = metaValue(item, '_thumbnail_id')
    return [
      {
        id,
        title,
        // Derived from the title, not the raw WP slug — several posts have
        // auto-generated slugs like "3647-2" with no relation to the title.
        slug: formatSlug(title),
        date: field(item, 'wp:post_date') || new Date().toISOString(),
        content,
        categories: categoriesOf(item),
        thumbnailId: thumb ? Number(thumb) : undefined,
        excerptFromRankMath: metaValue(item, 'rank_math_description'),
        sourceUrl: field(item, 'link'),
      },
    ]
  })
}

// ---------------------------------------------------------------------------
// WordPress REST API source — the live endpoints the client pointed at
// (https://primedesignandbuild.com/wp-json/wp/v2/posts and /categories).
// The domain blocks datacenter IPs at Cloudflare, so requests go through
// the r.jina.ai reader proxy, which returns the JSON payload in
// `{ data: { content: "<json>" } }`. Pagination is followed until the API
// reports there are no more pages, so every published post is imported.
// The XML export is kept as a fallback when the REST API is unreachable.
// ---------------------------------------------------------------------------

const WP_REST_BASE = 'https://primedesignandbuild.com/wp-json/wp/v2'
const JINA_BASE = 'https://r.jina.ai/'

const htmlToText = (html: string) => {
  try {
    return new JSDOM(`<body>${html}</body>`).window.document.body.textContent?.trim() || ''
  } catch {
    return ''
  }
}

async function wpRestJson<T>(path: string): Promise<T | undefined> {
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const response = await fetch(`${JINA_BASE}${WP_REST_BASE}${path}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(90000),
      })
      if (!response.ok) continue
      const envelope = (await response.json()) as { data?: { content?: string } }
      if (!envelope?.data?.content) continue
      return JSON.parse(envelope.data.content) as T
    } catch {
      /* retry below */
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 2500))
  }
  return undefined
}

type RestCategory = { id: number; name: string }
type RestPost = {
  id: number
  slug: string
  link: string
  date: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  categories: number[]
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>
  }
}

async function fetchRestPosts(): Promise<WordPressBlogPost[] | undefined> {
  const categories = await wpRestJson<RestCategory[]>('/categories?per_page=100&_fields=id,name')
  const categoryNames = new Map((categories || []).map((category) => [category.id, category.name]))

  const posts: WordPressBlogPost[] = []
  for (let page = 1; page <= 25; page++) {
    const pagePosts = await wpRestJson<RestPost[]>(`/posts?per_page=100&page=${page}&_embed=1`)
    if (!pagePosts?.length) break
    for (const post of pagePosts) {
      const title = htmlToText(post.title.rendered)
      const excerpt = htmlToText(post.excerpt.rendered)
      if (!post.id || !title || !post.content?.rendered) continue
      posts.push({
        id: post.id,
        title,
        // Keep the real WordPress slug when it's a meaningful one; posts
        // with auto-generated slugs like "3647-2" get a title-based slug.
        slug: /^[a-z]/.test(post.slug || '') ? post.slug : formatSlug(title),
        date: post.date || new Date().toISOString(),
        content: post.content.rendered,
        categories: (post.categories || [])
          .map((id) => categoryNames.get(id))
          .filter((name): name is string => Boolean(name) && name !== 'Uncategorized'),
        thumbnailUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
        excerptFromRankMath: excerpt || undefined,
        sourceUrl: post.link,
      })
    }
    if (pagePosts.length < 100) break
  }
  return posts.length ? posts : undefined
}

// ---------------------------------------------------------------------------
// HTML → Lexical conversion via Payload's official converter (the blog
// collection's editor restricts headings to h2/h3, which is all these
// posts use). WordPress's wpautop leaves body copy as blank-line-separated
// text without <p> tags, so loose segments are wrapped in <p> first, and
// WordPress's empty `<a id="...">` jump anchors are stripped.
//
// WordPress images are kept. The converter creates a *valid* upload node
// only when an <img> carries data-lexical-upload-relation-to +
// data-lexical-upload-id pointing at an existing media record, so
// resolveContentImages() rewrites every <img> with those attributes before
// conversion (see below). <figure> wrappers are unwrapped because they only
// carry alignment classes and none of these posts have <figcaption> text.
// ---------------------------------------------------------------------------

const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, await configPromise)

function wrapLooseParagraphs(rawHtml: string): string {
  const blockPattern = /<(h[23]|ul|ol|p|figure|table|blockquote)[^>]*>[\s\S]*?<\/\1>/gi
  let out = ''
  let cursor = 0
  let match: RegExpExecArray | null
  while ((match = blockPattern.exec(rawHtml))) {
    const segment = rawHtml.slice(cursor, match.index)
    out += segment
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => (block.startsWith('<') ? block : `<p>${block}</p>`))
      .join('\n')
    out += match[0]
    cursor = blockPattern.lastIndex
  }
  const tail = rawHtml.slice(cursor)
  out += tail
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => (block.startsWith('<') ? block : `<p>${block}</p>`))
    .join('\n')
  return out
}

/**
 * Converts WordPress `content:encoded` HTML to Lexical documents. Returns
 * the intro (everything before the first h2 — this site's own design shows
 * that in a larger lead paragraph) and the rest of the post, both as
 * richText so formatting and images survive exactly as WordPress wrote them.
 */
function convertToLexical(rawHtml: string): { intro: object | null; content: object } {
  // Strip the empty `<h1></h1>` WordPress always leaves at the top, the
  // empty `<a id="post-...">` jump anchors WordPress puts inside headings,
  // and the image <figure> wrappers (no captions to preserve).
  const html = rawHtml
    .replace(/<h1>\s*<\/h1>/i, '')
    .replace(/<a[^>]*id="[^"]*"[^>]*>\s*<\/a>/gi, '')
    .replace(/<\/?figure[^>]*>/gi, '')
    .trim()
  const firstH2Index = html.search(/<h2[\s>]/i)
  const introHtml = firstH2Index >= 0 ? html.slice(0, firstH2Index) : ''
  const bodyHtml = firstH2Index >= 0 ? html.slice(firstH2Index) : html

  const intro = introHtml.trim()
    ? convertHTMLToLexical({ editorConfig, html: wrapLooseParagraphs(introHtml), JSDOM })
    : null

  const content = convertHTMLToLexical({
    editorConfig,
    html: wrapLooseParagraphs(bodyHtml),
    JSDOM,
  })

  return { intro, content }
}

/**
 * The converter reads data-lexical-upload-id as a string, but Payload
 * validates rich-text upload nodes against numeric IDs (postgres). Upload
 * nodes are block nodes, so a bare upload at the root (the converter's
 * output for a standalone <img> between blocks) is already structurally
 * valid — only the id value needs normalizing.
 */
function fixLexicalForPayload(doc: object): object {
  const walk = (node: any): void => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'upload' && node.value != null) node.value = Number(node.value)
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child)
    }
  }
  walk((doc as { root?: unknown }).root)
  return doc
}

// ---------------------------------------------------------------------------
// Content image resolution. Every WordPress <img> stays in the post. Each
// image is resolved in order:
//   1. an already-imported media record with the same source URL
//   2. one with the same filename (also trying the WP resized-name base,
//      e.g. ADU-3-1024x682.png → ADU-3.png)
//   3. a local uploads copy (when the uploads directory is passed in)
//   4. a live download from WordPress
//   5. a Wayback Machine snapshot of the original URL
// If none of those work, the image still keeps its place in the post using
// a real site image and is flagged in the report — never silently dropped.
// ---------------------------------------------------------------------------

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  Referer: 'https://primedesignandbuild.com/',
}

const mimeFromBuffer = (buffer: Buffer) =>
  buffer.length > 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e
    ? 'image/png'
    : 'image/jpeg'

async function fetchBuffer(url: string): Promise<Buffer | undefined> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(30000),
    })
    if (response.ok) return Buffer.from(await response.arrayBuffer())
  } catch {
    /* unreachable source — try the next one */
  }
  return undefined
}

async function waybackBuffer(url: string): Promise<Buffer | undefined> {
  try {
    const api = `http://archive.org/wayback/available?url=${encodeURIComponent(url)}`
    const response = await fetch(api, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(30000),
    })
    if (!response.ok) return undefined
    const json = (await response.json()) as {
      archived_snapshots?: { closest?: { url?: string } }
    }
    const snapshotUrl = json.archived_snapshots?.closest?.url
    if (!snapshotUrl) return undefined
    return await fetchBuffer(snapshotUrl)
  } catch {
    return undefined
  }
}

const mediaName = (filename: string, buffer: Buffer) => {
  // Keep the original extension when the source has one — it distinguishes
  // files like image-1.jpeg from image-1.png. Only extensionless names get
  // an extension derived from the actual bytes.
  if (/\.[a-z0-9]{2,5}$/i.test(filename)) return filename
  const fallbackExt = mimeFromBuffer(buffer) === 'image/png' ? 'png' : 'jpg'
  return `${filename || 'image'}.${fallbackExt}`
}

async function createMediaFromBuffer(
  payload: Payload,
  {
    buffer,
    filename,
    alt,
    sourceUrl,
  }: { buffer: Buffer; filename: string; alt: string; sourceUrl: string },
): Promise<number | undefined> {
  const mimetype = mimeFromBuffer(buffer)
  let name = mediaName(filename, buffer)
  // The media filename is unique — on a collision, prefix with a hash of the
  // source URL so both files can coexist.
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: name } },
    limit: 1,
  })
  if (existing.docs[0]) {
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', Buffer.from(sourceUrl))))
      .slice(0, 4)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
    name = `${hash}-${name}`
  }
  const created = await payload
    .create({
      collection: 'media',
      // The media collection requires a non-empty alt; WordPress imgs often
      // have alt="" — fall back to the filename.
      data: { alt: alt || name, sourceUrl },
      file: {
        data: buffer,
        mimetype,
        name,
        size: buffer.length,
      },
    })
    .catch((error: unknown) => {
      console.error(`   ! media create failed for ${name}:`, error instanceof Error ? error.message : error)
      return undefined
    })
  return created ? Number(created.id) : undefined
}

type ContentImageReport = { url: string; resolution: string }

type ResolvedContentImage = { id: number; pending?: boolean }

async function resolveContentImages(
  html: string,
  payload: Payload,
  localFiles: Map<string, string>,
  post: WordPressBlogPost,
  placeholderMedia: { id: number; url?: string | null; filename?: string | null } | undefined,
): Promise<{ html: string; report: ContentImageReport[] }> {
  const srcs: string[] = []
  const imageTags = new Map<string, string>()
  html.replace(/<img[^>]*>/gi, (tag) => {
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? ''
    srcs.push(src)
    if (src && !imageTags.has(src)) imageTags.set(src, tag)
    return tag
  })

  // Buffer for the "pending" records below — a real site image that stands
  // in for files that are unreachable from every source. Each pending record
  // keeps the original WordPress filename, alt and source URL, so replacing
  // its file in the Payload admin restores the exact image in place.
  //
  // Payload returns media URLs relative to the app (/api/media/file/...),
  // so the public Vercel Blob URL is rebuilt from the blob token
  // (vercel_blob_rw_<storeId>_<token>) when possible.
  let placeholderUrl: string | undefined
  if (placeholderMedia?.url && placeholderMedia.filename) {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.replace(/^"|"$/g, '') || ''
    const storeId = token.match(/^vercel_blob_rw_([^_]+)_/)?.[1]
    placeholderUrl = storeId
      ? `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com/${placeholderMedia.filename}`
      : placeholderMedia.url.startsWith('http')
        ? placeholderMedia.url
        : undefined
  }
  const placeholderBuffer = placeholderUrl ? await fetchBuffer(placeholderUrl) : undefined

  const mediaIds = new Map<string, ResolvedContentImage | undefined>()
  let googleImageIndex = 0
  for (const src of [...new Set(srcs)].filter(Boolean)) {
    const mediaId = await resolveOneContentImage(
      src,
      imageTags.get(src),
      payload,
      localFiles,
      post,
      placeholderMedia,
      placeholderBuffer,
      () => ++googleImageIndex,
    )
    mediaIds.set(src, mediaId)
  }

  const report: ContentImageReport[] = []
  const rewritten = html.replace(/<img[^>]*>/gi, (tag) => {
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? ''
    const resolved = mediaIds.get(src)
    if (!resolved) return tag
    report.push({
      url: src,
      resolution: resolved.pending
        ? `PENDING — source unreachable, restore the file later (media #${resolved.id})`
        : `media #${resolved.id}`,
    })
    // The converter reads these attributes and creates a valid upload node
    // pointing at the resolved media record. Handles both `>` and ` />` tag
    // endings (the WordPress REST API emits both styles).
    return tag.replace(/(\/?>)\s*$/i, (match, closer) => {
      const injected = ` data-lexical-upload-relation-to="media" data-lexical-upload-id="${resolved.id}"${closer}`
      return tag.slice(0, -match.length) + injected
    })
  })

  return { html: rewritten, report }
}

async function resolveOneContentImage(
  src: string,
  tag: string | undefined,
  payload: Payload,
  localFiles: Map<string, string>,
  post: WordPressBlogPost,
  placeholderMedia: { id: number; url?: string | null } | undefined,
  placeholderBuffer: Buffer | undefined,
  nextGoogleIndex: () => number,
): Promise<ResolvedContentImage | undefined> {
  // 1. Already-imported media with the exact source URL.
  const byUrl = await payload.find({
    collection: 'media',
    where: { sourceUrl: { equals: src } },
    limit: 1,
  })
  if (byUrl.docs[0]) return { id: Number(byUrl.docs[0].id) }

  // 2. Same filename (also trying the WP resized-name base).
  let rawName = ''
  try {
    rawName = decodeURIComponent(new URL(src).pathname.split('/').pop() || '')
  } catch {
    /* not a valid URL (e.g. a data: URI) — skip the filename lookup */
  }
  const strippedName = rawName.replace(/-\d+x\d+(?=\.\w+$)/i, '')
  for (const filename of [rawName, strippedName].filter(Boolean)) {
    const byName = await payload.find({
      collection: 'media',
      where: { filename: { like: filename } },
      limit: 1,
    })
    if (byName.docs[0]) return { id: Number(byName.docs[0].id) }
  }

  // 3. Local uploads copy.
  let buffer: Buffer | undefined
  const localPath = strippedName ? localFiles.get(strippedName.toLowerCase()) : undefined
  if (localPath) {
    try {
      buffer = await readFile(localPath)
    } catch {
      buffer = undefined
    }
  }

  // 4/5. Live download, then Wayback Machine snapshot.
  if (!buffer) buffer = await fetchBuffer(src)
  if (!buffer) buffer = await waybackBuffer(src)

  const alt = tag?.match(/alt=["']([^"']*)["']/i)?.[1] ?? ''
  const isGoogleHosted = /googleusercontent|docsz/i.test(src)
  const name = isGoogleHosted
    ? `${post.slug}-image-${nextGoogleIndex()}`
    : strippedName || rawName || `${post.slug}-image`

  if (buffer) {
    const createdId = await createMediaFromBuffer(payload, {
      buffer,
      filename: name,
      alt,
      sourceUrl: src,
    })
    if (createdId) return { id: createdId }
  }

  // 6. Unreachable from every source (the site blocks direct downloads and
  // the file isn't archived) — the image keeps its place in the post via a
  // dedicated "pending" media record that carries the original filename, alt
  // and source URL. Replacing its file in the Payload admin restores the
  // exact WordPress image in place. The `_pending_` prefix guarantees the
  // record never shadows the real file if it becomes available later.
  if (!placeholderBuffer || !placeholderMedia) return { id: placeholderMedia?.id ?? 0, pending: true }
  const pendingName = mediaName(`_pending_${post.slug}-${name}`, placeholderBuffer)
  const existingPending = await payload.find({
    collection: 'media',
    where: { filename: { equals: pendingName } },
    limit: 1,
  })
  if (existingPending.docs[0]) {
    return { id: Number(existingPending.docs[0].id), pending: true }
  }
  const createdPending = await createMediaFromBuffer(payload, {
    buffer: placeholderBuffer,
    filename: pendingName,
    alt,
    sourceUrl: src,
  })
  return { id: createdPending ?? placeholderMedia.id, pending: true }
}

// ---------------------------------------------------------------------------
// Media resolution — same shape as the other migration scripts: check for an
// already-imported record first, then a local upload, then download.
// ---------------------------------------------------------------------------

async function fileIndex(directory?: string) {
  const result = new Map<string, string>()
  if (!directory) return result
  const walk = async (current: string) => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (!result.has(entry.name.toLowerCase())) result.set(entry.name.toLowerCase(), full)
    }
  }
  try {
    await walk(directory)
  } catch {
    /* no local uploads dir provided — attachments fall through to fetch */
  }
  return result
}

async function main() {
  const xml = await readFile(xmlPath, 'utf8')
  console.log('→ Fetching posts from the WordPress REST API (r.jina.ai reader proxy)…')
  const restPosts = await fetchRestPosts()
  const posts = restPosts ?? parseBlogPosts(xml)
  console.log(
    restPosts
      ? `  got ${restPosts.length} post(s) from ${WP_REST_BASE}/posts (all pages)`
      : '  REST API unreachable — falling back to the XML export',
  )
  const localFiles = await fileIndex(uploadsPath)

  const attachments = new Map<number, { title: string; url: string }>()
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const item = match[1]
    if (field(item, 'wp:post_type') !== 'attachment') continue
    const id = Number(field(item, 'wp:post_id'))
    const url = field(item, 'wp:attachment_url')
    if (id && url) attachments.set(id, { title: field(item, 'title') || '', url })
  }

  const payload = await getPayload({ config: configPromise })
  const categoryIds = new Map<string, number>()
  const report: Array<{ title: string; slug: string; status: string }> = []
  const contentImageReport: ContentImageReport[] = []

  // Real site image used as a placeholder when a WordPress file can't be
  // resolved — keeps the post (and each image position) intact while the
  // exact file is flagged in the report for later restoration.
  const placeholderMedia = await payload.find({
    collection: 'media',
    where: { filename: { like: 'WhatsApp-Image-2024-03-04-at-8.18.55-PM-5.jpeg' } },
    limit: 1,
  })
  const placeholderMediaId = placeholderMedia.docs[0]
    ? Number(placeholderMedia.docs[0].id)
    : undefined

  for (const post of posts) {
    console.log(`\n→ ${post.title}`)
    // Categories: find-or-create by name, matching the upsert pattern used
    // for services/locations elsewhere in this migration.
    const categoryRelIds: number[] = []
    for (const name of post.categories) {
      if (!categoryIds.has(name)) {
        const existing = await payload.find({
          collection: 'blog-categories',
          where: { name: { equals: name } },
          limit: 1,
        })
        const record =
          existing.docs[0] ||
          (await payload.create({
            collection: 'blog-categories',
            data: { name, status: 'published' },
            draft: true,
          }))
        categoryIds.set(name, Number(record.id))
      }
      categoryRelIds.push(categoryIds.get(name)!)
    }

    // Featured image — required by the schema. Resolution order: an
    // already-imported media record (by source URL, then filename), a local
    // uploads copy, a download from WordPress (or a Wayback snapshot of it),
    // and finally a real site image as a placeholder (flagged in the report)
    // so every post imports even when the WordPress server is unreachable.
    let featuredImageId: number | undefined
    let thumbnailFallback = false
    const thumbnailUrl =
      post.thumbnailUrl ||
      (post.thumbnailId ? attachments.get(post.thumbnailId)?.url : undefined)
    if (thumbnailUrl) {
      let filename = ''
      try {
        filename = decodeURIComponent(new URL(thumbnailUrl).pathname.split('/').pop() || '')
      } catch {
        /* keep empty — filename lookups are skipped */
      }
      const byUrl = await payload.find({
        collection: 'media',
        where: { sourceUrl: { equals: thumbnailUrl } },
        limit: 1,
      })
      if (byUrl.docs[0]) {
        featuredImageId = Number(byUrl.docs[0].id)
      } else if (filename) {
        const existingMedia = await payload.find({
          collection: 'media',
          where: { filename: { like: filename } },
          limit: 1,
        })
        if (existingMedia.docs[0]) {
          featuredImageId = Number(existingMedia.docs[0].id)
        } else {
          const localPath = localFiles.get(filename.toLowerCase())
          let buffer: Buffer | undefined
          if (localPath) {
            try {
              buffer = await readFile(localPath)
            } catch {
              buffer = undefined
            }
          }
          if (!buffer) buffer = (await fetchBuffer(thumbnailUrl)) ?? (await waybackBuffer(thumbnailUrl))
          if (buffer) {
            const createdId = await createMediaFromBuffer(payload, {
              buffer,
              filename: filename || `${post.slug}.jpg`,
              alt: post.title,
              sourceUrl: thumbnailUrl,
            })
            if (createdId) featuredImageId = createdId
          }
        }
      }
    }
    if (!featuredImageId && placeholderMediaId) {
      // The WordPress file is unreachable — use an existing site image so
      // the post still imports; flag it for a real thumbnail.
      featuredImageId = placeholderMediaId
      thumbnailFallback = true
    }
    if (!featuredImageId) {
      report.push({
        title: post.title,
        slug: post.slug,
        status: 'SKIPPED — no featured image resolved',
      })
      continue
    }

    // Content images: resolve every WordPress <img> to a media record, then
    // convert intro + body to rich text with the images kept in place.
    const placeholderDoc = placeholderMedia.docs[0] as
      | { id: number; url?: string | null; filename?: string | null }
      | undefined
    const { html: contentHtml, report: imageReport } = await resolveContentImages(
      post.content,
      payload,
      localFiles,
      post,
      placeholderDoc,
    )
    if (imageReport.length) {
      console.log(`   ↳ ${imageReport.length} content image(s):`)
      for (const { url, resolution } of imageReport) {
        console.log(`     - ${resolution}: ${url}`)
      }
      contentImageReport.push(...imageReport)
    }
    const { intro, content } = convertToLexical(contentHtml)
    const safeIntro = intro ? fixLexicalForPayload(intro) : null
    const safeContent = fixLexicalForPayload(content)
    const record = {
      title: post.title,
      slug: post.slug,
      wordpressId: post.id,
      sourceUrl: post.sourceUrl,
      status: 'published' as const,
      publishedDate: new Date(post.date).toISOString(),
      excerpt: post.excerptFromRankMath?.slice(0, 300),
      featuredImage: featuredImageId,
      categories: categoryRelIds,
      intro: safeIntro,
      content: safeContent,
      seo: post.excerptFromRankMath ? { metaDescription: post.excerptFromRankMath } : undefined,
    }

    const existing = await payload.find({
      collection: 'blog',
      where: { wordpressId: { equals: post.id } },
      limit: 1,
    })
    try {
      if (existing.docs[0]) {
        await payload.update({ collection: 'blog', id: existing.docs[0].id, data: record as never })
      } else {
        await payload.create({ collection: 'blog', data: record as never })
      }
      report.push({
        title: post.title,
        slug: post.slug,
        status: thumbnailFallback ? 'IMPORTED (placeholder thumbnail)' : 'IMPORTED',
      })
    } catch (error) {
      const details = (error as { data?: { errors?: unknown } }).data?.errors
      console.error(`   ✗ ${post.title} failed validation:`)
      console.error(JSON.stringify(details ?? (error as Error).message, null, 2).slice(0, 6000))
      report.push({ title: post.title, slug: post.slug, status: 'FAILED — see error above' })
    }
  }

  console.table(report)
  if (contentImageReport.length) {
    console.log('\nContent images:')
    console.table(contentImageReport)
  }
  await payload.destroy()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
