/**
 * Custom Kitchen (service id 11) — payload migration for the WordPress page
 * `custom-kitchen-silicon-valley`. All copy verbatim from the WP XML.
 *
 *   hero   → background IMAGE, one button "Schedule a Consultation" → #contact
 *   cta    → shared free-estimate banner (WP template `free-estimate`)
 *   video  → hero video moved into a standalone video section (WP element
 *            rbegii, Prime Kitchens 05.03.2023 Daniel CLIENT PRIME KITCHEN)
 *   iconChecklistGallery → "Discover Your Signature Style" (4 icon cards +
 *            4-photo gallery; themify icon names preserved)
 *   imageChecklist → "The Power of Customization" (side image + 4-item list)
 *   materialsShowcase → "Materials Crafted to Perfection" (4 material cards)
 *   primeKitchens → "Why Choose Prime Kitchens? / The Prime Difference"
 *             (3 cards; WP images)
 *   service_locations → 15 Silicon Valley city links for the areas strip
 *
 * The superseded legacy blocks (image-text, sub-services x2, prime-
 * difference) are removed so the new sections render once. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const SERVICE_ID = 11
const HERO_VIDEO_URL =
  'https://tagmediaspace.b-cdn.net/Prime%20Kitchens/05.03.2023%20Daniel%20CLIENT%20PRIME%20KITCHEN%20(2%20videos%20)%202365%20Cryer%20St%20Hayward.mp4'
const HERO_IMAGE_SOURCE =
  'https://primedesignandbuild.com/wp-content/uploads/2023/05/Kitchen-And-Bathroom-Images-1920-%C3%97-1080-px-1.png'
const WP = (name) => `https://primedesignandbuild.com/wp-content/uploads/2023/05/${name}`

const client = new Client({ connectionString: u })
await client.connect()

// ---- 1. Hero media + hero group ------------------------------------------
let heroImageId = (
  await client.query('select id from media where source_url = $1', [HERO_IMAGE_SOURCE])
).rows[0]?.id
if (!heroImageId) {
  const inserted = await client.query(
    `insert into media (alt, filename, mime_type, wordpress_id, source_url)
     values ($1, $2, 'image/png', null, $3) returning id`,
    [
      'Kitchen And Bathroom Images (1920 × 1080 px) (1)',
      'Kitchen-And-Bathroom-Images-1920-×-1080-px-1.png',
      HERO_IMAGE_SOURCE,
    ],
  )
  heroImageId = inserted.rows[0].id
  console.log(`created hero media ${heroImageId}`)
}

await client.query(
  `update services set
     hero_lead = 'Unleash your creativity with a tailor-made kitchen that reflects your personal style.',
     hero_image_id = $2,
     hero_video_id = null
   where id = $1`,
  [SERVICE_ID, heroImageId],
)

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

// ---- 2. Remove superseded legacy blocks -----------------------------------
// (children first)
const legacyParents = (
  await client.query(
    `select id from services_blocks_image_text_2 where _parent_id = $1
     union all select id from services_blocks_sub_services_2 where _parent_id = $1
     union all select id from services_blocks_prime_difference where _parent_id = $1`,
    [SERVICE_ID],
  )
).rows.map((r) => r.id)
for (const pid of legacyParents) {
  await client.query(`delete from services_blocks_image_text_2_buttons where _parent_id = $1`, [pid])
  await client.query(
    `delete from services_blocks_sub_services_2_items_features where _parent_id in
       (select id from services_blocks_sub_services_2_items where _parent_id = $1)`,
    [pid],
  )
  await client.query(`delete from services_blocks_sub_services_2_items where _parent_id = $1`, [pid])
  await client.query(`delete from services_blocks_prime_difference_features where _parent_id = $1`, [pid])
  await client.query(`delete from services_blocks_prime_difference_videos where _parent_id = $1`, [pid])
}
await client.query(`delete from services_blocks_image_text_2 where _parent_id = $1`, [SERVICE_ID])
await client.query(`delete from services_blocks_sub_services_2 where _parent_id = $1`, [SERVICE_ID])
await client.query(`delete from services_blocks_prime_difference where _parent_id = $1`, [SERVICE_ID])
console.log('legacy blocks removed')

// ---- 3. Estimate CTA + video blocks ---------------------------------------
const existingCta = await client.query(`select id from services_blocks_cta where _parent_id = $1`, [
  SERVICE_ID,
])
if (!existingCta.rows.length) {
  await client.query(
    `insert into services_blocks_cta (_order, _parent_id, _path, id, heading, description, source_id, source_element_type)
     values (2, $1, 'sections', $2, 'Ready to schedule your free estimate?',
             'Contact us here or reach us at (650) 235-4863', 'ezrdwe', 'template')`,
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
     values (3, $1, 'sections', $2, null, null, 'externalUrl', $3, null, true, 'rbegii', 'video')`,
    [SERVICE_ID, randomUUID(), HERO_VIDEO_URL],
  )
}

// ---- 4. Group columns on services ------------------------------------------
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_checklist_gallery_eyebrow varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_checklist_gallery_heading varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS image_checklist_eyebrow varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS image_checklist_heading varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS image_checklist_description varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS image_checklist_image varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS materials_showcase_eyebrow varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS materials_showcase_heading varchar`)
await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS materials_showcase_description varchar`)

// ---- 5. Prime Kitchens difference ------------------------------------------
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
const PRIME_CARDS = [
  ['Craftsmanship in every project', WP('1.svg')],
  ['Attention to detail, aiming for perfection', WP('WhatsApp-Image-2023-05-05-at-8.13.57-PM-1.jpeg')],
  ['Dedication to customer satisfaction', WP('Recommended.png')],
]
for (let i = 0; i < PRIME_CARDS.length; i++) {
  await client.query(
    `insert into services_prime_kitchens_cards (_order, _parent_id, id, title, image)
     values ($1, $2, $3, $4, $5)`,
    [i, SERVICE_ID, randomUUID(), PRIME_CARDS[i][0], PRIME_CARDS[i][1]],
  )
}

// ---- 6. Icon checklist gallery ("Discover Your Signature Style") -----------
await client.query(
  `create table if not exists services_icon_checklist_gallery_items (
     _order integer, _parent_id integer, id varchar, icon varchar, title varchar, description varchar
   )`,
)
await client.query(
  `create table if not exists services_icon_checklist_gallery_images (
     _order integer, _parent_id integer, id varchar, url varchar
   )`,
)
await client.query(`delete from services_icon_checklist_gallery_items where _parent_id = $1`, [SERVICE_ID])
await client.query(`delete from services_icon_checklist_gallery_images where _parent_id = $1`, [SERVICE_ID])
await client.query(
  `update services set
     icon_checklist_gallery_eyebrow = 'Endless Possibilities',
     icon_checklist_gallery_heading = 'Discover Your Signature Style'
   where id = $1`,
  [SERVICE_ID],
)
const ICON_ITEMS = [
  ['ti-ruler-pencil', 'Modern Sophistication', 'Embrace sleek lines, contemporary finishes, and state-of-the-art appliances for a kitchen that exudes elegance.'],
  ['ti-heart', 'Minimalist Elegance', 'Experience the beauty of simplicity with minimalist designs that emphasize clean lines and functionality.'],
  ['ti-key', 'Rustic Retreats', 'Create a cozy, farmhouse-inspired kitchen with natural materials, rustic accents, and warm tones.'],
  ['ti-time', 'Timeless Charm', 'Find classic appeal with traditional styles, intricate details, and warm, inviting finishes.'],
]
for (let i = 0; i < ICON_ITEMS.length; i++) {
  await client.query(
    `insert into services_icon_checklist_gallery_items (_order, _parent_id, id, icon, title, description)
     values ($1, $2, $3, $4, $5, $6)`,
    [i, SERVICE_ID, randomUUID(), ICON_ITEMS[i][0], ICON_ITEMS[i][1], ICON_ITEMS[i][2]],
  )
}
const ICON_IMAGES = [
  WP('WhatsApp-Image-2023-05-05-at-8.13.40-PM.jpeg'),
  WP('WhatsApp-Image-2023-05-05-at-8.13.40-PM-1.jpeg'),
  WP('WhatsApp-Image-2023-05-05-at-8.13.40-PM-2.jpeg'),
  WP('WhatsApp-Image-2023-05-05-at-8.13.42-PM.jpeg'),
]
for (let i = 0; i < ICON_IMAGES.length; i++) {
  await client.query(
    `insert into services_icon_checklist_gallery_images (_order, _parent_id, id, url)
     values ($1, $2, $3, $4)`,
    [i, SERVICE_ID, randomUUID(), ICON_IMAGES[i]],
  )
}

// ---- 7. Image checklist ("The Power of Customization") ---------------------
await client.query(
  `create table if not exists services_image_checklist_items (
     _order integer, _parent_id integer, id varchar, title varchar, description varchar
   )`,
)
await client.query(`delete from services_image_checklist_items where _parent_id = $1`, [SERVICE_ID])
await client.query(
  `update services set
     image_checklist_eyebrow = 'Your Vision, Our Expertise',
     image_checklist_heading = 'The Power of Customization',
     image_checklist_description = 'Discover the benefits of choosing a custom kitchen tailored to your exact specifications.',
     image_checklist_image = $2
   where id = $1`,
  [SERVICE_ID, WP('WhatsApp-Image-2023-05-31-at-11.36.50-PM.jpeg')],
)
const CHECKLIST = [
  ['Personalized Design', 'Collaborate with our experienced team to bring your dream kitchen to life.'],
  ['Superior Craftsmanship', 'Experience the highest quality and attention to detail in every aspect of your custom kitchen.'],
  ['Enhanced Functionality', 'Maximize efficiency and organization with custom features designed for your specific needs.'],
  ['Express Your Style', 'Choose from various styles, finishes, and innovative design elements to create a truly your kitchen.'],
]
for (let i = 0; i < CHECKLIST.length; i++) {
  await client.query(
    `insert into services_image_checklist_items (_order, _parent_id, id, title, description)
     values ($1, $2, $3, $4, $5)`,
    [i, SERVICE_ID, randomUUID(), CHECKLIST[i][0], CHECKLIST[i][1]],
  )
}

// ---- 8. Materials showcase ("Materials Crafted to Perfection") -------------
await client.query(
  `create table if not exists services_materials_showcase_items (
     _order integer, _parent_id integer, id varchar, image varchar, title varchar, description varchar
   )`,
)
await client.query(`delete from services_materials_showcase_items where _parent_id = $1`, [SERVICE_ID])
await client.query(
  `update services set
     materials_showcase_eyebrow = 'Uncompromising Quality',
     materials_showcase_heading = 'Materials Crafted to Perfection',
     materials_showcase_description = 'Immerse yourself in the finest selection of premium materials for your custom kitchen.'
   where id = $1`,
  [SERVICE_ID],
)
const MATERIALS = [
  [WP('WhatsApp-Image-2023-05-05-at-8.17.57-PM.jpeg'), 'Exquisite Countertops', 'Choose from a range of luxurious options, including granite, quartz, and marble, for a stunning centerpiece.'],
  [WP('WhatsApp-Image-2023-05-05-at-8.17.57-PM-3.jpeg'), 'Custom Cabinetry', 'Experience the beauty and functionality of handcrafted cabinets, meticulously designed to meet your specific needs.'],
  [WP('WhatsApp-Image-2023-05-05-at-8.18.54-PM-1.jpeg'), 'Durable Flooring', 'Discover high-quality flooring materials that provide both style and durability, setting the foundation for your custom kitchen.'],
  [WP('WhatsApp-Image-2023-05-05-at-8.13.40-PM.jpeg'), 'Stylish Accents', "Select the perfect hardware and fixtures to add the finishing touches and elevate your kitchen's aesthetic."],
]
for (let i = 0; i < MATERIALS.length; i++) {
  await client.query(
    `insert into services_materials_showcase_items (_order, _parent_id, id, image, title, description)
     values ($1, $2, $3, $4, $5, $6)`,
    [i, SERVICE_ID, randomUUID(), MATERIALS[i][0], MATERIALS[i][1], MATERIALS[i][2]],
  )
}

// ---- 9. 15 city links for the areas strip ----------------------------------
const slugify = (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const locations = await client.query('select id, name from locations order by id')
let created = 0
for (const loc of locations.rows) {
  const slug = `custom-kitchen-in-${slugify(loc.name)}`
  const existing = await client.query('select id from service_locations where slug = $1', [slug])
  if (existing.rows.length) continue
  await client.query(
    `insert into service_locations (title, slug, service_id, location_id, city)
     values ($1, $2, $3, $4, $5)`,
    [`Custom Kitchen in ${loc.name}`, slug, SERVICE_ID, loc.id, loc.name],
  )
  created += 1
}
console.log(`Done. Locations created: ${created}`)
await client.end()
process.exit(0)
