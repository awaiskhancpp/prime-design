/**
 * Restores three WordPress-parity defects found auditing the 45 city pages
 * against the Bricks family templates (1495 kitchen / 1584 bathroom /
 * 1639 home) and the shared templates they pull in.
 *
 * 1. home-remodeling hero feature photos, slots 1 and 2, are swapped.
 *    Template 1639 pairs the blurbs with attachments 708 (145.png),
 *    696 (133.png), 681 (178.png) in that order; Payload has 696 first, so
 *    every home city page shows 133 where WordPress shows 145 and vice versa.
 *    Kitchen (531/491/482) and bathroom (537/508/525) are already correct and
 *    are left untouched.
 *
 * 2. The "Silicon Valley Loves Working With Us!" body was rewritten during
 *    migration. Template 1159 is the source of truth and applies to all 45.
 *
 * 3. The kitchen video description was rewritten. Template 1495 is the source
 *    of truth; it applies to the 15 kitchen city pages. Bathroom and home are
 *    already correct, so they are not touched.
 *
 * WordPress stores the description and the closing "within reach" line as one
 * run-on string; the migration split them into `description` + `tagline`, and
 * the tagline is shared and already correct, so only the description sentence
 * is restored here.
 *
 * Services and media are resolved by slug or WordPress attachment id, never by
 * a Payload row id. Every write is conditional on the current value, so a
 * re-run is a no-op. Idempotent.
 *
 *   node scripts/fix-location-copy-and-hero-order.mjs --dry-run
 *   node scripts/fix-location-copy-and-hero-order.mjs
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const DRY_RUN = process.argv.includes('--dry-run')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const connectionString = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim().replace(/^["']|["']$/g, '')
if (!connectionString) throw new Error('DATABASE_URL not found in .env')

/** Template 1639 pairs each hero blurb with this attachment, in this order. */
const HOME_HERO_WP_IDS = [708, 696, 681]

/** Template 1159, verbatim. */
const SV_LOVES_BODY =
  'Our company guarantees to bring you the best experience possible. Call today to get a quote!'

/** Template 1495, the sentence before the shared tagline. */
const KITCHEN_VIDEO_DESCRIPTION =
  'Imagine the joy of cooking in a kitchen that reflects your unique style and caters to your every need.'

const client = new Client({ connectionString })
await client.connect()
const log = (...args) => console.log(...args)

