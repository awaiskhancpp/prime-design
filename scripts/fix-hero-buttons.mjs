/**
 * Aligns every service hero's buttons with WordPress (labels + links).
 * ServiceHero renders the hero GROUP buttons, so those are the rows set.
 * WP sources:
 *  - kitchen-remodeling: page 3261 "Kitchen Remodeling Information" hero —
 *    "Schedule a Free Consultation" → #contact_form (→ /contact).
 *  - home/bathroom/adu/additions/complete-renovation: "Start your renovation" /
 *    "Get a Free Consultation" → #contact (→ /contact) + "Explore Our
 *    Portfolio" → Our Projects (→ /our-projects).
 *  - european/custom/shaker: "Schedule a Consultation" → #contact (→ /contact).
 *  - comprehensive home repair: "Talk to an expert" → Contact, "View Our
 *    Portfolio" → Our Projects.
 *  - finance: already correct.
 * Deterministic + idempotent (delete + insert the exact WP set).
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

const CONTACT = '/contact'
const PROJECTS = '/our-projects'

const HERO_BUTTONS = {
  1: [['Schedule a Free Consultation', CONTACT]],
  2: [
    ['Start your renovation', CONTACT],
    ['Explore Our Portfolio', PROJECTS],
  ],
  3: [
    ['Get a Free Consultation', CONTACT],
    ['Explore Our Portfolio', PROJECTS],
  ],
  7: [
    ['Start your renovation', CONTACT],
    ['Explore Our Portfolio', PROJECTS],
  ],
  8: [
    ['Start your renovation', CONTACT],
    ['Explore Our Portfolio', PROJECTS],
  ],
  9: [
    ['Start your renovation', CONTACT],
    ['Explore Our Portfolio', PROJECTS],
  ],
  10: [['Schedule a Consultation', CONTACT]],
  11: [['Schedule a Consultation', CONTACT]],
  12: [['Schedule a Consultation', CONTACT]],
  14: [
    ['Talk to an expert', CONTACT],
    ['View Our Portfolio', PROJECTS],
  ],
}

for (const [serviceId, buttons] of Object.entries(HERO_BUTTONS)) {
  await c.query(`delete from services_hero_buttons where _parent_id = $1`, [Number(serviceId)])
  for (let i = 0; i < buttons.length; i++) {
    await c.query(
      `insert into services_hero_buttons (_order, _parent_id, id, label, url) values ($1, $2, $3, $4, $5)`,
      [i, Number(serviceId), randomUUID(), buttons[i][0], buttons[i][1]],
    )
  }
  console.log(`service ${serviceId}: ${buttons.map((b) => `${b[0]} -> ${b[1]}`).join(' | ')}`)
}

// Bathroom hero heading: WordPress "Crafting Your Dream Bathroom, Our
// Specialty" (the migrated value has a stray space before the comma).
await c.query(
  `update services set hero_heading = 'Crafting Your Dream Bathroom, Our Specialty'
   where id = 3 and hero_heading = 'Crafting Your Dream Bathroom , Our Specialty'`,
)
console.log('bathroom hero heading: comma artifact fixed')

await c.end()
console.log('Done.')
process.exit(0)
