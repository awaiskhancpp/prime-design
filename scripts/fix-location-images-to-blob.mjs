// Replace WordPress hotlink image URLs (stored by the pre-project service
// location migrations) with the Vercel Blob URLs of the already-migrated
// media records. The media collection holds the same filenames; rows whose
// media file is missing from blob are left untouched and reported.
import { readFileSync } from 'node:fs'
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'

const rawEnv = readFileSync('.env', 'utf8')
const conn = (rawEnv.match(/DATABASE_URL=([^\r\n]+)/) || [])[1].replace(/^"(.*)"$/, '$1')

const targets = [
  ['services', 'image_checklist_image'],
  ['service_locations', 'quote_image'],
  ['service_locations', 'silicon_valley_loves_image'],
]

const client = new pg.Client({ connectionString: conn })
await client.connect()
try {
  let fixed = 0
  let skipped = 0
  for (const [table, col] of targets) {
    const rows = await client.query(
      `SELECT id, ${col} AS value FROM ${table} WHERE ${col} ~ '^https?://primedesignandbuild\\.com'`,
    )
    for (const row of rows.rows) {
      let filename = ''
      try {
        filename = decodeURIComponent(new URL(row.value).pathname.split('/').pop() || '')
      } catch {
        skipped++
        continue
      }
      const media = await client.query(
        `SELECT id, url, filename FROM media WHERE filename ILIKE $1 LIMIT 1`,
        [filename],
      )
      if (!media.rows[0] || !media.rows[0].url) {
        console.log(`SKIP ${table}.${col} #${row.id}: ${filename} (${media.rows[0] ? 'no blob file' : 'no media row'})`)
        skipped++
        continue
      }
      await client.query(`UPDATE ${table} SET ${col} = $1 WHERE id = $2`, [media.rows[0].url, row.id])
      console.log(`FIX  ${table}.${col} #${row.id}: ${filename} → blob`)
      fixed++
    }
  }
  console.log(`\nfixed: ${fixed}, skipped: ${skipped}`)
} finally {
  await client.end()
}
