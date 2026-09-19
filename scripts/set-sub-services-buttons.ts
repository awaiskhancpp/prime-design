import 'dotenv/config'
import { createRequire } from 'node:module'

/**
 * Fill the sub-services sections' two buttons from the WordPress source.
 *
 * WordPress puts "View our gallery" and "Talk to an expert" beside these
 * headings; the block had no fields for them until
 * `20260919_140000_sub_services_buttons`, so they were dropped on import.
 *
 * Link targets come from the Bricks `link` settings:
 *
 *   - "View our gallery" -> post 349 -> `/gallery` on both pages.
 *   - "Talk to an expert" -> `#contact` on the bathroom page, which is the
 *     contact band on that page.
 *
 * The kitchen page's second button is the one deviation. WordPress points it
 * at post 339 — `/our-projects` — which does not match a button that says
 * "Talk to an expert", and the kitchen page no longer has a `#contact` band
 * to anchor to. It goes to `/contact` here; change it in the admin if the
 * WordPress target was deliberate.
 *
 *   npx tsx scripts/set-sub-services-buttons.ts [--dry]
 */

const dryRun = process.argv.includes('--dry')

const BUTTONS: Array<{
  heading: RegExp
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}> = [
  {
    heading: /style and vision/i,
    primary: { label: 'View our gallery', href: '/gallery' },
    secondary: { label: 'Talk to an expert', href: '/contact' },
  },
  {
    heading: /witness the beauty/i,
    primary: { label: 'View our gallery', href: '/gallery' },
    secondary: { label: 'Talk to an expert', href: '#contact' },
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

const TABLES = ['services_blocks_sub_services_2', 'landing_pages_blocks_sub_services']

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

let changed = 0
for (const table of TABLES) {
  const rows = await client.query<{ id: string; heading: string | null }>(
    `select id, heading from "${table}" where heading is not null`,
  )
  for (const row of rows.rows) {
    const match = BUTTONS.find((entry) => entry.heading.test(row.heading || ''))
    if (!match) continue
    console.log(`${dryRun ? '~' : '+'} ${table}: "${String(row.heading).slice(0, 52)}"`)
    console.log(`    ${match.primary.label} -> ${match.primary.href}`)
    console.log(`    ${match.secondary.label} -> ${match.secondary.href}`)
    changed += 1
    if (dryRun) continue
    await client.query(
      `update "${table}" set primary_cta_label = $2, primary_cta_href = $3,
         secondary_cta_label = $4, secondary_cta_href = $5 where id = $1`,
      [row.id, match.primary.label, match.primary.href, match.secondary.label, match.secondary.href],
    )
  }
}

console.log(`\n${dryRun ? 'dry run — ' : ''}${changed} section(s) ${dryRun ? 'would get' : 'now have'} both buttons`)
await client.end()
