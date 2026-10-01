import 'dotenv/config'
import fs from 'fs'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Compare the schema the Payload config describes with the schema the
 * database actually has — tables, columns, column types, nullability and enum
 * values — and print every difference.
 *
 * `payload migrate:create` cannot answer this question on its own: it diffs
 * the config against the newest `.json` snapshot in `src/migrations/`, not
 * against the database, so a stale snapshot makes it report drift that isn't
 * there (and, worse, emit DROP/RENAME for it). This script reads the real
 * database instead.
 *
 *   npx tsx scripts/schema-drift.ts [--write-snapshot <path.json>]
 *
 * With `--write-snapshot`, also writes the config's drizzle snapshot — the
 * `.json` file `migrate:create` would write — to that path, without
 * generating any SQL or prompting.
 *
 * Read-only: every query runs in a read-only transaction.
 */

type SnapshotColumn = { name: string; type: string; typeSchema?: string; notNull: boolean }
type SnapshotTable = {
  name: string
  schema: string
  columns: Record<string, SnapshotColumn>
  indexes: Record<string, { name: string; isUnique: boolean; columns: { expression: string }[] }>
  foreignKeys: Record<
    string,
    { name: string; tableTo: string; columnsFrom: string[]; columnsTo: string[]; onDelete?: string }
  >
}
type Snapshot = {
  tables: Record<string, SnapshotTable>
  enums: Record<string, { name: string; schema: string; values: string[] }>
}

const snapshotArg = process.argv.indexOf('--write-snapshot')
const snapshotPath = snapshotArg > -1 ? process.argv[snapshotArg + 1] : undefined

const payload = await getPayload({ config: configPromise })
const db = payload.db as unknown as {
  schema: unknown
  pool: { query: (sql: string) => Promise<{ rows: Record<string, string>[] }> }
  requireDrizzleKit: () => { generateDrizzleJson: (schema: unknown) => Promise<Snapshot> }
}

const snapshot = await db.requireDrizzleKit().generateDrizzleJson(db.schema)
if (snapshotPath) {
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2))
  console.log(`Snapshot written to ${snapshotPath}`)
}

await db.pool.query('BEGIN READ ONLY')
const { rows: columnRows } = await db.pool.query(`
  select c.table_name, c.column_name, c.data_type, c.udt_name, c.is_nullable
  from information_schema.columns c
  join information_schema.tables t
    on t.table_schema = c.table_schema and t.table_name = c.table_name
  where c.table_schema = 'public' and t.table_type = 'BASE TABLE'`)
const { rows: enumRows } = await db.pool.query(`
  select t.typname, e.enumlabel
  from pg_type t
  join pg_enum e on e.enumtypid = t.oid
  join pg_namespace n on n.oid = t.typnamespace
  where n.nspname = 'public'
  order by t.typname, e.enumsortorder`)
// Indexes and foreign keys are compared by what they cover, not by name: the
// hand-written migrations named them their own way (e.g. `…_parent_fk` where
// drizzle would write `…_parent_id_fk`), which is harmless.
const { rows: indexRows } = await db.pool.query(`
  select t.relname as table_name, i.indisunique::text as is_unique,
    string_agg(a.attname, ',' order by k.ord) as columns
  from pg_index i
  join pg_class t on t.oid = i.indrelid
  join pg_namespace n on n.oid = t.relnamespace
  cross join lateral unnest(i.indkey) with ordinality as k(attnum, ord)
  join pg_attribute a on a.attrelid = t.oid and a.attnum = k.attnum
  where n.nspname = 'public'
  group by t.relname, i.indexrelid, i.indisunique`)
const { rows: foreignKeyRows } = await db.pool.query(`
  select c.conrelid::regclass::text as table_name, c.confrelid::regclass::text as table_to,
    (select string_agg(a.attname, ',' order by k.ord)
       from unnest(c.conkey) with ordinality as k(attnum, ord)
       join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum) as columns,
    c.confdeltype as on_delete
  from pg_constraint c
  join pg_namespace n on n.oid = c.connamespace
  where n.nspname = 'public' and c.contype = 'f'`)
await db.pool.query('ROLLBACK')

const dbTables = new Map<string, Map<string, { type: string; notNull: boolean }>>()
for (const row of columnRows) {
  const columns = dbTables.get(row.table_name) ?? new Map()
  const type = row.data_type === 'USER-DEFINED' ? row.udt_name : row.udt_name
  columns.set(row.column_name, { type, notNull: row.is_nullable === 'NO' })
  dbTables.set(row.table_name, columns)
}

const dbEnums = new Map<string, string[]>()
for (const row of enumRows) {
  dbEnums.set(row.typname, [...(dbEnums.get(row.typname) ?? []), row.enumlabel])
}

