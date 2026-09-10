/**
 * Links the 15 Silicon Valley locations to the ADU and Finance services so
 * their pages end with the shared "Areas we service" strip
 * (LandingServiceAreasSection). Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

const slugify = (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const locations = await c.query('select id, name from locations order by id')
const TARGETS = [
  [7, 'adu', 'ADU'],
  [13, 'finance', 'Finance'],
]
for (const [serviceId, serviceSlug, title] of TARGETS) {
  let created = 0
  for (const loc of locations.rows) {
    const slug = `${serviceSlug}-in-${slugify(loc.name)}`
    const existing = await c.query('select id from service_locations where slug = $1', [slug])
    if (existing.rows.length) continue
    await c.query(
      `insert into service_locations (title, slug, service_id, location_id, city)
       values ($1, $2, $3, $4, $5)`,
      [`${title} in ${loc.name}`, slug, serviceId, loc.id, loc.name],
    )
    created += 1
  }
  console.log(`${serviceSlug}: created ${created}`)
}
await c.end()
process.exit(0)
