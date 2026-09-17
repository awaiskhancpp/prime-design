/**
 * Gives each Contact-page consultation card the photo WordPress used.
 *
 * WordPress (page `contact`, post 310) assigns every card its own image. None
 * of them is the matching service's hero, but the resolver had no card-image
 * field to read, so all six cards showed the wrong photo.
 *
 * Pairings are taken from the Bricks tree on post 310 — the image and title
 * found inside each card container, so the mapping is structural rather than
 * inferred from document position. Media is resolved by `wordpress_id`, the
 * stable attachment id carried over from the export.
 *
 * Services are resolved by slug. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

/** service slug -> WordPress attachment id of that card's image. */
const CARD_IMAGES = [
  ['additions', 2203, 'Additions Consultation'],
  ['complete-renovation', 2422, 'Complete Renovation Consultation'],
  ['adu', 2008, 'ADU / Garage Conversion'],
  // The "New Construction Consultation" card is backed by Home Remodeling.
  ['home-remodeling', 2216, 'New Construction Consultation'],
  ['kitchen-remodeling', 2188, 'Kitchen Remodeling Consultation'],
  ['bathroom-remodeling', 2168, 'Bathroom Remodeling Consultation'],
]

const c = new Client({ connectionString: u })
await c.connect()

let updated = 0
for (const [slug, wordpressId, cardTitle] of CARD_IMAGES) {
  const media = (
    await c.query('select id, filename from media where wordpress_id = $1', [String(wordpressId)])
  ).rows[0]
  if (!media) {
    console.log(`  SKIP  ${cardTitle}: wp attachment ${wordpressId} is not in the media collection`)
    continue
  }
  const { rowCount } = await c.query(
    `update services set consultation_image_id = $1 where slug = $2`,
    [media.id, slug],
  )
  if (!rowCount) {
    console.log(`  SKIP  ${cardTitle}: no service row with slug "${slug}"`)
    continue
  }
  updated += 1
  console.log(`  set   ${cardTitle.padEnd(34)} ${slug.padEnd(21)} media#${media.id} ${media.filename}`)
}

console.log(`\nupdated ${updated} of ${CARD_IMAGES.length} cards`)

const check = await c.query(
  `select s.slug, coalesce(s.consultation_label, s.title || ' Consultation') label, m.filename
     from services s
     left join media m on m.id = s.consultation_image_id
    where s.show_in_consultation_form = true and s.parent_service_id is null
    order by s.id`,
)
console.log('\nconsultation cards and their images:')
for (const r of check.rows) console.log(`   ${r.label.padEnd(34)} ${r.filename ?? '(none — falls back to hero)'}`)

await c.end()
process.exit(0)
