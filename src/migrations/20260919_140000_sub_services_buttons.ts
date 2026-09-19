import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The sub-services section's two calls to action.
 *
 * WordPress puts a pair of buttons beside these headings — "View our gallery"
 * and "Talk to an expert" on both the Kitchen ("Choose a Kitchen That
 * Reflects Your Unique Style and Vision.") and Bathroom ("Witness the Beauty
 * of Our Bathroom Transformations") sections. `ServiceOfferingsSection`
 * already accepted `primaryCta`/`secondaryCta` props, but the block had no
 * fields to hold them, so nothing was ever passed and the buttons were
 * silently dropped in the migration.
 *
 * Both tables, because `blocks/LandingPageBlocks.ts` is shared between the
 * Landing Pages and Services collections — Payload suffixes the services
 * side to `sub_services_2` because Services also defines its own
 * `sub-services`. Migrating one side alone previously broke every query
 * against the other (see `20260917_192000_services_shared_landing_blocks`).
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */

const TABLES = ['services_blocks_sub_services_2', 'landing_pages_blocks_sub_services']
const COLUMNS = [
  'primary_cta_label',
  'primary_cta_href',
  'secondary_cta_label',
  'secondary_cta_href',
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of TABLES)
    for (const column of COLUMNS)
      await db.execute(
        sql.raw(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" varchar;`),
      )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of TABLES)
    for (const column of COLUMNS)
      await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${column}";`))
}
