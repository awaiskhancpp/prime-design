import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `site_settings.company.serviceRegion` — the top banner's location text.
 *
 * `TopBanner` has read this field for a while, but it was never added to the
 * config, so the banner always fell through to `website.json`'s "Silicon
 * Valley". Seeded with that same text, which is WordPress's own top-bar
 * wording (the "Silicon Valley" link beside the pin on primedesignandbuild.com),
 * so nothing visible changes — it just becomes editable.
 *
 * Generated with `migrate:create`; the seed UPDATE was added by hand.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "company_service_region" varchar;
   UPDATE "site_settings" SET "company_service_region" = 'Silicon Valley' WHERE "company_service_region" IS NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "company_service_region";`)
}