/** Map a drizzle snapshot type onto the `udt_name` Postgres reports. */
const normalise = (type: string): string => {
  const base = type.replace(/\(.*\)/, '').replace(/"/g, '').trim()
  const table: Record<string, string> = {
    serial: 'int4',
    integer: 'int4',
    bigint: 'int8',
    bigserial: 'int8',
    boolean: 'bool',
    'timestamp with time zone': 'timestamptz',
    'timestamp without time zone': 'timestamp',
    timestamp: 'timestamp',
    'double precision': 'float8',
    real: 'float4',
    'character varying': 'varchar',
  }
  if (base.endsWith('[]')) return `_${normalise(base.slice(0, -2))}`
  return table[base] ?? base
}

const problems: string[] = []
const configTables = new Set<string>()

for (const table of Object.values(snapshot.tables)) {
  configTables.add(table.name)
  const actual = dbTables.get(table.name)
  if (!actual) {
    problems.push(`MISSING TABLE   ${table.name} (in config, not in database)`)
    continue
  }
  for (const column of Object.values(table.columns)) {
    const found = actual.get(column.name)
    if (!found) {
      problems.push(`MISSING COLUMN  ${table.name}.${column.name} (${column.type})`)
      continue
    }
    const expected = normalise(column.type)
    if (expected !== found.type) {
      problems.push(`TYPE MISMATCH   ${table.name}.${column.name}: config ${expected}, database ${found.type}`)
    }
    if (column.notNull !== found.notNull) {
      problems.push(
        `NULLABILITY     ${table.name}.${column.name}: config ${column.notNull ? 'NOT NULL' : 'NULL'}, database ${found.notNull ? 'NOT NULL' : 'NULL'}`,
      )
    }
  }
  for (const name of actual.keys()) {
    if (!Object.values(table.columns).some((column) => column.name === name)) {
      problems.push(`EXTRA COLUMN    ${table.name}.${name} (in database, not in config)`)
    }
  }
}

const onDeleteCodes: Record<string, string> = {
  a: 'no action',
  r: 'restrict',
  c: 'cascade',
  n: 'set null',
  d: 'set default',
}
const dbIndexes = new Set(
  indexRows.map((row) => `${row.table_name}(${row.columns})${row.is_unique === 'true' ? ' unique' : ''}`),
)
const dbForeignKeys = new Map(
  foreignKeyRows.map((row) => [
    `${row.table_name}(${row.columns}) -> ${row.table_to}`,
    onDeleteCodes[row.on_delete] ?? row.on_delete,
  ]),
)
for (const table of Object.values(snapshot.tables)) {
  if (!dbTables.has(table.name)) continue
  for (const index of Object.values(table.indexes)) {
    const columns = index.columns.map((column) => column.expression).join(',')
    const key = `${table.name}(${columns})${index.isUnique ? ' unique' : ''}`
    if (!dbIndexes.has(key)) problems.push(`MISSING INDEX   ${key}`)
  }
  for (const foreignKey of Object.values(table.foreignKeys)) {
    const key = `${table.name}(${foreignKey.columnsFrom.join(',')}) -> ${foreignKey.tableTo}`
    const onDelete = dbForeignKeys.get(key)
    if (!onDelete) problems.push(`MISSING FK      ${key}`)
    else if (foreignKey.onDelete && onDelete !== foreignKey.onDelete) {
      problems.push(`FK ON DELETE    ${key}: config ${foreignKey.onDelete}, database ${onDelete}`)
    }
  }
}

for (const name of dbTables.keys()) {
  if (!configTables.has(name) && name !== 'payload_migrations') {
    problems.push(`EXTRA TABLE     ${name} (in database, not in config)`)
  }
}

for (const enumDef of Object.values(snapshot.enums)) {
  const actual = dbEnums.get(enumDef.name)
  if (!actual) {
    problems.push(`MISSING ENUM    ${enumDef.name}`)
    continue
  }
  const missing = enumDef.values.filter((value) => !actual.includes(value))
  const extra = actual.filter((value) => !enumDef.values.includes(value))
  if (missing.length) problems.push(`ENUM VALUES     ${enumDef.name} missing in database: ${missing.join(', ')}`)
  if (extra.length) problems.push(`ENUM VALUES     ${enumDef.name} extra in database: ${extra.join(', ')}`)
}
for (const name of dbEnums.keys()) {
  if (!Object.values(snapshot.enums).some((enumDef) => enumDef.name === name)) {
    problems.push(`EXTRA ENUM      ${name} (in database, not in config)`)
  }
}

problems.sort()
console.log(problems.length ? problems.join('\n') : 'No drift: the database matches the config.')
console.log(`\n${problems.length} difference(s).`)
process.exit(0)
