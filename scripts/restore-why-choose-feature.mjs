/**
 * Restores the missing first feature of the "Why choose Prime Design & Build?"
 * (experience-difference) blocks. The WordPress source has SIX icon-boxes —
 * "Over 350+ Projects / in Silicon Valley" comes first — but the import only
 * carried five. Inserts the missing row at the top of both the service and
 * landing page block feature lists. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const client = new Client({ connectionString: u })
await client.connect()

/**
 * Targets are resolved through the block's owner, never by a literal block id.
 * Both uuids pinned here had stopped existing, so every statement below
 * matched nothing while the script still reported success.
 *
 * The service block is the "Why choose Prime Design & Build?" section on the
 * Home Repair page. The landing-page blocks are resolved as a set: every
 * landing page carrying this section lost the same first icon-box in the
 * import, and the "already present" check below keeps the insert idempotent
 * per block.
 */
const TARGETS = []

const serviceBlocks = await client.query(
  `select b.id from services_blocks_experience_difference b
     join services s on s.id = b._parent_id
    where s.slug = $1`,
  ['comprehensive-home-repair-installation-services-in-silicon-valley'],
)
if (!serviceBlocks.rows.length)
  throw new Error('No experience-difference block on the Home Repair service')
for (const row of serviceBlocks.rows) {
  TARGETS.push({ table: 'services_blocks_experience_difference_features', parent: row.id })
}

const landingBlocks = await client.query(
  `select b.id from landing_pages_blocks_experience_difference b
     join landing_pages l on l.id = b._parent_id
    order by l.slug`,
)
for (const row of landingBlocks.rows) {
  TARGETS.push({ table: 'landing_pages_blocks_experience_difference_features', parent: row.id })
}
console.log(`resolved ${TARGETS.length} experience-difference block(s)`)

for (const { table, parent } of TARGETS) {
  const existing = await client.query(
    `select id from ${table} where _parent_id = $1 and title = 'Over 350+ Projects'`,
    [parent],
  )
  if (existing.rows.length) {
    console.log(`skip (already present): ${table}`)
    continue
  }
  // Make room at the top, then insert the missing first feature.
  await client.query(`update ${table} set _order = _order + 1 where _parent_id = $1`, [parent])
  await client.query(
    `insert into ${table} (id, _order, _parent_id, title, description)
     values ($1, 0, $2, $3, $4)`,
    [randomUUID(), parent, 'Over 350+ Projects', 'in Silicon Valley'],
  )
  console.log(`inserted missing feature into ${table}`)
}

// Verify both lists.
for (const { table, parent } of TARGETS) {
  const rows = await client.query(
    `select _order, title, description from ${table} where _parent_id = $1 order by _order`,
    [parent],
  )
  console.log(`\n${table}:`)
  for (const r of rows.rows) console.log(`  ${r._order}. ${r.title} — ${r.description}`)
}

await client.end()
console.log('\nDone.')
process.exit(0)
