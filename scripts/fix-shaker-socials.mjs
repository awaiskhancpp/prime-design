/**
 * Point the Shaker Kitchen prime-difference social badges at the site's
 * local badge images (/public/social) and fill in the Houzz profile link.
 * Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

/**
 * The prime-difference block is resolved through the service slug, never by a
 * literal block id. This was a hardcoded
 * `BLOCK_ID = '5bea4421-5ea0-47e4-8dab-ac25ac7bb20c'`, which stopped existing
 * when the block was rewritten with a fresh uuid: every statement below then
 * matched nothing, so this script reported "NOT FOUND" for every row (and the
 * insert variant parented new rows to a dead id, where nothing can read them).
 */
const SERVICE_SLUG = 'shaker-kitchen'
const blockRow = await c.query(
  `select b.id from services_blocks_prime_difference b
     join services s on s.id = b._parent_id
    where s.slug = $1`,
  [SERVICE_SLUG],
)
if (!blockRow.rows.length)
  throw new Error(`No prime-difference block on the "${SERVICE_SLUG}" service`)
const BLOCK_ID = blockRow.rows[0].id
console.log(`${SERVICE_SLUG} prime-difference block -> ${BLOCK_ID}`)

const SOCIALS = [
  { match: '%Social-Media-Links-2.png', image: '/social/Yelp.png', url: 'https://www.yelp.com/biz/prime-kitchens-santa-clara' },
  { match: '%Social-Media-Links-1.png', image: '/social/Google.png', url: 'https://maps.google.com/?cid=11837063325613881352' },
  { match: '%Social-Media-Links.png', image: '/social/houzz.png', url: 'https://www.houzz.com/professionals/kitchen-and-bath-remodelers/prime-kitchens-pfvwus-pf~508047204' },
]

for (const s of SOCIALS) {
  const r = await c.query(
    `update services_blocks_prime_difference_socials set image = $1, url = $2
     where _parent_id = $3 and image like $4 returning _order`,
    [s.image, s.url, BLOCK_ID, s.match],
  )
  console.log(r.rows.length ? `updated (order ${r.rows[0]._order}): ${s.image} -> ${s.url}` : `NOT FOUND: ${s.match}`)
}

const check = await c.query(
  'select _order, image, url from services_blocks_prime_difference_socials where _parent_id = $1 order by _order',
  [BLOCK_ID],
)
console.log(JSON.stringify(check.rows, null, 2))
await c.end()
process.exit(0)
