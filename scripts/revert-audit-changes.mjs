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

/**
 * Services and blocks are resolved by slug, never by literal ids. The services
 * table was reseeded and every id shifted (adu 7->4, additions 8->5,
 * complete-renovation 9->6), and the two prime-difference block uuids below
 * no longer exist at all, so every statement here silently matched nothing.
 */
const serviceId = async (slug) => {
  const { rows } = await c.query('select id from services where slug = $1', [slug])
  if (!rows.length) throw new Error(`No service row with slug "${slug}"`)
  return rows[0].id
}
const primeDifferenceBlockId = async (slug) => {
  const { rows } = await c.query(
    `select b.id from services_blocks_prime_difference b
       join services s on s.id = b._parent_id
      where s.slug = $1`,
    [slug],
  )
  return rows[0]?.id ?? null
}
const ADU = await serviceId('adu')
const ADDITIONS = await serviceId('additions')
const COMPLETE_RENOVATION = await serviceId('complete-renovation')

// --- remove audit-added blocks (children first) ---
for (const [serviceId, table, childTable] of [
  [ADU, 'services_blocks_cta', null],
  [ADU, 'services_blocks_experience_difference', 'services_blocks_experience_difference_features'],
  [ADDITIONS, 'services_blocks_cta', null],
  [ADDITIONS, 'services_blocks_experience_difference', 'services_blocks_experience_difference_features'],
  [COMPLETE_RENOVATION, 'services_blocks_experience_difference', 'services_blocks_experience_difference_features'],
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
  "delete from services_blocks_video_2 where _parent_id = $1 and external_url like '%Prime%20Vid%20Noah%' returning id",
  [ADDITIONS],
)
console.log(`removed ${vids.rows.length} audit video rows (additions)`)

// --- clear audit group data ---
await c.query('update services set craftsmanship = null where id = $1', [ADU])
await c.query(
  "delete from services_rels where parent_id = $1 and path = 'galleryImages'",
  [ADU],
)
await c.query(
  `update services set
     silicon_valley_loves_eyebrow = null,
     silicon_valley_loves_heading = null,
     silicon_valley_loves_body = null
   where id = any($1::int[])`,
  [[ADDITIONS, COMPLETE_RENOVATION]],
)
console.log('cleared audit craftsmanship / gallery rels / silicon valley loves')

// --- logos: only Home Remodeling + Bathroom have none ---
const removed = await c.query(
  `delete from services_blocks_prime_difference_socials
   where _parent_id = any($1::varchar[])
   returning _parent_id`,
  [
    (
      await Promise.all(['home-remodeling', 'bathroom-remodeling'].map(primeDifferenceBlockId))
    ).filter(Boolean),
  ],
)
console.log(`removed social rows from ${removed.rows.length} blocks (home-remodeling + bathroom)`)

await c.end()
console.log('Done.')
process.exit(0)
