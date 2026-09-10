/**
 * Schema parity for the shared block fields added during the service-page
 * migrations: the `sub-services` items gained `label`, `body`, and a
 * `features` child array, and the `prime-difference` block gained
 * `checklist` and `socials` arrays. The services-side tables already carry
 * them; the landing_pages-side tables (queried at build time by Payload
 * even when empty) must match or prerendering fails with "column does not
 * exist". Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

// sub-services items (landing pages side)
await c.query(`ALTER TABLE landing_pages_blocks_sub_services_items ADD COLUMN IF NOT EXISTS label varchar`)
await c.query(`ALTER TABLE landing_pages_blocks_sub_services_items ADD COLUMN IF NOT EXISTS body varchar`)
await c.query(
  `create table if not exists landing_pages_blocks_sub_services_items_features (
     _order integer, _parent_id varchar, id varchar, text varchar
   )`,
)

// prime-difference block (landing pages side)
await c.query(
  `create table if not exists landing_pages_blocks_prime_difference_checklist (
     _order integer, _parent_id varchar, id varchar, text varchar
   )`,
)
await c.query(
  `create table if not exists landing_pages_blocks_prime_difference_socials (
     _order integer, _parent_id varchar, id varchar, image varchar, url varchar
   )`,
)

// repair-services categories parity (defensive — already migrated)
await c.query(`ALTER TABLE landing_pages_blocks_repair_services_categories ADD COLUMN IF NOT EXISTS label varchar`)
await c.query(`ALTER TABLE landing_pages_blocks_repair_services_categories ADD COLUMN IF NOT EXISTS closing_body jsonb`)

console.log('landing_pages schema parity applied')
await c.end()
process.exit(0)
