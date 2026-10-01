import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Store the city pages' repeated sections once.
 *
 * Measured on the data before writing this: across all 45 service-location
 * records, the quote, the Silicon Valley Loves section, the Prime Difference
 * section (eyebrow, heading, paragraph, the 4 reason cards, the 5-item
 * checklist), the three testimonial cards, and the "Don't Settle" eyebrow,
 * button and photo plus the video URL, poster and tagline each held exactly
 * one value. The "Don't Settle" heading, accent and paragraph and the video
 * eyebrow, title and description held one value per service family (kitchen,
 * bathroom, home) — constant across that family's 15 cities.
 *
 * So:
 * 1. The company-wide values go into the Shared Sections global, copied from
 *    one city (they are the same on all of them).
 * 2. The per-family values go into each service's City Page Defaults.
 * 3. A city's own value is cleared only where it equals what the page will now
 *    inherit — the service's value when the service has one, otherwise the
 *    shared one. Anything a city says differently stays on that city.
 *
 * The page resolves each field city → service → shared, so every page renders
 * exactly what it rendered before; it is just stored once.
 */

const FAMILY_FIELDS = [
  'dont_settle_heading',
  'dont_settle_heading_accent',
  'dont_settle_body',
  'location_video_eyebrow',
  'location_video_title',
  'location_video_description',
] as const

const SHARED_FIELDS = [
  'dont_settle_eyebrow',
  'dont_settle_cta_label',
  'dont_settle_image_id',
  'location_video_tagline',
  'location_video_video_url',
  'location_video_poster_id',
  'quote_heading',
  'quote_quote',
  'quote_attribution',
  'quote_image_id',
  'prime_difference_eyebrow',
  'prime_difference_heading',
  'prime_difference_body',
  'silicon_valley_loves_eyebrow',
  'silicon_valley_loves_heading',
  'silicon_valley_loves_body',
  'silicon_valley_loves_image_id',
] as const

/** City fields that the parent service can also set (its own quote / Silicon Valley Loves). */
const SERVICE_HAS = new Set<string>([
  ...FAMILY_FIELDS,
  'dont_settle_eyebrow',
  'dont_settle_cta_label',
  'dont_settle_image_id',
  'location_video_tagline',
  'location_video_video_url',
  'location_video_poster_id',
  'quote_heading',
  'quote_quote',
  'quote_attribution',
  'quote_image_id',
  'silicon_valley_loves_eyebrow',
  'silicon_valley_loves_heading',
  'silicon_valley_loves_body',
  'silicon_valley_loves_image_id',
])

