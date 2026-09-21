import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

/**
 * Point every "Silicon Valley Loves Working With Us!" section at the
 * uploaded `silicon-valley-loves.webp`.
 *
 * The heading appears through three different places, which is why this
 * touches three tables:
 *
 *   - `ProjectsTrustIntro` reads Site Settings → Trust Section, so one row
 *     covers every page that renders it (`/our-projects`, `/blog`).
 *   - `ServiceSiliconValleyLovesSection` reads each service's own
 *     `siliconValleyLoves` group, so the service pages carry it per record.
 *   - The same section on service-LOCATION pages reads the location's own
 *     `siliconValleyLoves` group first, falling back to the parent service's
 *     only when the location's is empty (`ServiceLocationPage.tsx`) — so a
 *     location record with its own (stale) image wins over an already-fixed
 *     service. `ServiceLocations`' copy of this field is a plain `text` URL
 *     column, not a media relation like the other two (`Services` and
 *     `SiteSettings` both use an upload field) — that type difference is why
 *     the original version of this script, which only handled `*_image_id`
 *     relation columns, silently never reached it, and every one of the 45
 *     service-location rows was still on the old badge graphic.
 *
 * All three were showing (or, for locations, still are showing)
 * `Prime-Kitchens-100-Satisfaction-Guarantee.png` / `-1.png` — a badge
 * graphic rather than a photograph.
 *
 *   npx tsx scripts/set-silicon-valley-loves-image.ts [--dry]
 */

const dryRun = process.argv.includes('--dry')
const FILENAME = 'silicon-valley-loves.webp'

type PgClient = {
  connect(): Promise<void>
  query<Row>(text: string, values?: unknown[]): Promise<{ rows: Row[]; rowCount: number | null }>
  end(): Promise<void>
}
const { Client } = createRequire(import.meta.url)('pg') as {
  Client: new (config: { connectionString?: string }) => PgClient
}

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const media = await client.query<{ id: number; width: number; height: number; url: string }>(
  `select id, width, height, url from media where filename = $1 limit 1`,
  [FILENAME],
)
if (!media.rows.length) throw new Error(`${FILENAME} is not in the Media collection`)
const targetId = media.rows[0].id
const targetUrl = media.rows[0].url
console.log(
  `target: media#${targetId} ${FILENAME} (${media.rows[0].width}x${media.rows[0].height}) -> ${targetUrl}\n`,
)

const TARGETS: Array<{ table: string; column: string; label: string; value: number | string }> = [
  { table: 'site_settings', column: 'trust_intro_image_id', label: 'ProjectsTrustIntro', value: targetId },
  { table: 'services', column: 'silicon_valley_loves_image_id', label: 'service pages', value: targetId },
  // A `text` URL column, not a relation — compares/sets the URL string
  // directly rather than the numeric media id the other two rows use.
  {
    table: 'service_locations',
    column: 'silicon_valley_loves_image',
    label: 'service-location pages',
    value: targetUrl,
  },
]

const backup: Array<{ table: string; column: string; id: unknown; was: number | string | null }> = []
let changed = 0

for (const { table, column, label, value } of TARGETS) {
  // `site_settings` is a singleton global with no `slug` column.
  const rows = await client.query<{ id: unknown; v: number | string | null; slug?: string }>(
    `select id, "${column}" v${table === 'site_settings' ? '' : ', slug'} from "${table}"
      where "${column}" is not null and "${column}" <> $1`,
    [value],
  )
  if (!rows.rows.length) {
    console.log(`= ${label} (${table}.${column}): already -> ${value}`)
    continue
  }
  for (const row of rows.rows) {
    console.log(`${dryRun ? '~' : '+'} ${label}: ${row.slug ?? `#${row.id}`} ${row.v} -> ${value}`)
    backup.push({ table, column, id: row.id, was: row.v })
    changed += 1
  }
  if (dryRun) continue
  await client.query(
    `update "${table}" set "${column}" = $1 where "${column}" is not null and "${column}" <> $1`,
    [value],
  )
}

if (!dryRun && backup.length) {
  const file = `svl-image-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  await writeFile(file, JSON.stringify(backup, null, 2))
  console.log(`\nprevious values written to ${file}`)
}

console.log(`\n${dryRun ? 'dry run — ' : ''}${changed} reference(s) ${dryRun ? 'would change' : 'changed'}`)
await client.end()
