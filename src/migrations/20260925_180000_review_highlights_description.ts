import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `pages_blocks_review_highlights.description` — an optional line under the
 * section heading.
 *
 * Added empty and left empty. The heading above it came from the Testimonials
 * Spotlight section, which also had a body ("See why our clients rave about
 * their stunning kitchens…"); that copy was not carried over, and this is the
 * field it would go in if it ever should be.
 *
 * Additive. Hand-written for the reason in §8b of CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_review_highlights" ADD COLUMN IF NOT EXISTS "description" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_review_highlights" DROP COLUMN IF EXISTS "description";
  `)
}
