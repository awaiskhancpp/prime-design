import 'dotenv/config'
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'
const { Client } = pg
const url = (process.env.DATABASE_URL || '').replace(/^"|"$/g, '')
const client = new Client({ connectionString: url })
await client.connect()

// 1. Public names = the WordPress homepage "Our Services" card names
await client.query(`UPDATE services SET title = 'ADU & Garage Conversions' WHERE slug = 'adu'`)
await client.query(`UPDATE services SET title = 'Home Additions' WHERE slug = 'additions'`)
await client.query(`UPDATE services SET title = 'New Construction / Complete Renovation' WHERE slug = 'complete-renovation'`)

// 2. Consultation labels (WP contact page 310 card names)
await client.query(`UPDATE services SET consultation_label = 'ADU / Garage Conversion' WHERE slug = 'adu'`)

// 3. Only the six WP consultation services may appear on the contact page
await client.query(
  `UPDATE services SET show_in_consultation_form = false WHERE slug IN ('home-remodeling', 'finance', 'comprehensive-home-repair-installation-services-in-silicon-valley')`
)

// 4. The sixth WP consultation card has no WP page of its own: store it as a
//    consultation-only service so the name comes from the services collection.
const existing = await client.query(`SELECT id FROM services WHERE slug = 'new-construction'`)
if (!existing.rows.length) {
  await client.query(
    `INSERT INTO services (title, slug, consultation_label, show_in_consultation_form, hero_image_id, sort_order)
     VALUES ('New Construction', 'new-construction', 'New Construction Consultation', true, 157, '0')`
  )
  console.log('inserted new-construction service')
} else {
  console.log('new-construction already exists, skipped insert')
}

const after = await client.query(
  `SELECT id, slug, title, consultation_label, show_in_consultation_form, hero_image_id FROM services ORDER BY id`
)
for (const r of after.rows) console.log(JSON.stringify(r))
await client.end()
