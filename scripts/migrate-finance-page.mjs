/**
 * Finance page (service 13) — payload-driven content for every section,
 * strictly from the WordPress source (page `finance`, Bricks export).
 *
 *   1. Hero — heading fixed, single WP button, WP background image (ADU-3-1).
 *   2. "One-Stop Hub" — WP copy (company name resolved), button, image right
 *      (the local /Finance-Prime-Kitchens.webp the client placed in public).
 *   3. "Let's work together to finance your renovation" — background image
 *      (Kitchen-And-Bathroom 1920×1080) + button, rendered by the
 *      craftsmanship section component.
 *   4. "Pick a company you can trust" — Licensed / Bonded / Insured SVGs
 *      (the client's /public files) wired to the block's feature icons.
 *   5. FAQ — the three WordPress finance FAQ posts into the faqs collection
 *      (Finance Questions category).
 *
 * Idempotent: every step only fills what is empty.
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

// ---- 1. Hero ---------------------------------------------------------------
await c.query(`update services set hero_heading = $2 where id = 13 and hero_heading = $1`, [
  'Your Dream Home , Financed',
  'Your Dream Home, Financed',
])
const heroButtons = await c.query('select id from services_hero_buttons where _parent_id = 13')
if (!heroButtons.rows.length) {
  await c.query(
    `insert into services_hero_buttons (_order, _parent_id, id, label, url) values (0, 13, $1, $2, $3)`,
    [randomUUID(), 'Unlock Your Dream Home Today', '/contact'],
  )
  console.log('hero: single WP button added')
}
let heroMedia = await c.query(
  `select id from media where filename = 'ADU-3-1.png' or source_url like '%/2023/07/ADU-3-1.png'`,
)
let heroMediaId = heroMedia.rows[0]?.id
if (!heroMediaId) {
  const inserted = await c.query(
    `insert into media (alt, updated_at, created_at, filename, mime_type, source_url)
     values ('', now(), now(), $2, 'image/png', $1)
     returning id`,
    ['https://primedesignandbuild.com/wp-content/uploads/2023/07/ADU-3-1.png', 'ADU-3-1.png'],
  )
  heroMediaId = inserted.rows[0].id
}
await c.query(
  `update services set hero_image_id = coalesce(hero_image_id, $1) where id = 13 and hero_image_id is null`,
  [heroMediaId],
)
console.log(`hero: background image media ${heroMediaId}`)

// ---- 2. One-Stop Hub cta block --------------------------------------------
const ONE_STOP_DESCRIPTION =
  'At Prime Design & Build, we go beyond just offering financing options. We are your dedicated partner throughout the entire journey, from financing to the final touches of your kitchen remodel. Our team is committed to providing comprehensive support and guidance, ensuring a seamless experience where no client is ever left hanging.'
await c.query(
  `update services_blocks_cta
   set description = $2,
       media_source_url = coalesce(media_source_url, '/Finance-Prime-Kitchens.webp')
   where id = $1`,
  ['cc6d26bb-c0c2-41f5-83f0-7384427bb615', ONE_STOP_DESCRIPTION],
)
await c.query(
  `update services_blocks_cta_buttons set url = '/contact' where _parent_id = $1 and url = '#contact'`,
  ['cc6d26bb-c0c2-41f5-83f0-7384427bb615'],
)
console.log('one-stop hub: copy + image + button wired')

// ---- 3. "Let's work together" cta block ------------------------------------
await c.query(
  `update services_blocks_cta
   set media_source_url = coalesce(media_source_url, $2)
   where id = $1`,
  [
    'c12dc432-6994-4ceb-9ce7-5eb3efdaae48',
    'https://primedesignandbuild.com/wp-content/uploads/2023/05/Kitchen-And-Bathroom-Images-1920-%C3%97-1080-px-1.png',
  ],
)
await c.query(
  `update services_blocks_cta_buttons set url = '/contact' where _parent_id = $1 and url = '#contact'`,
  ['c12dc432-6994-4ceb-9ce7-5eb3efdaae48'],
)
console.log("let's work together: background image + button wired")

// ---- 3b. "Renovation financing, simplified." process section ---------------
// Rich-text body (ordered steps) + the WordPress phone image on both
// columns. The block's description column becomes jsonb so the Lexical
// rich text is stored like the other rich-text sections.
await c.query(
  `alter table services_blocks_image_text_2
   alter column description type jsonb using (
     case when description is null then null::jsonb else to_jsonb(description) end
   )`,
)

const textNode = (text, format = 0) => ({
  mode: 'normal',
  text,
  type: 'text',
  style: '',
  detail: 0,
  format,
  version: 1,
})
const PROCESS_BODY =
  'We know your desire to transform your kitchen without the burden of long-term commitments. Prime Kitchen has your funds in your hands '
const PROCESS_STEPS = [
  [
    'Schedule a Consultation:',
    " Reach out to our team to schedule a consultation and discuss your kitchen remodeling project. We'll take the time to understand your vision, requirements, and budget.",
  ],
  [
    'Explore Financing Options:',
    " During the consultation, our knowledgeable financing specialists will guide you through the range of financing options available. We'll provide clear explanations and help you choose the financing plan that best aligns with your needs and goals.",
  ],
  [
    'Application and Approval:',
    " Once you've selected your preferred financing option, our team will assist you in completing the straightforward application process. We'll gather the necessary information and documentation and guide you through each step to ensure a smooth and efficient approval process.",
  ],
  [
    'Begin Your Kitchen Remodel:',
    " After your financing is approved, our team of expert craftsmen and designers will start transforming your kitchen into the space of your dreams. With meticulous attention to detail and a commitment to quality, we'll bring your vision to life, creating a beautiful and functional kitchen that you'll love for years to come.",
  ],
]
const processLexical = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: null,
        children: [
          textNode(PROCESS_BODY),
          textNode('within days of applying', 1),
          textNode(', providing you with the funds you need to create your '),
          textNode('dream', 2),
          textNode(' kitchen.'),
        ],
      },
      {
        type: 'list',
        format: '',
        indent: 0,
        version: 1,
        listType: 'number',
        tag: 'ol',
        start: 1,
        direction: null,
        children: PROCESS_STEPS.map(([title, rest], index) => ({
          type: 'listitem',
          format: '',
          indent: 0,
          version: 1,
          value: index + 1,
          direction: null,
          children: [textNode(title, 1), textNode(rest)],
        })),
      },
    ],
  },
}
await c.query(
  `update services_blocks_image_text_2
   set description = $2::jsonb,
       media_source_url = coalesce(media_source_url, $3)
   where id = $1`,
  [
    '6117ea9b-fca1-4ef2-8cfe-2d07cfbbf744',
    JSON.stringify(processLexical),
    'https://primedesignandbuild.com/wp-content/uploads/2023/05/Prime-Kitchens-Phone.png',
  ],
)
console.log('renovation financing: rich-text steps + phone image wired')

// ---- 4. Licensed / Bonded / Insured icons ----------------------------------
const ICONS = ['/finance-licenced.svg', '/finance-bonded.svg', '/finance-insured.svg']
const features = await c.query(
  `select id, _order from services_blocks_experience_difference_features where _parent_id = $1 order by _order`,
  ['dead86f6-617d-4c0d-b46c-ae5e516bfcf6'],
)
for (const feature of features.rows) {
  await c.query(
    `update services_blocks_experience_difference_features set icon_source_svg_url = $2 where id = $1 and icon_source_svg_url is null`,
    [feature.id, ICONS[feature._order] ?? null],
  )
}
console.log('licensed/bonded/insured: icon paths set')

// ---- 5. Finance FAQs -------------------------------------------------------
// The WordPress finance accordion queries the four FAQ posts in this date
// order. The kitchen question IS part of the WordPress finance category, so
// it stays on this page.
const FAQS = [
  [
    'How do I finance a kitchen remodel?',
    'Financing a kitchen remodel can be approached in various ways. One popular method is through a home equity loan or line of credit, leveraging the equity in your home. These options often offer lower interest rates due to their secured nature. Personal loans or low to no-interest credit cards are alternative financing options. We recommend thoroughly researching each option and consulting with a financial advisor to determine the best fit for your specific circumstances.',
  ],
  [
    'Will remodeling a kitchen add value to my home?',
    "Remodeling your kitchen can undoubtedly add value to your home. The kitchen is a central focal point and a significant factor in potential buyers' decision-making process. However, the exact value added can vary depending on various factors, such as the quality of the remodel, current market conditions, and other considerations. While a kitchen remodel is an investment that can yield positive returns, it's important to have realistic expectations and not expect to recoup every penny spent.",
  ],
  [
    'What financing options do you offer for kitchen remodels?',
    'At Prime Design & Build, we understand that financing plays a crucial role in making your dream kitchen a reality. We offer flexible financing options to accommodate various budgets and financial situations. Our team can guide you through the available options, including home equity loans, personal loans, and credit card financing, to find the best solution for you.',
  ],
  [
    'How can I qualify for financing with Prime Design & Build?',
    'Qualifying for financing with Prime Design & Build is a straightforward process. Our financing specialists will assess your financial situation, credit history, and income to determine your eligibility. We strive to make the process as seamless as possible, and our team is here to assist you every step of the way.',
  ],
]
const faqLexical = (text) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: null,
        children: [textNode(text)],
      },
    ],
  },
})
for (let i = 0; i < FAQS.length; i++) {
  const [question, answer] = FAQS[i]
  const existing = await c.query(
    `select id from faqs where category_id = 7 and question = $1`,
    [question],
  )
  if (existing.rows.length) {
    await c.query(`update faqs set sort_order = $2, visible = true where id = $1`, [
      existing.rows[0].id,
      String(i),
    ])
  } else {
    await c.query(
      `insert into faqs (question, answer, sort_order, visible, updated_at, created_at, category_id)
       values ($1, $2::jsonb, $3, true, now(), now(), 7)`,
      [question, JSON.stringify(faqLexical(answer)), String(i)],
    )
  }
}
const financeFaqs = await c.query(
  `select id, question, sort_order from faqs where category_id = 7 and visible = true order by sort_order`,
)
console.log(
  'faqs:',
  financeFaqs.rows.map((r) => `${r.question} (#${r.sort_order})`).join(' | '),
)

await c.end()
console.log('Done.')
process.exit(0)
