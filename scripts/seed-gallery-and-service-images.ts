// Seed the gallery categories collection (WP HappyFiles categories →
// migrated media) and fill services hero/gallery images with the real
// WordPress images (resolved to Vercel Blob media).
// @ts-nocheck
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { getPayload } from 'payload'
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'
import configPromise from '../src/payload.config'

const rawEnv = readFileSync('.env', 'utf8')
const conn = (rawEnv.match(/DATABASE_URL=([^\r\n]+)/) || [])[1].replace(/^"(.*)"$/, '$1')

const xml = readFileSync('primedesignampbuild.WordPress.2026-08-28.xml', 'utf8')

// ---------- parse XML attachments + happyfiles categories ----------
const attachments = new Map() // id -> filename
for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
  const item = m[1]
  if (!/<wp:post_type><!\[CDATA\[attachment\]\]>/.test(item)) continue
  const id = Number(item.match(/<wp:post_id>([^<]*)<\/wp:post_id>/)?.[1])
  const url = item.match(/<wp:attachment_url><!\[CDATA\[([^\]]*)\]\]><\/wp:attachment_url>/)?.[1]
  if (id && url) {
    const filename = decodeURIComponent(url.split('/').pop() || '')
    const cats = [...item.matchAll(/<category domain="happyfiles_category"[^>]*><!\[CDATA\[([^\]]*)\]\]><\/category>/g)].map((c) => c[1])
    attachments.set(id, { filename, cats })
  }
}
const idsByCategory = new Map()
for (const [id, { cats }] of attachments) {
  for (const cat of cats) {
    if (!idsByCategory.has(cat)) idsByCategory.set(cat, [])
    idsByCategory.get(cat).push(id)
  }
}

// ---------- DB helpers ----------
const client = new pg.Client({ connectionString: conn })
await client.connect()

const mediaIdByFilename = new Map()
async function mediaIdFor(filename) {
  const normalize = (name) => name.replace(/Ã—/g, '×')
  for (const candidate of [filename, normalize(filename)]) {
    if (mediaIdByFilename.has(candidate)) return mediaIdByFilename.get(candidate)
    const r = await client.query(
      `SELECT id, url FROM media WHERE filename ILIKE $1 LIMIT 1`,
      [candidate],
    )
    if (r.rows[0]) {
      const value = r.rows[0].url ? Number(r.rows[0].id) : undefined
      mediaIdByFilename.set(candidate, value)
      return value
    }
  }
  mediaIdByFilename.set(filename, undefined)
  return undefined
}

async function mediaIdsForAttachmentIds(ids, cap = 12) {
  const out = []
  for (const id of ids) {
    const entry = attachments.get(id)
    if (!entry) continue
    const mediaId = await mediaIdFor(entry.filename)
    if (mediaId && !out.includes(mediaId)) out.push(mediaId)
    if (out.length >= cap) break
  }
  return out
}

// ---------- create gallery_categories tables ----------
for (const sql of [
  `CREATE TABLE IF NOT EXISTS gallery_categories (
     id serial PRIMARY KEY, title varchar, slug varchar UNIQUE,
     updated_at timestamptz, created_at timestamptz)`,
  `CREATE TABLE IF NOT EXISTS gallery_categories_images (
     _order integer NOT NULL, _parent_id integer NOT NULL, media_id integer)`,
  `CREATE TABLE IF NOT EXISTS gallery_categories_rels (
     id serial PRIMARY KEY, "order" integer, parent_id integer,
     path varchar, media_id integer)`,
  `ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS gallery_categories_id integer`,
]) {
  await client.query(sql)
}

// ---------- seed gallery categories ----------
const payload = await getPayload({ config: configPromise })

