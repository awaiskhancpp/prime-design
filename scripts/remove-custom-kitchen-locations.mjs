/**
 * Removes the 15 `custom-kitchen-in-*` service-location records.
 *
 * They exist only in Payload. WordPress has exactly 45 location pages
 * (kitchen / bathroom / home-remodeling x 15 cities) and no custom-kitchen
 * ones; these rows were created by step 9 of `scripts/migrate-custom-kitchen.mjs`,
 * which copies the city list onto whichever service it is run for.
 *
 * They carry no migrated content — every one has a null featured image, null
 * SEO description, null location video, and zero prime-difference reasons or
 * testimonial cards — so they published 15 near-empty, indexable URLs.
 *
 * Child rows are deleted first, then the parents. Resolved by service slug.
 * Idempotent: a second run reports 0 remaining and changes nothing.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const SERVICE_SLUG = 'custom-kitchen'

const c = new Client({ connectionString: u })
await c.connect()

const service = (await c.query('select id from services where slug = $1', [SERVICE_SLUG])).rows[0]
if (!service) throw new Error(`No service row with slug "${SERVICE_SLUG}"`)

const targets = (
  await c.query('select id, slug from service_locations where service_id = $1 order by slug', [
    service.id,
  ])
).rows

if (!targets.length) {
  console.log(`No service-location rows for "${SERVICE_SLUG}" — nothing to do.`)
  await c.end()
  process.exit(0)
}

// Safety: refuse to delete anything that actually carries content.
const nonEmpty = (
  await c.query(
    `select sl.slug from service_locations sl
      where sl.service_id = $1
        and (sl.featured_image_id is not null
             or coalesce(sl.seo_meta_description, '') <> ''
             or coalesce(sl.location_video_video_url, '') <> ''
             or exists (select 1 from service_locations_prime_difference_reasons r where r._parent_id = sl.id)
             or exists (select 1 from service_locations_testimonial_cards_items t where t._parent_id = sl.id))`,
    [service.id],
  )
).rows
if (nonEmpty.length) {
  throw new Error(
    `Refusing to delete: ${nonEmpty.length} row(s) carry content — ${nonEmpty.map((r) => r.slug).join(', ')}`,
  )
}

console.log(`deleting ${targets.length} "${SERVICE_SLUG}" service-location rows:`)
for (const t of targets) console.log(`   ${t.slug}`)

const ids = targets.map((t) => t.id)

// Child tables that hang off service_locations, discovered rather than listed,
// so a new sub-table cannot be missed and leave orphans behind.
const children = (
  await c.query(
    `select table_name from information_schema.tables
      where table_schema = 'public'
        and table_name like 'service_locations\_%'
      order by length(table_name) desc`,
  )
).rows.map((r) => r.table_name)

let childDeleted = 0
for (const table of children) {
  const cols = (
    await c.query(
      `select column_name from information_schema.columns where table_name = $1`,
      [table],
    )
  ).rows.map((r) => r.column_name)
  const fk = ['_parent_id', 'parent_id'].find((k) => cols.includes(k))
  if (!fk) continue
  const { rowCount } = await c.query(
    `delete from ${table} where ${fk} = any($1::int[])`,
    [ids],
  )
  if (rowCount) {
    childDeleted += rowCount
    console.log(`   - ${rowCount} row(s) from ${table}`)
  }
}

const { rowCount: parentDeleted } = await c.query(
  'delete from service_locations where id = any($1::int[])',
  [ids],
)

console.log(`\ndeleted ${parentDeleted} service_locations row(s) and ${childDeleted} child row(s)`)

const remaining = await c.query(
  `select s.slug, count(sl.id)::int n
     from services s left join service_locations sl on sl.service_id = s.id
    group by s.slug having count(sl.id) > 0 order by s.slug`,
)
console.log('\nservice-locations remaining:')
let total = 0
for (const r of remaining.rows) {
  total += r.n
  console.log(`   ${r.slug.padEnd(22)} ${r.n}`)
}
console.log(`   ${'TOTAL'.padEnd(22)} ${total}   (WordPress has 45)`)

await c.end()
process.exit(0)
