/**
 * Testimonials page → Pages collection record `testimonials`.
 *
 * Mirrors how WordPress builds the page (`primedesignampbuild` WP post 347,
 * slug `testimonials`), section for section:
 *
 *   Bricks root 0  → `hero` block
 *                    "Hear From Our Satisfied Customers" + body + wp image 1776
 *   Bricks root 1  → `testimonial-videos` block
 *                    seven <video> elements (six unique; the Atherton clip is
 *                    repeated). Each is pointed at the locally imported copy
 *                    rather than the bunny.net URL, since those files are
 *                    already in the Media collection with posters.
 *   Bricks root 2  → `review-highlights` block
 *                    On WordPress this is the shortcode [brb_collection
 *                    id="1223"], a third-party review-aggregator plugin, so
 *                    there is NO WordPress content behind it. The badges,
 *                    ratings and counts come from website.json, which is where
 *                    they were scraped to; putting them on the block makes them
 *                    editable in the admin.
 *   Bricks root 3  → `testimonials-spotlight` block
 *                    "Testimonials that Matter / Real Results, Real People".
 *                    Its slider is a Bricks query loop over the `testimonial`
 *                    post type, so this block stores ONLY the section copy —
 *                    the reviews are read from the Testimonials collection at
 *                    render time and are not duplicated onto the page.
 *   Bricks root 4  → `contact` block (the shared contact section w/ video).
 *
 * The trailing `service-areas` strip is not on the WordPress page; it is kept
 * because the current Next.js page renders it.
 *
 * Also backfills `source` / `timeAgo` on the five reviews the page shows, and
 * gives them a deterministic sort order, so the cards keep rendering the same
 * people now that they come from the collection instead of a hardcoded array.
 *
 * Idempotent: the page record and its blocks are rebuilt from scratch.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim()
if (!u) throw new Error('DATABASE_URL not found in .env')

const PAGE_SLUG = 'testimonials'

/** Minimal Lexical document from paragraphs of [text, formatBitmask] runs. */
const lexical = (paragraphs) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: paragraphs.map((runs) => ({
      type: 'paragraph',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr',
      children: runs.map(([text, format = 0]) => ({
        mode: 'normal',
        text,
        type: 'text',
        style: '',
        detail: 0,
        format,
        version: 1,
      })),
    })),
  },
})
const BOLD = 1
const ITALIC = 2
const UNDERLINE = 8

const client = new Client({ connectionString: u })
await client.connect()

/** Media id for a WordPress attachment id, or null when it was not imported. */
const mediaByWp = async (wordpressId) =>
  (await client.query(`select id from media where wordpress_id = $1`, [String(wordpressId)]))
    .rows[0]?.id ?? null

/** Media id by exact filename. */
const mediaByFile = async (filename) =>
  (await client.query(`select id from media where filename = $1`, [filename])).rows[0]?.id ?? null

// ---- 0. The page record ----------------------------------------------------
let pageId = (await client.query(`select id from pages where slug = $1`, [PAGE_SLUG])).rows[0]?.id
if (!pageId) {
  pageId = (
    await client.query(
      `insert into pages (title, slug, updated_at, created_at)
       values ('Testimonials', $1, now(), now()) returning id`,
      [PAGE_SLUG],
    )
  ).rows[0].id
  console.log(`created pages record ${pageId} (${PAGE_SLUG})`)
} else {
  console.log(`pages record ${pageId} (${PAGE_SLUG})`)
}

// Rebuild the layout from scratch so re-running cannot stack duplicates.
const BLOCK_TABLES = [
  ['pages_blocks_testimonial_videos', ['pages_blocks_testimonial_videos_videos']],
  [
    'pages_blocks_review_highlights',
    ['pages_blocks_review_highlights_badges', 'pages_blocks_review_highlights_stats'],
  ],
  ['pages_blocks_testimonials_spotlight', []],
  ['pages_blocks_hero', []],
  ['pages_blocks_contact', []],
  ['pages_blocks_service_areas', []],
]
for (const [table, children] of BLOCK_TABLES) {
  const ids = (await client.query(`select id from ${table} where _parent_id = $1`, [pageId])).rows.map(
    (r) => r.id,
  )
  for (const child of children) {
    if (ids.length)
      await client.query(`delete from ${child} where _parent_id = any($1::varchar[])`, [ids])
  }
  await client.query(`delete from ${table} where _parent_id = $1`, [pageId])
}

