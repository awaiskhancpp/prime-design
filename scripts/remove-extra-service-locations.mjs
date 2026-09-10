/**
 * Only three services have location pages (Kitchen, Bathroom, Home
 * Remodeling — each with 30 city pages in the WordPress export). Removes
 * every service-location record created for the other services (Finance,
 * ADU, European/Custom/Shaker Kitchen, Comprehensive Home Repair). The
 * areas strip on those pages keeps rendering the same canonical city list
 * via the static fallback. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

const before = await c.query(
  'select s.id, s.slug, count(sl.id)::int as n from services s left join service_locations sl on sl.service_id = s.id group by s.id, s.slug order by s.id',
)
console.log('BEFORE', JSON.stringify(before.rows))

const del = await c.query('delete from service_locations where service_id not in (1, 2, 3)')
console.log(`deleted ${del.rowCount} service-location rows`)

const after = await c.query(
  'select s.id, s.slug, count(sl.id)::int as n from services s left join service_locations sl on sl.service_id = s.id group by s.id, s.slug order by s.id',
)
console.log('AFTER', JSON.stringify(after.rows))
await c.end()
process.exit(0)
