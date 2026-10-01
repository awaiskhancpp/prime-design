/**
 * Assign the uploaded kitchen-remodeling photos to their matching city cards.
 *
 * This uses the existing per-service/per-location `featuredImage` relation,
 * so no schema migration is needed and other services' records are untouched.
 * The same featured image is also used as the corresponding kitchen location
 * page's share/fallback image.
 *
 *   pnpm exec tsx scripts/assign-kitchen-service-area-images.ts        # dry run
 *   pnpm exec tsx scripts/assign-kitchen-service-area-images.ts write  # apply
 */
import 'dotenv/config'
import { createRequire } from 'node:module'

// `pg` is only reachable through this literal nested path — it's a
// transitive dependency (of the Postgres Payload adapter), not a direct one,
// so neither a plain `import 'pg'` nor its `@types/pg` declarations resolve
// here. `createRequire` resolves the real package fine at runtime; this
// minimal shape (just the calls this script actually makes) is what lets the
// generic `client.query<T>()` calls below type-check without them.
type PgQueryResult<T> = { rows: T[]; rowCount: number | null }
type PgClient = {
  connect(): Promise<void>
  query<T = unknown>(text: string, values?: unknown[]): Promise<PgQueryResult<T>>
  end(): Promise<void>
}
const { Client } = createRequire(import.meta.url)(
  '../node_modules/.pnpm/pg@8.20.0/node_modules/pg',
) as { Client: new (config: { connectionString?: string }) => PgClient }

const assignments = [
  { city: 'Saratoga', mediaId: 693, filename: 'Saratoga.png' },
  { city: 'Santa Clara', mediaId: 692, filename: 'Santa Clara.png' },
  { city: 'Redwood City', mediaId: 691, filename: 'RedWood City.png' },
  { city: 'Palo Alto', mediaId: 690, filename: 'Palo Alto Kitchen.png' },
  { city: 'Mountain View', mediaId: 689, filename: 'Mountain View.png' },
  { city: 'Milpitas', mediaId: 688, filename: 'Milpitas.png' },
  { city: 'Menlo Park', mediaId: 687, filename: 'Menlo Park.png' },
  { city: 'Los Gatos', mediaId: 686, filename: 'Los Gatos.png' },
  { city: 'Los Altos', mediaId: 685, filename: 'Los Altos.png' },
  { city: 'Fremont', mediaId: 684, filename: 'Fremont.png' },
  { city: 'Cupertino', mediaId: 683, filename: 'Cupertino.png' },
  // The uploaded filename is misspelled "Cambell.png"; the Payload location
  // record is correctly named "Campbell".
  { city: 'Campbell', mediaId: 682, filename: 'Cambell.png' },
  { city: 'Sunnyvale', mediaId: 681, filename: 'SunnyVale.png' },
  { city: 'Silicon Valley', mediaId: 680, filename: 'Silicon Valley.png' },
] as const

const write = process.argv[2] === 'write'

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

try {
  const serviceResult = await client.query<{ id: number }>(
    'SELECT id FROM services WHERE slug = $1',
    ['kitchen-remodeling'],
  )
  if (serviceResult.rowCount !== 1) {
    throw new Error(
      `Expected exactly one kitchen-remodeling service, found ${serviceResult.rowCount}. No images were changed.`,
    )
  }

  const serviceId = serviceResult.rows[0].id
  const locationsResult = await client.query<{
    id: number
    city: string | null
    location_name: string
    current_media_id: number | null
  }>(
    `SELECT sl.id, sl.city, l.name AS location_name, sl.featured_image_id AS current_media_id
       FROM service_locations sl
       JOIN locations l ON l.id = sl.location_id
      WHERE sl.service_id = $1`,
    [serviceId],
  )
  const recordsByCity = new Map<string, typeof locationsResult.rows>()
  for (const record of locationsResult.rows) {
    const city = (record.location_name || record.city || '').trim().toLowerCase()
    const records = recordsByCity.get(city) || []
    records.push(record)
    recordsByCity.set(city, records)
  }

  const mediaResult = await client.query<{ id: number; filename: string | null }>(
    'SELECT id, filename FROM media WHERE id = ANY($1::int[])',
    [assignments.map(({ mediaId }) => mediaId)],
  )
  const mediaById = new Map(mediaResult.rows.map((media) => [media.id, media]))
  const plan: Array<{
    city: string
    recordId: number
    mediaId: number
    filename: string
    currentMediaId: number | null
  }> = []
  const problems: string[] = []

  for (const assignment of assignments) {
    const matchingRecords = recordsByCity.get(assignment.city.toLowerCase()) || []
    if (matchingRecords.length !== 1) {
      problems.push(
        `${assignment.city}: expected one kitchen-remodeling service-location record, found ${matchingRecords.length}`,
      )
      continue
    }
    const media = mediaById.get(assignment.mediaId)
    if (!media) {
      problems.push(`${assignment.city}: media record ${assignment.mediaId} was not found`)
      continue
    }
    plan.push({
      city: assignment.city,
      recordId: matchingRecords[0].id,
      mediaId: assignment.mediaId,
      filename: media.filename || '(filename unavailable)',
      currentMediaId: matchingRecords[0].current_media_id,
    })
  }

  if (problems.length) {
    console.error('Preflight failed; no images were changed:')
    problems.forEach((problem) => console.error(`  - ${problem}`))
    process.exitCode = 1
  } else {
    console.table(
      plan.map(({ city, mediaId, filename, currentMediaId }) => ({
        City: city,
        'New media ID': mediaId,
        'Payload filename': filename,
        'Current media ID': currentMediaId ?? '—',
      })),
    )

    if (write) {
      await client.query('BEGIN')
      try {
        for (const item of plan) {
          if (item.currentMediaId === item.mediaId) continue
          const result = await client.query(
            `UPDATE service_locations
                SET featured_image_id = $1, seo_og_image_id = $1, updated_at = NOW()
              WHERE id = $2 AND service_id = $3`,
            [item.mediaId, item.recordId, serviceId],
          )
          if (result.rowCount !== 1) {
            throw new Error(`Expected to update one record for ${item.city}, updated ${result.rowCount}`)
          }
        }
        await client.query('COMMIT')
        console.log('Kitchen service-area images assigned.')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      }
    } else {
      console.log('Dry run only — pass "write" to assign these images.')
    }
  }
} finally {
  await client.end()
}
