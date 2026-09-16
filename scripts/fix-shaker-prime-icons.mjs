/**
 * Shaker Kitchen prime-difference icon fix: the WordPress SVGs
 * (Customer-Focused.svg, Innovation.svg, Process-2.svg, Process-1.svg) were
 * colored via currentColor/CSS on the original site (#c19a5b brass), but
 * rendered through an <img> tag they lose that color. The site's local
 * equivalents for the same four concepts are already #c19a5b, so point the
 * four feature rows at them. Idempotent.
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
 * literal block id. The uuid used to be inlined into both statements below and
 * stopped existing when the block was rewritten with a fresh one, so every
 * update matched nothing and the script reported "NOT FOUND" for all four
 * icons while appearing to succeed.
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

const ICONS = {
  'Customer Satisfaction': '/customer-satisfaction.svg',
  Expertise: '/professional-expertise.svg',
  'Attention to Detail': '/attention-to-detail.svg',
  'Quality Craftsmanship': '/quality-craftsmanship.svg',
}

for (const [title, path] of Object.entries(ICONS)) {
  const r = await c.query(
    `update services_blocks_prime_difference_features
       set icon_source_svg_url = $1
     where _parent_id = $2 and title = $3
     returning title`,
    [path, BLOCK_ID, title],
  )
  console.log(r.rows.length ? `updated: ${title} -> ${path}` : `NOT FOUND: ${title}`)
}

const check = await c.query(
  `select title, icon_source_svg_url from services_blocks_prime_difference_features
   where _parent_id = $1 order by _order`,
  [BLOCK_ID],
)
console.log(JSON.stringify(check.rows))
await c.end()
process.exit(0)
