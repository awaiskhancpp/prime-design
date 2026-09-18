import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `landing_pages_blocks_cta.heading` becomes nullable.
 *
 * Some WordPress CTA sections are a bare button band with no copy — `gyrixo`
 * on home-remodeling-information is nothing but a "Schedule A Call" button.
 * The importer satisfied the NOT NULL constraint by inventing a heading
 * ("Ready to get started?") and writing it to the database, so a fabricated
 * H2 rendered on a live ads page. Dropping the requirement lets the section
 * import as what it actually is.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_cta" ALTER COLUMN "heading" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restoring NOT NULL requires every row to have a heading. Rows that were
  // imported from a heading-less source section genuinely have none, so fill
  // them with the empty string rather than re-inventing copy.
  await db.execute(sql`
    UPDATE "landing_pages_blocks_cta" SET "heading" = '' WHERE "heading" IS NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_cta" ALTER COLUMN "heading" SET NOT NULL;
  `)
}
