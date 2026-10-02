/**
 * Sets each service's /services index card photo from the WordPress source.
 *
 * WordPress page 353 (`/services`) is a grid of service cards, and the photo
 * on each card is NOT the service's hero and NOT its homepage card — all
 * three are independent choices. The mapping below is read straight off that
 * page's Bricks tree: service slug → the WordPress attachment id of the image
 * element inside that card.
 *
 * Attachments are matched on `wordpress_id`, never on filename: the importer
 * renames collisions, so #692 lives in the Media collection as `129-1.png`
 * and #2002 as `Home-Remodeling-1.png`.
 *
 * Idempotent — re-running sets the same rows to the same values.
 */
import 'dotenv/config'
import { createRequire } from 'node:module'

const { Client } = createRequire(import.meta.url)('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

/** service slug → WordPress attachment id on the /services card. */
const LISTING_IMAGES: Record<string, number> = {
  adu: 2010, // ADU-2.png
  'european-kitchen': 522,
  'shaker-kitchen': 542,
  finance: 1558, // Prime-Kitchens-Website-Photos.png
  'home-remodeling': 692, // 129.png
  'bathroom-remodeling': 510,
  'custom-kitchen': 523,
  'kitchen-remodeling': 481,
  additions: 2002, // Home-Remodeling.png — WordPress's name for the Additions card
  // 'complete-renovation': 2422 — the card exists on the WordPress page, but
  // attachment 2422 (WhatsApp-Image-2024-03-04-at-10.17.43-PM.jpeg) was never
  // imported into the Media collection. Left unset deliberately so the card
  // falls back rather than showing an invented photo; reported below.
}

/** On the WordPress page but with no imported attachment to point at. */
const UNRESOLVED: Record<string, number> = { 'complete-renovation': 2422 }

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const wpIds = Object.values(LISTING_IMAGES)
const media = await client.query(
  `select id, wordpress_id::int as wp, filename from media where wordpress_id::int = any($1)`,
  [wpIds],
)
const byWp = new Map((media.rows as { id: number; wp: number; filename: string }[]).map((r) => [r.wp, r]))

let set = 0
const missingMedia: string[] = []
const missingService: string[] = []

for (const [slug, wp] of Object.entries(LISTING_IMAGES)) {
  const m = byWp.get(wp)
  if (!m) {
    missingMedia.push(`${slug} → wp#${wp}`)
    continue
  }
  const res = await client.query(
    `update services set listing_image_id = $1 where slug = $2 returning slug`,
    [m.id, slug],
  )
  if (!res.rowCount) {
    missingService.push(slug)
    continue
  }
  set++
  console.log(`  ${slug.padEnd(22)} → media #${String(m.id).padEnd(5)} (wp#${wp}, ${m.filename})`)
}

console.log(`\n${set} service(s) given a /services card photo.`)

if (missingMedia.length) {
  console.log(`\nNOT SET — attachment missing from the Media collection:`)
  missingMedia.forEach((m) => console.log(`  ${m}`))
}
if (missingService.length) {
  console.log(`\nNOT SET — no service row with that slug:`)
  missingService.forEach((m) => console.log(`  ${m}`))
}
for (const [slug, wp] of Object.entries(UNRESOLVED)) {
  console.log(
    `\nGAP — "${slug}" has a card on the WordPress /services page using attachment #${wp}, which is not in the Media collection. Left empty; the card falls back to the homepage photo. Import #${wp} to close this.`,
  )
}

// Services with no card on the WordPress /services page at all.
const all = await client.query(`select slug from services order by slug`)
const covered = new Set([...Object.keys(LISTING_IMAGES), ...Object.keys(UNRESOLVED)])
const absent = (all.rows as { slug: string }[]).map((r) => r.slug).filter((s) => !covered.has(s))
if (absent.length) {
  console.log(`\nNo card on the WordPress /services page (left empty, falls back):`)
  absent.forEach((s) => console.log(`  ${s}`))
}

await client.end()
