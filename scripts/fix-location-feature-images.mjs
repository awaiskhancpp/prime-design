/**
 * Restores the three hero feature photos on the service-location pages.
 *
 * WordPress renders every city page from its family's Bricks content template
 * (1495 kitchen / 1584 bathroom / 1639 home), and each template names three
 * specific photos beside the hero blurbs:
 *
 *   kitchen   wp 531, 491, 482
 *   bathroom  wp 537, 508, 525
 *   home      wp 696, 708, 681
 *
 * The migration never carried them, so `getLocationFeatures` fell back to the
 * service gallery — which is itself empty in Payload, so it fell further back
 * to the static `serviceDetails` object in `src/lib/services.ts`. Every city
 * page in a family therefore showed photos that appear nowhere in the
 * WordPress source.
 *
 * The images live on the SERVICE (`locationFeatureImages`), not on each
 * service-location, because WordPress sets them per family template rather
 * than per city.
 *
 * Services are resolved by slug and media by `wordpress_id`, the stable
 * attachment id from the export. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const RELS_PATH = 'locationFeatureImages'

/** service slug -> the WordPress attachment ids its family template uses. */
const FAMILIES = [
  ['kitchen-remodeling', [531, 491, 482]],
  ['bathroom-remodeling', [537, 508, 525]],
  ['home-remodeling', [696, 708, 681]],
]

const c = new Client({ connectionString: u })
await c.connect()

const missing = []

for (const [slug, wpIds] of FAMILIES) {
  const service = (await c.query('select id from services where slug = $1', [slug])).rows[0]
  if (!service) throw new Error(`No service row with slug "${slug}"`)

  await c.query('delete from services_rels where parent_id = $1 and path = $2', [
    service.id,
    RELS_PATH,
  ])

  console.log(`\n${slug} (service ${service.id})`)
  let order = 0
  for (const wpId of wpIds) {
    const media = (
      await c.query('select id, filename from media where wordpress_id = $1', [String(wpId)])
    ).rows[0]
    if (!media) {
      missing.push({ slug, wpId })
      console.log(`   wp ${String(wpId).padEnd(5)} SKIPPED — not in the media collection`)
      continue
    }
    await c.query(
      `insert into services_rels ("order", parent_id, path, media_id) values ($1, $2, $3, $4)`,
      [order, service.id, RELS_PATH, media.id],
    )
    order += 1
    console.log(`   wp ${String(wpId).padEnd(5)} -> media#${String(media.id).padEnd(5)} ${media.filename}`)
  }
}

console.log('\n--- result ---')
const check = await c.query(
  `select s.slug, count(r.id)::int n
     from services s
     left join services_rels r on r.parent_id = s.id and r.path = $1
    where s.slug = any($2::text[])
    group by s.slug order by s.slug`,
  [RELS_PATH, FAMILIES.map(([slug]) => slug)],
)
for (const r of check.rows) console.log(`   ${r.slug.padEnd(22)} ${r.n}/3 feature images`)

if (missing.length) {
  console.log('\nNOT RESTORED — these WordPress originals were never imported:')
  for (const m of missing) console.log(`   ${m.slug.padEnd(22)} wp ${m.wpId}`)
  console.log('   The origin returns 403 for direct downloads, so the binaries')
  console.log('   need to come from a WordPress backup or the media library.')
}

await c.end()
process.exit(0)
