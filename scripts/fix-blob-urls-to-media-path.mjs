// Convert the blob host URLs (written by the previous step) to the site's
// payload-native form /api/media/file/<filename>, which next/image renders
// without a remote-pattern entry.
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
  for (const [table, col] of targets) {
    const rows = await client.query(
      `SELECT id, ${col} AS value FROM ${table} WHERE ${col} LIKE '%.public.blob.vercel-storage.com/%'`,
    )
    for (const row of rows.rows) {
      const filename = decodeURIComponent(row.value.split('/').pop() || '')
      if (!filename) continue
      await client.query(`UPDATE ${table} SET ${col} = $1 WHERE id = $2`, [
        `/api/media/file/${filename}`,
        row.id,
      ])
      console.log(`FIX ${table}.${col} #${row.id} → /api/media/file/${filename}`)
      fixed++
    }
  }
  console.log(`\nfixed: ${fixed}`)
} finally {
  await client.end()
}
