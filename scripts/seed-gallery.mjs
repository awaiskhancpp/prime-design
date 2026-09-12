// Seeds the Gallery global (table + reasons array) with the WordPress
// gallery page (post 349) copy. Idempotent.
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'
import { readFileSync } from 'node:fs'

const env = readFileSync('.env', 'utf8')
const url = (env.match(/^DATABASE_URL=(.*)$/m)?.[1] || '').trim().replace(/^"(.*)"$/, '$1')
const client = new pg.Client({ connectionString: url })
await client.connect()

await client.query(`
  CREATE TABLE IF NOT EXISTS gallery (
    id int4 PRIMARY KEY,
    hero_eyebrow varchar,
    hero_heading varchar,
    hero_heading_highlight varchar,
    hero_description jsonb,
    hero_image_id int4,
    why_choose_us_eyebrow varchar,
    why_choose_us_eyebrow_accent varchar,
    why_choose_us_heading varchar,
    updated_at timestamptz,
    created_at timestamptz
  )
`)
await client.query(`
  CREATE TABLE IF NOT EXISTS gallery_why_choose_us_reasons (
    _order int4 NOT NULL,
    _parent_id int4 NOT NULL,
    id varchar PRIMARY KEY,
    icon varchar,
    title varchar,
    body varchar
  )
`)
console.log('schema ok')

const paragraph = (text) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text, format: 0, detail: 0, style: '', mode: 'normal', version: 1 }],
      },
    ],
  },
})

const now = new Date().toISOString()
await client.query(
  `INSERT INTO gallery (
     id, hero_eyebrow, hero_heading, hero_heading_highlight, hero_description,
     why_choose_us_eyebrow, why_choose_us_eyebrow_accent, why_choose_us_heading,
     created_at, updated_at
   ) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $8)
   ON CONFLICT (id) DO UPDATE SET
     hero_eyebrow = EXCLUDED.hero_eyebrow,
     hero_heading = EXCLUDED.hero_heading,
     hero_heading_highlight = EXCLUDED.hero_heading_highlight,
     hero_description = EXCLUDED.hero_description,
     why_choose_us_eyebrow = EXCLUDED.why_choose_us_eyebrow,
     why_choose_us_eyebrow_accent = EXCLUDED.why_choose_us_eyebrow_accent,
     why_choose_us_heading = EXCLUDED.why_choose_us_heading,
     updated_at = EXCLUDED.updated_at`,
  [
    'Our Gallery',
    'A reflection of our remodeling projects in Silicon Valley',
    'remodeling projects',
    JSON.stringify(
      paragraph(
        'See our kitchen remodeling, bathroom remodeling, and other home remodeling work here at Prime Design & Build\u2019s gallery.',
      ),
    ),
    'Experience the',
    '\u201CPrime Difference\u201D',
    'Why choose Prime Design & Build?',
    now,
  ],
)
console.log('gallery row ok')

await client.query(`DELETE FROM gallery_why_choose_us_reasons`)
const reasons = [
  ['/attention-to-detail.svg', 'Attention to Detail', 'We meticulously plan and execute every project with precision and attention to detail.'],
  ['/quality-craftsmanship.svg', 'Quality Craftsmanship', 'Our commitment to quality ensures outstanding and beautiful home transformations.'],
  ['/professional-expertise.svg', 'Professional Expertise', 'With years of industry experience, we create exceptional, tailored home remodels.'],
  ['/customer-satisfaction.svg', 'Customer Satisfaction', 'We prioritize your satisfaction with exceptional service and communication.'],
]
for (let i = 0; i < reasons.length; i++) {
  await client.query(
    `INSERT INTO gallery_why_choose_us_reasons (_order, _parent_id, id, icon, title, body) VALUES ($1, 1, $2, $3, $4, $5)`,
    [i + 1, `reason-${i + 1}`, reasons[i][0], reasons[i][1], reasons[i][2]],
  )
}
console.log('reasons ok')

await client.end()
console.log('done')
