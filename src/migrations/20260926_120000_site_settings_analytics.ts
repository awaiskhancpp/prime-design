import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `site-settings.analytics` — measurement, advertising, and site-verification
 * identifiers, so tags can be corrected from the admin without a deploy.
 *
 * The new site had no tracking at all: nothing in `src/` emitted a GTM
 * container, GA4, the Meta Pixel, Clarity, or any verification meta tag, and
 * the WordPress export could not supply them — those values live in
 * `wp_options`, which a WXR file does not contain.
 *
 * The tracking IDs below are the values read verbatim out of the live
 * WordPress HTML (view-source of primedesignandbuild.com). Two of them do not
 * match their platform's documented shape — `GT-TW5S8VN` has no middle
 * segment, and `AW-16669484786` carries 11 digits where 10 is typical — but
 * both are what the live site actually serves, so both are seeded as-is. The
 * field validation is deliberately structural for the same reason: rejecting
 * on length would reject a tag that is demonstrably in use.
 *
 * The verification tokens are intentionally NOT seeded. They are per-property
 * values in Google/Bing accounts and no copy exists on this machine; they are
 * left empty rather than guessed, because a wrong token verifies nothing and
 * fails silently. See the Site Verification tab in the admin.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_tracking_google_tag_manager_id" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_tracking_google_tag_id" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_tracking_google_ads_id" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_tracking_meta_pixel_id" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_tracking_clarity_project_id" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_tracking_nimbata_tracking_number" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_tracking_nimbata_script" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_verification_google" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_verification_bing" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_verification_yandex" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_verification_pinterest" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_verification_facebook_domain_verification" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_custom_head_code" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_custom_body_start_code" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_custom_body_end_code" varchar;
  `)

  // Seeded only where nothing has been set, so re-running never overwrites an
  // edit made in the admin. Google Tag Manager is left empty on purpose: the
  // live site has no container, and inventing one would double every page view.
  await db.execute(sql`
    UPDATE "site_settings"
       SET "analytics_tracking_google_tag_id" =
             COALESCE("analytics_tracking_google_tag_id", 'GT-TW5S8VN'),
           "analytics_tracking_google_ads_id" =
             COALESCE("analytics_tracking_google_ads_id", 'AW-16669484786'),
           "analytics_tracking_meta_pixel_id" =
             COALESCE("analytics_tracking_meta_pixel_id", '907561544155711'),
           "analytics_tracking_clarity_project_id" =
             COALESCE("analytics_tracking_clarity_project_id", 'p0z8k1muhv'),
           "analytics_tracking_nimbata_tracking_number" =
             COALESCE("analytics_tracking_nimbata_tracking_number", '28126028620');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_tracking_google_tag_manager_id";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_tracking_google_tag_id";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_tracking_google_ads_id";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_tracking_meta_pixel_id";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_tracking_clarity_project_id";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_tracking_nimbata_tracking_number";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_tracking_nimbata_script";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_verification_google";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_verification_bing";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_verification_yandex";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_verification_pinterest";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_verification_facebook_domain_verification";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_custom_head_code";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_custom_body_start_code";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_custom_body_end_code";`,
  )
}
