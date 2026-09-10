/**
 * Shaker Kitchen (service id 12) — payload migration for the WordPress page
 * `shaker-kitchen-silicon-valley`. All copy verbatim from the WP XML.
 *
 *   hero   → background IMAGE, one button "Schedule a Consultation" → #contact
 *   cta    → shared free-estimate banner (WP template `free-estimate`)
 *   video  → hero video moved into a standalone video section (WP element
 *            khqbae, Prime Kitchens 05.03.2023 Daniel CLIENT PRIME KITCHEN)
 *   sub-services → "What makes a Shaker Kitchen stand out?" header + the two
 *            feature cards (eyebrow accents + paragraph bodies)
 *   prime-difference → "Why Choose Prime Design & Build?" / "The Prime
 *            Difference" with the 5-item checklist and 4 icon cards (WP SVGs)
 *   testimonialCards → Isabel E. / Christian F. / James G. review cards
 *   service_locations → 15 Silicon Valley city links for the areas strip
 *
 * Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const SERVICE_ID = 12
const HERO_VIDEO_URL =
  'https://tagmediaspace.b-cdn.net/Prime%20Kitchens/05.03.2023%20Daniel%20CLIENT%20PRIME%20KITCHEN%20(2%20videos%20)%202365%20Cryer%20St%20Hayward.mp4'
const HERO_IMAGE_SOURCE =
  'https://primedesignandbuild.com/wp-content/uploads/2023/05/WhatsApp-Image-2023-05-05-at-8.13.35-PM.jpeg'
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
     values ($1, $2, 'image/jpeg', null, $3) returning id`,
    ['Shaker kitchen hero background', 'WhatsApp-Image-2023-05-05-at-8.13.35-PM.jpeg', HERO_IMAGE_SOURCE],
  )
  heroImageId = inserted.rows[0].id
  console.log(`created hero media ${heroImageId}`)
}

await client.query(
  `update services set
     hero_lead = 'Dating back to the mid-eighteenth century, Shaker-style kitchens embody simplicity, functionality, and unparalleled craftsmanship. The classically proportioned doors with distinctive square frames can be customized with an array of handle designs, making Shaker kitchens a versatile choice for both traditional and modern homes.',
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

// ---- 2. Estimate CTA + video blocks ---------------------------------------
const existingCta = await client.query(`select id from services_blocks_cta where _parent_id = $1`, [
  SERVICE_ID,
])
if (!existingCta.rows.length) {
  await client.query(
    `insert into services_blocks_cta (_order, _parent_id, _path, id, heading, description, source_id, source_element_type)
     values (2, $1, 'sections', $2, 'Ready to schedule your free estimate?',
             'Contact us here or reach us at (650) 235-4863', 'mojcyl', 'template')`,
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
     values (3, $1, 'sections', $2, null, null, 'externalUrl', $3, null, true, 'khqbae', 'video')`,
    [SERVICE_ID, randomUUID(), HERO_VIDEO_URL],
  )
}

// ---- 3. Feature cards: eyebrow + paragraph bodies -------------------------
await client.query(
  `ALTER TABLE services_blocks_sub_services_2_items ADD COLUMN IF NOT EXISTS body varchar`,
)
await client.query(
  `update services_blocks_sub_services_2 set eyebrow = 'Learn more about Shaker Kitchens'
   where _parent_id = $1`,
  [SERVICE_ID],
)
const CARD_BODIES = {
  'Versatile Door Options':
    'Our Shaker range offers both lay-on and in-frame doors. The traditional in-frame style presents doors and drawer fronts that sit within the frames, with visible hinges when closed. For a more contemporary look, our lay-on design creates a seamless appearance as the doors lay over the frame, minimizing gaps between doors and drawers.',
  'Endless Finishes & Colors':
    'Express your individual style with a wide range of finishes and colors for your Shaker kitchen. Create a stunning focal point with a bold-colored kitchen island or achieve an understated elegance with a neutral color scheme complemented by wooden worktops or floors. From blue to gray Shaker kitchens and beyond, we provide an extensive palette to suit your taste.',
}
for (const [title, body] of Object.entries(CARD_BODIES)) {
  await client.query(
    `update services_blocks_sub_services_2_items set body = $2 where _parent_id in
       (select id from services_blocks_sub_services_2 where _parent_id = $1) and title = $3`,
    [SERVICE_ID, body, title],
  )
}

// ---- 4. Prime Difference block --------------------------------------------
await client.query(`update services_blocks_sub_services_2 set _order = 4 where _parent_id = $1`, [
  SERVICE_ID,
])
const existingPd = await client.query(
  `select id from services_blocks_prime_difference where _parent_id = $1`,
  [SERVICE_ID],
)
let pdId = existingPd.rows[0]?.id
if (!pdId) {
  const inserted = await client.query(
    `insert into services_blocks_prime_difference (_order, _parent_id, _path, id, eyebrow, heading, description)
     values (5, $1, 'sections', $2, 'Why Choose Prime Design & Build?', '"The Prime Difference"',
             'At Prime Design & Build, we understand that your kitchen is the heart of your home, and when it comes to European kitchen remodeling, we are the unrivaled experts.')
     returning id`,
    [SERVICE_ID, randomUUID()],
  )
  pdId = inserted.rows[0].id
  console.log(`created prime-difference block ${pdId}`)
}

// checklist child table (new block field)
await client.query(
  `create table if not exists services_blocks_prime_difference_checklist (
     _order integer, _parent_id varchar, id varchar, text varchar
   )`,
)
await client.query(`delete from services_blocks_prime_difference_checklist where _parent_id = $1`, [pdId])
const CHECKLIST = [
  'Experts on-site for accurate solutions',
  'Wide range of construction and remodel services',
  'Customer satisfaction is a priority',
  'Competitive pricing for our services',
  'Quick response for customer satisfaction',
]
for (let i = 0; i < CHECKLIST.length; i++) {
  await client.query(
    `insert into services_blocks_prime_difference_checklist (_order, _parent_id, id, text)
     values ($1, $2, $3, $4)`,
    [i, pdId, randomUUID(), CHECKLIST[i]],
  )
}

// features: 4 icon cards with the WP SVGs (no descriptions in the source)
await client.query(`delete from services_blocks_prime_difference_features where _parent_id = $1`, [pdId])
const FEATURES = [
  ['Customer Satisfaction', 'Customer-Focused.svg'],
  ['Expertise', 'Innovation.svg'],
  ['Attention to Detail', 'Process-2.svg'],
  ['Quality Craftsmanship', 'Process-1.svg'],
]
for (let i = 0; i < FEATURES.length; i++) {
  await client.query(
    `insert into services_blocks_prime_difference_features (_order, _parent_id, id, title, description, icon_source_svg_url)
     values ($1, $2, $3, $4, null, $5)`,
    [i, pdId, randomUUID(), FEATURES[i][0], WP(FEATURES[i][1])],
  )
}

// ---- 5. Testimonial cards ---------------------------------------------------
await client.query(
  `create table if not exists services_testimonial_cards_items (
     _order integer, _parent_id integer, id varchar, name varchar, quote varchar, avatar varchar
   )`,
)
await client.query(`delete from services_testimonial_cards_items where _parent_id = $1`, [SERVICE_ID])
const TESTIMONIALS = [
  [
    'Isabel E.',
    'Our basement was remodeled by Daniel and his team from Prime Design & Build. We highly recommend their services! We had our basement remodeled by them. This area of our home has been turned into a cozy and inviting space for entertaining guests. They did an excellent job with the design and layout, making the most of the available space. We added a wet bar and a pool table, and we couldn\'t be happier with the results. Everything was completed on time and within our budget. We are so happy we chose them for our basement remodel!',
    WP('unnamed-5.png'),
  ],
  [
    'Christian F.',
    'We met with Daniel for an initial consultation for our flooring and windows replacement. We have been living in our bungalow for 15 years and thought we gave the place an update. Daniel was very attentive during our meeting. He made sure to take note of everything we wanted. He also gave us different options that we never even thought of which actually save us money in the long run! We are so happy with our new floors and windows. It feels like we purchased a new property. This company knows how to work with their clients and we would recommend them to anyone!',
    WP('unnamed-4.png'),
  ],
  [
    'James G.',
    'I recently had the pleasure of working with Prime Design & Build in San Jose for my home renovation project. Their team of experts worked tirelessly to create my dream home, always taking my needs and preferences into consideration. They provided me with a custom design that perfectly matched my vision and worked with me every step of the way to ensure that everything was perfect. Their attention to detail was impressive and the quality of their work was exceptional. I was especially impressed by their commitment to staying within my budget and completing the project on time. They kept me informed throughout the process and were always available to answer any questions I had. Overall, I was very impressed with the team at Prime Design & Build and would highly recommend them to anyone in need of a custom home or remodeling services. They truly went above and beyond to make my dream home a reality.',
    WP('unnamed-3.png'),
  ],
]
for (let i = 0; i < TESTIMONIALS.length; i++) {
  await client.query(
    `insert into services_testimonial_cards_items (_order, _parent_id, id, name, quote, avatar)
     values ($1, $2, $3, $4, $5, $6)`,
    [i, SERVICE_ID, randomUUID(), TESTIMONIALS[i][0], TESTIMONIALS[i][1], TESTIMONIALS[i][2]],
  )
}

// ---- 6. 15 city links for the areas strip ----------------------------------
const slugify = (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const locations = await client.query('select id, name from locations order by id')
let created = 0
for (const loc of locations.rows) {
  const slug = `shaker-kitchen-in-${slugify(loc.name)}`
  const existing = await client.query('select id from service_locations where slug = $1', [slug])
  if (existing.rows.length) continue
  await client.query(
    `insert into service_locations (title, slug, service_id, location_id, city)
     values ($1, $2, $3, $4, $5)`,
    [`Shaker Kitchen in ${loc.name}`, slug, SERVICE_ID, loc.id, loc.name],
  )
  created += 1
}
console.log(`Done. Locations created: ${created}`)
await client.end()
process.exit(0)
