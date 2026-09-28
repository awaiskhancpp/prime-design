import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Completes the analytics configuration captured from the WordPress source.
 *
 * The earlier analytics migration stored the main Google tag, Ads, Pixel,
 * Clarity, and the Nimbata number, but it did not store the separate GA4
 * destination, the exact Nimbata loader, or the Search Console token. Those
 * values are present verbatim in the supplied WordPress HTML, so this
 * backfill is safe and does not invent account credentials.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "analytics_tracking_google_analytics_id" varchar;
  `)

  await db.execute(sql`
    UPDATE "site_settings"
       SET "analytics_tracking_google_analytics_id" =
             COALESCE("analytics_tracking_google_analytics_id", 'G-TBYM3E67T2'),
           "analytics_tracking_nimbata_script" =
             COALESCE(
               "analytics_tracking_nimbata_script",
               '<script async src="//cdn.dni.nimbata.com/28126028620.min.js"></script>'
             ),
           "analytics_verification_google" =
             COALESCE(
               "analytics_verification_google",
               'USD3C-QV6qvjCQbRPquFLsFf8-vuZeVVE7GGpked_Pw'
             );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "analytics_tracking_google_analytics_id";
  `)
}
