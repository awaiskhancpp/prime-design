import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `testimonials.source_url` and `.quote_is_excerpt`.
 *
 * Yelp's API returns a ~160-character excerpt of a review, never the whole
 * thing, so 47 of the 49 Yelp reviews here end mid-sentence in "...". The
 * WordPress site shows the identical truncated text — its review plugin reads
 * the same API — and no fuller copy exists in the export, the page markup or
 * anywhere else we can reach. Google's API returns full reviews, and all 76
 * Google records are complete.
 *
 * So a truncated review gets a link to itself on Yelp instead of a dead
 * ellipsis, and a flag saying its text is an excerpt. Paste the full text into
 * `quote` and untick the flag and the card stops being a stub.
 *
 * Additive. Hand-written for the reason in §8b of CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "testimonials"
      ADD COLUMN IF NOT EXISTS "source_url" varchar,
      ADD COLUMN IF NOT EXISTS "quote_is_excerpt" boolean DEFAULT false;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "testimonials"
      DROP COLUMN IF EXISTS "source_url",
      DROP COLUMN IF EXISTS "quote_is_excerpt";
  `)
}
