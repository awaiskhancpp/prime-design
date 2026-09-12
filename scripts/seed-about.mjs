// Seeds the About global (table + array) with the WordPress About page
// (post 343) copy and references the real WP media already in blob.
// Idempotent.
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'
import { readFileSync } from 'node:fs'

const env = readFileSync('.env', 'utf8')
const url = (env.match(/^DATABASE_URL=(.*)$/m)?.[1] || '').trim().replace(/^"(.*)"$/, '$1')
const client = new pg.Client({ connectionString: url })
await client.connect()

await client.query(`
  CREATE TABLE IF NOT EXISTS about (
    id int4 PRIMARY KEY,
    hero_eyebrow varchar,
    hero_heading varchar,
    hero_heading_highlight varchar,
    hero_description jsonb,
    hero_image_id int4,
    hero_image_secondary_id int4,
    hero_video_id int4,
    hero_cta_label varchar,
    hero_cta_href varchar,
    team_eyebrow varchar,
    team_heading varchar,
    team_heading_highlight varchar,
    team_body jsonb,
    team_cta_label varchar,
    team_cta_href varchar,
    team_intro_heading varchar,
    team_intro_subheading varchar,
    team_intro_body jsonb,
    guiding_principle_eyebrow varchar,
    guiding_principle_heading varchar,
    guiding_principle_heading_highlight varchar,
    guiding_principle_body jsonb,
    guiding_principle_image_id int4,
    guiding_principle_image_secondary_id int4,
    guiding_principle_cta_label varchar,
    guiding_principle_cta_href varchar,
    core_values_heading varchar,
    core_values_description varchar,
    experts_eyebrow varchar,
    experts_heading varchar,
    experts_description jsonb,
    experts_video_id int4,
    experts_poster_id int4,
    experts_badge_id int4,
    experts_cta_label varchar,
    experts_cta_href varchar,
    faq_heading varchar,
    faq_description varchar,
    updated_at timestamptz,
    created_at timestamptz
  )
`)
await client.query(`
  CREATE TABLE IF NOT EXISTS about_core_values_values (
    _order int4 NOT NULL,
    _parent_id int4 NOT NULL,
    id varchar PRIMARY KEY,
    icon varchar,
    title varchar,
    body jsonb
  )
`)
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
const richParagraph = (segments) => ({
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
        children: segments.map((segment) => ({
          type: 'text',
          text: segment.text,
          format: segment.format ?? 0,
          detail: 0,
          style: '',
          mode: 'normal',
          version: 1,
        })),
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
    children: [paragraph(a).root.children[0], paragraph(b).root.children[0]],
  },
})

