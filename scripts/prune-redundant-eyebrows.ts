import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

/**
 * Remove the eyebrows that repeat their own heading.
 *
 * `set-service-section-headers.ts` filled every empty eyebrow, which was too
 * broad. An eyebrow earns its place when it frames a heading the visitor
 * cannot categorise on sight — "What we build" over "Witness the Beauty of
 * Our Bathroom Transformations" does that. It does not when it restates the
 * heading:
 *
 *     Free estimate
 *     Ready to schedule your free estimate?     <- says it already
 *
 *     Financing
 *     Renovation financing, simplified.          <- says it already
 *
 * The CTA bands are also the wrong shape for one: a slim brass strip with a
 * heading, a line and a button. A label above that is clutter, not hierarchy.
 *
 * Only values this session wrote are cleared — the list is read back from the
 * receipt file, so no WordPress copy can be touched even by mistake.
 *
 *   npx tsx scripts/prune-redundant-eyebrows.ts <receipt.json> [--dry]
 */

const args = process.argv.slice(2)
const dryRun = args.includes('--dry')
const receiptPath = args.find((a) => a.endsWith('.json'))
if (!receiptPath) throw new Error('pass the service-headers-written-*.json receipt')

/** Section types whose eyebrow restates the heading. */
const REDUNDANT_TABLES = new Set(['cta', 'image_text_2'])

type PgClient = {
  connect(): Promise<void>
  query<Row>(text: string, values?: unknown[]): Promise<{ rows: Row[]; rowCount: number | null }>
  end(): Promise<void>
}
const { Client } = createRequire(import.meta.url)('pg') as {
  Client: new (config: { connectionString?: string }) => PgClient
}

type Written = { table: string; slug: string; field: string; value: string }
const written = JSON.parse(await readFile(receiptPath, 'utf8')) as Written[]

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

let cleared = 0
for (const entry of written) {
  if (entry.field !== 'eyebrow' || !REDUNDANT_TABLES.has(entry.table)) continue
  const table = `services_blocks_${entry.table}`
  // Guarded on the exact value this session wrote, so an edit made since is
  // left alone.
  const rows = await client.query(
    `update "${table}" b set eyebrow = null
       from services s
      where s.id = b._parent_id and s.slug = $1 and b.eyebrow = $2
      returning b.id`,
    [entry.slug, entry.value],
  )
  const n = rows.rows.length
  if (!n) continue
  console.log(`${dryRun ? '~' : '-'} ${entry.table} [${entry.slug}] cleared ${JSON.stringify(entry.value)}`)
  cleared += n
}

// "Services" over "Repair & Installation" is nearly a restatement; this names
// the work instead.
const repair = await client.query(
  `update services_blocks_repair_services set eyebrow = 'What we fix'
    where eyebrow = 'Services' returning id`,
)
if (repair.rows.length) console.log(`${dryRun ? '~' : '+'} repair_services eyebrow -> "What we fix"`)

console.log(`\n${dryRun ? 'dry run — ' : ''}${cleared} redundant eyebrow(s) cleared`)
await client.end()
