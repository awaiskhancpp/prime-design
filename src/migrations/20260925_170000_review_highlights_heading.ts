import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `pages_blocks_review_highlights.eyebrow` / `.heading`.
 *
 * The Review Highlights strip had no heading of its own. On the Testimonials
 * page it was introduced by a separate Testimonials Spotlight section sitting
 * underneath it, whose eyebrow ("Testimonials that Matter") and heading ("Real
 * Results, Real People") were really describing these reviews. That section is
 * being removed from the page, so its heading moves up to the section it
 * introduces, centred above the badges and the platform tabs.
 *
 * `scripts/move-spotlight-heading.ts` carries the values across and takes the
 * spotlight block off the page.
 *
 * Additive. Hand-written for the reason in §8b of CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_review_highlights"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar,
      ADD COLUMN IF NOT EXISTS "heading" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_review_highlights"
      DROP COLUMN IF EXISTS "eyebrow",
      DROP COLUMN IF EXISTS "heading";
  `)
}
