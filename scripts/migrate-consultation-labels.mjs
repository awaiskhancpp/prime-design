/**
 * Adds the per-service consultation label: every service gets a
 * `consultation_label` pre-filled with "{Title} Consultation" (e.g.
 * "Kitchen Remodeling Consultation"), used as the appointment name in the
 * Contact consultation list. Only services whose `show_in_consultation_form`
 * checkbox is checked are rendered there (default true). Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

await c.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS consultation_label varchar`)
// Pre-fill every service's appointment name with "{Title} Consultation";
// existing custom values are kept.
const r = await c.query(
  `update services set consultation_label = title || ' Consultation' where consultation_label is null`,
)
console.log(`rows prefilled: ${r.rowCount}`)

const check = await c.query(
  'select id, title, show_in_consultation_form, consultation_label from services order by id',
)
console.log(JSON.stringify(check.rows, null, 2))
await c.end()
process.exit(0)
