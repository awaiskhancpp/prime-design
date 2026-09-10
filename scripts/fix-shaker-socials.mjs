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

const BLOCK_ID = '5bea4421-5ea0-47e4-8dab-ac25ac7bb20c'

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
