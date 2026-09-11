// Seed Payload with WordPress content that previously lived only in static
// component fallbacks:
//   1. Real Homes testimonials (WP pages 335/1978) for home-remodeling and
//      additions services.
//   2. Comprehensive page "Why choose Prime Design & Build?" 6 items
//      (WP page 3463) as experience-difference features.
import { readFileSync } from 'node:fs'
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'

const rawEnv = readFileSync('.env', 'utf8')
const conn = (rawEnv.match(/DATABASE_URL=([^\r\n]+)/) || [])[1].replace(/^"(.*)"$/, '$1')

const REAL_HOMES = [
  {
    attribution: 'Alex and Sophia',
    quote:
      "Prime Design & Build's team of experts brought new life to our home. Their commitment to quality and design is unparalleled.",
  },
  {
    attribution: 'Robert and Laura',
    quote:
      'Choosing Prime Design & Build was the best decision we made for our home remodeling. Their expertise and professionalism made the entire process stress-free.',
  },
  {
    attribution: 'Jonathan and Emma',
    quote:
      'Prime Design & Build captured our vision perfectly and delivered exceptional results. Our home now reflects our unique style and personality.',
  },
]

const WHY_CHOOSE_ITEMS = [
  { title: 'Over 350+ Projects', description: 'in Silicon Valley' },
  { title: 'Experts on-site', description: 'for interior design & planning' },
  { title: 'Certified General Contractor', description: 'fully licensed' },
  { title: 'Family-owned and operated', description: 'for personalized service' },
  { title: 'Competitive pricing', description: 'without compromising quality' },
  { title: 'Quick response', description: 'and customer satisfaction guaranteed' },
]

const client = new pg.Client({ connectionString: conn })
await client.connect()
try {
  for (const serviceId of [2, 8]) {
    await client.query(`DELETE FROM services_real_homes_testimonials WHERE _parent_id = $1`, [serviceId])
    for (const [index, item] of REAL_HOMES.entries()) {
      await client.query(
        `INSERT INTO services_real_homes_testimonials (_order, _parent_id, attribution, quote) VALUES ($1, $2, $3, $4)`,
        [index, serviceId, item.attribution, item.quote],
      )
    }
    console.log(`seeded real-homes testimonials for service ${serviceId}`)
  }

  const block = await client.query(
    `SELECT id FROM services_blocks_experience_difference WHERE _parent_id = 14`,
  )
  if (block.rows[0]) {
    await client.query(
      `DELETE FROM services_blocks_experience_difference_features WHERE _parent_id = $1`,
      [block.rows[0].id],
    )
    for (const [index, item] of WHY_CHOOSE_ITEMS.entries()) {
      await client.query(
        `INSERT INTO services_blocks_experience_difference_features (id, _order, _parent_id, title, description) VALUES ($1, $2, $3, $4, $5)`,
        [crypto.randomUUID(), index, block.rows[0].id, item.title, item.description],
      )
    }
    console.log('seeded 6 why-choose features for comprehensive service')
  } else {
    console.log('no experience_difference block for service 14')
  }
} finally {
  await client.end()
}
