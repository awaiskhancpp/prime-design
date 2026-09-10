/**
 * Audit conversion — remaining static service-page sections become
 * Payload-driven (designs unchanged):
 *
 *   ADU (7):        free-estimate CTA block; "Why choose" experience-
 *                   difference block (WP why-choose template 1212 content);
 *                   Craftsmanship That Transforms rich text (WP ADU page);
 *                   gallery images (ADU-2.png + ADU-5.png) via services_rels
 *   Additions (8):  free-estimate CTA block; video block (WP page's Noah
 *                   MP4); "Why choose" experience-difference block (gallery
 *                   WhyChooseUs design, WP 1212 content); Silicon Valley
 *                   Loves group
 *   Complete Renovation (9): "Why choose" experience-difference block;
 *                   Silicon Valley Loves group
 *
 * All copy is the same text the pages already render (sourced from the WP
 * why-choose template / Silicon Valley Loves template). Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

const paragraph = (text) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
  direction: null,
})
const headingH2 = (text) => ({
  tag: 'h2',
  type: 'heading',
  format: '',
  indent: 0,
  version: 1,
  children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
  direction: null,
})
const lexical = (nodes) =>
  JSON.stringify({ root: { type: 'root', format: '', indent: 0, version: 1, children: nodes } })

const WHY_CHOOSE_FEATURES = [
  ['Attention to Detail', 'We meticulously plan and execute every project with precision and attention to detail.'],
  ['Quality Craftsmanship', 'Our commitment to quality ensures outstanding and beautiful home transformations.'],
  ['Professional Expertise', 'With years of industry experience, we create exceptional, tailored home remodels.'],
  ['Customer Satisfaction', 'We prioritize your satisfaction with exceptional service and communication.'],
]
const ICONS = [
  '/attention-to-detail.svg',
  '/quality-craftsmanship.svg',
  '/professional-expertise.svg',
  '/customer-satisfaction.svg',
]
const ESTIMATE = {
  heading: 'Ready to schedule your free estimate?',
  description: 'Contact us here or reach us at (650) 235-4863',
}
const SVL = {
  eyebrow: 'Over 350+ Projects in Silicon Valley',
  heading: 'Silicon Valley Loves Working With Us!',
  body: 'Our company is committed to creating the best experience possible. Call today to get a quote and let\u2019s talk about what you want to build.',
}

async function ensureCta(serviceId, sourceId, order) {
  const existing = await c.query('select id from services_blocks_cta where _parent_id = $1', [serviceId])
  if (!existing.rows.length) {
    await c.query(
      `insert into services_blocks_cta (_order, _parent_id, _path, id, heading, description, source_id, source_element_type)
       values ($1, $2, 'sections', $3, $4, $5, $6, 'template')`,
      [order, serviceId, randomUUID(), ESTIMATE.heading, ESTIMATE.description, sourceId],
    )
    console.log(`service ${serviceId}: cta block created`)
  }
}

async function ensureWhyChoose(serviceId, order, { eyebrow = null } = {}) {
  const existing = await c.query(
    'select id from services_blocks_experience_difference where _parent_id = $1',
    [serviceId],
  )
  if (existing.rows.length) return existing.rows[0].id
  const inserted = await c.query(
    `insert into services_blocks_experience_difference (_order, _parent_id, _path, id, eyebrow, heading)
     values ($1, $2, 'sections', $3, $4, 'Why choose Prime Design & Build?') returning id`,
    [order, serviceId, randomUUID(), eyebrow],
  )
  const blockId = inserted.rows[0].id
  for (let i = 0; i < WHY_CHOOSE_FEATURES.length; i++) {
    await c.query(
      `insert into services_blocks_experience_difference_features
         (_order, _parent_id, id, title, description, icon_source_svg_url)
       values ($1, $2, $3, $4, $5, $6)`,
      [i, blockId, randomUUID(), WHY_CHOOSE_FEATURES[i][0], WHY_CHOOSE_FEATURES[i][1], ICONS[i]],
    )
  }
  console.log(`service ${serviceId}: why-choose block created`)
  return blockId
}

async function ensureSvl(serviceId) {
  await c.query(
    `update services set
       silicon_valley_loves_eyebrow = coalesce(silicon_valley_loves_eyebrow, $2),
       silicon_valley_loves_heading = coalesce(silicon_valley_loves_heading, $3),
       silicon_valley_loves_body = coalesce(silicon_valley_loves_body, $4)
     where id = $1`,
    [serviceId, SVL.eyebrow, SVL.heading, SVL.body],
  )
  console.log(`service ${serviceId}: silicon valley loves populated`)
}

// ============ ADU (7) ============
console.log('step: adu cta')
await ensureCta(7, 'cducqf', 2)
console.log('step: adu why-choose')
await ensureWhyChoose(7, 3, { eyebrow: null })
console.log('step: adu craftsmanship')
await c.query(
  `update services set craftsmanship = $2::jsonb where id = $1 and craftsmanship is null`,
  [
    7,
    lexical([
      headingH2('Craftsmanship That Transforms'),
      paragraph(
        'At Prime Design & Build, we take pride in our unwavering commitment to professionalism. Our team of experts is dedicated to providing a seamless remodeling experience, from initial consultation to project completion. With clear communication, transparent processes, and a focus on your satisfaction, we ensure that your home remodeling journey is stress-free and enjoyable.',
      ),
      paragraph(
        'We believe that exceptional craftsmanship can truly transform a space. Our skilled artisans bring years of experience and attention to detail to every project. From precision installation to meticulous finishes, we create spaces that reflect your vision and enhance the beauty of your home.',
      ),
    ]),
  ],
)
// ADU craftsmanship gallery images (ADU-2.png + ADU-5.png)
console.log('step: adu gallery media')
for (const [name, wpUrl] of [
  ['ADU-2.png', 'https://primedesignandbuild.com/wp-content/uploads/2023/07/ADU-2.png'],
  ['ADU-5.png', 'https://primedesignandbuild.com/wp-content/uploads/2023/07/ADU-5.png'],
]) {
  let mediaId = (await c.query('select id from media where source_url = $1', [wpUrl])).rows[0]?.id
  if (!mediaId) {
    const ins = await c.query(
      `insert into media (alt, filename, mime_type, wordpress_id, source_url) values ($1, $2, 'image/png', null, $3) returning id`,
      [name.replace('.png', ''), name, wpUrl],
    )
    mediaId = ins.rows[0].id
  }
  const rel = await c.query(
    "select id from services_rels where parent_id = 7 and path = 'galleryImages' and media_id = $1",
    [mediaId],
  )
  if (!rel.rows.length) {
    await c.query(
      `insert into services_rels ("order", parent_id, path, media_id) values (0, 7, 'galleryImages', $1)`,
      [mediaId],
    )
  }
}
console.log('service 7: craftsmanship + gallery images set')

// ============ Additions (8) ============
await ensureCta(8, 'est', 2)
const addVideo = await c.query(
  "select id from services_blocks_video_2 where _parent_id = 8 and external_url like '%Prime%20Vid%20Noah%'",
)
if (!addVideo.rows.length) {
  await c.query(
    `insert into services_blocks_video_2
       (_order, _parent_id, _path, id, heading, description, source, external_url, poster_id, controls, source_id, source_element_type)
     values (3, 8, 'sections', $1, null, null, 'externalUrl',
             'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/Prime%20Vid%20Noah.mp4',
             null, true, 'additions-video', 'video')`,
    [randomUUID()],
  )
  console.log('service 8: video block created (Noah MP4)')
}
await ensureWhyChoose(8, 4, { eyebrow: 'Experience the' })
await ensureSvl(8)

// ============ Complete Renovation (9) ============
await ensureWhyChoose(9, 3, { eyebrow: 'Experience the' })
await ensureSvl(9)

await c.end()
console.log('Done.')
process.exit(0)
