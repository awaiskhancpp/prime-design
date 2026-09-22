import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `locations.latitude` / `locations.longitude` — where each service area's pin
 * sits on the coverage map.
 *
 * Until now the coordinates lived in `CITY_COORDS`, a hardcoded lookup in
 * `LandscapingServiceAreas` keyed by city *name*, and the marker list was
 * built with `.filter((city) => CITY_COORDS[city])`. Any area the table had
 * no entry for was dropped without a word: SiteSettings lists 15 service
 * areas, the table knew 14 of them, and "Silicon Valley" — the one entry that
 * is a region rather than a city — never reached the map. The section
 * rendered 15 badges beside 14 pins.
 *
 * Making this a real Payload field is what lets the count be fixed at all:
 * the region has no "city coordinate" to look up, so it needs an editable one.
 *
 * Written by hand rather than generated — see §8b of CLAUDE.md, which blocks
 * `migrate:create` until a baseline snapshot is restored. Values are seeded by
 * `scripts/set-location-coordinates.ts`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "latitude" numeric;
  `)
  await db.execute(sql`
    ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "longitude" numeric;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "locations" DROP COLUMN IF EXISTS "longitude";`)
  await db.execute(sql`ALTER TABLE "locations" DROP COLUMN IF EXISTS "latitude";`)
}
