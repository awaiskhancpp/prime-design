/**
 * European Kitchen (service id 10) — payload migration for the section
 * structure authored on the WordPress page `european-kitchen-silicon-valley`:
 *
 *   hero   → background IMAGE (no video), one button "Schedule a Consultation"
 *            → #contact, lead text without the duplicated title line
 *   cta    → the shared free-estimate banner (WP template `free-estimate`)
 *   video  → the hero video moved into a standalone video section (WP element
 *            499548, Prime Kitchens 1794 San Luis Ave MP4)
 *   primeKitchens → the bespoke "Why Choose Prime Kitchens? / The Prime
 *            Difference" three-card section (images live in /public)
 *   sub-services → eyebrow "Learn more about European Kitchens" added to the
 *            features header (heading + description already migrated)
 *   service_locations → 15 Silicon Valley city links so the "Areas we
 *            service" strip fetches from Payload
 *
 * All copy is taken verbatim from the WordPress XML. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const SERVICE_ID = 10
const HERO_VIDEO_URL =
  'https://tagmediaspace.b-cdn.net/Prime%20Kitchens/01.19.2023%20Prime%20Kitchens%201794%20San%20Luis%20Ave%20Mountain%20View.mp4'

const client = new Client({ connectionString: u })
await client.connect()

// ---- 1. Hero group: image background, single button, clean lead ----------
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS prime_kitchens_eyebrow varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS prime_kitchens_title varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS prime_kitchens_description varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS prime_kitchens_passion_heading varchar`)

await client.query(
  `update services set
     hero_lead = 'Experience the allure of European kitchens that blend elegance and functionality.',
     hero_video_id = null
   where id = $1`,
  [SERVICE_ID],
)

// hero.buttons array child table (Payload group arrays live in child tables)
await client.query(
  `create table if not exists services_hero_buttons (
     _order integer, _parent_id integer, id varchar, label varchar, url varchar
   )`,
)
await client.query(`delete from services_hero_buttons where _parent_id = $1`, [SERVICE_ID])
await client.query(
  `insert into services_hero_buttons (_order, _parent_id, id, label, url)
   values (0, $1, $2, 'Schedule a Consultation', '#contact')`,
  [SERVICE_ID, randomUUID()],
)

// ---- 2. Prime Kitchens difference section --------------------------------
await client.query(
  `create table if not exists services_prime_kitchens_cards (
     _order integer, _parent_id integer, id varchar, title varchar, image varchar
   )`,
)
await client.query(`delete from services_prime_kitchens_cards where _parent_id = $1`, [SERVICE_ID])
await client.query(
  `update services set
     prime_kitchens_eyebrow = 'Why Choose Prime Kitchens?',
     prime_kitchens_title = 'The Prime Difference',
     prime_kitchens_description = 'At Prime Kitchens, we understand that your kitchen is the heart of your home, and when it comes to European kitchen remodeling, we are the unrivaled experts.',
     prime_kitchens_passion_heading = 'Our passion for:'
   where id = $1`,
  [SERVICE_ID],
)
const CARDS = [
  ['Craftsmanship in every project', '/craftsmanship-in-every-project.svg'],
  ['Attention to detail, aiming for perfection', '/attention-to-detail-aiming-for-perfection.webp'],
  ['Dedication to customer satisfaction', '/dedication-to-customer-satisfaction.png'],
]
for (let i = 0; i < CARDS.length; i++) {
  await client.query(
    `insert into services_prime_kitchens_cards (_order, _parent_id, id, title, image)
     values ($1, $2, $3, $4, $5)`,
    [i, SERVICE_ID, randomUUID(), CARDS[i][0], CARDS[i][1]],
  )
}

// ---- 3. Features header eyebrow ------------------------------------------
await client.query(
  `update services_blocks_sub_services_2 set eyebrow = 'Learn more about European Kitchens'
   where _parent_id = $1`,
  [SERVICE_ID],
)

// ---- 4. Free-estimate CTA block + video block (re-ordered sections) ------
await client.query(
  `update services_blocks_prime_difference set _order = 4 where _parent_id = $1`,
  [SERVICE_ID],
)
await client.query(
  `update services_blocks_sub_services_2 set _order = 5 where _parent_id = $1`,
  [SERVICE_ID],
)
const existingCta = await client.query(
  `select id from services_blocks_cta where _parent_id = $1`,
  [SERVICE_ID],
)
if (!existingCta.rows.length) {
  await client.query(
    `insert into services_blocks_cta (_order, _parent_id, _path, id, heading, description, source_id, source_element_type)
     values (2, $1, 'sections', $2, 'Ready to schedule your free estimate?',
             'Contact us here or reach us at (650) 235-4863', 'dvqnrg', 'template')`,
    [SERVICE_ID, randomUUID()],
  )
}
const existingVideo = await client.query(
  `select id from services_blocks_video_2 where _parent_id = $1 and external_url = $2`,
  [SERVICE_ID, HERO_VIDEO_URL],
)
if (!existingVideo.rows.length) {
  await client.query(
    `insert into services_blocks_video_2
       (_order, _parent_id, _path, id, heading, description, source, external_url, poster_id, controls, source_id, source_element_type)
     values (3, $1, 'sections', $2, null, null, 'externalUrl', $3, null, true, '499548', 'video')`,
    [SERVICE_ID, randomUUID(), HERO_VIDEO_URL],
  )
}

// ---- 5. 15 city links for the areas strip ---------------------------------
const slugify = (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const locations = await client.query('select id, name from locations order by id')
let created = 0
for (const loc of locations.rows) {
  const slug = `european-kitchen-in-${slugify(loc.name)}`
  const existing = await client.query('select id from service_locations where slug = $1', [slug])
  if (existing.rows.length) continue
  await client.query(
    `insert into service_locations (title, slug, service_id, location_id, city)
     values ($1, $2, $3, $4, $5)`,
    [`European Kitchen in ${loc.name}`, slug, SERVICE_ID, loc.id, loc.name],
  )
  created += 1
}

console.log(`Done. Locations created: ${created}`)
const check = await client.query(
  `select hero_lead, hero_video_id, prime_kitchens_eyebrow, prime_kitchens_title, prime_kitchens_passion_heading from services where id = $1`,
  [SERVICE_ID],
)
console.log('SERVICE ROW', JSON.stringify(check.rows))
const btns = await client.query('select label, url from services_hero_buttons where _parent_id = $1', [SERVICE_ID])
console.log('HERO BUTTONS', JSON.stringify(btns.rows))
const cards = await client.query('select _order, title, image from services_prime_kitchens_cards where _parent_id = $1 order by _order', [SERVICE_ID])
console.log('PRIME CARDS', JSON.stringify(cards.rows))
const blocks = await client.query(
  "select t.table_name as t, b._order, b.id from services_blocks_cta b, (select 'cta' as table_name) t where b._parent_id = $1",
  [SERVICE_ID],
)
console.log('CTA CHECK', JSON.stringify(blocks.rows))
await client.end()
process.exit(0)
