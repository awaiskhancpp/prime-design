import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import {
  convertHTMLToLexical,
  defaultEditorConfig,
  sanitizeServerEditorConfig,
} from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import configPromise from '../src/payload.config'

// ---------------------------------------------------------------------------
// WordPress "project" post type → Payload projects collection.
//
// Source split, per the client:
// - The REST API (https://primedesignandbuild.com/wp-json/wp/v2/project,
//   paginated — every page is pulled) supplies the project list: id, slug,
//   title, date, featured_media. Its content/acf come back EMPTY, so…
// - the XML export fills in what the REST API is missing: project_gallery
//   (serialized attachment ids), the serialized map address, video_url and
//   the post content for the projects that have one.
// - Images: all attachment filenames are already in the media collection
//   (migrated to Vercel Blob with the same filenames), so galleries and
//   featured images resolve by filename without any downloads.
//
// The domain blocks datacenter IPs at Cloudflare, so the REST requests go
// through the r.jina.ai reader proxy (same as migrate-blog.ts).
// ---------------------------------------------------------------------------

const xmlPath =
  process.argv[2] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-28.xml'

const WP_REST_BASE = 'https://primedesignandbuild.com/wp-json/wp/v2'
const JINA_BASE = 'https://r.jina.ai/'

const htmlToText = (html: string) => {
  try {
    return new JSDOM(`<body>${html}</body>`).window.document.body.textContent?.trim() || ''
  } catch {
    return ''
  }
}

