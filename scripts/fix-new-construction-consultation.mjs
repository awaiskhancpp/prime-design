/**
 * Restores the "New Construction Consultation" card on the contact page.
 *
 * The WordPress contact page (post 310) shows six consultation cards:
 * Additions, Complete Renovation, ADU / Garage Conversion, New Construction,
 * Kitchen Remodeling and Bathroom Remodeling. Only five rendered, because the
 * New Construction card is backed by the Home Remodeling service and that
 * service had `showInConsultationForm` unchecked. (`src/lib/consultations.ts`
 * also ordered by a `new-construction` slug that does not exist; that is fixed
 * in the same change.)
 *
 * Resolved by slug. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const c = new Client({ connectionString: u })
await c.connect()

const { rowCount, rows } = await c.query(
  `update services
      set show_in_consultation_form = true,
          consultation_label = 'New Construction Consultation'
    where slug = $1
    returning id, slug, consultation_label, show_in_consultation_form`,
  ['home-remodeling'],
)
if (!rowCount) throw new Error('No service row with slug "home-remodeling"')
console.log('updated:', JSON.stringify(rows[0]))

console.log('\nconsultation cards now enabled (top-level services only):')
const cards = await c.query(
  `select slug, coalesce(consultation_label, title || ' Consultation') label
     from services
    where show_in_consultation_form = true and parent_service_id is null
    order by id`,
)
for (const r of cards.rows) console.log(`   ${r.slug.padEnd(22)} ${r.label}`)
console.log(`total: ${cards.rowCount}`)

await c.end()
process.exit(0)
