import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

/**
 * Make `(650) 235-4863` the site's only phone number.
 *
 * Three different numbers were live at once, and none of them was invented
 * here — they each arrived by a different route:
 *
 *   - `(650) 220-9600` is the number in the WordPress export, where it
 *     appears 16 times. It landed in `site_settings.company_phone` and in
 *     several landing-page "Find us" blocks.
 *   - `(650) 235-4863` sat in a *separate* Site Settings field,
 *     `company_phone_cta`, so the header CTA and the footer disagreed by
 *     design.
 *   - `(650) 235-4869` is on a landing-page block — a single transposed
 *     digit, and the one that is simply wrong.
 *
 * The project owner confirmed 235-4863 is the real number, so every field
 * below is set to it, including the `_clean` digits used for `tel:` links.
 * Nothing is reformatted beyond that: each column keeps its own shape.
 *
 *   npx tsx scripts/set-single-phone-number.ts [--dry]
 */

const dryRun = process.argv.includes('--dry')

const PHONE = '(650) 235-4863'
const PHONE_CLEAN = '6502354863'

type PgClient = {
  connect(): Promise<void>
  query<Row>(text: string, values?: unknown[]): Promise<{ rows: Row[]; rowCount: number | null }>
  end(): Promise<void>
}
const { Client } = createRequire(import.meta.url)('pg') as {
  Client: new (config: { connectionString?: string }) => PgClient
}

/** Every column that holds a phone number, and the value it should end up with. */
const TARGETS: Array<{ table: string; column: string; value: string }> = [
  { table: 'site_settings', column: 'company_phone', value: PHONE },
  { table: 'site_settings', column: 'company_phone_clean', value: PHONE_CLEAN },
  { table: 'site_settings', column: 'company_phone_cta', value: PHONE },
  { table: 'landing_pages_blocks_find_us', column: 'phone', value: PHONE },
  { table: 'services_blocks_find_us', column: 'phone', value: PHONE },
]

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const backup: Array<{ table: string; column: string; id: unknown; was: string }> = []
let changed = 0

for (const { table, column, value } of TARGETS) {
  const exists = await client.query<{ n: number }>(
    `select count(*)::int n from information_schema.columns where table_name = $1 and column_name = $2`,
    [table, column],
  )
  if (!exists.rows[0].n) {
    console.log(`- ${table}.${column}: no such column, skipped`)
    continue
  }

  const rows = await client.query<{ id: unknown; v: string | null }>(
    `select id, "${column}" v from "${table}" where "${column}" is not null and "${column}" <> $1`,
    [value],
  )
  if (!rows.rows.length) {
    console.log(`= ${table}.${column}: already ${value}`)
    continue
  }
  for (const row of rows.rows) {
    console.log(`${dryRun ? '~' : '+'} ${table}.${column} #${row.id}: ${JSON.stringify(row.v)} -> ${JSON.stringify(value)}`)
    backup.push({ table, column, id: row.id, was: row.v as string })
    changed += 1
  }
  if (dryRun) continue
  await client.query(`update "${table}" set "${column}" = $1 where "${column}" is not null and "${column}" <> $1`, [value])
}

if (!dryRun && backup.length) {
  const file = `phone-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  await writeFile(file, JSON.stringify(backup, null, 2))
  console.log(`\nprevious values written to ${file}`)
}

console.log(`\n${dryRun ? 'dry run — ' : ''}${changed} value(s) ${dryRun ? 'would change' : 'changed'}`)
await client.end()