let order = 0
const nextOrder = () => (order += 1)

// ---- 1. Hero (Bricks root 0) ----------------------------------------------
const heroImageId = await mediaByWp(1776)
if (!heroImageId) console.log('WARNING: wp attachment 1776 (hero image) is not in the media collection')
await client.query(
  `insert into pages_blocks_hero
     (_order, _parent_id, _path, id, eyebrow, heading, heading_highlight, description, image_id, align)
   values ($1, $2, 'layout', $3, $4, $5, $6, $7, $8, 'left')`,
  [
    nextOrder(),
    pageId,
    randomUUID(),
    'Testimonials',
    'Hear From Our Satisfied Customers',
    'Our Satisfied',
    JSON.stringify(
      lexical([
        [
          [
            "At Prime Design & Build, we believe that the best measure of our success comes from the satisfaction of our clients. We're humbled by the kind words our customers have shared about their experiences with us.",
          ],
        ],
      ]),
    ),
    heroImageId,
  ],
)

// ---- 2. Testimonial videos (Bricks root 1) ---------------------------------
const videosBlockId = randomUUID()
await client.query(
  `insert into pages_blocks_testimonial_videos (_order, _parent_id, _path, id)
   values ($1, $2, 'layout', $3)`,
  [nextOrder(), pageId, videosBlockId],
)

// WordPress order, with the duplicated Atherton clip dropped.
const VIDEOS = [
  ['Rosewood Dr, Atherton', 'Noam', 'noam-rosewood-atherton.mp4', 'noam-rosewood-atherton-poster.jpg'],
  ['Alice Ave, Mountain View (Kitchen)', 'Ilay', 'ilay-alice-ave-kitchen.mp4', 'ilay-alice-ave-kitchen-poster.jpg'],
  ['First floor renovation', null, 'first-floor-renovation.mp4', 'first-floor-renovation-poster.jpg'],
  ['Client walkthrough', 'Noah, Co-Owner', 'noah-prime-intro.mp4', 'noah-prime-intro-poster.jpg'],
  ['San Luis Ave, Mountain View', null, 'prime-kitchens-san-luis.mp4', 'prime-kitchens-san-luis-poster.jpg'],
  ['Bluebonnet Ct, Morgan Hill (Full House)', 'Josef', 'josef-bluebonnet-morgan-hill.mp4', 'josef-bluebonnet-morgan-hill-poster.jpg'],
]
for (let i = 0; i < VIDEOS.length; i++) {
  const [title, speaker, file, poster] = VIDEOS[i]
  const videoId = await mediaByFile(file)
  if (!videoId) {
    console.log(`WARNING: video "${file}" not in the media collection — row skipped`)
    continue
  }
  await client.query(
    `insert into pages_blocks_testimonial_videos_videos
       (_order, _parent_id, id, title, speaker, video_id, poster_id)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [i + 1, videosBlockId, randomUUID(), title, speaker, videoId, await mediaByFile(poster)],
  )
}

// ---- 3. Review highlights (Bricks root 2 — plugin shortcode) ---------------
const highlightsBlockId = randomUUID()
await client.query(
  `insert into pages_blocks_review_highlights (_order, _parent_id, _path, id, review_limit)
   values ($1, $2, 'layout', $3, 5)`,
  [nextOrder(), pageId, highlightsBlockId],
)
const BADGES = [
  ['/social/Yelp.png', 'Yelp rating'],
  ['/social/Google.png', 'Google rating'],
  ['/social/houzz.png', 'Houzz rating'],
  ['/social/BB-ACCREDITED.jpeg', 'BBB accredited business'],
]
for (let i = 0; i < BADGES.length; i++) {
  await client.query(
    `insert into pages_blocks_review_highlights_badges (_order, _parent_id, id, image_path, alt)
     values ($1, $2, $3, $4, $5)`,
    [i + 1, highlightsBlockId, randomUUID(), BADGES[i][0], BADGES[i][1]],
  )
}
const STATS = [
  ['Google reviews', 4.9, 56, 'https://maps.google.com/?cid=11837063325613881352', 'Read all reviews on Google'],
  ['Yelp reviews', 4.9, 64, 'https://www.yelp.com/biz/prime-kitchens-santa-clara', 'Read all reviews on Yelp'],
]
for (let i = 0; i < STATS.length; i++) {
  await client.query(
    `insert into pages_blocks_review_highlights_stats
       (_order, _parent_id, id, label, rating, count, url, link_label)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [i + 1, highlightsBlockId, randomUUID(), ...STATS[i]],
  )
}

