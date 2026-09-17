/**
 * Restores the three SEO defects the WordPress (Rank Math) comparison found.
 * 67 of the 70 migrated descriptions already match WordPress exactly; these
 * are the rest.
 *
 * 1. HTML entities left encoded by the import. Rank Math stores its titles and
 *    descriptions entity-encoded (`Prime Design &amp; Build`,
 *    `Valley&#039;s`). A meta attribute is escaped again on render, so Google
 *    was being served the literal text `&amp;`. Affects all 45
 *    service-location descriptions and the homepage title.
 *
 * 2. Three titles were title-cased during migration, changing WordPress's
 *    wording: "Experts In Silicon Valley" (WordPress: "in"), "Projects By"
 *    and "Portfolio By" (WordPress: "by").
 *
 * 3. The contact, faq and testimonials page records have no SEO at all, so
 *    those routes fell back to invented copy. WordPress has a Rank Math title
 *    and description for each.
 *
 * The frontend also decodes entities defensively (see `decodeEntities` in
 * src/lib/seo.ts), so the rendered pages are correct either way; this fixes
 * the stored values so the admin UI and any future consumer see clean text.
 *
 * Records are matched by slug, never by row id. Every write is conditional on
 * the current value, so re-running changes nothing. Idempotent.
 *
 *   node scripts/fix-seo-fields.mjs --dry-run
 *   node scripts/fix-seo-fields.mjs
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const DRY_RUN = process.argv.includes('--dry-run')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const connectionString = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim().replace(/^["']|["']$/g, '')
if (!connectionString) throw new Error('DATABASE_URL not found in .env')

/** Mirrors decodeEntities() in src/lib/seo.ts. */
const decode = (value) =>
  String(value)
    .replace(/&(?:amp|#0*38);/gi, '&')
    .replace(/&(?:apos|#0*39|#x27);/gi, "'")
    .replace(/&(?:quot|#0*34);/gi, '"')
    .replace(/&(?:lsquo|#8216);/gi, '‘')
    .replace(/&(?:rsquo|#8217);/gi, '’')
    .replace(/&(?:ldquo|#8220);/gi, '“')
    .replace(/&(?:rdquo|#8221);/gi, '”')
    .replace(/&(?:ndash|#8211);/gi, '–')
    .replace(/&(?:mdash|#8212);/gi, '—')
    .replace(/&(?:hellip|#8230);/gi, '…')
    .replace(/&(?:nbsp|#160);/gi, ' ')

/** Titles as WordPress published them. */
const TITLE_FIXES = [
  ['about', 'About Prime Kitchens | Home Remodeling Experts in Silicon Valley'],
  ['gallery', 'Gallery | Home Remodeling Projects by Prime Design & Build'],
  [
    'our-projects',
    'Projects | Home Remodeling Portfolio by Prime Design & Build - Silicon Valley Experts',
  ],
]

/** Pages whose Rank Math SEO was never imported. */
const MISSING_SEO = [
  [
    'contact',
    'Contact Prime Design & Build | Home Remodeling Experts in Silicon Valley',
    'Contact Prime Design & Build for expert remodeling services in Silicon Valley. Schedule your free consultation today and start transforming your home. Reach out now!',
  ],
  [
    'faq',
    'FAQ | Home Remodeling Services by Prime Design & Build',
    "Explore FAQs about Prime Design & Build's home remodeling services in Silicon Valley. Find answers to common queries and insights into our process.",
  ],
  [
    'testimonials',
    'Testimonials | Client Reviews for Prime Design & Build - Silicon Valley Home Remodeling',
    'Read client testimonials about Prime Design & Build, trusted experts in home remodeling in Silicon Valley. Hear from homeowners about our craftsmanship and service.',
  ],
]

/** Every table + column pair that stores migrated SEO text. */
const TEXT_COLUMNS = [
  ['pages', 'seo_meta_title'],
  ['pages', 'seo_meta_description'],
  ['pages', 'seo_og_title'],
  ['pages', 'seo_og_description'],
  ['services', 'seo_meta_title'],
  ['services', 'seo_meta_description'],
  ['services', 'seo_og_title'],
  ['services', 'seo_og_description'],
  ['service_locations', 'seo_meta_title'],
  ['service_locations', 'seo_meta_description'],
  ['service_locations', 'seo_og_title'],
  ['service_locations', 'seo_og_description'],
  ['landing_pages', 'seo_meta_title'],
  ['landing_pages', 'seo_meta_description'],
  ['projects', 'seo_meta_title'],
  ['projects', 'seo_meta_description'],
  ['blog', 'seo_meta_title'],
  ['blog', 'seo_meta_description'],
]

const ENTITY_RE = "%&#%"
const client = new Client({ connectionString })
await client.connect()
const log = (...args) => console.log(...args)

try {
  log(`${DRY_RUN ? '[dry run] ' : ''}restoring WordPress SEO values`)
  log('')

  // ---- 1. decode HTML entities ------------------------------------------
  log('1. HTML entities left encoded by the import')
  let decoded = 0
  for (const [table, column] of TEXT_COLUMNS) {
    const exists = (
      await client.query(
        `select 1 from information_schema.columns where table_name = $1 and column_name = $2`,
        [table, column],
      )
    ).rowCount
    if (!exists) continue

    const rows = (
      await client.query(
        `select id, ${column} as value from "${table}"
          where ${column} is not null
            and (${column} like '%&amp;%' or ${column} like '%&quot;%' or ${column} like $1
                 or ${column} like '%&rsquo;%' or ${column} like '%&nbsp;%' or ${column} like '%&apos;%')`,
        [ENTITY_RE],
      )
    ).rows
    if (!rows.length) continue
    log(`   ${table}.${column}: ${rows.length} rows`)
    for (const row of rows) {
      const next = decode(row.value)
      if (next === row.value) continue
      decoded += 1
      if (!DRY_RUN) {
        await client.query(`update "${table}" set ${column} = $2 where id = $1`, [row.id, next])
      }
    }
  }
  log(`   ${DRY_RUN ? 'would decode' : 'decoded'} ${decoded} values`)
  log('')

  // ---- 2. title casing ---------------------------------------------------
  log('2. titles title-cased away from the WordPress wording')
  for (const [slug, title] of TITLE_FIXES) {
    const current = (await client.query(`select seo_meta_title t from pages where slug = $1`, [slug])).rows[0]
    if (!current) throw new Error(`No pages row with slug "${slug}".`)
    if (current.t === title) {
      log(`   ${slug.padEnd(14)} already matches WordPress`)
      continue
    }
    log(`   ${slug}`)
    log(`      now: ${current.t}`)
    log(`      ->   ${title}`)
    if (!DRY_RUN) {
      await client.query(
        `update pages set seo_meta_title = $2, updated_at = now() where slug = $1 and seo_meta_title is distinct from $2`,
        [slug, title],
      )
    }
  }
  log('')

  // ---- 3. pages with no SEO at all ---------------------------------------
  log('3. page records missing their WordPress SEO')
  for (const [slug, title, description] of MISSING_SEO) {
    const current = (
      await client.query(`select seo_meta_title t, seo_meta_description d from pages where slug = $1`, [slug])
    ).rows[0]
    if (!current) throw new Error(`No pages row with slug "${slug}".`)
    if (current.t && current.d) {
      log(`   ${slug.padEnd(14)} already has SEO - left alone`)
      continue
    }
    log(`   ${slug}`)
    log(`      T: ${title}`)
    log(`      D: ${description.slice(0, 90)}...`)
    if (!DRY_RUN) {
      // COALESCE so a value an editor already set is never overwritten.
      await client.query(
        `update pages
            set seo_meta_title       = coalesce(seo_meta_title, $2),
                seo_meta_description = coalesce(seo_meta_description, $3),
                seo_og_title         = coalesce(seo_og_title, $2),
                seo_og_description   = coalesce(seo_og_description, $3),
                updated_at           = now()
          where slug = $1`,
        [slug, title, description],
      )
    }
  }
  log('')

  // ---- verification ------------------------------------------------------
  log(DRY_RUN ? 'current state:' : 'verification:')
  let remaining = 0
  for (const [table, column] of TEXT_COLUMNS) {
    const exists = (
      await client.query(
        `select 1 from information_schema.columns where table_name = $1 and column_name = $2`,
        [table, column],
      )
    ).rowCount
    if (!exists) continue
    const n = (
      await client.query(
        `select count(*)::int n from "${table}"
          where ${column} like '%&amp;%' or ${column} like '%&quot;%' or ${column} like $1
             or ${column} like '%&rsquo;%' or ${column} like '%&nbsp;%' or ${column} like '%&apos;%'`,
        [ENTITY_RE],
      )
    ).rows[0].n
    remaining += n
  }
  log(`  ${remaining === 0 ? 'ok  ' : 'GAP '} rows still holding HTML entities: ${remaining}`)

  const titlesOk = (
    await client.query(`select count(*)::int n from pages where slug = any($1::text[]) and seo_meta_title = any($2::text[])`, [
      TITLE_FIXES.map((row) => row[0]),
      TITLE_FIXES.map((row) => row[1]),
    ])
  ).rows[0].n
  log(`  ${titlesOk === 3 ? 'ok  ' : 'GAP '} titles matching WordPress: ${titlesOk}/3`)

  const seeded = (
    await client.query(
      `select count(*)::int n from pages where slug = any($1::text[])
        and seo_meta_title is not null and seo_meta_description is not null`,
      [MISSING_SEO.map((row) => row[0])],
    )
  ).rows[0].n
  log(`  ${seeded === 3 ? 'ok  ' : 'GAP '} contact/faq/testimonials with SEO: ${seeded}/3`)

  const covered = (
    await client.query(`select count(*)::int n from pages where seo_meta_description is not null`)
  ).rows[0].n
  const total = (await client.query(`select count(*)::int n from pages`)).rows[0].n
  log(`  ${covered === total ? 'ok  ' : 'note'} pages with a meta description: ${covered}/${total}`)

  if (!DRY_RUN && (remaining !== 0 || titlesOk !== 3 || seeded !== 3)) {
    throw new Error('Verification failed - see the GAP lines above.')
  }
} finally {
  await client.end()
}
