/**
 * Moves the location-page section content from the services table down to
 * each service's service_locations rows, so the service-locations
 * "Location Page Sections" tab is the single authoring surface for location
 * pages (services keeps only the groups its own pages render).
 *
 * For every service 1..3: copy the 6 groups' columns into each of its 15
 * city rows with coalesce (never overwrites an existing value) and insert
 * the array child rows only when the city has none yet. Upload images on
 * services (media ids) are resolved to their hotlink URL for the text image
 * fields on service_locations. Idempotent.
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

const mediaUrl = async (id) => {
  if (id === null || id === undefined) return null
  const { rows } = await c.query('select source_url, url from media where id = $1', [id])
  return rows[0]?.source_url || rows[0]?.url || null
}

for (const serviceId of [1, 2, 3]) {
  const svc = (await c.query('select * from services where id = $1', [serviceId])).rows[0]
  const cities = (
    await c.query('select id, slug from service_locations where service_id = $1 order by slug', [
      serviceId,
    ])
  ).rows
  console.log(`service ${serviceId} (${svc.slug}): ${cities.length} cities`)

  const quoteImage = await mediaUrl(svc.quote_image_id)
  const svlImage = await mediaUrl(svc.silicon_valley_loves_image_id)

  for (const city of cities) {
    await c.query(
      `update service_locations set
         location_video_eyebrow = coalesce(location_video_eyebrow, $2),
         location_video_title = coalesce(location_video_title, $3),
         location_video_description = coalesce(location_video_description, $4),
         location_video_tagline = coalesce(location_video_tagline, $5),
         location_video_video_url = coalesce(location_video_video_url, $6),
         location_video_poster = coalesce(location_video_poster, $7),
         dont_settle_eyebrow = coalesce(dont_settle_eyebrow, $8),
         dont_settle_heading = coalesce(dont_settle_heading, $9),
         dont_settle_heading_accent = coalesce(dont_settle_heading_accent, $10),
         dont_settle_body = coalesce(dont_settle_body, $11),
         dont_settle_cta_label = coalesce(dont_settle_cta_label, $12),
         prime_difference_eyebrow = coalesce(prime_difference_eyebrow, $13),
         prime_difference_heading = coalesce(prime_difference_heading, $14),
         prime_difference_body = coalesce(prime_difference_body, $15),
         quote_heading = coalesce(quote_heading, $16),
         quote_quote = coalesce(quote_quote, $17),
         quote_attribution = coalesce(quote_attribution, $18),
         quote_image = coalesce(quote_image, $19),
         silicon_valley_loves_eyebrow = coalesce(silicon_valley_loves_eyebrow, $20),
         silicon_valley_loves_heading = coalesce(silicon_valley_loves_heading, $21),
         silicon_valley_loves_body = coalesce(silicon_valley_loves_body, $22),
         silicon_valley_loves_image = coalesce(silicon_valley_loves_image, $23)
       where id = $1`,
      [
        city.id,
        svc.location_video_eyebrow, svc.location_video_title, svc.location_video_description,
        svc.location_video_tagline, svc.location_video_video_url, svc.location_video_poster,
        svc.dont_settle_eyebrow, svc.dont_settle_heading, svc.dont_settle_heading_accent,
        svc.dont_settle_body, svc.dont_settle_cta_label,
        svc.prime_difference_eyebrow, svc.prime_difference_heading, svc.prime_difference_body,
        svc.quote_heading, svc.quote_quote, svc.quote_attribution, quoteImage,
        svc.silicon_valley_loves_eyebrow, svc.silicon_valley_loves_heading,
        svc.silicon_valley_loves_body, svlImage,
      ],
    )

    // Child arrays — insert copies only when this city has none.
    const copyRows = async (sourceTable, targetTable, columns) => {
      const existing = await c.query(`select id from ${targetTable} where _parent_id = $1`, [city.id])
      if (existing.rows.length) return 0
      const src = await c.query(`select * from ${sourceTable} where _parent_id = $1 order by _order`, [
        serviceId,
      ])
      for (let i = 0; i < src.rows.length; i++) {
        const values = columns.map((col) => src.rows[i][col] ?? null)
        await c.query(
          `insert into ${targetTable} (_order, _parent_id, id, ${columns.join(', ')}) values ($1, $2, $3, ${columns
            .map((_, index) => `$${index + 4}`)
            .join(', ')})`,
          [i, city.id, randomUUID(), ...values],
        )
      }
      return src.rows.length
    }

    const checklistN = await copyRows(
      'services_prime_difference_checklist',
      'service_locations_prime_difference_checklist',
      ['text'],
    )
    const reasonsN = await copyRows(
      'services_prime_difference_reasons',
      'service_locations_prime_difference_reasons',
      ['title', 'description', 'image'],
    )
    const statsN = await copyRows(
      'services_silicon_valley_loves_stats',
      'service_locations_silicon_valley_loves_stats',
      ['value', 'label', 'detail'],
    )
    const cardsN = await copyRows(
      'services_testimonial_cards_items',
      'service_locations_testimonial_cards_items',
      ['name', 'quote', 'avatar'],
    )
    console.log(
      `  ${city.slug}: checklist ${checklistN}, reasons ${reasonsN}, stats ${statsN}, cards ${cardsN}`,
    )
  }
}

await c.end()
console.log('Done.')
process.exit(0)
