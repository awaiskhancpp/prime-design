/**
 * Migrates the `repair-services` block categories (home-repair section) so
 * the section is fully Payload rich-text driven while the data matches the
 * WordPress source with 100% fidelity:
 *
 *   1. adds `label` (each category's own list heading, e.g. "Services include:"
 *      vs "Key benefits:" — the WordPress page does NOT share one label) and
 *      `closing_body` (paragraphs after the list: Door, Flooring, Interior);
 *   2. restores the full category titles ("Cabinet Repair & Installation",
 *      not just "Cabinet" — the accent word + heading rest are two WP nodes);
 *   3. converts the plain-text `description` column to Lexical rich text
 *      (jsonb) to match the new `richText` field type in LandingPageBlocks.
 *
 * Runs against BOTH the services and landing_pages block tables, which
 * carry the same six migrated categories. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const url = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim()
if (!url) throw new Error('DATABASE_URL not found in .env')

const CATEGORIES = [
  {
    title: 'Cabinet',
    full: 'Cabinet Repair & Installation',
    label: 'Services include:',
    closingBody: null,
  },
  {
    title: 'Door',
    full: 'Door Installation & Repair',
    label: 'We service and install:',
    closingBody:
      'If you’re experiencing issues such as squeaking hinges, damaged frames, or drafts, our door repair specialists can quickly diagnose and fix the problem, restoring both security and style to your home.',
  },
  {
    title: 'Drywall',
    full: 'Drywall Repair, Installation & Replacement',
    label: 'Key benefits:',
    closingBody: null,
  },
  {
    title: 'Flooring',
    full: 'Flooring Installation & Repairs',
    label: 'Flooring types we work with:',
    closingBody:
      'Flooring repairs may include addressing water damage, refinishing hardwood, patching torn carpet, or replacing tiles. We focus on every detail to deliver a smooth, flawless surface.',
  },
  {
    title: 'Interior',
    full: 'Interior Painting',
    label: 'Interior painting options:',
    closingBody:
      'Whether you’re looking to freshen up a single room or repaint your entire home, our professional painters handle preparation, color matching, and clean-up with minimal disruption.',
  },
  {
    title: 'Window',
    full: 'Window Repair & Replacement',
    label: 'Window services include:',
    closingBody: null,
  },
]

/** Lexical JSON for one plain paragraph, mirroring Payload's serialization. */
function paragraph(text) {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [
      { mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 },
    ],
    direction: null,
  }
}

function lexicalDoc(text) {
  return JSON.stringify({
    root: { type: 'root', format: '', indent: 0, version: 1, children: [paragraph(text)] },
  })
}

const client = new Client({ connectionString: url })
await client.connect()

const TABLES = [
  'services_blocks_repair_services_categories',
  'landing_pages_blocks_repair_services_categories',
]

for (const table of TABLES) {
  await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS label character varying`)
  await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS closing_body jsonb`)

  for (const cat of CATEGORIES) {
    await client.query(
      `UPDATE ${table} SET title = $1, label = $2 WHERE title = $3`,
      [cat.full, cat.label, cat.title],
    )
    if (cat.closingBody) {
      await client.query(
        `UPDATE ${table} SET closing_body = $1::jsonb WHERE title = $2 AND closing_body IS NULL`,
        [lexicalDoc(cat.closingBody), cat.full],
      )
    }
  }

  // Plain text -> Lexical rich text. `to_jsonb` turns the varchar into a
  // JSON string first, then we wrap it in the editor-state shape.
  await client.query(`UPDATE ${table} SET description = NULL WHERE description = ''`)
  await client.query(
    `ALTER TABLE ${table} ALTER COLUMN description TYPE jsonb USING (CASE WHEN description IS NULL THEN NULL::jsonb ELSE to_jsonb(description) END)`,
  )
  await client.query(
    `UPDATE ${table} SET description = jsonb_build_object(
      'root', jsonb_build_object(
        'type', 'root', 'format', '', 'indent', 0, 'version', 1,
        'children', jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph', 'format', '', 'indent', 0, 'version', 1,
            'children', jsonb_build_array(
              jsonb_build_object(
                'mode', 'normal', 'text', description #>> '{}',
                'type', 'text', 'style', '', 'detail', 0, 'format', 0, 'version', 1
              )
            ),
            'direction', null
          )
        )
      )
    ) WHERE description IS NOT NULL`,
  )

  const check = await client.query(
    `SELECT _order, title, label, description #>> '{root,children,0,children,0,text}' AS body,
            closing_body #>> '{root,children,0,children,0,text}' AS closing
     FROM ${table} ORDER BY _order`,
  )
  console.log(`\n=== ${table} ===`)
  for (const row of check.rows) {
    console.log(
      JSON.stringify({
        title: row.title,
        label: row.label,
        body: row.body?.slice(0, 50),
        closing: row.closing?.slice(0, 50) ?? null,
      }),
    )
  }
}

await client.end()
console.log('\nDone.')
process.exit(0)
