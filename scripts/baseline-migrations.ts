import 'dotenv/config'
import { createRequire } from 'node:module'

const { Client } = createRequire(import.meta.url)('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// Both of these migrations' actual schema changes are already live in the
// database (confirmed via inspect-migration-state.ts) — dev-push applied
// them before `push: false` was set. This only records that fact in
// payload_migrations; it does not run any schema-altering SQL.
const alreadyApplied = ['20260902_221829_phase9_current_schema_sync', '20260903_210844']

const existing = await client.query('select name from payload_migrations where name = any($1)', [
  alreadyApplied,
])
const existingNames = new Set(existing.rows.map((r: { name: string }) => r.name))
const toInsert = alreadyApplied.filter((name) => !existingNames.has(name))

if (!toInsert.length) {
  console.log('Nothing to do — both migrations are already recorded.')
} else {
  for (const name of toInsert) {
    await client.query(
      `insert into payload_migrations (name, batch, updated_at, created_at)
       values ($1, '13', now(), now())`,
      [name],
    )
    console.log('Recorded as already applied:', name)
  }
}

console.log('\n--- payload_migrations after update ---')
const after = await client.query('select id, name, batch from payload_migrations order by id')
console.log(JSON.stringify(after.rows, null, 2))

await client.end()
