/**
 * Seeds the Site Settings global with the WordPress/canonical company
 * details and makes it the single source for contact info site-wide.
 * Values come from the WordPress source (contact page template: address 1
 * links to the Google Business profile, address 2 is plain text; hours;
 * telephone; email; license) and the harvested website.json for the ACF
 * options WordPress did not export (phone, email, license, social URLs).
 * Deterministic + idempotent (delete + insert child rows).
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

// ---- schema parity for the new fields ------------------------------
await c.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS company_hours varchar`)
await c.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS company_phone_cta varchar`)
await c.query(
  `ALTER TABLE site_settings_company_addresses ADD COLUMN IF NOT EXISTS link varchar`,
)

// ---- ensure the global row exists -----------------------------------
const existing = await c.query('select id from site_settings limit 1')
const settingsId = existing.rows[0]?.id ?? (
  await c.query(
    `insert into site_settings (id, updated_at, created_at) values (1, now(), now()) returning id`,
  )
).rows[0].id

// ---- company + socials + SEO ----------------------------------------
const GOOGLE_BUSINESS = 'https://maps.google.com/?cid=11837063325613881352'
await c.query(
  `update site_settings set
     company_name = 'Prime Design & Build',
     company_email = 'office@primedesignandbuild.com',
     company_email_link = 'mailto:office@primedesignandbuild.com',
     company_phone = '(650) 220-9600',
     company_phone_clean = '6502209600',
     company_phone_cta = '(650) 235-4863',
     company_license = 'LIC #1087809',
     company_hours = 'Open: 8am - 6pm (Mon - Fri)',
     social_links_google_business = $1,
     social_links_yelp = 'https://www.yelp.com/biz/prime-kitchens-santa-clara',
     social_links_houzz = 'https://www.houzz.com/professionals/kitchen-and-bath-remodelers/prime-kitchens-pfvwus-pf~508047204',
     seo_meta_title = 'Prime Design & Build',
     seo_meta_description = 'Silicon Valley''s Premier Home Remodeling Experts',
     seo_og_title = 'Prime Design & Build',
     seo_og_description = 'Silicon Valley''s Premier Home Remodeling Experts',
     seo_no_index = false
   where id = $2`,
  [GOOGLE_BUSINESS, settingsId],
)

// ---- default OG image: the brand logo media if available -------------
const logo = await c.query(
  `select id from media where filename ilike '%Prime-Kitchens-Logo%' limit 1`,
)
if (logo.rows[0]) {
  await c.query(`update site_settings set default_og_image_id = $1 where id = $2`, [
    logo.rows[0].id,
    settingsId,
  ])
  console.log(`defaultOgImage: media ${logo.rows[0].id} (logo)`)
} else {
  console.log('defaultOgImage: no logo media found — left empty')
}

// ---- addresses: one linked (Google Business), one plain --------------
await c.query(`delete from site_settings_company_addresses where _parent_id = $1`, [settingsId])
const ADDRESSES = [
  ['416 East Campbell Ave, Campbell CA 95008', GOOGLE_BUSINESS],
  ['3 E 3rd Ave Suite 200, San Mateo, CA 94401', null],
]
for (let i = 0; i < ADDRESSES.length; i++) {
  await c.query(
    `insert into site_settings_company_addresses (_order, _parent_id, id, address, link)
     values ($1, $2, $3, $4, $5)`,
    [i, settingsId, randomUUID(), ADDRESSES[i][0], ADDRESSES[i][1]],
  )
}
console.log('addresses:', ADDRESSES.map((a) => a[0]).join(' | '))

// ---- service areas: the 15 cities -----------------------------------
const locations = await c.query('select id, name from locations order by name')
const CITIES = [
  'Campbell', 'Cupertino', 'Fremont', 'Los Altos', 'Los Gatos', 'Menlo Park',
  'Milpitas', 'Mountain View', 'Palo Alto', 'Redwood City', 'San Jose',
  'Santa Clara', 'Saratoga', 'Silicon Valley', 'Sunnyvale',
]
await c.query(`delete from site_settings_service_areas where _parent_id = $1`, [settingsId])
let linked = 0
for (let i = 0; i < CITIES.length; i++) {
  const match = locations.rows.find((l) => l.name.toLowerCase() === CITIES[i].toLowerCase())
  if (!match) {
    console.log(`city missing from locations: ${CITIES[i]}`)
    continue
  }
  await c.query(
    `insert into site_settings_service_areas (_order, _parent_id, id, location_id)
     values ($1, $2, $3, $4)`,
    [i, settingsId, randomUUID(), match.id],
  )
  linked++
}
console.log(`serviceAreas: ${linked}/${CITIES.length} cities linked`)

await c.end()
console.log('Done.')
process.exit(0)
