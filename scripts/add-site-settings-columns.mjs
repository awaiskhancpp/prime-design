// Schema parity (push:false) for the user's new SiteSettings fields.
import { readFileSync } from 'node:fs'
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'

const rawEnv = readFileSync('.env', 'utf8')
const conn = (rawEnv.match(/DATABASE_URL=([^\r\n]+)/) || [])[1].replace(/^"(.*)"$/, '$1')

const client = new pg.Client({ connectionString: conn })
await client.connect()
try {
  for (const [col, type] of [
    ['top_banner_enabled', 'boolean'],
    ['company_maps_url', 'varchar'],
  ]) {
    const exists = await client.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = $1`,
      [col],
    )
    if (!exists.rows[0]) {
      await client.query(`ALTER TABLE site_settings ADD COLUMN ${col} ${type}`)
      console.log(`added ${col}`)
    } else {
      console.log(`${col} already exists`)
    }
  }
} finally {
  await client.end()
}
