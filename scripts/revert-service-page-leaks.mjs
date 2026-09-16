/**
 * Reverts service-page side effects of the location-page work.
 *
 * The location-page migration populated the services table (which service
 * pages render) with content that only location pages should carry:
 *   - testimonial cards for services 1, 2, 3 → removed (Shaker Kitchen,
 *     service 12, keeps its own committed cards);
 *   - quote group for services 2, 3 → cleared (their WordPress pages have no
 *     quote section; Kitchen Remodeling keeps its committed quote).
 *
 * Location pages are unaffected: they read the copies now stored on their
 * own service_locations records. Idempotent.
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
 * Services are resolved by slug rather than by literal ids. These particular
 * ids still happen to be correct, but every other script in this folder that
 * pinned a service id broke silently when the services table was reseeded.
 */
const serviceIds = async (...slugs) => {
  const { rows } = await c.query('select id, slug from services where slug = any($1::text[])', [slugs])
  const missing = slugs.filter((slug) => !rows.some((row) => row.slug === slug))
  if (missing.length) throw new Error(`No service row(s) with slug: ${missing.join(', ')}`)
  return rows.map((row) => row.id)
}
const CARD_SERVICES = await serviceIds('kitchen-remodeling', 'bathroom-remodeling', 'home-remodeling')
const QUOTE_SERVICES = await serviceIds('bathroom-remodeling', 'home-remodeling')

const cards = await c.query(
  `delete from services_testimonial_cards_items where _parent_id = any($1::int[])
   returning _parent_id`,
  [CARD_SERVICES],
)
console.log(`removed testimonial cards from services: ${cards.rowCount} rows (${[...new Set(cards.rows.map((r) => r._parent_id))].join(', ')})`)

const quotes = await c.query(
  `update services set quote_heading = null, quote_quote = null, quote_attribution = null, quote_image_id = null
   where id = any($1::int[]) returning id, slug`,
  [QUOTE_SERVICES],
)
console.log(`cleared quote group on services: ${quotes.rows.map((r) => r.slug).join(', ')}`)

await c.end()
process.exit(0)
