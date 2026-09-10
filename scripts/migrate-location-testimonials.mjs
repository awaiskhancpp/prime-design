/**
 * Populates the "Testimonial Cards" section (Location Page Sections tab) for
 * Kitchen Remodeling, Bathroom Remodeling and Home Remodeling so every
 * service-location page renders the three WordPress testimonial cards
 * (Isabel E., Christian F., James G. — the testimonial CPT posts from the
 * WordPress export). Idempotent.
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

const WP = (name) => `https://primedesignandbuild.com/wp-content/uploads/2023/05/${name}`
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

await c.query(
  `create table if not exists services_testimonial_cards_items (
     _order integer, _parent_id integer, id varchar, name varchar, quote varchar, avatar varchar
   )`,
)

for (const serviceId of [1, 2, 3]) {
  const existing = await c.query(
    'select id from services_testimonial_cards_items where _parent_id = $1',
    [serviceId],
  )
  if (existing.rows.length) {
    console.log(`skip (already has cards): service ${serviceId}`)
    continue
  }
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    await c.query(
      `insert into services_testimonial_cards_items (_order, _parent_id, id, name, quote, avatar)
       values ($1, $2, $3, $4, $5, $6)`,
      [i, serviceId, randomUUID(), TESTIMONIALS[i][0], TESTIMONIALS[i][1], TESTIMONIALS[i][2]],
    )
  }
  console.log(`populated testimonial cards: service ${serviceId}`)
}
await c.end()
process.exit(0)
