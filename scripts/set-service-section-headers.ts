import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

/**
 * Fill the missing eyebrows and descriptions on the service pages' section
 * headers.
 *
 * The audit behind this: of 160 section headings site-wide, the eyebrow field
 * was filled on 72 and the description on 98 — which is why the headers read
 * as inconsistent. This is round one, the service pages only.
 *
 * Two rules shaped the copy:
 *
 *   - The same section type gets the same eyebrow on every page. Nine pages
 *     share the "Ready to schedule your free estimate?" band, so all nine get
 *     "Free estimate" rather than nine variations. That is what turns a wall
 *     of one-off labels into a system.
 *   - Heroes are the exception: their eyebrow names the service, because on a
 *     service page that line is doing orientation work, not labelling a
 *     section type.
 *
 * NOTHING IS OVERWRITTEN. Every update is guarded on the column being null or
 * empty, so existing WordPress copy cannot be replaced by anything here, and a
 * re-run is a no-op.
 *
 *   npx tsx scripts/set-service-section-headers.ts [--dry]
 */

const dryRun = process.argv.includes('--dry')

/** table (without the `services_blocks_` prefix) -> service slug -> value */
type Fill = { table: string; slug: string; heading?: RegExp; eyebrow?: string; description?: string }

const EYEBROW_BY_SECTION: Record<string, string> = {
  gallery_2: 'Our work',
  sub_services_2: 'What we build',
  checklist: "What's included",
  experience_difference: 'Why us',
  repair_services: 'Services',
}

const HERO_EYEBROWS: Record<string, string> = {
  additions: 'Room additions',
  adu: 'ADU & garage conversions',
  'complete-renovation': 'Complete renovation',
  'bathroom-remodeling': 'Bathroom remodeling',
  'kitchen-remodeling': 'Kitchen remodeling',
  'home-remodeling': 'Home remodeling',
  'comprehensive-home-repair-installation-services-in-silicon-valley': 'Repair & installation',
  finance: 'Financing',
}

/** Descriptions for the seven headings that have none. */
const DESCRIPTIONS: Fill[] = [
  {
    table: 'checklist',
    slug: 'additions',
    description:
      'What a room addition covers, from the first drawings through to the finished space.',
  },
  {
    table: 'checklist',
    slug: 'adu',
    description:
      'What an ADU or garage conversion covers, from permitting through to the finished unit.',
  },
  {
    table: 'checklist',
    slug: 'complete-renovation',
    description: 'What a whole-home renovation covers, room by room.',
  },
  {
    table: 'prime_difference',
    slug: 'bathroom-remodeling',
    description: 'The things that stay the same on every bathroom we build.',
  },
  {
    table: 'prime_difference',
    slug: 'home-remodeling',
    description: 'The things that stay the same on every home we remodel.',
  },
  {
    table: 'experience_difference',
    slug: 'comprehensive-home-repair-installation-services-in-silicon-valley',
    description: 'Licensed, insured, and accountable for every repair we take on.',
  },
  {
    table: 'faq',
    slug: 'finance',
    description: 'Common questions about financing a remodel with Prime Design & Build.',
  },
]

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

const written: Array<{ table: string; slug: string; field: string; value: string }> = []

/** Guarded on emptiness, so existing copy is never replaced. */
async function fill(table: string, column: string, value: string, where: string, args: unknown[]) {
  const full = `services_blocks_${table}`
  const rows = await client.query<{ id: string; slug: string }>(
    `select b.id, s.slug from "${full}" b join services s on s.id = b._parent_id
      where (b."${column}" is null or b."${column}" = '') and ${where}`,
    args,
  )
  for (const row of rows.rows) {
    console.log(`${dryRun ? '~' : '+'} ${table}.${column} [${row.slug}] = ${JSON.stringify(value)}`)
    written.push({ table, slug: row.slug, field: column, value })
    if (dryRun) continue
    await client.query(`update "${full}" set "${column}" = $2 where id = $1`, [row.id, value])
  }
}

// --- eyebrows: one per section type -------------------------------------
for (const [table, eyebrow] of Object.entries(EYEBROW_BY_SECTION))
  await fill(table, 'eyebrow', eyebrow, `b.heading is not null and b.heading <> ''`, [])

// --- eyebrows: the free-estimate band, shared across nine pages ----------
await fill('cta', 'eyebrow', 'Free estimate', `b.heading ilike $1`, ['%free estimate%'])
// --- eyebrows: the finance CTAs and the finance image+text --------------
await fill('cta', 'eyebrow', 'Financing', `s.slug = 'finance'`, [])
await fill('image_text_2', 'eyebrow', 'Financing', `s.slug = 'finance'`, [])

// --- eyebrows: heroes name their service --------------------------------
for (const [slug, eyebrow] of Object.entries(HERO_EYEBROWS))
  await fill('hero', 'eyebrow', eyebrow, `s.slug = $1`, [slug])

// --- descriptions --------------------------------------------------------
for (const entry of DESCRIPTIONS)
  if (entry.description)
    await fill(entry.table, 'description', entry.description, `s.slug = $1`, [entry.slug])

if (!dryRun && written.length) {
  const file = `service-headers-written-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  await writeFile(file, JSON.stringify(written, null, 2))
  console.log(`\nwrote ${written.length} value(s); list saved to ${file}`)
}
console.log(`\n${dryRun ? 'dry run — ' : ''}${written.length} field(s) filled (none overwritten)`)
await client.end()