const newId = `substr(md5(random()::text || clock_timestamp()::text), 1, 24)`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const { rows: sources } = await db.execute(
    sql`SELECT "id" FROM "service_locations" ORDER BY "id" LIMIT 1`,
  )
  if (!sources.length) return
  const sourceId = Number(sources[0].id)

  // 1. The global row, from one city.
  await db.execute(
    sql.raw(`
      INSERT INTO "shared_sections" (${SHARED_FIELDS.map((c) => `"${c}"`).join(', ')}, "updated_at", "created_at")
      SELECT ${SHARED_FIELDS.map((c) => `"${c}"`).join(', ')}, now(), now()
      FROM "service_locations" WHERE "id" = ${sourceId}
      AND NOT EXISTS (SELECT 1 FROM "shared_sections");
    `),
  )
  const { rows: shared } = await db.execute(sql`SELECT "id" FROM "shared_sections" LIMIT 1`)
  const sharedId = Number(shared[0].id)

  await db.execute(
    sql.raw(`
      INSERT INTO "shared_sections_prime_difference_reasons" ("_order", "_parent_id", "id", "title", "description", "image")
      SELECT "_order", ${sharedId}, ${newId}, "title", "description", "image"
      FROM "service_locations_prime_difference_reasons" WHERE "_parent_id" = ${sourceId}
      AND NOT EXISTS (SELECT 1 FROM "shared_sections_prime_difference_reasons");

      INSERT INTO "shared_sections_prime_difference_checklist" ("_order", "_parent_id", "id", "text")
      SELECT "_order", ${sharedId}, ${newId}, "text"
      FROM "service_locations_prime_difference_checklist" WHERE "_parent_id" = ${sourceId}
      AND NOT EXISTS (SELECT 1 FROM "shared_sections_prime_difference_checklist");

      INSERT INTO "shared_sections_rels" ("order", "parent_id", "path", "testimonials_id")
      SELECT "order", ${sharedId}, "path", "testimonials_id"
      FROM "service_locations_rels"
      WHERE "parent_id" = ${sourceId} AND "path" = 'testimonialCards.testimonials'
      AND NOT EXISTS (SELECT 1 FROM "shared_sections_rels");
    `),
  )

  // 2. Per-family defaults on each service, from its own cities (one value each).
  for (const column of FAMILY_FIELDS) {
    await db.execute(
      sql.raw(`
        UPDATE "services" s SET "${column}" = v.value
        FROM (
          SELECT "service_id", min("${column}") AS value
          FROM "service_locations" GROUP BY "service_id"
          HAVING count(DISTINCT "${column}") = 1
        ) v
        WHERE s."id" = v."service_id" AND s."${column}" IS NULL;
      `),
    )
  }

  // What every city page shows today, to prove afterwards that none changed.
  await db.execute(
    sql.raw(`
      CREATE TEMP TABLE "city_before" ON COMMIT DROP AS
      SELECT "id", ${[...FAMILY_FIELDS, ...SHARED_FIELDS].map((c) => `"${c}"`).join(', ')} FROM "service_locations";
    `),
  )

  // 3. Clear each city value that equals what the page now inherits.
  for (const column of [...FAMILY_FIELDS, ...SHARED_FIELDS]) {
    const sharedValue = (SHARED_FIELDS as readonly string[]).includes(column)
      ? `g."${column}"`
      : 'NULL'
    const inherited = SERVICE_HAS.has(column)
      ? `COALESCE(s."${column}", ${sharedValue})`
      : sharedValue
    await db.execute(
      sql.raw(`
        UPDATE "service_locations" sl SET "${column}" = NULL
        FROM "services" s, "shared_sections" g
        WHERE s."id" = sl."service_id" AND g."id" = ${sharedId}
          AND sl."${column}" IS NOT NULL
          AND sl."${column}" = ${inherited};
      `),
    )
  }

  // Arrays: a city's reason cards, checklist and testimonial cards go only if
  // they are identical to the shared ones (services carry none of these).
  await db.execute(
    sql.raw(`
      WITH shared_reasons AS (
        SELECT string_agg("_order" || '|' || "title" || '|' || coalesce("image", '') || '|' || md5(coalesce("description"::text, '')), '#' ORDER BY "_order") AS sig
        FROM "shared_sections_prime_difference_reasons" WHERE "_parent_id" = ${sharedId}
      ),
      city_reasons AS (
        SELECT "_parent_id", string_agg("_order" || '|' || "title" || '|' || coalesce("image", '') || '|' || md5(coalesce("description"::text, '')), '#' ORDER BY "_order") AS sig
        FROM "service_locations_prime_difference_reasons" GROUP BY "_parent_id"
      )
      DELETE FROM "service_locations_prime_difference_reasons" r
      USING city_reasons c, shared_reasons g
      WHERE r."_parent_id" = c."_parent_id" AND c.sig = g.sig;

      WITH shared_items AS (
        SELECT string_agg("_order" || '|' || coalesce("text", ''), '#' ORDER BY "_order") AS sig
        FROM "shared_sections_prime_difference_checklist" WHERE "_parent_id" = ${sharedId}
      ),
      city_items AS (
        SELECT "_parent_id", string_agg("_order" || '|' || coalesce("text", ''), '#' ORDER BY "_order") AS sig
        FROM "service_locations_prime_difference_checklist" GROUP BY "_parent_id"
      )
      DELETE FROM "service_locations_prime_difference_checklist" r
      USING city_items c, shared_items g
      WHERE r."_parent_id" = c."_parent_id" AND c.sig = g.sig;

      WITH shared_cards AS (
        SELECT string_agg("order" || '|' || "testimonials_id", '#' ORDER BY "order") AS sig
        FROM "shared_sections_rels" WHERE "parent_id" = ${sharedId} AND "path" = 'testimonialCards.testimonials'
      ),
      city_cards AS (
        SELECT "parent_id", string_agg("order" || '|' || "testimonials_id", '#' ORDER BY "order") AS sig
        FROM "service_locations_rels" WHERE "path" = 'testimonialCards.testimonials' GROUP BY "parent_id"
      )
      DELETE FROM "service_locations_rels" r
      USING city_cards c, shared_cards g
      WHERE r."parent_id" = c."parent_id" AND r."path" = 'testimonialCards.testimonials' AND c.sig = g.sig;
    `),
  )

  // Nothing a city page shows may change: each city's resolved value
  // (own → service → shared) must equal what it held before.
  const mismatches = [...FAMILY_FIELDS, ...SHARED_FIELDS].map((column) => {
    const sharedValue = (SHARED_FIELDS as readonly string[]).includes(column)
      ? `g."${column}"`
      : 'NULL'
    const inherited = SERVICE_HAS.has(column)
      ? `COALESCE(s."${column}", ${sharedValue})`
      : sharedValue
    return `(SELECT count(*) FROM "service_locations" sl
              JOIN "services" s ON s."id" = sl."service_id"
              JOIN "city_before" b ON b."id" = sl."id"
              CROSS JOIN "shared_sections" g
             WHERE COALESCE(sl."${column}", ${inherited}) IS DISTINCT FROM b."${column}")`
  })
  const { rows: changed } = await db.execute(
    sql.raw(`SELECT (${mismatches.join(' + ')})::int AS n`),
  )
  if (Number(changed[0].n) > 0) {
    throw new Error(
      `shared_sections_content: ${changed[0].n} city field(s) would render differently; nothing was changed`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Put the shared values back on every city page, so the global can be
  // removed without a page losing its copy.
  const columns = [...FAMILY_FIELDS, ...SHARED_FIELDS]
  for (const column of columns) {
    const sharedValue = (SHARED_FIELDS as readonly string[]).includes(column)
      ? `g."${column}"`
      : 'NULL'
    const inherited = SERVICE_HAS.has(column)
      ? `COALESCE(s."${column}", ${sharedValue})`
      : sharedValue
    await db.execute(
      sql.raw(`
        UPDATE "service_locations" sl SET "${column}" = ${inherited}
        FROM "services" s, "shared_sections" g
        WHERE s."id" = sl."service_id" AND sl."${column}" IS NULL;
      `),
    )
  }
  await db.execute(
    sql.raw(`
      INSERT INTO "service_locations_prime_difference_reasons" ("_order", "_parent_id", "id", "title", "description", "image")
      SELECT r."_order", sl."id", ${newId}, r."title", r."description", r."image"
      FROM "service_locations" sl CROSS JOIN "shared_sections_prime_difference_reasons" r
      WHERE NOT EXISTS (SELECT 1 FROM "service_locations_prime_difference_reasons" x WHERE x."_parent_id" = sl."id");

      INSERT INTO "service_locations_prime_difference_checklist" ("_order", "_parent_id", "id", "text")
      SELECT r."_order", sl."id", ${newId}, r."text"
      FROM "service_locations" sl CROSS JOIN "shared_sections_prime_difference_checklist" r
      WHERE NOT EXISTS (SELECT 1 FROM "service_locations_prime_difference_checklist" x WHERE x."_parent_id" = sl."id");

      INSERT INTO "service_locations_rels" ("order", "parent_id", "path", "testimonials_id")
      SELECT r."order", sl."id", r."path", r."testimonials_id"
      FROM "service_locations" sl CROSS JOIN "shared_sections_rels" r
      WHERE r."path" = 'testimonialCards.testimonials'
        AND NOT EXISTS (SELECT 1 FROM "service_locations_rels" x WHERE x."parent_id" = sl."id" AND x."path" = r."path");
    `),
  )
}
