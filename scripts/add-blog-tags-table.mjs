/** Create the missing blog_tags table (hasMany text field). Idempotent. */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()
await c.query(
  `create table if not exists blog_tags (
     _order integer, _parent_id integer, id varchar, value varchar
   )`,
)
console.log('blog_tags ready')
await c.end()
process.exit(0)
