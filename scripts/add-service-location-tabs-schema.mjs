/**
 * Adds the "Location Page Sections" tab schema to the service_locations
 * table: the six override groups (locationVideo, dontSettle, primeDifference,
 * quote, siliconValleyLoves, testimonialCards) plus their array child tables.
 * All values start empty — an empty field inherits from the parent service's
 * "Location Page Sections" defaults, then from the built-in per-city template.
 * Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

// Group columns — naming mirrors the services table (Payload group fields).
const cols = [
  ['location_video_eyebrow', 'varchar'], ['location_video_title', 'varchar'],
  ['location_video_description', 'varchar'], ['location_video_tagline', 'varchar'],
  ['location_video_video_url', 'varchar'], ['location_video_poster', 'varchar'],
  ['dont_settle_eyebrow', 'varchar'], ['dont_settle_heading', 'varchar'],
  ['dont_settle_heading_accent', 'varchar'], ['dont_settle_body', 'varchar'],
  ['dont_settle_cta_label', 'varchar'],
  ['prime_difference_eyebrow', 'varchar'], ['prime_difference_heading', 'varchar'],
  ['prime_difference_body', 'varchar'],
  ['quote_heading', 'varchar'], ['quote_quote', 'varchar'],
  ['quote_attribution', 'varchar'], ['quote_image', 'varchar'],
  ['silicon_valley_loves_eyebrow', 'varchar'], ['silicon_valley_loves_heading', 'varchar'],
  ['silicon_valley_loves_body', 'varchar'], ['silicon_valley_loves_image', 'varchar'],
]
for (const [name, type] of cols) {
  await c.query(`ALTER TABLE service_locations ADD COLUMN IF NOT EXISTS ${name} ${type}`)
}

await c.query(
  `create table if not exists service_locations_prime_difference_checklist (
     _order integer, _parent_id integer, id varchar, text varchar
   )`,
)
await c.query(
  `create table if not exists service_locations_prime_difference_reasons (
     _order integer, _parent_id integer, id varchar, title varchar, description varchar, image varchar
   )`,
)
await c.query(
  `create table if not exists service_locations_silicon_valley_loves_stats (
     _order integer, _parent_id integer, id varchar, value varchar, label varchar, detail varchar
   )`,
)
await c.query(
  `create table if not exists service_locations_testimonial_cards_items (
     _order integer, _parent_id integer, id varchar, name varchar, quote varchar, avatar varchar
   )`,
)

const count = await c.query('select count(*)::int as n from service_locations')
console.log(`Schema ready. service_locations rows: ${count.rows[0].n} (all fields empty = inherit).`)
await c.end()
process.exit(0)
