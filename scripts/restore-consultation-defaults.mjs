/**
 * Restores the three kitchen child categories' "Show in Consultation Form"
 * checkbox to its default (true). Their exclusion from the Contact list is
 * now handled structurally by `resolveConsultations` (services with a
 * parentService never render there), so the checkbox stays a plain opt-out
 * for main services and new child categories are excluded automatically.
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

const r = await c.query(
  "update services set show_in_consultation_form = true where slug in ('european-kitchen', 'custom-kitchen', 'shaker-kitchen') returning title, show_in_consultation_form",
)
console.log(JSON.stringify(r.rows))
await c.end()
process.exit(0)
