import 'dotenv/config'
import { createRequire } from 'node:module'

const { Client } = createRequire(import.meta.url)('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

console.log('--- payload_migrations (what Payload believes has run) ---')
const migrations = await client.query('select * from payload_migrations order by id')
console.log(JSON.stringify(migrations.rows, null, 2))

console.log('\n--- did the failed migration leave a partial constraint behind? ---')
const partial = await client.query(
  `select conname from pg_constraint where conname = 'services_blocks_prime_difference_features_icon_icon_media_id_me'`,
)
console.log('constraint exists:', partial.rows.length > 0)

console.log('\n--- is your imported landing page data still there? ---')
const landingPages = await client.query('select id, title, slug from landing_pages order by id')
console.log(JSON.stringify(landingPages.rows, null, 2))

console.log('\n--- does the NOT NULL relaxation from the newest migration need to run? ---')
const colCheck = await client.query(`
  select table_name, column_name, is_nullable
  from information_schema.columns
  where table_name = 'landing_pages_blocks_service_areas_areas'
    and column_name in ('link_label', 'link_url')
`)
console.log(JSON.stringify(colCheck.rows, null, 2))

await client.end()
