/**
 * Contact page -> Pages collection record `contact`.
 *
 * WordPress (page `contact`) is two Bricks sections: "Schedule Your Free
 * Consultation" above the six consultation cards, then the "Ready to discuss
 * your needs?" contact form. The hero copy was hardcoded in ContactPage.tsx;
 * it now lives on the record, and the cards keep coming from the Consultations
 * collection rather than being copied onto the page.
 *
 * Idempotent: the record's blocks are rebuilt on every run.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const PAGE_SLUG = 'contact'

const lexical = (paragraphs) => ({
  root: {
    type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
    children: paragraphs.map((text) => ({
      type: 'paragraph', version: 1, format: '', indent: 0, direction: 'ltr',
      children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
    })),
  },
})

const c = new Client({ connectionString: u })
await c.connect()

let pageId = (await c.query(`select id from pages where slug = $1`, [PAGE_SLUG])).rows[0]?.id
if (!pageId) {
  pageId = (await c.query(
    `insert into pages (title, slug, updated_at, created_at) values ('Contact', $1, now(), now()) returning id`,
    [PAGE_SLUG],
  )).rows[0].id
  console.log(`created pages record ${pageId} (${PAGE_SLUG})`)
} else {
  console.log(`pages record ${pageId} (${PAGE_SLUG})`)
}

for (const table of ['pages_blocks_hero','pages_blocks_consultations','pages_blocks_contact_intro','pages_blocks_service_areas']) {
  await c.query(`delete from ${table} where _parent_id = $1`, [pageId])
}

let order = 0
const next = () => (order += 1)

const heroImage = (await c.query(`select id from media where filename = $1`, ['o-94.jpg'])).rows[0]?.id ?? null

await c.query(
  `insert into pages_blocks_hero
     (_order, _parent_id, _path, id, eyebrow, heading, description, image_id, align)
   values ($1, $2, 'layout', $3, $4, $5, $6, $7, 'left')`,
  [
    next(), pageId, randomUUID(),
    'Contact Prime Design & Build',
    'Schedule Your Free Consultation',
    JSON.stringify(lexical([
      'Choose the type of project you are considering and take the first step toward a thoughtful, well-built transformation.',
    ])),
    heroImage,
  ],
)

await c.query(
  `insert into pages_blocks_consultations (_order, _parent_id, _path, id, eyebrow, heading, description)
   values ($1, $2, 'layout', $3, $4, $5, $6)`,
  [
    next(), pageId, randomUUID(),
    'Book a consultation',
    'Pick the conversation that fits your project',
    'Every consultation is free and takes about an hour. Choose a type below to pick a date and time.',
  ],
)

await c.query(
  `insert into pages_blocks_contact_intro (_order, _parent_id, _path, id, eyebrow, heading, heading_highlight, body)
   values ($1, $2, 'layout', $3, $4, $5, $6, $7)`,
  [
    next(), pageId, randomUUID(),
    'Contact',
    'Ready to discuss your needs?',
    'your needs?',
    JSON.stringify(lexical([
      "If you have any questions or you'd like to find out more about our services, please get in touch.",
    ])),
  ],
)

await c.query(
  `insert into pages_blocks_service_areas (_order, _parent_id, _path, id, heading)
   values ($1, $2, 'layout', $3, 'Areas we service')`,
  [next(), pageId, randomUUID()],
)

const counts = await c.query(
  `select 'hero' t, count(*)::int n from pages_blocks_hero where _parent_id = $1
   union all select 'consultations', count(*)::int from pages_blocks_consultations where _parent_id = $1
   union all select 'contact-intro', count(*)::int from pages_blocks_contact_intro where _parent_id = $1
   union all select 'areas', count(*)::int from pages_blocks_service_areas where _parent_id = $1`,
  [pageId],
)
console.log('blocks:', counts.rows.map((r) => `${r.t}=${r.n}`).join(' '))
console.log('consultations in the collection:', (await c.query(`select count(*)::int n from consultations`).catch(()=>({rows:[{n:'?'}]}))).rows[0].n)

await c.end()
process.exit(0)
