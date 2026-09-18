import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

/**
 * Point every "Silicon Valley Loves Working With Us!" section at the
 * uploaded `silicon-valley-loves.webp`.
 *
 * The heading appears through two different components, which is why this
 * touches two places:
 *
 *   - `ProjectsTrustIntro` reads Site Settings → Trust Section, so one row
 *     covers every page that renders it (`/our-projects`, `/blog`).
 *   - `ServiceSiliconValleyLovesSection` reads each service's own
 *     `siliconValleyLoves` group, so the service pages carry it per record.
 *
 * Both were showing `Prime-Kitchens-100-Satisfaction-Guarantee.png` — a badge
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

const media = await client.query<{ id: number; width: number; height: number }>(
  `select id, width, height from media where filename = $1 limit 1`,
  [FILENAME],
)
if (!media.rows.length) throw new Error(`${FILENAME} is not in the Media collection`)
const target = media.rows[0].id
console.log(`target: media#${target} ${FILENAME} (${media.rows[0].width}x${media.rows[0].height})\n`)

const TARGETS: Array<{ table: string; column: string; label: string }> = [
  { table: 'site_settings', column: 'trust_intro_image_id', label: 'ProjectsTrustIntro' },
  { table: 'services', column: 'silicon_valley_loves_image_id', label: 'service pages' },
]

const backup: Array<{ table: string; column: string; id: unknown; was: number | null }> = []
let changed = 0

for (const { table, column, label } of TARGETS) {
  const rows = await client.query<{ id: unknown; v: number | null; slug?: string }>(
    `select id, "${column}" v${table === 'services' ? ', slug' : ''} from "${table}"
      where "${column}" is not null and "${column}" <> $1`,
    [target],
  )
  if (!rows.rows.length) {
    console.log(`= ${label} (${table}.${column}): already media#${target}`)
    continue
  }
  for (const row of rows.rows) {
    console.log(
      `${dryRun ? '~' : '+'} ${label}: ${row.slug ?? `#${row.id}`} media#${row.v} -> media#${target}`,
    )
    backup.push({ table, column, id: row.id, was: row.v })
    changed += 1
  }
  if (dryRun) continue
  await client.query(
    `update "${table}" set "${column}" = $1 where "${column}" is not null and "${column}" <> $1`,
    [target],
  )
}

if (!dryRun && backup.length) {
  const file = `svl-image-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  await writeFile(file, JSON.stringify(backup, null, 2))
  console.log(`\nprevious values written to ${file}`)
}

console.log(`\n${dryRun ? 'dry run — ' : ''}${changed} reference(s) ${dryRun ? 'would change' : 'changed'}`)
await client.end()
