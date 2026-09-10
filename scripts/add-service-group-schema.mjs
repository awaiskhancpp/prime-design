/** Schema parity for the new Services groups (whyChooseUs, realHomes). Idempotent. */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

const cols = [
  ['why_choose_us_eyebrow', 'varchar'], ['why_choose_us_heading', 'varchar'],
  ['real_homes_eyebrow', 'varchar'], ['real_homes_heading', 'varchar'],
  ['real_homes_heading_accent', 'varchar'], ['real_homes_description', 'varchar'],
  ['real_homes_cta_label', 'varchar'], ['real_homes_cta_href', 'varchar'],
]
for (const [name, type] of cols) {
  await c.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS ${name} ${type}`)
}
await c.query(
  `create table if not exists services_why_choose_us_items (
     _order integer, _parent_id integer, id varchar, title varchar, description varchar
   )`,
)
await c.query(
  `create table if not exists services_real_homes_testimonials (
     _order integer, _parent_id integer, id varchar, quote varchar, attribution varchar
   )`,
)
console.log('schema ready (all fields empty = fallback)')
await c.end()
process.exit(0)
