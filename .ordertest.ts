import 'dotenv/config'
import { createRequire } from 'node:module'

const { Client } = createRequire(import.meta.url)('./node_modules/.pnpm/pg@8.20.0/node_modules/pg')
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const svc = await client.query('select id, slug from services order by id')
const tables = await client.query(
  `select table_name from information_schema.tables
   where table_schema='public' and table_name like 'services\\_blocks\\_%' order by table_name`,
)
const parentTables = tables.rows
  .map((r) => r.table_name)
  .filter(
    (t) =>
      !/_(items|buttons|features|reviews|categories|questions|groups|areas|steps|videos|_rels)$/.test(
        t,
      ),
  )

// gather rows with _order + heading columns (best-effort column discovery)
const rowMap: Record<string, Array<{ o: number; t: string; h: string }>> = {}
for (const t of parentTables) {
  const cols = await client.query(
    `select column_name from information_schema.columns where table_name=$1`,
    [t],
  )
  const hasHeading = cols.rows.some((c) => c.column_name === 'heading')
  const headingSel = hasHeading ? 'heading' : 'null'
  const rows = await client.query(
    `select _parent_id, _order, ${headingSel} as heading from "${t}" where _parent_id is not null order by _order`,
  )
  for (const r of rows.rows) {
    const key = String(r._parent_id)
    rowMap[key] ||= []
    const slug = t.replace(/^services_blocks_/, '')
    rowMap[key].push({ o: r._order ?? 0, t: slug, h: (r.heading || '').slice(0, 70) })
  }
}
for (const s of svc.rows) {
  const rows = (rowMap[String(s.id)] || []).sort((a, b) => a.o - b.o)
  console.log(`\n## ${s.slug}`)
  rows.forEach((r) => console.log(`   [${r.o}] ${r.t} — ${r.h}`))
}
await client.end()