const now = new Date().toISOString()
await client.query(
  `INSERT INTO about (
     id, hero_eyebrow, hero_heading, hero_heading_highlight, hero_description,
     hero_image_id, hero_cta_label, hero_cta_href,
     team_eyebrow, team_heading, team_heading_highlight, team_body,
     team_cta_label, team_cta_href, team_intro_heading, team_intro_subheading, team_intro_body,
     guiding_principle_eyebrow, guiding_principle_heading, guiding_principle_heading_highlight,
     guiding_principle_body, guiding_principle_image_id, guiding_principle_image_secondary_id,
     guiding_principle_cta_label, guiding_principle_cta_href,
     core_values_heading, core_values_description,
     experts_eyebrow, experts_heading, experts_description, experts_video_id, experts_badge_id,
     experts_cta_label, experts_cta_href,
     faq_heading, faq_description, created_at, updated_at
   ) VALUES (
     1, $1, $2, $3, $4, $5, $6, $7,
     $8, $9, $10, $11, $12, $13, $14, $15, $16,
     $17, $18, $19, $20, $21, $22, $23, $24,
     $25, $26,
     $27, $28, $29, $30, $31, $32, $33,
     $34, $35, $36, $36
   )
   ON CONFLICT (id) DO UPDATE SET
     hero_eyebrow = EXCLUDED.hero_eyebrow,
     hero_heading = EXCLUDED.hero_heading,
     hero_heading_highlight = EXCLUDED.hero_heading_highlight,
     hero_description = EXCLUDED.hero_description,
     hero_image_id = EXCLUDED.hero_image_id,
     hero_cta_label = EXCLUDED.hero_cta_label,
     hero_cta_href = EXCLUDED.hero_cta_href,
     team_eyebrow = EXCLUDED.team_eyebrow,
     team_heading = EXCLUDED.team_heading,
     team_heading_highlight = EXCLUDED.team_heading_highlight,
     team_body = EXCLUDED.team_body,
     team_cta_label = EXCLUDED.team_cta_label,
     team_cta_href = EXCLUDED.team_cta_href,
     team_intro_heading = EXCLUDED.team_intro_heading,
     team_intro_subheading = EXCLUDED.team_intro_subheading,
     team_intro_body = EXCLUDED.team_intro_body,
     guiding_principle_eyebrow = EXCLUDED.guiding_principle_eyebrow,
     guiding_principle_heading = EXCLUDED.guiding_principle_heading,
     guiding_principle_heading_highlight = EXCLUDED.guiding_principle_heading_highlight,
     guiding_principle_body = EXCLUDED.guiding_principle_body,
     guiding_principle_image_id = EXCLUDED.guiding_principle_image_id,
     guiding_principle_image_secondary_id = EXCLUDED.guiding_principle_image_secondary_id,
     guiding_principle_cta_label = EXCLUDED.guiding_principle_cta_label,
     guiding_principle_cta_href = EXCLUDED.guiding_principle_cta_href,
     core_values_heading = EXCLUDED.core_values_heading,
     core_values_description = EXCLUDED.core_values_description,
     experts_eyebrow = EXCLUDED.experts_eyebrow,
     experts_heading = EXCLUDED.experts_heading,
     experts_description = EXCLUDED.experts_description,
     experts_video_id = EXCLUDED.experts_video_id,
     experts_badge_id = EXCLUDED.experts_badge_id,
     experts_cta_label = EXCLUDED.experts_cta_label,
     experts_cta_href = EXCLUDED.experts_cta_href,
     faq_heading = EXCLUDED.faq_heading,
     faq_description = EXCLUDED.faq_description,
     updated_at = EXCLUDED.updated_at`,
  [
    'About us and our story',
    'The Go-To Choice for Homeowners In Silicon Valley',
    'Go-To Choice',
    JSON.stringify(
      richParagraph([
        { text: 'Our team of visionary leaders and dedicated professionals are committed to transforming your ' },
        { text: 'dreams', format: 1 },
        { text: ' into reality. With ' },
        { text: 'years of experience', format: 1 },
        { text: ' and a shared passion for excellence, we are here to deliver ' },
        { text: 'unparalleled', format: 2 },
        { text: ' service and create ' },
        { text: 'stunning spaces', format: 1 },
        { text: ' that exceed your expectations.' },
      ]),
    ),
    453, // Kitchen-And-Bathroom-Images-1920-×-1080-px-2.png (WP 828)
    'Unlock Your Dream Home Today',
    '/contact',
    'Driven by Passion, Guided by Expertise',
    'Meet our exceptional Team',
    'exceptional',
    JSON.stringify(
      richParagraph([
        { text: 'Our team of visionary leaders and dedicated ' },
        { text: 'professionals is committed to transforming', format: 8 },
        { text: ' your ' },
        { text: 'dreams', format: 1 },
        { text: ' into reality. With ' },
        { text: 'years of experience', format: 1 },
        { text: ' and a shared passion for excellence, we are here to deliver ' },
        { text: 'unparalleled', format: 2 },
        { text: ' service and create ' },
        { text: 'stunning spaces', format: 1 },
        { text: ' that exceed your expectations.' },
      ]),
    ),
    'Speak with Our Team',
    '#contact',
    'Meet the team',
    'The Faces Behind Prime Design and Build',
    JSON.stringify(
      paragraph(
        'Here, we showcase the talented individuals who bring their expertise, passion, and creativity to Prime Design & Build. Each team member plays a vital role in shaping our company\u2019s success and delivering outstanding results for our clients. Through their dedication, skill, and commitment to craftsmanship, our team ensures that your home remodeling journey is nothing short of exceptional. Explore below to get to know the faces behind Prime Design & Build and discover the talent that sets us apart.',
      ),
    ),
    'Our Guiding Principle',
    'Prime Design & Build\u2019s Promise: Reliability in Every Project We Take On',
    'Reliability in Every Project We Take On',
    JSON.stringify(
      twoParagraphs(
        'Our guiding principle is reliability. We believe in working closely with our clients to turn their vision into reality, with a commitment to delivering exceptional projects on time and within budget. Our team of experienced professionals upholds the highest standards of quality, safety, and expertise in every aspect of the project, from design to architecture, engineering, and completion.',
        'Our reliability sets us apart in the industry and drives our mission to provide the best experience for every client, every time.',
      ),
    ),
    359, // prime7-2.jpg (WP 2675)
    353, // prime13-1.jpg (WP 2681)
    'Start your project',
    '/contact',
    'Our Core Values',
    'At Prime Design & Build, we are passionately committed to delivering excellence in every facet of our business. We pride ourselves on upholding an unwavering standard of integrity, grounded in fairness, honesty, and personal responsibility.',
    'Experts in Silicon Valley',
    'This is why our customers love us!',
    JSON.stringify(
      richParagraph([
        { text: 'At Prime Design & Build, we combine the ' },
        { text: 'latest advancements', format: 9 },
        { text: ' in home technology with a relentless commitment to ' },
        { text: 'superior', format: 2 },
        { text: ' craftsmanship, ensuring every inch of your space is thoughtfully utilized for both functionality and stunning design.' },
      ]),
    ),
    408, // Cryer St mp4 (WP experts video)
    454, // company-of-year.png (WP 880)
    'See our services',
    '/services',
    'Frequently Asked Questions',
    'Here are some frequently asked questions about our company.',
    now,
  ],
)
console.log('about row ok')

await client.query(`DELETE FROM about_core_values_values`)
const values = [
  ['/about/about-customer-focused.svg', 'Customer Focus'],
  ['/about/about-uncompromising-quality.svg', 'Uncompromising Quality'],
  ['/about/about-integrity-and-transparency.svg', 'Integrity and Transparency'],
  ['/about/about-innovative-solutions.svg', 'Innovative Solutions'],
  ['/about/about-seamless-process.svg', 'Seamless Process'],
  ['/about/about-expertise-and-knowledge.svg', 'Expertise and Knowledge'],
]
for (let i = 0; i < values.length; i++) {
  await client.query(
    `INSERT INTO about_core_values_values (_order, _parent_id, id, icon, title) VALUES ($1, 1, $2, $3, $4)`,
    [i + 1, `value-${i + 1}`, values[i][0], values[i][1]],
  )
}
console.log('core values ok')

await client.end()
console.log('done')
