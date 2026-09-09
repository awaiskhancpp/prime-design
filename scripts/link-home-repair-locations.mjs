/**
 * Links the 15 Silicon Valley locations to the comprehensive home repair
 * service so the "Areas we service" strip (LandingServiceAreasSection after
 * Why Choose Us) renders from Payload — the same shared city strip every
 * other service page uses. Only structural fields are set (title/slug/city
 * + location link); no invented SEO or hero copy. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const slugify = (value) =>
  value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

const client = new Client({ connectionString: u })
await client.connect()

const service = await client.query(
  "select id from services where slug = 'comprehensive-home-repair-installation-services-in-silicon-valley'",
)
if (!service.rows[0]) throw new Error('service 14 not found')
const serviceId = service.rows[0].id

const locations = await client.query('select id, name from locations order by id')

let created = 0
for (const loc of locations.rows) {
  const slug = `comprehensive-home-repair-installation-services-in-silicon-valley-in-${slugify(loc.name)}`
  const existing = await client.query('select id from service_locations where slug = $1', [slug])
  if (existing.rows.length) {
    console.log(`skip (exists): ${slug}`)
    continue
  }
  await client.query(
    `insert into service_locations (title, slug, service_id, location_id, city)
     values ($1, $2, $3, $4, $5)`,
    [`Home Repair Services in ${loc.name}`, slug, serviceId, loc.id, loc.name],
  )
  created += 1
  console.log(`created: ${slug}`)
}

const total = await client.query('select count(*)::int as n from service_locations where service_id = $1', [
  serviceId,
])
console.log(`Done. ${created} created; total linked: ${total.rows[0].n}`)
await client.end()
process.exit(0)
