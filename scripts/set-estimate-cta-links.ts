import 'dotenv/config'
import { createRequire } from 'node:module'

/**
 * Turn the free-estimate band's copy into two real links.
 *
 * "Contact us here or reach us at (650) 235-4863" was flat text — the word
 * "here" pointed nowhere and the phone number was not dialable. Now that the
 * column is rich text (`20260919_130000_cta_body_rich_text`), the same
 * sentence is rebuilt as a Lexical paragraph with a link on "here" and a
 * `tel:` link on the number.
 *
 * Matched on the exact sentence, so only the estimate bands are touched —
 * the finance and landing CTAs share the column and are left alone.
 *
 *   npx tsx scripts/set-estimate-cta-links.ts [--dry]
 */

const dryRun = process.argv.includes('--dry')
const SENTENCE = 'Contact us here or reach us at (650) 235-4863'
const PHONE = '(650) 235-4863'
const PHONE_HREF = 'tel:6502354863'

type PgClient = {
  connect(): Promise<void>
  query<Row>(text: string, values?: unknown[]): Promise<{ rows: Row[]; rowCount: number | null }>
  end(): Promise<void>
}
const { Client } = createRequire(import.meta.url)('pg') as {
  Client: new (config: { connectionString?: string }) => PgClient
}

const textNode = (text: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const linkNode = (text: string, url: string) => ({
  type: 'link',
  format: '',
  indent: 0,
  version: 3,
  direction: 'ltr',
  fields: { url, newTab: false, linkType: 'custom' },
  children: [textNode(text)],
})

/** "Contact us <here> or reach us at <(650) 235-4863>" */
const document = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [
          textNode('Contact us '),
          linkNode('here', '/contact'),
          textNode(' or reach us at '),
          linkNode(PHONE, PHONE_HREF),
        ],
      },
    ],
  },
}

const TARGETS: Array<{ table: string; column: string }> = [
  { table: 'services_blocks_cta', column: 'description' },
  { table: 'landing_pages_blocks_cta', column: 'description' },
  { table: 'pages_blocks_cta', column: 'body' },
]

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

let changed = 0
for (const { table, column } of TARGETS) {
  // The migration turned the sentence into a single text node, so matching on
  // the flattened text finds exactly the rows that carried it.
  const rows = await client.query<{ id: string }>(
    `select id from "${table}"
      where "${column}" is not null
        and (
          select string_agg(t->>'text', '')
          from jsonb_array_elements("${column}"->'root'->'children') c,
               jsonb_array_elements(c->'children') t
        ) = $1`,
    [SENTENCE],
  )
  if (!rows.rows.length) {
    console.log(`= ${table}.${column}: no rows with that sentence`)
    continue
  }
  for (const row of rows.rows) {
    console.log(`${dryRun ? '~' : '+'} ${table}.${column} #${row.id}`)
    changed += 1
  }
  if (dryRun) continue
  await client.query(
    `update "${table}" set "${column}" = $1::jsonb where id = any($2::varchar[])`,
    [JSON.stringify(document), rows.rows.map((row) => row.id)],
  )
}

console.log(
  `\n${dryRun ? 'dry run — ' : ''}${changed} band(s) ${dryRun ? 'would get' : 'now have'} both links`,
)
await client.end()
