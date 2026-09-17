/**
 * Points the location-page sections at the images WordPress actually uses.
 *
 * Every city page renders from its family's Bricks content template, and each
 * section there names a specific attachment. None of them had been imported, so
 * the components fell back to `service.image` — which on a location page is
 * that city's featured marketing graphic. That is why the same wrong photo
 * appeared in several sections on all 45 pages.
 *
 *   Don't Settle …            wp 579   11.png      (identical on all 3 families)
 *   Crafting Your Dream Home  wp 1130  Kitchen-And-Bathroom-…-8.png  (template 1160)
 *   Silicon Valley Loves …    wp 1194  Prime-Kitchens-100-Satisfaction-Guarantee.png (template 1159)
 *   Offerings cards (kitchen) wp 1125 Custom-Kitchen.png
 *                             wp 1123 European-Kitchen.png
 *                             wp 1124 Shaker-Kitchen.png
 *
 * The offerings cards live on the kitchen service's shared `sub-services`
 * block, so correcting them also corrects the kitchen service page — both were
 * showing 2024 photos that appear nowhere in the WordPress source for these
 * cards.
 *
 * Media is resolved by `wordpressId`, services and locations by slug. Run
 * `pnpm tsx scripts/import-wordpress-media.ts` first if any attachment is
 * missing; this script reports and skips rather than inventing a substitute.
 * Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const c = new Client({ connectionString: u })
await c.connect()

const missing = []

/** Media url for a WordPress attachment id, or null (recorded, never faked). */
async function mediaUrl(wp, label) {
  const m = (await c.query('select id, url, filename from media where wordpress_id = $1', [wp])).rows[0]
  if (!m) {
    missing.push(`wp ${wp} (${label})`)
    return null
  }
  return m
}

// ---- 1. Don't Settle — same photo on all three families, all 45 pages ------
const dontSettle = await mediaUrl(579, "Don't Settle")
if (dontSettle) {
  const { rowCount } = await c.query(
    `update service_locations set dont_settle_image = $1 where dont_settle_image is distinct from $1`,
    [dontSettle.url],
  )
  console.log(`Don't Settle          ${dontSettle.filename.padEnd(46)} ${rowCount} row(s)`)
}

// ---- 2. Quote section ("Crafting Your Dream Home, Our Promise") ------------
const quote = await mediaUrl(1130, 'Crafting Your Dream Home')
if (quote) {
  const { rowCount } = await c.query(
    `update service_locations set quote_image = $1 where quote_image is distinct from $1`,
    [quote.url],
  )
  console.log(`Crafting Your Dream   ${quote.filename.slice(0, 46).padEnd(46)} ${rowCount} row(s)`)
}

// ---- 3. Silicon Valley Loves ----------------------------------------------
const loves = await mediaUrl(1194, 'Silicon Valley Loves')
if (loves) {
  const { rowCount } = await c.query(
    `update service_locations set silicon_valley_loves_image = $1
      where silicon_valley_loves_image is distinct from $1`,
    [loves.url],
  )
  console.log(`Silicon Valley Loves  ${loves.filename.slice(0, 46).padEnd(46)} ${rowCount} row(s)`)
}

// ---- 4. Offerings cards on the kitchen family ------------------------------
const CARDS = [
  ['Custom Kitchen', 1125],
  ['European Kitchen', 1123],
  ['Shaker Kitchen', 1124],
]
console.log('\nOfferings cards (kitchen-remodeling sub-services block):')
for (const [title, wp] of CARDS) {
  const m = await mediaUrl(wp, `offerings: ${title}`)
  if (!m) continue
  const { rowCount } = await c.query(
    `update services_blocks_sub_services_2_items i
        set media_asset_id = $1, media_source_url = $2
       from services_blocks_sub_services_2 b, services s
      where i._parent_id = b.id and b._parent_id = s.id
        and s.slug = 'kitchen-remodeling' and i.title = $3`,
    [m.id, m.url, title],
  )
  console.log(`   ${title.padEnd(20)} -> media#${String(m.id).padEnd(5)} ${m.filename.padEnd(24)} ${rowCount} row(s)`)
}

// ---- 5. Video poster — the clip's own frame, WordPress defines none --------
const poster = (
  await c.query(`select url, filename from media where filename = 'prime-kitchens-cryer-st-poster.jpg'`)
).rows[0]
console.log(
  `\nLocation video poster is applied in the component (${poster ? poster.filename : 'poster media MISSING'}); ` +
    `the stored per-city field stays empty so WordPress parity is preserved.`,
)

if (missing.length) {
  console.log('\nNOT APPLIED — these attachments are not in the media collection:')
  for (const m of missing) console.log(`   ${m}`)
  console.log('   Run: pnpm tsx scripts/import-wordpress-media.ts')
}

await c.end()
process.exit(0)
