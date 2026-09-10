/**
 * Hides the kitchen-remodeling sub-category pages (European Kitchen, Custom
 * Kitchen, Shaker Kitchen) from the Contact consultation list by unchecking
 * their "Show in Consultation Form" flag — the list renders only checked
 * services. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

const r = await c.query(
  "update services set show_in_consultation_form = false where slug in ('european-kitchen', 'custom-kitchen', 'shaker-kitchen') returning title, show_in_consultation_form",
)
console.log(JSON.stringify(r.rows))

const check = await c.query(
  'select title, show_in_consultation_form from services order by id',
)
console.log(JSON.stringify(check.rows))
await c.end()
process.exit(0)
