import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `find-us` map pins — the offices' coordinates, as real fields.
 *
 * The contact band on every Google Ads landing page ended in a map. It was a
 * Google Maps embed addressed by the first line of the block's `address`
 * field: no coordinates of its own, and Google re-geocoding a postal address
 * on every page load to work out what to draw.
 *
 * That map is now drawn from OpenFreeMap's keyless tiles (see
 * `src/components/ui/LocationMap.tsx`), which — unlike the embed — needs to be
 * told where it is. Rather than geocode the address again somewhere in the
 * render path, the coordinates are stored, so `find-us` joins
 * `locations.latitude` / `locations.longitude` as a place the site reads a
 * position from Payload instead of inferring one.
 *
 * Seeded from these two addresses, as recorded in `address` on all seven
 * landing pages:
 *
 *   - `416 East Campbell Ave, Campbell CA 95008` → 37.2869225, -121.9426511
 *     (OpenStreetMap `node/13276687061`, the "Prime Design & Build" office
 *     itself)
 *   - `3 E 3rd Ave Suite 200, San Mateo, CA 94401` → 37.5631825, -122.3258967
 *     (OpenStreetMap `way/927641694`, the building at 3 East 3rd Avenue)
 *
 * Both are OpenStreetMap-derived, matching the tiles drawn underneath them.
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */

/** The two offices, in the order `address` lists them. */
const PINS: Array<{ latitude: number; longitude: number }> = [
  { latitude: 37.2869225, longitude: -121.9426511 },
  { latitude: 37.5631825, longitude: -122.3258967 },
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "landing_pages_blocks_find_us_map_pins" (
      "_order" integer NOT NULL,
      -- varchar, not integer: the parent is a block row, and blocks carry
      -- Payload's generated varchar ids. (landing_pages.id is the integer
      -- one; landing_pages_blocks_find_us.id is not.)
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "latitude" numeric,
      "longitude" numeric
    );
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "landing_pages_blocks_find_us_map_pins"
        ADD CONSTRAINT "landing_pages_blocks_find_us_map_pins_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_find_us"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_find_us_map_pins_order_idx"
      ON "landing_pages_blocks_find_us_map_pins" USING btree ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_find_us_map_pins_parent_id_idx"
      ON "landing_pages_blocks_find_us_map_pins" USING btree ("_parent_id");
  `)

  // Seed every existing `find-us` block with both offices. The parent rows are
  // the blocks themselves, so this covers all seven landing pages without
  // naming any of them — and a block added later is authored in the admin.
  for (const [order, pin] of PINS.entries()) {
    await db.execute(sql`
      INSERT INTO "landing_pages_blocks_find_us_map_pins" ("_order", "_parent_id", "id", "latitude", "longitude")
      SELECT ${order}, b."id", b."id" || '-pin-' || ${order}, ${pin.latitude}, ${pin.longitude}
        FROM "landing_pages_blocks_find_us" b
       WHERE NOT EXISTS (
         SELECT 1 FROM "landing_pages_blocks_find_us_map_pins" p
          WHERE p."_parent_id" = b."id" AND p."_order" = ${order}
       );
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "landing_pages_blocks_find_us_map_pins" CASCADE;`)
}
