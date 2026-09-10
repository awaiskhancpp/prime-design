/**
 * Populates the remaining "Location Page Sections" tab groups for the three
 * services with location pages: locationVideo, dontSettle and
 * primeDifference. Copy is the WordPress/canonical site copy with
 * {City}/{ServiceTitle} placeholders for the per-city substitution.
 * Idempotent.
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

// columns
const cols = [
  ['location_video_eyebrow', 'varchar'], ['location_video_title', 'varchar'],
  ['location_video_description', 'varchar'], ['location_video_tagline', 'varchar'],
  ['location_video_video_url', 'varchar'], ['location_video_poster', 'varchar'],
  ['dont_settle_eyebrow', 'varchar'], ['dont_settle_heading', 'varchar'],
  ['dont_settle_heading_accent', 'varchar'], ['dont_settle_body', 'varchar'],
  ['dont_settle_cta_label', 'varchar'],
  ['prime_difference_eyebrow', 'varchar'], ['prime_difference_heading', 'varchar'],
  ['prime_difference_body', 'varchar'],
]
for (const [name, type] of cols) {
  await c.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS ${name} ${type}`)
}
await c.query(
  `create table if not exists services_prime_difference_checklist (
     _order integer, _parent_id integer, id varchar, text varchar
   )`,
)
await c.query(
  `create table if not exists services_prime_difference_reasons (
     _order integer, _parent_id integer, id varchar, title varchar, description varchar, image varchar
   )`,
)

const SPACES = {
  1: { space: 'Kitchen', poster: '/services/kitchen-remodeling.jpeg', video: 'https://tagmediaspace.b-cdn.net/Prime%20Kitchens/05.03.2023%20Daniel%20CLIENT%20PRIME%20KITCHEN%20(2%20videos%20)%202365%20Cryer%20St%20Hayward.mp4' },
  3: { space: 'Bathroom', poster: '/before-after/bathroom_remodeling_after.jpeg', video: 'https://tagmediaspace.b-cdn.net/Prime%20Kitchens/01.19.2023%20Prime%20Kitchens%201794%20San%20Luis%20Ave%20Mountain%20View.mp4' },
  2: { space: 'Home', poster: '/services/home-remodeling.jpeg', video: 'https://tagmediaspace.b-cdn.net/Prime%20Kitchens/05.03.2023%20Daniel%20CLIENT%20PRIME%20KITCHEN%20(2%20videos%20)%202365%20Cryer%20St%20Hayward.mp4' },
}

const PRIME = {
  eyebrow: 'Why Choose Prime Design & Build?',
  heading: 'The Prime Difference',
  body: 'At Prime Design & Build, we understand that your kitchen is the heart of your home, and when it comes to European kitchen remodeling, we are the unrivaled experts.',
  checklist: [
    'Experts on-site for accurate solutions',
    'Wide range of construction and remodel services',
    'Customer satisfaction is a priority',
    'Competitive pricing for our services',
    'Quick response for customer satisfaction',
  ],
  reasons: [
    ['Customer Satisfaction', '/customer-satisfaction.svg'],
    ['Expertise', '/professional-expertise.svg'],
    ['Attention to Detail', '/attention-to-detail.svg'],
    ['Quality Craftsmanship', '/quality-craftsmanship.svg'],
  ],
}

for (const [serviceId, cfg] of Object.entries(SPACES)) {
  const spaceWord = cfg.space.toLowerCase()
  const dontSettleBody =
    `As a homeowner in {City}, you understand the significance of creating a ${spaceWord} that stands out and makes a statement. At Prime Design & Build, we specialize in {ServiceTitle} in {City}, bringing your vision to life with our high-quality craftsmanship and attention to detail. Whether you're looking for a modern, sleek design or a timeless, classic style, our team of experts will transform your ${spaceWord} into a space that reflects your unique taste and enhances your home. With our custom {ServiceTitle} services, we ensure that every detail is tailored to your needs, providing you with a ${spaceWord} that surpasses your expectations.`

  await c.query(
    `update services set
       location_video_eyebrow = coalesce(location_video_eyebrow, $2),
       location_video_title = coalesce(location_video_title, $3),
       location_video_description = coalesce(location_video_description, $4),
       location_video_tagline = coalesce(location_video_tagline, $5),
       location_video_video_url = coalesce(location_video_video_url, $6),
       location_video_poster = coalesce(location_video_poster, $7),
       dont_settle_eyebrow = coalesce(dont_settle_eyebrow, $8),
       dont_settle_heading = coalesce(dont_settle_heading, $9),
       dont_settle_heading_accent = coalesce(dont_settle_heading_accent, $10),
       dont_settle_body = coalesce(dont_settle_body, $11),
       dont_settle_cta_label = coalesce(dont_settle_cta_label, $12),
       prime_difference_eyebrow = coalesce(prime_difference_eyebrow, $13),
       prime_difference_heading = coalesce(prime_difference_heading, $14),
       prime_difference_body = coalesce(prime_difference_body, $15)
     where id = $1`,
    [
      Number(serviceId),
      '#1 {ServiceTitle} Company in {City}',
      'Your Dream {ServiceTitle} in {City} \u2013 A World of Possibilities!',
      'Imagine stepping into a freshly finished space that reflects your unique style and caters to your every need.',
      'With Prime Design & Build, it\u2019s within reach.',
      cfg.video,
      cfg.poster,
      '{ServiceTitle} in {City}',
      "Don't Settle for a Mediocre",
      `${cfg.space} in {City}`,
      dontSettleBody,
      'Talk to an expert',
      PRIME.eyebrow,
      PRIME.heading,
      PRIME.body,
    ],
  )

  // checklist + reasons child rows
  const existingCheck = await c.query(
    'select id from services_prime_difference_checklist where _parent_id = $1',
    [serviceId],
  )
  if (!existingCheck.rows.length) {
    for (let i = 0; i < PRIME.checklist.length; i++) {
      await c.query(
        `insert into services_prime_difference_checklist (_order, _parent_id, id, text)
         values ($1, $2, $3, $4)`,
        [i, Number(serviceId), randomUUID(), PRIME.checklist[i]],
      )
    }
  }
  const existingReasons = await c.query(
    'select id from services_prime_difference_reasons where _parent_id = $1',
    [serviceId],
  )
  if (!existingReasons.rows.length) {
    for (let i = 0; i < PRIME.reasons.length; i++) {
      await c.query(
        `insert into services_prime_difference_reasons (_order, _parent_id, id, title, description, image)
         values ($1, $2, $3, $4, null, $5)`,
        [i, Number(serviceId), randomUUID(), PRIME.reasons[i][0], PRIME.reasons[i][1]],
      )
    }
  }
  console.log(`service ${serviceId}: location video / dont-settle / prime difference populated`)
}

await c.end()
console.log('Done.')
process.exit(0)
