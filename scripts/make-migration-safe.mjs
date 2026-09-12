// Rewrites a generated catch-up migration's UP statements to be idempotent.
import { readFileSync, writeFileSync } from 'node:fs'

const file = process.argv[2]
let sqlText = readFileSync(file, 'utf8')

sqlText = sqlText.replace(/CREATE TABLE "([a-z0-9_]+)"/g, 'CREATE TABLE IF NOT EXISTS "$1"')
sqlText = sqlText.replace(/CREATE INDEX "([a-z0-9_]+)"/g, 'CREATE INDEX IF NOT EXISTS "$1"')
sqlText = sqlText.replace(
  /ALTER TABLE "([a-z0-9_]+)" ADD CONSTRAINT "([a-z0-9_]+)" (FOREIGN KEY[^;]*?);/g,
  (_m, table, name, rest) =>
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${name}') THEN ALTER TABLE "${table}" ADD CONSTRAINT "${name}" ${rest}; END IF; END $$;`,
)

writeFileSync(file, sqlText)
console.log('rewritten', file)
