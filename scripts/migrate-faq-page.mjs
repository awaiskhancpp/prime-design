/**
 * FAQ page -> Pages collection record `faq`.
 *
 * WordPress (page `faq`, WP post 351) builds this page from two Bricks roots:
 *
 *   root 0  an authored hero — eyebrow "Frequently Asked Questions", heading
 *           `<span class="heading--gradient">Explore the FAQs:</span> Your
 *           Comprehensive Guide to Home Remodeling`, an intro paragraph and
 *           the button "Unlock Your Dream Remodel Today".
 *   root 1  a query loop — `{term_name} Questions` per FAQ taxonomy term, then
 *           `{post_title}` / `{post_content}` per question.
 *
 * So the hero becomes a `hero` block and the loop becomes the `faq-index`
 * block, which stores only the section's own copy. The questions stay in the
 * FAQs collection grouped by their FAQ Category relationship and are read at
 * render time — the same records the service pages already use, so nothing is
 * duplicated.
 *
 * Idempotent: the record's blocks are rebuilt from scratch on every run.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const PAGE_SLUG = 'faq'

/** Minimal Lexical document from plain paragraphs. */
const lexical = (paragraphs) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr',
      children: [
        { mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 },
      ],
    })),
  },
})

const c = new Client({ connectionString: u })
await c.connect()

// ---- the page record -------------------------------------------------------
let pageId = (await c.query(`select id from pages where slug = $1`, [PAGE_SLUG])).rows[0]?.id
if (!pageId) {
  pageId = (
    await c.query(
      `insert into pages (title, slug, updated_at, created_at)
       values ('FAQ', $1, now(), now()) returning id`,
      [PAGE_SLUG],
    )
  ).rows[0].id
  console.log(`created pages record ${pageId} (${PAGE_SLUG})`)
} else {
  console.log(`pages record ${pageId} (${PAGE_SLUG})`)
}

for (const table of ['pages_blocks_hero', 'pages_blocks_faq_index', 'pages_blocks_service_areas']) {
  await c.query(`delete from ${table} where _parent_id = $1`, [pageId])
}

let order = 0
const nextOrder = () => (order += 1)

// ---- hero (Bricks root 0) --------------------------------------------------
// The hero image is whatever the page already used; resolved by filename so no
// media id is pinned here.
const heroImage = (
  await c.query(`select id from media where filename = $1`, ['Prime9-5.jpg'])
).rows[0]?.id ?? null

await c.query(
  `insert into pages_blocks_hero
     (_order, _parent_id, _path, id, eyebrow, heading, heading_highlight, description,
      image_id, cta_label, cta_href, cta_style, cta_show_calendar_icon, align)
   values ($1, $2, 'layout', $3, $4, $5, $6, $7, $8, $9, $10, 'filled', false, 'left')`,
  [
    nextOrder(),
    pageId,
    randomUUID(),
    'Frequently Asked Questions',
    'Explore the FAQs: Your Comprehensive Guide to Home Remodeling',
    'Explore the FAQs:',
    JSON.stringify(
      lexical([
        "If you're considering remodeling your home with Prime Design & Build, we understand that you may have some questions. Browse the answers below, or search for exactly what you need.",
      ]),
    ),
    heroImage,
    'Unlock Your Dream Remodel Today',
    '/contact',
  ],
)

// ---- FAQ index (Bricks root 1 — the query loop) ----------------------------
await c.query(
  `insert into pages_blocks_faq_index
     (_order, _parent_id, _path, id, eyebrow, heading, description, search_placeholder, all_label, empty_message)
   values ($1, $2, 'layout', $3, $4, $5, $6, $7, $8, $9)`,
  [
    nextOrder(),
    pageId,
    randomUUID(),
    'Answers',
    'Find answers to common questions',
    'Browse by category or search below.',
    'Search questions and answers…',
    'All questions',
    'No questions match that search.',
  ],
)

// ---- shared areas strip ----------------------------------------------------
await c.query(
  `insert into pages_blocks_service_areas (_order, _parent_id, _path, id, heading)
   values ($1, $2, 'layout', $3, 'Areas we service')`,
  [nextOrder(), pageId, randomUUID()],
)

const counts = await c.query(
  `select 'hero' t, count(*)::int n from pages_blocks_hero where _parent_id = $1
   union all select 'faq-index', count(*)::int from pages_blocks_faq_index where _parent_id = $1
   union all select 'areas', count(*)::int from pages_blocks_service_areas where _parent_id = $1`,
  [pageId],
)
console.log('blocks:', counts.rows.map((r) => `${r.t}=${r.n}`).join(' '))

const faqs = await c.query(
  `select cat.title, count(f.id)::int n
     from faq_categories cat join faqs f on f.category_id = cat.id and f.visible
    group by cat.title order by cat.title`,
)
console.log(
  `questions available from the FAQs collection: ${faqs.rows.reduce((s, r) => s + r.n, 0)} across ${faqs.rows.length} categories`,
)

await c.end()
process.exit(0)
