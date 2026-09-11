// Schema parity (Payload push:false) for the pages.hero.cta group added to
// src/collections/Pages.ts — flattened as hero_cta_label / hero_cta_href.
import { readFileSync } from 'node:fs'
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'

const rawEnv = readFileSync('.env', 'utf8')
const conn = (rawEnv.match(/DATABASE_URL=([^\r\n]+)/) || [])[1].replace(/^"(.*)"$/, '$1')

const client = new pg.Client({ connectionString: conn })
await client.connect()
try {
  const existing = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'pages' AND column_name IN ('hero_cta_label','hero_cta_href')`,
  )
  const present = new Set(existing.rows.map((r) => r.column_name))
  if (!present.has('hero_cta_label')) {
    await client.query(`ALTER TABLE pages ADD COLUMN hero_cta_label varchar`)
    console.log('added hero_cta_label')
  }
  if (!present.has('hero_cta_href')) {
    await client.query(`ALTER TABLE pages ADD COLUMN hero_cta_href varchar`)
    console.log('added hero_cta_href')
  }
  const cols = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'pages' AND column_name LIKE 'hero_%' ORDER BY column_name`,
  )
  console.log('hero columns:', cols.rows.map((r) => r.column_name).join(', '))
} finally {
  await client.end()
}
