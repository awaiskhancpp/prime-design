/**
 * Restores the bullet lists (and their italic lead-in labels) inside the
 * European Kitchen feature cards — the WordPress Feature Grid cards each end
 * with a `<ul>` that the first migration dropped. Verbatim WP copy:
 *
 *   Transform Your Kitchen into a Work of Art
 *     - Modern and sleek designs with clean lines
 *     - Rustic and charming styles with warm earthy tones
 *     - Contemporary designs featuring minimalist aesthetics
 *     - Timeless and classic designs with intricate details
 *     - Personalized designs tailored to your preferences
 *
 *   Key Elements of European Kitchens
 *     label: Here's what gives your kitchen a European charm:
 *     - Streamlined and minimalist design
 *     - Abundance of natural light
 *     - Open and airy atmosphere
 *     - Focus on functionality and efficiency
 *     - Incorporation of smart storage solutions
 *
 *   Premium Materials for European Kitchens
 *     label: Unleash the Beauty and Durability:
 *     - High-quality hardwoods, such as oak, walnut, and beech
 *     - Stylish glass and metal accents
 *     - Elegant and durable stone countertops, like marble and granite
 *     - Sleek and modern stainless steel appliances
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const ITEMS = {
  'Transform Your Kitchen into a Work of Art': {
    label: null,
    features: [
      'Modern and sleek designs with clean lines',
      'Rustic and charming styles with warm earthy tones',
      'Contemporary designs featuring minimalist aesthetics',
      'Timeless and classic designs with intricate details',
      'Personalized designs tailored to your preferences',
    ],
  },
  'Key Elements of European Kitchens': {
    label: "Here's what gives your kitchen a European charm:",
    features: [
      'Streamlined and minimalist design',
      'Abundance of natural light',
      'Open and airy atmosphere',
      'Focus on functionality and efficiency',
      'Incorporation of smart storage solutions',
    ],
  },
  'Premium Materials for European Kitchens': {
    label: 'Unleash the Beauty and Durability:',
    features: [
      'High-quality hardwoods, such as oak, walnut, and beech',
      'Stylish glass and metal accents',
      'Elegant and durable stone countertops, like marble and granite',
      'Sleek and modern stainless steel appliances',
    ],
  },
}

const client = new Client({ connectionString: u })
await client.connect()

/**
 * Services are resolved by slug, never by a literal row id. The services table
 * was reseeded at some point and every id shifted (adu 7->4, additions 8->5,
 * complete-renovation 9->6, european-kitchen 10->7, custom-kitchen 11->8,
 * shaker-kitchen 12->9, finance 13->21, home repair 14->22), after which the
 * statements below silently matched nothing and the script still exited 0.
 */
const serviceId = async (slug) => {
  const { rows } = await client.query('select id from services where slug = $1', [slug])
  if (!rows.length) throw new Error(`No service row with slug "${slug}"`)
  return rows[0].id
}
const EUROPEAN_KITCHEN = await serviceId('european-kitchen')

// Columns for the items table + child table for the features array
// (Payload group arrays land in `{table}_{array}` child tables).
await client.query(`ALTER TABLE services_blocks_sub_services_2_items ADD COLUMN IF NOT EXISTS label varchar`)
await client.query(
  `create table if not exists services_blocks_sub_services_2_items_features (
     _order integer, _parent_id varchar, id varchar, text varchar
   )`,
)

const block = await client.query(
  'select id from services_blocks_sub_services_2 where _parent_id = $1',
  [EUROPEAN_KITCHEN],
)
const blockId = block.rows[0].id
const items = await client.query(
  'select id, title from services_blocks_sub_services_2_items where _parent_id = $1 order by _order',
  [blockId],
)

for (const row of items.rows) {
  const content = ITEMS[row.title]
  if (!content) {
    console.log(`skip (no WP list): ${row.title}`)
    continue
  }
  await client.query('update services_blocks_sub_services_2_items set label = $1 where id = $2', [
    content.label,
    row.id,
  ])
  await client.query(
    'delete from services_blocks_sub_services_2_items_features where _parent_id = $1',
    [row.id],
  )
  for (let i = 0; i < content.features.length; i++) {
    await client.query(
      `insert into services_blocks_sub_services_2_items_features (_order, _parent_id, id, text)
       values ($1, $2, $3, $4)`,
      [i, row.id, randomUUID(), content.features[i]],
    )
  }
  console.log(`migrated: ${row.title} (${content.features.length} bullets, label: ${content.label ?? 'none'})`)
}

// Verify
const check = await client.query(
  `select i.title, i.label, f.text
   from services_blocks_sub_services_2_items i
   left join services_blocks_sub_services_2_items_features f on f._parent_id = i.id
   where i._parent_id = $1
   order by i._order, f._order`,
  [blockId],
)
console.log('\nVERIFY:')
console.log(JSON.stringify(check.rows, null, 2))
await client.end()
process.exit(0)
