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

const TARGETS = [
  {
    table: 'services_blocks_experience_difference_features',
    parent: '45e9274c-53d4-4c22-b995-242f4f2a39cf',
  },
  {
    table: 'landing_pages_blocks_experience_difference_features',
    parent: '6a9ef34b06ed2e521083593a',
  },
]

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
