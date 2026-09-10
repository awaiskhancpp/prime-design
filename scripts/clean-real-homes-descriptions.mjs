/** Clean the Real Homes block descriptions (fabricated quotes were embedded). */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

const CLEAN_DESCRIPTION =
  'Explore the success stories of homeowners who entrusted Prime Design & Build to create their dream living spaces.'

for (const parent of [2, 8]) {
  const rows = await c.query(
    `select id, eyebrow, heading, description from services_blocks_landing_testimonials where _parent_id = $1`,
    [parent],
  )
  for (const b of rows.rows) {
    console.log(`service ${parent} BEFORE: eyebrow=${JSON.stringify(b.eyebrow)} desc=${JSON.stringify((b.description ?? '').slice(0, 120))}`)
    await c.query(`update services_blocks_landing_testimonials set description = $2 where id = $1`, [
      b.id,
      CLEAN_DESCRIPTION,
    ])
  }
}
await c.end()
console.log('descriptions cleaned')
process.exit(0)
