// Seeds the Homepage global (table + arrays) with the WordPress homepage
// copy (post 2) and marks the six WordPress-curated projects as featured.
// Idempotent: tables are created IF NOT EXISTS and the global row is
// upserted by id 1.
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'
import { readFileSync } from 'node:fs'

const env = readFileSync('.env', 'utf8')
const url = (env.match(/^DATABASE_URL=(.*)$/m)?.[1] || '').trim().replace(/^"(.*)"$/, '$1')
const client = new pg.Client({ connectionString: url })
await client.connect()

// --- schema parity (push: false) ---
await client.query(`
  CREATE TABLE IF NOT EXISTS homepage (
    id int4 PRIMARY KEY,
    hero_eyebrow varchar,
    hero_heading varchar,
    hero_heading_highlight varchar,
    hero_description varchar,
    hero_image_id int4,
    hero_video_id int4,
    hero_cta_label varchar,
    hero_cta_href varchar,
    intro_eyebrow varchar,
    intro_heading varchar,
    intro_body jsonb,
    intro_image_id int4,
    difference_eyebrow varchar,
    difference_heading varchar,
    difference_heading_highlight varchar,
    projects_intro_eyebrow varchar,
    projects_intro_heading varchar,
    projects_intro_body jsonb,
    services_intro_eyebrow varchar,
    services_intro_heading varchar,
    services_intro_body jsonb,
    feature_blocks_eyebrow varchar,
    feature_blocks_title varchar,
    feature_blocks_title_highlight varchar,
    contact_intro_eyebrow varchar,
    contact_intro_heading varchar,
    contact_intro_heading_highlight varchar,
    contact_intro_body jsonb,
    service_areas_heading varchar,
    updated_at timestamptz,
    created_at timestamptz
  )
`)
await client.query(`
  CREATE TABLE IF NOT EXISTS homepage_difference_checklist (
    _order int4 NOT NULL,
    _parent_id int4 NOT NULL,
    id varchar PRIMARY KEY,
    lead varchar,
    text varchar
  )
`)
await client.query(`
  CREATE TABLE IF NOT EXISTS homepage_feature_blocks_items (
    _order int4 NOT NULL,
    _parent_id int4 NOT NULL,
    id varchar PRIMARY KEY,
    title varchar,
    body jsonb,
    cta_label varchar,
    cta_href varchar,
    before_image_id int4,
    after_image_id int4
  )
`)
await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured bool NOT NULL DEFAULT false`)
console.log('schema ok')

const paragraph = (text, format = 0) => ({
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
        children: [{ type: 'text', text, format, detail: 0, style: '', mode: 'normal', version: 1 }],
      },
    ],
  },
})
const twoParagraphs = (a, b) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [paragraph(a).root.children[0], paragraph(b, 2).root.children[0]],
  },
})

const introBody = paragraph(
  'Where we transform blueprints into reality with unwavering dedication and unmatched expertise. Your vision is our foundation, and together, we construct a future of enduring quality and innovation. Let\u2019s build something extraordinary.',
)
const contactBody = paragraph(
  'If you have any questions or you\u2019d like to find out more about our services, please get in touch.',
)
const bathroomBody = twoParagraphs(
  'Let our expert team transform your bathroom into a space of beauty and functionality. Start your bathroom remodeling journey today!',
  'Your dream bathroom becomes a reality as we work closely with you to bring your vision to life.',
)
const renovationBody = twoParagraphs(
  'With a keen eye for detail and a commitment to craftsmanship, we employ innovative designs to create a home renovation that exceeds your expectations.',
  'Whether it\u2019s a full-scale renovation or specific room transformations, we approach each project with the utmost care and professionalism.',
)

const now = new Date().toISOString()
await client.query(
  `INSERT INTO homepage (
     id, hero_heading, hero_heading_highlight, hero_image_id, hero_video_id, hero_cta_label, hero_cta_href,
     intro_heading, intro_body, intro_image_id,
     difference_eyebrow, difference_heading, difference_heading_highlight,
     projects_intro_heading, services_intro_heading,
     feature_blocks_eyebrow, feature_blocks_title, feature_blocks_title_highlight,
     contact_intro_eyebrow, contact_intro_heading, contact_intro_heading_highlight, contact_intro_body,
     service_areas_heading, created_at, updated_at
   ) VALUES (
     1, $1, $2, $3, $4, $5, $6, $7, $8, $3, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $22
   )
   ON CONFLICT (id) DO UPDATE SET
     hero_heading = EXCLUDED.hero_heading,
     hero_heading_highlight = EXCLUDED.hero_heading_highlight,
     hero_image_id = EXCLUDED.hero_image_id,
     hero_video_id = EXCLUDED.hero_video_id,
     hero_cta_label = EXCLUDED.hero_cta_label,
     hero_cta_href = EXCLUDED.hero_cta_href,
     intro_heading = EXCLUDED.intro_heading,
     intro_body = EXCLUDED.intro_body,
     intro_image_id = EXCLUDED.intro_image_id,
     difference_eyebrow = EXCLUDED.difference_eyebrow,
     difference_heading = EXCLUDED.difference_heading,
     difference_heading_highlight = EXCLUDED.difference_heading_highlight,
     projects_intro_heading = EXCLUDED.projects_intro_heading,
     services_intro_heading = EXCLUDED.services_intro_heading,
     feature_blocks_eyebrow = EXCLUDED.feature_blocks_eyebrow,
     feature_blocks_title = EXCLUDED.feature_blocks_title,
     feature_blocks_title_highlight = EXCLUDED.feature_blocks_title_highlight,
     contact_intro_eyebrow = EXCLUDED.contact_intro_eyebrow,
     contact_intro_heading = EXCLUDED.contact_intro_heading,
     contact_intro_heading_highlight = EXCLUDED.contact_intro_heading_highlight,
     contact_intro_body = EXCLUDED.contact_intro_body,
     service_areas_heading = EXCLUDED.service_areas_heading,
     updated_at = EXCLUDED.updated_at`,
  [
    'Top-rated design and build firm in the Bay Area',
    'design and build',
    444, // WhatsApp_Image_2023-10-01_at_9.20.04_PM-transformed-scaled.jpeg (WP 2125)
    447, // Home-Video-Updated.mp4
    'Schedule a Consultation',
    '/contact',
    'Discover the Prime experience with a new home renovation, ADU, home addition or kitchen and bathroom remodel',
    JSON.stringify(introBody),
    'Over 350+ Projects in Silicon Valley',
    'The Prime Difference',
    'Difference',
    'Our Latest Remodeling Projects',
    'Our Services',
    'Remodel Your Entire Home With Prime Design & Build',
    "We don't just build Kitchens, We do it all.",
    'We do it all',
    'Contact',
    'Contact our team today!',
    'today',
    JSON.stringify(contactBody),
    'Areas we service',
    now,
  ],
)
console.log('homepage row ok')

// --- difference checklist (5 WordPress items) ---
await client.query(`DELETE FROM homepage_difference_checklist`)
const checklist = [
  ['', 'Experts on-site for interior design'],
  ['', 'Certified general contractor, fully licensed.'],
  ['Family-owned', ' and operated business'],
  ['Competitive', ' pricing for our services'],
  ['Quick response', ' for customer satisfaction'],
]
for (let i = 0; i < checklist.length; i++) {
  await client.query(
    `INSERT INTO homepage_difference_checklist (_order, _parent_id, id, lead, text) VALUES ($1, 1, $2, $3, $4)`,
    [i + 1, `check-${i + 1}`, checklist[i][0], checklist[i][1]],
  )
}
console.log('checklist ok')

// --- feature blocks (2 WordPress cards) ---
await client.query(`DELETE FROM homepage_feature_blocks_items`)
const items = [
  {
    title: 'Bathroom Remodeling',
    body: bathroomBody,
    ctaLabel: 'Learn more',
    ctaHref: '/bathroom-remodeling',
    beforeImageId: 153, // o-47.jpg (WP 2175)
    afterImageId: 209, // WhatsApp-Image-2024-03-04-at-8.18.54-PM-2.jpeg (WP 2418)
  },
  {
    title: 'Complete Home Renovation',
    body: renovationBody,
    ctaLabel: 'Learn more',
    ctaHref: '/home-remodeling',
    beforeImageId: 445, // WhatsApp-Image-2024-03-04-at-8.36.47-PM.jpeg (WP 2424)
    afterImageId: 446, // WhatsApp-Image-2024-03-04-at-8.37.03-PM.jpeg (WP 2425)
  },
]
for (let i = 0; i < items.length; i++) {
  const item = items[i]
  await client.query(
    `INSERT INTO homepage_feature_blocks_items
       (_order, _parent_id, id, title, body, cta_label, cta_href, before_image_id, after_image_id)
     VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      i + 1,
      `feature-${i + 1}`,
      item.title,
      JSON.stringify(item.body),
      item.ctaLabel,
      item.ctaHref,
      item.beforeImageId,
      item.afterImageId,
    ],
  )
}
console.log('feature blocks ok')

// --- featured projects: the six WordPress homepage projects ---
const featuredSlugs = [
  'atherton-kitchen-remodeling-projects',
  'full-home-remodeling-los-gatos',
  'sunnyvale-complete-home-renovation',
  'san-mateo-complete-home-remodel',
  'full-home-remodeling-cupertino',
  'san-jose-complete-home-remodel',
]
const res = await client.query(`UPDATE projects SET featured = true WHERE slug = ANY($1)`, [
  featuredSlugs,
])
console.log('featured projects updated:', res.rowCount)

await client.end()
console.log('done')
