// One-off schema parity change (Payload push:false): `blog.intro` is now a
// richText field, so the column must become jsonb. Legacy plain-text intros
// are wrapped into a minimal Lexical document so the column conversion never
// fails; the migration script then overwrites them with real rich text.
import { readFileSync } from 'node:fs'
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'

const rawEnv = readFileSync('.env', 'utf8')
const conn = (rawEnv.match(/DATABASE_URL=([^\r\n]+)/) || [])[1].replace(/^"(.*)"$/, '$1')

const client = new pg.Client({ connectionString: conn })
await client.connect()
try {
  const current = await client.query(
    `SELECT data_type FROM information_schema.columns WHERE table_name = 'blog' AND column_name = 'intro'`,
  )
  console.log('current type:', current.rows[0]?.data_type ?? 'MISSING')
  if (current.rows[0]?.data_type === 'jsonb') {
    console.log('already jsonb — nothing to do')
  } else {
    await client.query(`
      ALTER TABLE blog
        ALTER COLUMN intro TYPE jsonb
        USING CASE
          WHEN intro IS NULL THEN NULL
          WHEN intro::text LIKE '{%' OR intro::text LIKE '[%' THEN intro::jsonb
          ELSE jsonb_build_object(
            'root',
            jsonb_build_object(
              'type', 'root', 'format', '', 'indent', 0, 'version', 1, 'direction', 'ltr',
              'children',
              jsonb_build_array(
                jsonb_build_object(
                  'type', 'paragraph', 'format', '', 'indent', 0, 'version', 1,
                  'direction', 'ltr', 'textFormat', 0, 'textStyle', '',
                  'children',
                  jsonb_build_array(
                    jsonb_build_object(
                      'type', 'text', 'version', 1, 'format', 0, 'mode', 'normal',
                      'style', '', 'detail', 0, 'text', intro
                    )
                  )
                )
              )
            )
          )
        END
    `)
    console.log('converted to jsonb')
  }
  const sample = await client.query(`SELECT title, jsonb_typeof(intro) AS kind FROM blog LIMIT 10`)
  console.table(sample.rows)
} finally {
  await client.end()
}