// ---- 4. Spotlight (Bricks root 3) ------------------------------------------
await client.query(
  `insert into pages_blocks_testimonials_spotlight
     (_order, _parent_id, _path, id, eyebrow, heading, body, cta_label, cta_href, cta_note, review_limit)
   values ($1, $2, 'layout', $3, $4, $5, $6, $7, $8, $9, 12)`,
  [
    nextOrder(),
    pageId,
    randomUUID(),
    'Testimonials that Matter',
    'Real Results, Real People',
    JSON.stringify(
      lexical([
        [
          ['See why our clients '],
          ['rave', BOLD],
          [' about their '],
          ['stunning', ITALIC],
          [' kitchens and how we can '],
          ['bring your vision to life', UNDERLINE],
          ['.'],
        ],
        [
          ["Don't just take our word for it – see how our clients' "],
          ['dreams', BOLD],
          [' became a '],
          ['reality', BOLD],
          [' with Prime Design & Build.'],
        ],
      ]),
    ),
    'See our services',
    '/services',
    'Ready to talk?',
  ],
)

// ---- 5. Contact (Bricks root 4) + the areas strip --------------------------
await client.query(
  `insert into pages_blocks_contact (_order, _parent_id, _path, id)
   values ($1, $2, 'layout', $3)`,
  [nextOrder(), pageId, randomUUID()],
)
await client.query(
  `insert into pages_blocks_service_areas (_order, _parent_id, _path, id, heading)
   values ($1, $2, 'layout', $3, 'Areas we service')`,
  [nextOrder(), pageId, randomUUID()],
)

// ---- 6. The reviews the page shows ----------------------------------------
// Source and relative date come from the review platforms (they were held in
// src/lib/testimonials.ts). Sort order keeps these five first so the cards
// render the same people the hardcoded page did.
const PAGE_REVIEWS = [
  ['Edward L.', 'Yelp', '5 months ago', 1],
  ['David W.', 'Yelp', '11 months ago', 2],
  ['Hanyu C.', 'Yelp', '11 months ago', 3],
  ['Dennis Randall', 'Google', 'a year ago', 4],
  ['Arika', 'Yelp', '2 years ago', 5],
]
// Push everything already featured behind them, without unfeaturing anything.
await client.query(
  `update testimonials set sort_order = 100 + coalesce(sort_order, 0) where featured = true`,
)
for (const [name, source, timeAgo, sortOrder] of PAGE_REVIEWS) {
  const { rowCount } = await client.query(
    `update testimonials
        set featured = true, source = $2, time_ago = $3, sort_order = $4
      where name = $1`,
    [name, source, timeAgo, sortOrder],
  )
  console.log(`  ${rowCount ? 'set' : 'NOT FOUND'}: ${name}`)
}

const blocks = await client.query(
  `select 'hero' t, count(*)::int n from pages_blocks_hero where _parent_id = $1
   union all select 'videos', count(*)::int from pages_blocks_testimonial_videos where _parent_id = $1
   union all select 'highlights', count(*)::int from pages_blocks_review_highlights where _parent_id = $1
   union all select 'spotlight', count(*)::int from pages_blocks_testimonials_spotlight where _parent_id = $1
   union all select 'contact', count(*)::int from pages_blocks_contact where _parent_id = $1
   union all select 'areas', count(*)::int from pages_blocks_service_areas where _parent_id = $1`,
  [pageId],
)
console.log('\nblocks on the page:', blocks.rows.map((r) => `${r.t}=${r.n}`).join(' '))

await client.end()
process.exit(0)
