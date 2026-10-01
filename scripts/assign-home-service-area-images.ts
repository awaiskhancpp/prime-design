/**
 * Assign the uploaded home-remodeling photos to their matching city cards.
 * Uses the existing per-service/per-location featured image relation.
 *
 *   pnpm exec tsx scripts/assign-home-service-area-images.ts        # dry run
 *   pnpm exec tsx scripts/assign-home-service-area-images.ts write  # apply
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
  { city: 'Santa Clara', mediaId: 735, filename: 'Home Remodeling in Santa Clara.png' },
  { city: 'Redwood City', mediaId: 734, filename: 'Home Remodeling in RedWood City.png' },
  { city: 'Palo Alto', mediaId: 733, filename: 'Home Remodeling in Palo Alto.png' },
  { city: 'Mountain View', mediaId: 732, filename: 'Home Remodeling in Mountain View.png' },
  { city: 'Milpitas', mediaId: 731, filename: 'Home Remodeling in Milpitas.png' },
  { city: 'Menlo Park', mediaId: 730, filename: 'Home Remodeling in Menlo Park.png' },
  { city: 'Los Gatos', mediaId: 729, filename: 'Home Remodeling in Los Gatos.png' },
  { city: 'Los Altos', mediaId: 728, filename: 'Home Remodeling in Los Altos.png' },
  { city: 'Fremont', mediaId: 727, filename: 'Home Remodeling in Fremont.png' },
  { city: 'Cupertino', mediaId: 726, filename: 'Home Remodeling in Cupertino.png' },
  { city: 'Campbell', mediaId: 725, filename: 'Home Remodeling in Campbell.png' },
  { city: 'Sunnyvale', mediaId: 724, filename: 'Home Remodeling in Sunnyvale.png' },
  { city: 'Silicon Valley', mediaId: 723, filename: 'Home Remodeling in Silicon Valley.png' },
  { city: 'Saratoga', mediaId: 722, filename: 'Home Remodeling in Saratoga.png' },
] as const

const write = process.argv[2] === 'write'
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

try {
  const serviceResult = await client.query<{ id: number }>(
    'SELECT id FROM services WHERE slug = $1',
    ['home-remodeling'],
  )
  if (serviceResult.rowCount !== 1) {
    throw new Error(`Expected exactly one home-remodeling service, found ${serviceResult.rowCount}. No images were changed.`)
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
      problems.push(`${assignment.city}: expected one home-remodeling service-location record, found ${matchingRecords.length}`)
      continue
    }
    const media = mediaById.get(assignment.mediaId)
    if (!media) {
      problems.push(`${assignment.city}: media record ${assignment.mediaId} was not found`)
      continue
    }
    if ((media.filename || '').toLowerCase() !== assignment.filename.toLowerCase()) {
      problems.push(`${assignment.city}: media ${assignment.mediaId} filename is "${media.filename}", expected "${assignment.filename}"`)
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
          if (result.rowCount !== 1) throw new Error(`Expected to update one record for ${item.city}, updated ${result.rowCount}`)
        }
        await client.query('COMMIT')
        console.log('Home service-area images assigned.')
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
