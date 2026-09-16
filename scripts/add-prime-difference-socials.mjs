/**
 * Adds the Google / Yelp / Houzz logos to the Home Remodeling and Bathroom
 * prime-difference blocks. The WordPress "why-choose-w-list" template
 * (which carries the socials row) is used on the Kitchen, Bathroom, Home
 * Remodeling and Shaker pages, so every page rendering the Prime Difference
 * section shows the logos. Idempotent.
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

const SOCIALS = [
  ['/social/Yelp.png', 'https://www.yelp.com/biz/prime-kitchens-santa-clara'],
  ['/social/Google.png', 'https://maps.google.com/?cid=11837063325613881352'],
  [
    '/social/houzz.png',
    'https://www.houzz.com/professionals/kitchen-and-bath-remodelers/prime-kitchens-pfvwus-pf~508047204',
  ],
]

/**
 * Resolved through the service slug, never by a literal block uuid. The two
 * uuids that used to be pinned here no longer exist, so every insert below was
 * parented to a dead id where nothing could read it.
 */
const BLOCKS = []
for (const slug of ['home-remodeling', 'bathroom-remodeling']) {
  const { rows } = await c.query(
    `select b.id from services_blocks_prime_difference b
       join services s on s.id = b._parent_id
      where s.slug = $1`,
    [slug],
  )
  if (!rows.length) throw new Error(`No prime-difference block on the "${slug}" service`)
  BLOCKS.push([slug, rows[0].id])
  console.log(`${slug} prime-difference block -> ${rows[0].id}`)
}

await c.query(
  `create table if not exists services_blocks_prime_difference_socials (
     _order integer, _parent_id varchar, id varchar, image varchar, url varchar
   )`,
)

for (const [slug, blockId] of BLOCKS) {
  const existing = await c.query(
    'select id from services_blocks_prime_difference_socials where _parent_id = $1',
    [blockId],
  )
  if (existing.rows.length) {
    console.log(`skip (already has socials): ${slug}`)
    continue
  }
  for (let i = 0; i < SOCIALS.length; i++) {
    await c.query(
      `insert into services_blocks_prime_difference_socials (_order, _parent_id, id, image, url)
       values ($1, $2, $3, $4, $5)`,
      [i, blockId, randomUUID(), SOCIALS[i][0], SOCIALS[i][1]],
    )
  }
  console.log(`added socials: ${slug}`)
}
await c.end()
process.exit(0)
