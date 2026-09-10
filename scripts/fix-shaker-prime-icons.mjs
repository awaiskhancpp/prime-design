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
     where _parent_id = '5bea4421-5ea0-47e4-8dab-ac25ac7bb20c' and title = $2
     returning title`,
    [path, title],
  )
  console.log(r.rows.length ? `updated: ${title} -> ${path}` : `NOT FOUND: ${title}`)
}

const check = await c.query(
  `select title, icon_source_svg_url from services_blocks_prime_difference_features
   where _parent_id = '5bea4421-5ea0-47e4-8dab-ac25ac7bb20c' order by _order`,
)
console.log(JSON.stringify(check.rows))
await c.end()
process.exit(0)
