import 'dotenv/config'
import crypto from 'node:crypto'
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'
const { Client } = pg
const url = (process.env.DATABASE_URL || '').replace(/^"|"$/g, '')
const client = new Client({ connectionString: url })
await client.connect()

// 1. Blog featured images -> the real WP originals
const mapping = [
  { id: 2, media: 544 },
  { id: 5, media: 545 },
  { id: 6, media: 546 },
  { id: 8, media: 547 },
]
for (const m of mapping) {
  await client.query(`UPDATE blog SET featured_image_id = $1 WHERE id = $2`, [m.media, m.id])
}
const check = await client.query(`SELECT id, slug, featured_image_id FROM blog ORDER BY id`)
console.log('blog rows after update:')
for (const r of check.rows) console.log(JSON.stringify(r))

// 2. Estimate CTA block on the pages 'blog' record (WP page 1670 root order: hero=0, loop=1, free-estimate tpl 1174=2)
const existing = await client.query(`SELECT id FROM pages_blocks_cta WHERE "_parent_id" = 1`)
if (existing.rows.length) {
  console.log('estimate cta block already exists, skipping insert')
} else {
  await client.query(
    `INSERT INTO pages_blocks_cta ("_order", "_parent_id", "_path", id, heading, body) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      2,
      1,
      'layout',
      crypto.randomUUID(),
      'Ready to schedule your free estimate?',
      'Contact us here or reach us at (650) 235-4863',
    ]
  )
  console.log('inserted estimate cta block')
}
const after = await client.query(`SELECT * FROM pages_blocks_cta WHERE "_parent_id" = 1`)
console.log('pages_blocks_cta for blog:', JSON.stringify(after.rows))
await client.end()
