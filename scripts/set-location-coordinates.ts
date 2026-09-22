/**
 * Seeds `locations.latitude` / `locations.longitude` — the coverage map's pins.
 *
 *   npx tsx scripts/set-location-coordinates.ts        # report only, writes nothing
 *   npx tsx scripts/set-location-coordinates.ts write  # apply
 *
 * The 14 city values are the ones that were already driving the map from the
 * hardcoded `CITY_COORDS` table in `LandscapingServiceAreas` — moved into the
 * CMS, not re-derived, so no pin shifts.
 *
 * "Silicon Valley" is the 15th service area and the reason the map showed 14
 * pins for 15 badges: it is the region, not a city, so the city table had no
 * entry for it and the marker list silently filtered it out. It has no
 * "correct" city coordinate, so one was chosen deliberately — see the note on
 * the value below.
 */
import dotenv from 'dotenv'
dotenv.config()

const { getPayload } = await import('payload')
const configPromise = (await import('@payload-config')).default
const payload = await getPayload({ config: configPromise })

const COORDS: Record<string, [number, number]> = {
  'San Jose': [37.3382, -121.8863],
  'Santa Clara': [37.3541, -121.9552],
  Sunnyvale: [37.3688, -122.0363],
  'Mountain View': [37.3861, -122.0839],
  'Palo Alto': [37.4419, -122.143],
  'Menlo Park': [37.453, -122.1817],
  'Redwood City': [37.4852, -122.2364],
  Cupertino: [37.3229, -122.0322],
  'Los Altos': [37.3852, -122.1141],
  'Los Gatos': [37.2358, -121.9624],
  Saratoga: [37.2638, -122.023],
  Campbell: [37.2872, -121.95],
  Milpitas: [37.4323, -121.8996],
  Fremont: [37.5485, -121.9886],

  // The region itself. Placed at Moffett Park, Sunnyvale — the most central
  // point in the service footprint that still clears every city pin by 6km
  // (nearest are Sunnyvale at 6.0km and Mountain View at 6.6km), so the 15th
  // teardrop reads as its own marker instead of stacking on a neighbour. The
  // true centroid of the 14 cities, 37.3788/-122.0352, sits 1.1km from
  // Sunnyvale and would have collided. Editable in the admin like any other.
  'Silicon Valley': [37.4224, -122.0252],
}

const write = process.argv[2] === 'write'

const { docs } = await payload.find({ collection: 'locations', limit: 300, sort: 'name', depth: 0 })

let updated = 0
const missing: string[] = []

for (const doc of docs as Array<{
  id: number | string
  name: string
  latitude?: number | null
  longitude?: number | null
}>) {
  const coords = COORDS[doc.name]
  if (!coords) {
    missing.push(doc.name)
    continue
  }
  const [latitude, longitude] = coords
  if (doc.latitude === latitude && doc.longitude === longitude) {
    console.log(`  = ${doc.name} already ${latitude}, ${longitude}`)
    continue
  }
  console.log(
    `  ${write ? '→' : '·'} ${doc.name}: ${doc.latitude ?? '—'}, ${doc.longitude ?? '—'} => ${latitude}, ${longitude}`,
  )
  if (write) {
    await payload.update({ collection: 'locations', id: doc.id, data: { latitude, longitude } })
    updated++
  }
}

// Same habit as the other migration scripts: name the gaps, never paper over
// them. A location listed here has no pin and will be reported by the section.
if (missing.length) {
  console.log(`\n!! ${missing.length} location(s) with no coordinate in this script:`)
  missing.forEach((name) => console.log(`     ${name}`))
}

console.log(`\n${write ? `Updated ${updated} location(s).` : 'Dry run — pass "write" to apply.'}`)
process.exit(0)
