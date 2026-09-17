/**
 * Corrects the location pages' video section against the WordPress source.
 *
 * Each family renders from its own Bricks content template, and each template
 * embeds the SAME clip for this section:
 *
 *   1495 kitchen   05.03.2023 Daniel CLIENT PRIME KITCHEN ... 2365 Cryer St Hayward.mp4
 *   1584 bathroom  05.03.2023 Daniel CLIENT PRIME KITCHEN ... 2365 Cryer St Hayward.mp4
 *   1639 home      05.03.2023 Daniel CLIENT PRIME KITCHEN ... 2365 Cryer St Hayward.mp4
 *
 * The separate "01.19.2023 Prime Kitchens 1794 San Luis Ave Mountain View" clip
 * belongs to the shared contact template (1199), which every page also embeds.
 * The bathroom family had the San Luis clip in BOTH slots, so bathroom city
 * pages played the same video twice.
 *
 * Posters: none of the three templates sets one on this video — the Bricks
 * `<video>` element carries only `fileUrl`, `filePreload`, `fileAutoplay` and
 * friends. The stored posters (`/services/kitchen-remodeling.jpeg`,
 * `/before-after/bathroom_remodeling_after.jpeg`,
 * `/services/home-remodeling.jpeg`) are local files invented during migration,
 * so they are cleared. A poster should only ever appear if WordPress or an
 * editor explicitly set one.
 *
 * The clip is resolved through the Media collection by its WordPress
 * provenance (`source_url`, the bunny.net URL the export recorded), never by a
 * Payload id. Services are resolved by slug. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

/** The WordPress source URL of the clip all three family templates embed. */
const WP_VIDEO_SOURCE = '05.03.2023%20Daniel%20CLIENT%20PRIME%20KITCHEN'

const FAMILIES = ['kitchen-remodeling', 'bathroom-remodeling', 'home-remodeling']

const c = new Client({ connectionString: u })
await c.connect()

// Resolve the clip by its WordPress provenance rather than a Payload id.
// The same clip exists twice in Media: the raw WordPress filename (spaces and
// parentheses, percent-encoded in URLs) and a curated re-encode the rest of the
// site uses. Both are byte-identical, so prefer the curated one — a filename
// with no spaces — and fall back to whatever matches if it is ever removed.
const media = (
  await c.query(
    `select id, filename, url from media
      where source_url like $1 and mime_type like 'video%'
      order by (filename like '% %') asc, id asc
      limit 1`,
    [`%${WP_VIDEO_SOURCE}%`],
  )
).rows[0]
if (!media) {
  throw new Error(
    `No media row whose source_url matches "${WP_VIDEO_SOURCE}" — the Cryer St clip is not imported.`,
  )
}
console.log(`WordPress clip -> media#${media.id} ${media.filename}`)
console.log(`   url: ${media.url}\n`)

let videoFixed = 0
let postersCleared = 0

for (const slug of FAMILIES) {
  const service = (await c.query('select id from services where slug = $1', [slug])).rows[0]
  if (!service) throw new Error(`No service row with slug "${slug}"`)

  const { rowCount: v } = await c.query(
    `update service_locations
        set location_video_video_url = $1
      where service_id = $2
        and location_video_video_url is distinct from $1`,
    [media.url, service.id],
  )
  const { rowCount: p } = await c.query(
    `update service_locations
        set location_video_poster = null
      where service_id = $1 and location_video_poster is not null`,
    [service.id],
  )
  videoFixed += v
  postersCleared += p
  console.log(`${slug.padEnd(22)} video updated on ${v} row(s), poster cleared on ${p} row(s)`)
}

console.log(`\ntotal: ${videoFixed} video url(s) corrected, ${postersCleared} invented poster(s) cleared`)

const check = await c.query(
  `select s.slug, sl.location_video_video_url v, sl.location_video_poster p, count(*)::int n
     from service_locations sl join services s on s.id = sl.service_id
    group by 1, 2, 3 order by 1`,
)
console.log('\nresult:')
for (const r of check.rows)
  console.log(
    `   ${r.slug.padEnd(22)} ${r.n}x  video=${String(r.v).split('/').pop()}  poster=${r.p ?? '(none)'}`,
  )

await c.end()
process.exit(0)
