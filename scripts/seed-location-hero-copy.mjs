/**
 * Seeds the per-family location hero copy onto the THREE service records.
 *
 * The copy above the quote form on every city page (lede, body, form subject
 * and three feature blurbs) used to be hardcoded in ServiceLocationHeroForm,
 * keyed by service slug. WordPress authors it on the family template
 * (1495 kitchen / 1584 bathroom / 1639 home) rather than per city, so the
 * default belongs on `services`; the 45 service_locations rows are left empty
 * and inherit it.
 *
 * The values below are the exact strings the component shipped, so seeding
 * changes nothing on screen — it just moves the source of truth into Payload.
 * `{City}` and `{Company}` are substituted at render time and are stored
 * verbatim.
 *
 * Services are resolved by slug and the script throws if one is missing.
 * Only NULL columns are written and blurbs are only inserted when a service
 * has none, so a re-run never overwrites an editor's changes. Idempotent.
 *
 *   node scripts/seed-location-hero-copy.mjs
 *   node scripts/seed-location-hero-copy.mjs --dry-run
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const DRY_RUN = process.argv.includes('--dry-run')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const connectionString = env.match(/^DATABASE_URL=(.+)$/m)?.[1].trim().replace(/^["']|["']$/g, '')
if (!connectionString) throw new Error('DATABASE_URL not found in .env')

/** Verbatim HERO_COPY from src/components/services/ServiceLocationHeroForm.tsx. */
const HERO_COPY = {
  'kitchen-remodeling': {
    lede: 'The recipe for a Dream Kitchen, Your Masterpiece.',
    body: 'Serving {City} with tailored kitchen remodeling solutions. At {Company}, we turn your vision into reality.',
    formSubject: 'kitchen',
    blurbs: [
      'Experience the joy of timeless elegance with a modern twist.',
      'Design your perfect kitchen with unmatched quality & service.',
      'Find out why people keep raving about "The Prime Difference".',
    ],
  },
  'bathroom-remodeling': {
    lede: 'From Vision to Reality: Your Dream Bathroom Awaits',
    body: "Transforming {City}'s bathrooms into dream havens, {Company} delivers tailored bathroom remodeling solutions that bring your vision to life.",
    formSubject: 'bathroom',
    blurbs: [
      'Indulge in the timeless elegance of modern bathroom transformations.',
      'Build your bathroom oasis with cutting edge technology & material.',
      'Find out why people keep raving about "The Prime Difference".',
    ],
  },
  'home-remodeling': {
    lede: "Dream, Design, Deliver: {Company}'s Home Remodeling Marvels",
    body: 'Transforming {City} Homes into Personalized Masterpieces. Your Vision, Our Craftsmanship',
    formSubject: 'home',
    blurbs: [
      'Seamless remodeling experience from start to finish',
      'Precision installation and meticulous finishes for lasting beauty',
      'Find out why people keep raving about "The Prime Difference".',
    ],
  },
}

const client = new Client({ connectionString })
await client.connect()

try {
  console.log(`${DRY_RUN ? '[dry run] ' : ''}seeding location hero copy onto services\n`)
  let columnsWritten = 0
  let blurbsWritten = 0

  for (const [slug, copy] of Object.entries(HERO_COPY)) {
    const { rows } = await client.query(
      `select id, location_hero_lede, location_hero_body, location_hero_form_subject
         from services where slug = $1`,
      [slug],
    )
    if (!rows.length) throw new Error(`No service row with slug "${slug}".`)
    const service = rows[0]

    const { rows: existing } = await client.query(
      `select count(*)::int n from services_location_hero_blurbs where _parent_id = $1`,
      [service.id],
    )
    const hasBlurbs = existing[0].n > 0

    const pending = []
    if (service.location_hero_lede === null) pending.push('lede')
    if (service.location_hero_body === null) pending.push('body')
    if (service.location_hero_form_subject === null) pending.push('formSubject')
    if (!hasBlurbs) pending.push(`blurbs x${copy.blurbs.length}`)

    console.log(`  ${slug} (service#${service.id})`)
    if (!pending.length) {
      console.log('    already seeded — nothing to write\n')
      continue
    }
    console.log(`    ${DRY_RUN ? 'would write' : 'writing'}: ${pending.join(', ')}`)

    if (!DRY_RUN) {
      // COALESCE so a column an editor has already filled is never clobbered.
      const { rowCount } = await client.query(
        `update services
            set location_hero_lede        = coalesce(location_hero_lede, $2),
                location_hero_body        = coalesce(location_hero_body, $3),
                location_hero_form_subject = coalesce(location_hero_form_subject, $4),
                updated_at                = now()
          where id = $1`,
        [service.id, copy.lede, copy.body, copy.formSubject],
      )
      columnsWritten += rowCount

      if (!hasBlurbs) {
        for (const [index, text] of copy.blurbs.entries()) {
          await client.query(
            `insert into services_location_hero_blurbs (id, _order, _parent_id, text)
             values ($1, $2, $3, $4)`,
            [randomUUID(), index, service.id, text],
          )
          blurbsWritten += 1
        }
      }
    }
    console.log('')
  }

  // Verify against the collection rather than trusting the write counts.
  const { rows: check } = await client.query(`
    select s.slug,
           s.location_hero_lede is not null as has_lede,
           s.location_hero_body is not null as has_body,
           s.location_hero_form_subject is not null as has_subject,
           (select count(*)::int from services_location_hero_blurbs b where b._parent_id = s.id) as blurbs
      from services s
     where s.slug = any($1::text[])
     order by s.slug`,
    [Object.keys(HERO_COPY)],
  )

  console.log(DRY_RUN ? 'current state:' : `done — ${columnsWritten} services updated, ${blurbsWritten} blurbs inserted. verification:`)
  let gaps = 0
  for (const row of check) {
    const ok = row.has_lede && row.has_body && row.has_subject && row.blurbs === 3
    if (!ok) gaps += 1
    console.log(
      `  ${ok ? 'ok  ' : 'GAP '} ${row.slug.padEnd(22)} lede=${row.has_lede} body=${row.has_body} subject=${row.has_subject} blurbs=${row.blurbs}`,
    )
  }

  const { rows: overrides } = await client.query(`
    select count(*)::int n from service_locations
     where location_hero_lede is not null
        or location_hero_body is not null
        or location_hero_form_subject is not null`)
  console.log(`\n  service_locations carrying a hero override: ${overrides[0].n} (expected 0 — all 45 inherit)`)

  if (!DRY_RUN && gaps) throw new Error(`${gaps} service records are still missing hero copy.`)
} finally {
  await client.end()
}
