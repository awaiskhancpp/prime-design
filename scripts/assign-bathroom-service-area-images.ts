/**
 * Assign the uploaded bathroom-remodeling photos to their matching city cards.
 * Uses the existing per-service/per-location featured image relation.
 *
 *   pnpm exec tsx scripts/assign-bathroom-service-area-images.ts        # dry run
 *   pnpm exec tsx scripts/assign-bathroom-service-area-images.ts write  # apply
 */
import 'dotenv/config'
import { createRequire } from 'node:module'

const { Client } = createRequire(import.meta.url)('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const assignments = [
  { city: 'Silicon Valley', filename: 'Silicon Valley.png' },
  { city: 'Saratoga', filename: 'Bathroom Remodeling in Saratoga.png' },
  { city: 'Santa Clara', filename: 'Bathroom Remodeling in Santa Clara.png' },
  { city: 'Redwood City', filename: 'Bathroom Remodeling in RedWood City.png' },
  { city: 'Palo Alto', filename: 'Bathroom Remodeling in Palo Alto.png' },
  { city: 'Mountain View', filename: 'Bathroom Remodeling in Mountain View.png' },
  { city: 'Milpitas', filename: 'Bathroom Remodeling in Milpitas.png' },
  { city: 'Menlo Park', filename: 'Bathroom Remodeling in Menlo Park.png' },
  { city: 'Los Gatos', filename: 'Bathroom Remodeling in Los Gatos.png' },
  { city: 'Los Altos', filename: 'Bathroom Remodeling in Los Altos.png' },
  { city: 'Fremont', filename: 'Bathroom Remodeling in Fremont.png' },
  { city: 'Cupertino', filename: 'Bathroom Remodeling in Cupertino.png' },
  { city: 'Campbell', filename: 'Bathroom Remodeling in Campbell.png' },
  { city: 'Sunnyvale', filename: 'Bathroom Remodeling in SunnyVale.png' },
] as const

const normalizeFilename = (filename: string) => filename.toLowerCase().replace(/\.[^.]+$/, '').replace(/-\d+$/, '')
const write = process.argv[2] === 'write'
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

try {
  const serviceResult = await client.query<{ id: number }>(
    'SELECT id FROM services WHERE slug = $1',
    ['bathroom-remodeling'],
  )
  if (serviceResult.rowCount !== 1) {
    throw new Error(`Expected exactly one bathroom-remodeling service, found ${serviceResult.rowCount}. No images were changed.`)
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

  const mediaResult = await client.query<{ id: number; filename: string | null; created_at: Date }>(
    `SELECT id, filename, created_at FROM media
      WHERE filename IS NOT NULL
      ORDER BY created_at DESC`,
  )
  const plan: Array<{
    city: string
    recordId: number
    mediaId: number
    filename: string
    createdAt: Date
    currentMediaId: number | null
  }> = []
  const problems: string[] = []

  for (const assignment of assignments) {
    const matchingRecords = recordsByCity.get(assignment.city.toLowerCase()) || []
    if (matchingRecords.length !== 1) {
      problems.push(`${assignment.city}: expected one bathroom-remodeling service-location record, found ${matchingRecords.length}`)
      continue
    }
    const expected = normalizeFilename(assignment.filename)
    const matchingMedia = mediaResult.rows.filter((media) => media.filename && normalizeFilename(media.filename) === expected)
    if (!matchingMedia.length) {
      problems.push(`${assignment.city}: uploaded media matching "${assignment.filename}" was not found`)
      continue
    }
    const media = matchingMedia[0]
    plan.push({
      city: assignment.city,
      recordId: matchingRecords[0].id,
      mediaId: media.id,
      filename: media.filename || '(filename unavailable)',
      createdAt: media.created_at,
      currentMediaId: matchingRecords[0].current_media_id,
    })
  }

  if (problems.length) {
    console.error('Preflight failed; no images were changed:')
    problems.forEach((problem) => console.error(`  - ${problem}`))
    process.exitCode = 1
  } else {
    console.table(
      plan.map(({ city, mediaId, filename, createdAt, currentMediaId }) => ({
        City: city,
        'New media ID': mediaId,
        'Payload filename': filename,
        'Uploaded at': createdAt,
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
                SET featured_image_id = $1, updated_at = NOW()
              WHERE id = $2 AND service_id = $3`,
            [item.mediaId, item.recordId, serviceId],
          )
          if (result.rowCount !== 1) throw new Error(`Expected to update one record for ${item.city}, updated ${result.rowCount}`)
        }
        await client.query('COMMIT')
        console.log('Bathroom service-area images assigned.')
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
