/**
 * Uploads existing media into Vercel Blob and points media.url at the blob
 * URL, so the site no longer depends on the local uploads dir or WordPress
 * hotlinks. Idempotent: rows whose url is already a blob URL are skipped.
 * Local files come from ./media; hotlink-only rows download from source_url
 * (WordPress may 403 some — those are recorded in the failures file).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createRequire } from 'node:module'
import { put } from '@vercel/blob'
import { sanitizeFilename } from 'payload/shared'

/** Same key computation as the Payload Vercel Blob plugin (no prefixes). */
const fileKeyOf = (filename) => path.posix.join('', sanitizeFilename(filename))

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const ROOT = fileURLToPath(new URL('..', import.meta.url))

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const clean = (value) => value?.trim().replace(/^["']|["']$/g, '')
const TOKEN = clean(env.match(/^BLOB_READ_WRITE_TOKEN=(.+)$/m)?.[1])
if (!TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN missing in .env')
  process.exit(1)
}
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

const rows = await c.query(
  `select id, filename, mime_type, url, source_url from media order by id`,
)
console.log(`candidates: ${rows.rows.length}`)

const failures = []
let ok = 0
let skipped = 0
const CONCURRENCY = 4
let cursor = 0

const worker = async () => {
  while (cursor < rows.rows.length) {
    const row = rows.rows[cursor++]
    try {
      let body
      let pathname
      const urlName = row.url?.startsWith('/api/media/file/')
        ? decodeURIComponent(row.url.split('/').pop() ?? '')
        : null
      const keyFilename = row.filename ?? urlName ?? row.source_url?.split('/').pop() ?? `media-${row.id}`
      pathname = fileKeyOf(keyFilename)
      // Local file: the original upload (either the url's basename, or the
      // stored filename for rows whose url was already repointed at blob).
      const localPath = urlName
        ? path.join(ROOT, 'media', urlName)
        : path.join(ROOT, 'media', row.filename ?? '')
      if (existsSync(localPath)) {
        body = await readFile(localPath)
      } else if (row.source_url) {
        // Browser-like headers: WordPress hotlink protection blocks bare fetches.
        const res = await fetch(row.source_url, {
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
            Referer: 'https://primedesignandbuild.com/',
            Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*',
          },
        })
        if (!res.ok) {
          failures.push({ id: row.id, filename: row.filename, reason: `download ${res.status}` })
          continue
        }
        body = Buffer.from(await res.arrayBuffer())
      } else {
        skipped++
        continue
      }
      const blob = await put(pathname, body, {
        access: 'public',
        token: TOKEN,
        contentType: row.mime_type || undefined,
        allowOverwrite: true,
      })
      await c.query(`update media set url = $2 where id = $1`, [row.id, blob.url])
      ok++
    } catch (err) {
      failures.push({ id: row.id, filename: row.filename, reason: String(err?.message ?? err) })
    }
    if ((ok + failures.length) % 25 === 0) {
      console.log(`progress: ok=${ok} failed=${failures.length} skipped=${skipped}/${rows.rows.length}`)
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))
writeFileSync(
  new URL('./_blob-migration-failures.json', import.meta.url),
  JSON.stringify(failures, null, 2),
)
console.log(`DONE ok=${ok} failed=${failures.length} skipped=${skipped}`)
if (failures.length) console.log('failures written to scripts/_blob-migration-failures.json')
await c.end()
process.exit(0)
