/**
 * Removes the ADU page's legacy "Accessory Dwelling Units (ADUs) -
 * Expanding Your Living Space" image-text block — the section is extra on
 * the ADU page (the user's page does not render it). Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()
const rows = await c.query('select id from services_blocks_image_text_2 where _parent_id = 7')
for (const r of rows.rows) {
  await c.query('delete from services_blocks_image_text_2_buttons where _parent_id = $1', [r.id])
  await c.query('delete from services_blocks_image_text_2 where id = $1', [r.id])
}
console.log(`removed ${rows.rows.length} adu image-text block(s)`)
await c.end()
process.exit(0)
