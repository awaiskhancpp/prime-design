/**
 * Content-sourcing fixes (approved):
 * 1. Comprehensive Home Repair "Why Choose" block — WordPress content:
 *    heading "The Prime Difference" + icon-box "Over 350+ Projects in
 *    Silicon Valley" + the three WordPress list items (the previous block
 *    content added two extra items and split the WP titles).
 * 2. Real Homes blocks (home-remodeling, additions) — replace the three
 *    fabricated quotes with three real WordPress reviews (Google reviews
 *    from the migrated review data). Idempotent (delete + insert).
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

// ---- 1. Comprehensive why-choose --------------------------------------
const whyBlock = (
  await c.query(`select id from services_blocks_experience_difference where _parent_id = 14`)
).rows[0]
await c.query(`update services_blocks_experience_difference set heading = 'The Prime Difference' where id = $1`, [
  whyBlock.id,
])
await c.query(`delete from services_blocks_experience_difference_features where _parent_id = $1`, [whyBlock.id])
const WHY_ITEMS = [
  'Over 350+ Projects in Silicon Valley',
  'Experts on-site for interior design',
  'Certified General Contractor, Fully Licensed.',
  'Family-Owned and Operated Business',
]
for (let i = 0; i < WHY_ITEMS.length; i++) {
  await c.query(
    `insert into services_blocks_experience_difference_features (_order, _parent_id, id, title, description)
     values ($1, $2, $3, $4, null)`,
    [i, whyBlock.id, randomUUID(), WHY_ITEMS[i]],
  )
}
console.log('why-choose: heading "The Prime Difference" + 4 WordPress items')

// ---- 2. Real Homes reviews -------------------------------------------
const REAL_REVIEWS = {
  2: [
    [
      'Krishna Kumar',
      "We recently hired Prime Design and Build for a major renovation of our bathroom, kitchen and flooring, and we're very happy with the results. The workmanship throughout was excellent—the attention to detail really shows in the finished spaces. Isabella, the project coordinator, was instrumental in keeping everything on track and Fernando, the supervisor, ensured all work met code and promptly addressed any changes requested by permit inspectors. Their responsiveness and clear communication made the process feel much more manageable and helped ease the stress of living through a renovation. Overall, we had a very positive experience and would recommend Prime Design and Build for their quality work and strong team support.",
    ],
    [
      'Ariel Diaz',
      "We had a great experience with our home renovation thanks to Noah and Prime Design. From our kitchen to two bathrooms, the work was flawless. Noah stayed involved throughout, always attentive and helpful. Everything was completed on time and to a high standard. We've already shared their name with neighbors and look forward to hiring them again soon.",
    ],
    [
      'Rachel Lansing',
      'Prime Design & Build handled our modest home renovation brilliantly, exceeding our expectations at every turn. They were always available for project discussions, offering invaluable design advice from day one. Their support in managing costs was invaluable, promptly addressing any issues to ensure everything met our standards. The quality of their work is outstanding, resulting in a custom home that perfectly embodies our style. The crew was polite and kept the work area impeccably clean throughout. I recommend this company.',
    ],
  ],
  8: [
    [
      'Jim Mitchell',
      'They demonstrated remarkable dedication, delivering an outstanding result with our room addition project. We are thrilled with the final outcome. Their skilled expansion of our living space highlighted their unwavering commitment and exceptional attention to detail. Not only did they meet our project deadline, but they also exceeded our expectations by completing the work ahead of schedule. Their swift turnaround and exceptional craftsmanship in bringing our new room to life have left us thoroughly delighted. We enthusiastically recommend them for their grade A+ work!',
    ],
    [
      'Sam Gerardo',
      "We were thoroughly impressed by Prime Design's exceptional organizational skills. Despite the complexities of a home addition, they maintained steady progress and completed the project on time. Noah, a key member of their team, ensured our vision was seamlessly integrated throughout the process. Their dedication and meticulous attention to detail were remarkable, making the entire experience enjoyable. We extend our heartfelt gratitude for their outstanding service!",
    ],
    [
      'Carmen Hertz',
      "After reviewing eight estimates for converting my garage into an ADU, I ultimately selected them for their outstanding balance of quality and affordability. Collaborating with Noah and his team was a pleasure; they consistently demonstrated punctuality, efficiency, and expertise throughout the project, despite its complexity and size. Noah's accessibility and willingness to provide assistance enhanced our collaboration, offering valuable advice that not only benefited me but also helped in saving costs. The project was completed within the expected timeframe, without any unforeseen expenses, and the final result was truly exceptional. I would gladly choose to work with Prime Design again, and we've even discussed potential future projects together!",
    ],
  ],
}

for (const [serviceId, reviews] of Object.entries(REAL_REVIEWS)) {
  const block = (
    await c.query(`select id from services_blocks_landing_testimonials where _parent_id = $1`, [
      Number(serviceId),
    ])
  ).rows[0]
  const provider = (
    await c.query(
      `select id from services_blocks_landing_testimonials_providers where _parent_id = $1 limit 1`,
      [block.id],
    )
  ).rows[0]
  await c.query(
    `delete from services_blocks_landing_testimonials_providers_reviews where _parent_id = $1`,
    [provider.id],
  )
  for (let i = 0; i < reviews.length; i++) {
    await c.query(
      `insert into services_blocks_landing_testimonials_providers_reviews
         (_order, _parent_id, id, reviewer, rating, body, date)
       values ($1, $2, $3, $4, 5, $5, 'a year ago')`,
      [i, provider.id, randomUUID(), reviews[i][0], reviews[i][1]],
    )
  }
  console.log(`service ${serviceId}: 3 real WordPress reviews installed`)
}

await c.end()
console.log('Done.')
process.exit(0)
