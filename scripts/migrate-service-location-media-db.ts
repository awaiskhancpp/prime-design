import 'dotenv/config'
import { createRequire } from 'node:module'
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { transformWordPressServiceLocations } from './transform-wordpress-service-locations'

const { Client } = createRequire(import.meta.url)('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')
const mediaXmlPath = process.argv[2] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-26 (1).xml'
const pagesXmlPath = process.argv[3] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-26.xml'
const localUploadsDir = process.argv[4]
const mediaDir = path.resolve(process.cwd(), 'media')
const field = (item: string, tag: string) => item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim()
const filename = (url: string) => decodeURIComponent(new URL(url).pathname.split('/').pop() || 'wordpress-image')
const mimeType = (name: string) => ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', svg: 'image/svg+xml' })[name.split('.').pop()?.toLowerCase() || ''] || 'application/octet-stream'
const exists = async (filePath: string) => access(filePath).then(() => true).catch(() => false)

async function findLocalFile(directory: string, target: string): Promise<string | undefined> {
  try {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name)
      if (entry.isFile() && entry.name.toLowerCase() === target.toLowerCase()) return entryPath
      if (entry.isDirectory()) {
        const nested = await findLocalFile(entryPath, target)
        if (nested) return nested
      }
    }
  } catch {
    return undefined
  }
  return undefined
}

const [mediaXml, pagesXml] = await Promise.all([readFile(mediaXmlPath, 'utf8'), readFile(pagesXmlPath, 'utf8')])
const attachments = new Map<number, { title: string; url: string }>()
for (const match of mediaXml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
  const item = match[1]
  if (field(item, 'wp:post_type') !== 'attachment') continue
  const id = Number(field(item, 'wp:post_id'))
  const url = field(item, 'wp:attachment_url')
  if (id && url) attachments.set(id, { title: field(item, 'title') || filename(url), url })
}

const locations = transformWordPressServiceLocations(pagesXml)
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
await mkdir(mediaDir, { recursive: true })
let imported = 0
let reused = 0
try {
  await client.query('BEGIN')
  for (const location of locations) {
    if (!location.thumbnailId) continue
    const attachment = attachments.get(location.thumbnailId)
    if (!attachment) {
      console.warn(`Missing attachment ${location.thumbnailId} for ${location.slug}`)
      continue
    }
    const name = filename(attachment.url)
    const localFile = localUploadsDir ? await findLocalFile(localUploadsDir, name) : undefined
    const localPath = path.join(mediaDir, name)
    const existing = await client.query('SELECT id FROM media WHERE filename = $1 LIMIT 1', [name])
    let mediaId: number
    if (existing.rows[0]) {
      mediaId = existing.rows[0].id
      reused++
      if (localFile) await writeFile(localPath, await readFile(localFile))
    } else {
      const data = localFile
        ? await readFile(localFile)
        : await (async () => {
          const response = await fetch(attachment.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
              Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
              Referer: 'https://primedesignandbuild.com/',
            },
          })
          if (!response.ok) throw new Error(`Download failed for ${attachment.url}: ${response.status}`)
          return Buffer.from(await response.arrayBuffer())
        })()
      await writeFile(localPath, data)
      const metadata = await sharp(data).metadata()
      const result = await client.query(
        `INSERT INTO media (alt, url, filename, mime_type, filesize, width, height, focal_x, focal_y, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 50, 50, NOW(), NOW()) RETURNING id`,
        [attachment.title, `/api/media/file/${name}`, name, mimeType(name), data.length, metadata.width || null, metadata.height || null],
      )
      mediaId = result.rows[0].id
      imported++
    }
    if (!await exists(localPath)) throw new Error(`Media file was not materialized at ${localPath}`)
    await client.query('UPDATE service_locations SET featured_image_id = $1, updated_at = NOW() WHERE slug = $2', [mediaId, location.slug])
  }
  await client.query('COMMIT')
  const result = await client.query('SELECT COUNT(*)::int AS records, COUNT(featured_image_id)::int AS linked FROM service_locations WHERE slug LIKE \'%-in-%\'')
  console.log(`Media migration complete: imported=${imported}, reused=${reused}, service-location records=${result.rows[0].records}, linked=${result.rows[0].linked}`)
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  await client.end()
}
