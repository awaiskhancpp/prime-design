import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Service-location pages: the Prime Difference prose becomes rich text, and
 * the Offerings section gets its own two buttons.
 *
 * ── Rich text ─────────────────────────────────────────────────────────────
 *
 * `primeDifference.body` and `primeDifference.reasons[].description` were
 * `varchar`. The WordPress original emphasises a phrase inside that paragraph
 * ("we are the <b>unrivaled experts</b>") and a plain string cannot carry it,
 * so both become `jsonb` holding a Lexical document.
 *
 * The body column has real copy in all 45 rows, so it is not retyped in place
 * — the existing sentence is wrapped into a one-paragraph Lexical document by
 * the UPDATE below, and only then does the old column go. `description` is
 * null in all 180 reason rows (WordPress never had card copy on these pages),
 * but it is converted the same way rather than dropped and re-added, so a row
 * that did somehow carry text keeps it.
 *
 * ── Offerings buttons ─────────────────────────────────────────────────────
 *
 * `ServiceLocationPage` hardcoded a single "Talk to an expert" button. The
 * live original carries two — "View our gallery" (→ /gallery) and "Talk to an
 * expert" (→ #contact) — and neither was editable. These columns give the
 * record its own pair; `scripts/seed-location-prime-difference.ts` fills them.
 */

/** Wraps a plain string column into a Payload/Lexical rich-text document. */
const lexicalFromColumn = (column: string) =>
  sql.raw(`
  jsonb_build_object(
    'root', jsonb_build_object(
      'type', 'root',
      'format', '',
      'indent', 0,
      'version', 1,
      'direction', 'ltr',
      'children', jsonb_build_array(
        jsonb_build_object(
          'type', 'paragraph',
          'format', '',
          'indent', 0,
          'version', 1,
          'direction', 'ltr',
          'children', jsonb_build_array(
            jsonb_build_object(
              'mode', 'normal',
              'text', ${column},
              'type', 'text',
              'style', '',
              'detail', 0,
              'format', 0,
              'version', 1
            )
          )
        )
      )
    )
  )
`)

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ---- primeDifference.body : varchar -> jsonb (content preserved) --------
  await db.execute(sql`
    ALTER TABLE "service_locations"
      ADD COLUMN IF NOT EXISTS "prime_difference_body_rich" jsonb;
  `)
  await db.execute(sql`
    UPDATE "service_locations"
       SET "prime_difference_body_rich" = ${lexicalFromColumn('"prime_difference_body"')}
     WHERE "prime_difference_body" IS NOT NULL
       AND "prime_difference_body" <> ''
       AND "prime_difference_body_rich" IS NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "service_locations" DROP COLUMN IF EXISTS "prime_difference_body";
  `)
  await db.execute(sql`
    ALTER TABLE "service_locations"
      RENAME COLUMN "prime_difference_body_rich" TO "prime_difference_body";
  `)

  // ---- reasons[].description : varchar -> jsonb ---------------------------
  await db.execute(sql`
    ALTER TABLE "service_locations_prime_difference_reasons"
      ADD COLUMN IF NOT EXISTS "description_rich" jsonb;
  `)
  await db.execute(sql`
    UPDATE "service_locations_prime_difference_reasons"
       SET "description_rich" = ${lexicalFromColumn('"description"')}
     WHERE "description" IS NOT NULL
       AND "description" <> ''
       AND "description_rich" IS NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "service_locations_prime_difference_reasons" DROP COLUMN IF EXISTS "description";
  `)
  await db.execute(sql`
    ALTER TABLE "service_locations_prime_difference_reasons"
      RENAME COLUMN "description_rich" TO "description";
  `)

  // ---- offerings buttons --------------------------------------------------
  await db.execute(sql`
    ALTER TABLE "service_locations"
      ADD COLUMN IF NOT EXISTS "offerings_primary_cta_label" varchar,
      ADD COLUMN IF NOT EXISTS "offerings_primary_cta_href" varchar,
      ADD COLUMN IF NOT EXISTS "offerings_secondary_cta_label" varchar,
      ADD COLUMN IF NOT EXISTS "offerings_secondary_cta_href" varchar;
  `)
}

/**
 * Reverses the shape, not the editing.
 *
 * Going back to `varchar` can only keep the plain text of a rich-text value,
 * so any bold, link or second paragraph an editor added is flattened to its
 * words here. That is the honest cost of the rollback; the alternative —
 * dropping the column — would lose the sentence entirely.
 */
const plainFromLexical = (column: string) =>
  sql.raw(`
  NULLIF(
    (
      SELECT string_agg(child ->> 'text', '')
        FROM jsonb_array_elements(${column} -> 'root' -> 'children') AS block,
             jsonb_array_elements(block -> 'children') AS child
       WHERE child ->> 'type' = 'text'
    ),
    ''
  )
`)

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "service_locations"
      ADD COLUMN IF NOT EXISTS "prime_difference_body_plain" varchar;
  `)
  await db.execute(sql`
    UPDATE "service_locations"
       SET "prime_difference_body_plain" = ${plainFromLexical('"prime_difference_body"')}
     WHERE "prime_difference_body" IS NOT NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "service_locations" DROP COLUMN IF EXISTS "prime_difference_body";
  `)
  await db.execute(sql`
    ALTER TABLE "service_locations"
      RENAME COLUMN "prime_difference_body_plain" TO "prime_difference_body";
  `)

  await db.execute(sql`
    ALTER TABLE "service_locations_prime_difference_reasons"
      ADD COLUMN IF NOT EXISTS "description_plain" varchar;
  `)
  await db.execute(sql`
    UPDATE "service_locations_prime_difference_reasons"
       SET "description_plain" = ${plainFromLexical('"description"')}
     WHERE "description" IS NOT NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "service_locations_prime_difference_reasons" DROP COLUMN IF EXISTS "description";
  `)
  await db.execute(sql`
    ALTER TABLE "service_locations_prime_difference_reasons"
      RENAME COLUMN "description_plain" TO "description";
  `)

  await db.execute(sql`
    ALTER TABLE "service_locations"
      DROP COLUMN IF EXISTS "offerings_primary_cta_label",
      DROP COLUMN IF EXISTS "offerings_primary_cta_href",
      DROP COLUMN IF EXISTS "offerings_secondary_cta_label",
      DROP COLUMN IF EXISTS "offerings_secondary_cta_href";
  `)
}
