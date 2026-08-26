import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { transformWordPressServiceLocations } from './transform-wordpress-service-locations'

const mediaXmlPath = process.argv[2] || 'C:/Users/HP/Downloads/primedesignandbuild.WordPress.2026-08-26 (1).xml'
const pagesXmlPath = process.argv[3] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-26.xml'

const field = (item: string, tag: string) => item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim()
const filenameFromUrl = (url: string) => decodeURIComponent(new URL(url).pathname.split('/').pop() || 'wordpress-image')

const mediaXml = await readFile(mediaXmlPath, 'utf8')
const pagesXml = await readFile(pagesXmlPath, 'utf8')
const locations = transformWordPressServiceLocations(pagesXml)
const attachments = new Map<number, { title: string; url: string }>()
for (const match of mediaXml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
  const item = match[1]
  if (field(item, 'wp:post_type') !== 'attachment') continue
  const id = Number(field(item, 'wp:post_id'))
  const url = field(item, 'wp:attachment_url')
  if (id && url) attachments.set(id, { title: field(item, 'title') || filenameFromUrl(url), url })
}

const payload = await getPayload({ config: configPromise })
let imported = 0
let reused = 0
let skipped = 0
for (const location of locations) {
  if (!location.thumbnailId) {
    skipped++
    continue
  }
  const attachment = attachments.get(location.thumbnailId)
  if (!attachment) {
    console.warn(`Missing media attachment ${location.thumbnailId} for ${location.slug}`)
    skipped++
    continue
  }

  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filenameFromUrl(attachment.url) } }, limit: 1 })
  const media = existing.docs[0] || await (async () => {
    const response = await fetch(attachment.url)
    if (!response.ok) throw new Error(`Could not download ${attachment.url}: ${response.status}`)
    const data = Buffer.from(await response.arrayBuffer())
    const created = await payload.create({
      collection: 'media',
      data: { alt: attachment.title },
      file: { data, mimetype: response.headers.get('content-type') || 'image/jpeg', name: filenameFromUrl(attachment.url), size: data.length },
    })
    imported++
    return created
  })()
  if (existing.docs[0]) reused++

  const serviceLocation = await payload.find({ collection: 'service-locations', where: { slug: { equals: location.slug } }, limit: 1 })
  if (serviceLocation.docs[0]) await payload.update({ collection: 'service-locations', id: serviceLocation.docs[0].id, data: { featuredImage: media.id } })
}

console.log(`Service-location media complete: imported=${imported}, reused=${reused}, skipped=${skipped}`)
process.exit(0)
