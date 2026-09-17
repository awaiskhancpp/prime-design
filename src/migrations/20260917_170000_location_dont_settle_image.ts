import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds `service_locations.dont_settle_image`.
 *
 * The "Don't Settle for a Mediocre …" section had no image field, so
 * `ServiceLocationPage` fell back to `service.image` — which on a location page
 * resolves to that city's featured marketing graphic. WordPress uses a single
 * photo there on all three family templates (attachment 579, `11.png`), which
 * the original migration never imported.
 *
 * Text rather than an upload relation, matching the sibling `quote.image` and
 * `siliconValleyLoves.image` fields on the same collection.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "service_locations" ADD COLUMN IF NOT EXISTS "dont_settle_image" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "service_locations" DROP COLUMN IF EXISTS "dont_settle_image";`)
}
