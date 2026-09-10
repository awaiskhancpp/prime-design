/**
 * Reverts the sections added during the audit run (the user had already
 * fixed and verified those pages) and applies the logo corrections:
 *
 *   - ADU: remove audit CTA + why-choose blocks, craftsmanship text,
 *     gallery image rels
 *   - Additions: remove audit CTA + video (Noah) + why-choose blocks,
 *     clear Silicon Valley Loves
 *   - Complete Renovation: remove audit why-choose block, clear Silicon
 *     Valley Loves
 *   - Home Remodeling + Bathroom: remove the social logo rows (the only two
 *     pages whose WordPress section has no logos)
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

// --- remove audit-added blocks (children first) ---
for (const [serviceId, table, childTable] of [
  [7, 'services_blocks_cta', null],
  [7, 'services_blocks_experience_difference', 'services_blocks_experience_difference_features'],
  [8, 'services_blocks_cta', null],
  [8, 'services_blocks_experience_difference', 'services_blocks_experience_difference_features'],
  [9, 'services_blocks_experience_difference', 'services_blocks_experience_difference_features'],
]) {
  const rows = await c.query(`select id from ${table} where _parent_id = $1`, [serviceId])
  for (const r of rows.rows) {
    if (childTable) {
      await c.query(`delete from ${childTable} where _parent_id = $1`, [r.id])
    }
    await c.query(`delete from ${table} where id = $1`, [r.id])
  }
  console.log(`removed ${rows.rows.length} ${table} rows for service ${serviceId}`)
}
// additions Noah video block
const vids = await c.query(
  "delete from services_blocks_video_2 where _parent_id = 8 and external_url like '%Prime%20Vid%20Noah%' returning id",
)
console.log(`removed ${vids.rows.length} audit video rows (additions)`)

// --- clear audit group data ---
await c.query('update services set craftsmanship = null where id = 7')
await c.query(
  "delete from services_rels where parent_id = 7 and path = 'galleryImages'",
)
await c.query(
  `update services set
     silicon_valley_loves_eyebrow = null,
     silicon_valley_loves_heading = null,
     silicon_valley_loves_body = null
   where id in (8, 9)`,
)
console.log('cleared audit craftsmanship / gallery rels / silicon valley loves')

// --- logos: only Home Remodeling + Bathroom have none ---
const removed = await c.query(
  `delete from services_blocks_prime_difference_socials
   where _parent_id in ('009134c4-9abf-4aa3-80e9-990161774756', '94a657a1-47b3-40b2-a889-2ee41b12ba09')
   returning _parent_id`,
)
console.log(`removed social rows from ${removed.rows.length} blocks (home-remodeling + bathroom)`)

await c.end()
console.log('Done.')
process.exit(0)