const contentExcerpt = (content: string, length = 180) => {
  const text = htmlToText(content)
  if (text.length <= length) return text
  const cut = text.slice(0, length)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : length).trim()}…`
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

type RestProject = {
  id: number
  slug: string
  link: string
  date: string
  title: { rendered: string }
}

// ---------------------------------------------------------------------------
// XML parsing — the real project data.
// ---------------------------------------------------------------------------

type XmlProject = {
  id: number
  title: string
  slug: string
  content: string
  thumbnailId?: number
  galleryIds: number[]
  address?: { address?: string; lat?: number; lng?: number; zoom?: number; place_id?: string }
  videoUrl?: string
}

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

function parseXmlProjects(xml: string): Map<number, XmlProject> {
  const projects = new Map<number, XmlProject>()
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const item = match[1]
    if (field(item, 'wp:post_type') !== 'project') continue
    const id = Number(field(item, 'wp:post_id'))
    const title = field(item, 'title')
    if (!id || !title) continue

    const galleryRaw = metaValue(item, 'project_gallery') || ''
    const galleryIds = [...galleryRaw.matchAll(/i:\d+;s:\d+:"(\d+)"/g)].map((m) => Number(m[1]))

    const addressRaw = metaValue(item, 'address') || ''
    const addressMatch = addressRaw.match(
      /s:\d+:"address";s:\d+:"([^"]*)";[\s\S]*?s:\d+:"lat";d:([\d.-]+);[\s\S]*?s:\d+:"lng";d:([\d.-]+);/,
    )
    const zoomMatch = addressRaw.match(/s:\d+:"zoom";i:(\d+);/)
    const placeMatch = addressRaw.match(/s:\d+:"place_id";s:\d+:"([^"]*)";/)

    const thumbnailRaw = metaValue(item, '_thumbnail_id')
    const videoUrl = metaValue(item, 'video_url') || undefined

    projects.set(id, {
      id,
      title,
      slug: field(item, 'wp:post_name') || '',
      content: field(item, 'content:encoded') || '',
      thumbnailId: thumbnailRaw ? Number(thumbnailRaw) : undefined,
      galleryIds,
      address: addressMatch
        ? {
            address: addressMatch[1],
            lat: Number(addressMatch[2]),
            lng: Number(addressMatch[3]),
            zoom: zoomMatch ? Number(zoomMatch[1]) : undefined,
            place_id: placeMatch?.[1] || undefined,
          }
        : undefined,
      videoUrl,
    })
  }
  return projects
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, await configPromise)

async function main() {
  const xml = await readFile(xmlPath, 'utf8')

  console.log('→ Fetching projects from the WordPress REST API (r.jina.ai reader proxy)…')
  const restProjects: RestProject[] = []
  for (let page = 1; page <= 50; page++) {
    const pageProjects = await wpRestJson<RestProject[]>(`/project?per_page=50&page=${page}`)
    if (!pageProjects?.length) break
    restProjects.push(...pageProjects)
    if (pageProjects.length < 50) break
  }
  console.log(`  got ${restProjects.length} project(s) (all pages)`)

  // Attachment URLs from the XML export (all media is already in Payload).
  const attachments = new Map<number, { url: string }>()
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const item = match[1]
    if (field(item, 'wp:post_type') !== 'attachment') continue
    const id = Number(field(item, 'wp:post_id'))
    const url = field(item, 'wp:attachment_url')
    if (id && url) attachments.set(id, { url })
  }

  const xmlProjects = parseXmlProjects(xml)

  const payload = await getPayload({ config: configPromise })
  const report: Array<{ title: string; slug: string; gallery: string; status: string }> = []

  const resolveMediaByUrl = async (url: string | undefined): Promise<number | undefined> => {
    if (!url) return undefined
    const filename = decodeURIComponent(new URL(url).pathname.split('/').pop() || '')
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { like: filename } },
      limit: 1,
    })
    return existing.docs[0] ? Number(existing.docs[0].id) : undefined
  }

  for (const rest of restProjects) {
    const xmlProject = xmlProjects.get(rest.id)
    if (!xmlProject) {
      report.push({
        title: htmlToText(rest.title.rendered),
        slug: rest.slug,
        gallery: '—',
        status: 'SKIPPED — no XML data for this project',
      })
      continue
    }
    console.log(`\n→ ${htmlToText(rest.title.rendered)}`)

    const galleryIds: number[] = []
    let galleryMissing = 0
    for (const attachmentId of xmlProject.galleryIds) {
      const mediaId = await resolveMediaByUrl(attachments.get(attachmentId)?.url)
      if (mediaId) galleryIds.push(mediaId)
      else galleryMissing++
    }

    const thumbnailId =
      (await resolveMediaByUrl(attachments.get(xmlProject.thumbnailId!)?.url)) || galleryIds[0]

    // WordPress content exists for a handful of projects; the rest only have
    // a title + gallery + address. Summary/description come from that real
    // content — never invented.
    const wpText = xmlProject.content ? htmlToText(xmlProject.content) : ''
    const wpContent = xmlProject.content
      ? convertHTMLToLexical({
          editorConfig,
          html: xmlProject.content,
          JSDOM,
        })
      : null

    const record = {
      title: htmlToText(rest.title.rendered) || xmlProject.title,
      slug: rest.slug || xmlProject.slug,
      summary: wpText ? contentExcerpt(xmlProject.content) : undefined,
      description: wpText || undefined,
      content: wpContent,
      location: xmlProject.address?.address,
      address: xmlProject.address ? JSON.stringify(xmlProject.address) : undefined,
      featuredImage: thumbnailId,
      gallery: galleryIds,
      videoUrl: xmlProject.videoUrl,
    }

    const existing = await payload.find({
      collection: 'projects',
      where: { slug: { equals: record.slug } },
      limit: 1,
    })
    try {
      if (existing.docs[0]) {
        await payload.update({
          collection: 'projects',
          id: existing.docs[0].id,
          data: record as never,
        })
      } else {
        await payload.create({ collection: 'projects', data: record as never })
      }
      report.push({
        title: record.title,
        slug: record.slug,
        gallery: galleryMissing ? `${galleryIds.length}/${galleryIds.length + galleryMissing}` : `${galleryIds.length}`,
        status: galleryMissing ? 'IMPORTED (some gallery images missing)' : 'IMPORTED',
      })
    } catch (error) {
      const details = (error as { data?: { errors?: unknown } }).data?.errors
      console.error(`   ✗ ${record.title} failed:`)
      console.error(JSON.stringify(details ?? (error as Error).message, null, 2).slice(0, 4000))
      report.push({ title: record.title, slug: record.slug, gallery: '—', status: 'FAILED — see error' })
    }
  }

  // The projects index hero — WordPress page 339 "Our Projects" (Bricks:
  // h1 "Showcasing our latest <span class=heading--gradient>remodeling
  // projects</span> in Silicon Valley", lede "Inspiring Home Makeovers that
  // Reflect Your Style and Enhance Your Lifestyle"). Stored on the pages
  // collection so ProjectsPage renders it from Payload.
  const projectsPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'our-projects' } },
    limit: 1,
  })
  const projectsPageData = {
    title: 'Our Projects',
    hero: {
      heading: 'Showcasing our latest remodeling projects in Silicon Valley',
      description: 'Inspiring Home Makeovers that Reflect Your Style and Enhance Your Lifestyle',
    },
  }
  try {
    if (projectsPage.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: projectsPage.docs[0].id,
        data: projectsPageData as never,
      })
      console.log('↳ updated pages record "our-projects" (hero)')
    } else {
      await payload.create({
        collection: 'pages',
        data: { ...projectsPageData, slug: 'our-projects', isGoogleAdsPage: false } as never,
      })
      console.log('↳ created pages record "our-projects" (hero)')
    }
  } catch (error) {
    console.error(
      '   ✗ pages record "our-projects" failed:',
      error instanceof Error ? error.message : error,
    )
  }

  console.table(report)
  await payload.destroy()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