const galleryTabs = [
  { slug: 'kitchens', title: 'Our Kitchens', categories: ['Kitchens (GALLERY)'] },
  { slug: 'bathrooms', title: 'Our Bathrooms', categories: ['Bathroom (GALLERY)'] },
  { slug: 'adu-additions', title: 'ADU & Additions', categories: ['ADU', 'Addition', 'New Construction'] },
]
for (const tab of galleryTabs) {
  const ids = tab.categories.flatMap((cat) => idsByCategory.get(cat) || [])
  const mediaIds = await mediaIdsForAttachmentIds(ids, 200)
  const existing = await payload.find({
    collection: 'gallery-categories',
    where: { slug: { equals: tab.slug } },
    limit: 1,
  })
  const data = { title: tab.title, slug: tab.slug, images: mediaIds }
  if (existing.docs[0]) {
    await payload.update({ collection: 'gallery-categories', id: existing.docs[0].id, data: data as never })
  } else {
    await payload.create({ collection: 'gallery-categories', data: data as never })
  }
  console.log(`gallery tab ${tab.slug}: ${mediaIds.length} blob images`)
}

// ---------- services hero + gallery images ----------
const serviceImageMap = {
  // WP page → [heroImageIds (first blob wins), galleryCategory, pageImageIds fallback]
  1: { hero: [2626], gallery: 'Kitchens', page: [2681, 2748, 2392, 2298, 2407, 2676, 2495, 2628, 2411, 543, 2577, 503] },
  2: { hero: [2072, 872], gallery: 'Home Remodeling', page: [693, 696, 698, 872] },
  3: { hero: [1844, 2415, 2490, 2710], gallery: 'Bathrooms', page: [2415, 2490, 468, 465, 2487, 2710, 2413, 517, 466, 516, 515, 508] },
  7: { hero: [2010, 2006, 2429, 2007], gallery: 'ADU', page: [2010, 2006, 2429, 2007] },
  8: { hero: [2003, 2482, 2492], gallery: 'Addition', page: [2003, 2482, 2492] },
  9: { hero: [2048, 2012, 2050, 872], gallery: 'New Construction', page: [2048, 2012, 2050, 872, 2051, 2052] },
  10: { hero: [1335, 2628, 2495], gallery: 'Kitchens', page: [2628, 2495, 522, 2678, 1652] },
  11: { hero: [827, 502, 494, 491], gallery: 'Custom Kitchens', page: [502, 1652, 494, 491, 483, 533, 1928, 532, 531, 528] },
  12: { hero: [542, 539], gallery: 'Kitchens', page: [542, 539] },
  13: { hero: [868, 872], gallery: '', page: [868, 872] },
  14: { hero: [2407, 2422, 2673, 975], gallery: '', page: [2407, 2422, 2763, 2673, 975, 2705, 2682] },
}

for (const [serviceId, spec] of Object.entries(serviceImageMap)) {
  // Hero image — first attachment with a blob-backed media record.
  let heroMediaId
  for (const attachmentId of spec.hero) {
    const entry = attachments.get(attachmentId)
    if (!entry) continue
    const mediaId = await mediaIdFor(entry.filename)
    if (mediaId) {
      heroMediaId = mediaId
      break
    }
  }
  if (heroMediaId) {
    await client.query(`UPDATE services SET hero_image_id = $1 WHERE id = $2`, [heroMediaId, serviceId])
    console.log(`service ${serviceId} hero → media #${heroMediaId}`)
  } else {
    console.log(`service ${serviceId} hero: no blob image found (left unchanged)`)
  }

  // Gallery — happyfiles category images, falling back to the page's own
  // image elements (blob-backed media only).
  if (spec.gallery) {
    const ids = idsByCategory.get(spec.gallery) || []
    let galleryIds = await mediaIdsForAttachmentIds(ids, 12)
    if (galleryIds.length < 3 && spec.page) {
      galleryIds = await mediaIdsForAttachmentIds(spec.page, 12)
    }
    if (galleryIds.length) {
      await client.query(`DELETE FROM services_gallery_images WHERE _parent_id = $1`, [serviceId])
      for (const [index, mediaId] of galleryIds.entries()) {
        await client.query(
          `INSERT INTO services_gallery_images (_order, _parent_id, media_id) VALUES ($1, $2, $3)`,
          [index, serviceId, mediaId],
        )
      }
      console.log(`service ${serviceId} gallery: ${galleryIds.length} blob images`)
    } else {
      console.log(`service ${serviceId} gallery: no blob images available`)
    }
  }
}

await client.end()
await payload.destroy()

