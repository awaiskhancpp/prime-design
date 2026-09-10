/**
 * Adds the WordPress "The Prime Difference" social badges (Yelp, Google,
 * Houzz) to the Shaker Kitchen prime-difference block. The badges live on
 * the block itself, so the shared ServicePrimeDifferenceSection only shows
 * them for pages whose WordPress section actually carries them — other
 * pages using the section stay badge-free. Idempotent.
 *
 * Image files and links are the WordPress ones (Social-Media-Links-*.png);
 * Yelp/Google hrefs are the company's canonical profile URLs, Houzz has no
 * known profile URL in the export so its image renders unlinked.
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

const BLOCK_ID = '5bea4421-5ea0-47e4-8dab-ac25ac7bb20c'
const WP = (name) => `https://primedesignandbuild.com/wp-content/uploads/2023/05/${name}`

await c.query(
  `create table if not exists services_blocks_prime_difference_socials (
     _order integer, _parent_id varchar, id varchar, image varchar, url varchar
   )`,
)
await c.query(`delete from services_blocks_prime_difference_socials where _parent_id = $1`, [BLOCK_ID])

const SOCIALS = [
  // WordPress order: Yelp, Google, Houzz.
  [WP('Social-Media-Links-2.png'), 'https://www.yelp.com/biz/prime-kitchens-santa-clara'],
  [WP('Social-Media-Links-1.png'), 'https://maps.google.com/?cid=11837063325613881352'],
  [WP('Social-Media-Links.png'), null],
]
for (let i = 0; i < SOCIALS.length; i++) {
  await c.query(
    `insert into services_blocks_prime_difference_socials (_order, _parent_id, id, image, url)
     values ($1, $2, $3, $4, $5)`,
    [i, BLOCK_ID, randomUUID(), SOCIALS[i][0], SOCIALS[i][1]],
  )
}

const check = await c.query(
  'select _order, image, url from services_blocks_prime_difference_socials where _parent_id = $1 order by _order',
  [BLOCK_ID],
)
console.log(JSON.stringify(check.rows, null, 2))
await c.end()
process.exit(0)