try {
  log(`${DRY_RUN ? '[dry run] ' : ''}restoring WordPress copy and hero image order`)
  log('')

  // ---- 1. home hero feature image order -----------------------------------
  log('1. home-remodeling hero feature images')
  const homeRows = (await client.query(`select id from services where slug = 'home-remodeling'`)).rows
  if (!homeRows.length) throw new Error('No service row with slug "home-remodeling".')
  const homeId = homeRows[0].id

  const wanted = []
  for (const wpId of HOME_HERO_WP_IDS) {
    const rows = (
      await client.query(`select id, filename, wordpress_id from media where wordpress_id = $1`, [wpId])
    ).rows
    if (!rows.length) throw new Error(`Media has no row with wordpress_id ${wpId}.`)
    wanted.push(rows[0])
  }

  const current = (
    await client.query(
      `select r.id, r."order", m.id media_id, m.wordpress_id, m.filename
         from services_rels r join media m on m.id = r.media_id
        where r.parent_id = $1 and r.path = 'locationFeatureImages'
        order by r."order"`,
      [homeId],
    )
  ).rows
  log(`   current: ${current.map((r) => `wp${r.wordpress_id}`).join(' -> ') || '(none)'}`)
  log(`   target : ${wanted.map((m) => `wp${m.wordpress_id}`).join(' -> ')}`)

  const alreadyRight =
    current.length === wanted.length && current.every((row, i) => row.media_id === wanted[i].id)

  if (alreadyRight) {
    log('   already in WordPress order - nothing to do')
  } else if (current.length !== wanted.length) {
    throw new Error(
      `Expected ${wanted.length} locationFeatureImages rows for home-remodeling, found ${current.length}.`,
    )
  } else if (DRY_RUN) {
    log(`   would rewrite ${current.length} rows into WordPress order`)
  } else {
    // The rows already exist and point at the right media; only `order` is wrong.
    for (const [index, media] of wanted.entries()) {
      const row = current.find((r) => r.media_id === media.id)
      if (!row) throw new Error(`wp${media.wordpress_id} is not among the home-remodeling feature images.`)
      await client.query(`update services_rels set "order" = $2 where id = $1`, [row.id, index])
    }
    log(`   reordered ${wanted.length} rows`)
  }
  log('')

  // ---- 2 & 3. copy --------------------------------------------------------
  const KITCHEN_ONLY = `and sl.service_id = (select id from services where slug = 'kitchen-remodeling')`
  const copyFixes = [
    {
      label: '2. Silicon Valley Loves body (all families)',
      column: 'silicon_valley_loves_body',
      value: SV_LOVES_BODY,
      where: '',
    },
    {
      label: '3. kitchen video description (kitchen only)',
      column: 'location_video_description',
      value: KITCHEN_VIDEO_DESCRIPTION,
      where: KITCHEN_ONLY,
    },
  ]

  for (const fix of copyFixes) {
    log(fix.label)
    const before = (
      await client.query(
        `select sl.${fix.column} v, count(*)::int n
           from service_locations sl
          where true ${fix.where}
          group by 1 order by 2 desc`,
      )
    ).rows
    for (const row of before) log(`   [${row.n} pages] ${row.v === null ? '(null)' : row.v}`)

    const pending = (
      await client.query(
        `select count(*)::int n from service_locations sl
          where sl.${fix.column} is distinct from $1 ${fix.where}`,
        [fix.value],
      )
    ).rows[0].n

    if (!pending) {
      log('   already matches WordPress - nothing to do')
      log('')
      continue
    }
    log(`   ${DRY_RUN ? 'would update' : 'updating'} ${pending} pages to:`)
    log(`   -> ${fix.value}`)
    if (!DRY_RUN) {
      const res = await client.query(
        `update service_locations sl
            set ${fix.column} = $1, updated_at = now()
          where sl.${fix.column} is distinct from $1 ${fix.where}`,
        [fix.value],
      )
      log(`   updated ${res.rowCount} rows`)
    }
    log('')
  }

  // ---- verification -------------------------------------------------------
  log(DRY_RUN ? 'current state:' : 'verification:')
  const order = (
    await client.query(
      `select m.wordpress_id wp, m.filename
         from services_rels r join media m on m.id = r.media_id
        where r.parent_id = $1 and r.path = 'locationFeatureImages'
        order by r."order"`,
      [homeId],
    )
  ).rows
  const orderOk = order.map((r) => r.wp).join(',') === HOME_HERO_WP_IDS.join(',')
  log(
    `  ${orderOk ? 'ok  ' : 'GAP '} home hero order: ${order.map((r) => `wp${r.wp} ${r.filename}`).join(' | ')}`,
  )

  const sv = (
    await client.query(`select count(*)::int n from service_locations where silicon_valley_loves_body = $1`, [
      SV_LOVES_BODY,
    ])
  ).rows[0].n
  log(`  ${sv === 45 ? 'ok  ' : 'GAP '} svLoves body matches WordPress on ${sv}/45 pages`)

  const kv = (
    await client.query(
      `select count(*)::int n from service_locations
        where location_video_description = $1
          and service_id = (select id from services where slug = 'kitchen-remodeling')`,
      [KITCHEN_VIDEO_DESCRIPTION],
    )
  ).rows[0].n
  log(`  ${kv === 15 ? 'ok  ' : 'GAP '} kitchen video description matches WordPress on ${kv}/15 pages`)

  if (!DRY_RUN && (!orderOk || sv !== 45 || kv !== 15)) {
    throw new Error('Verification failed - see the GAP lines above.')
  }
} finally {
  await client.end()
}
