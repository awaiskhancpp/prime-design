import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Baseline: make the database match the Payload config exactly, and ship the
 * schema snapshot `migrate:create` diffs against.
 *
 * Every migration after `20260914_180701_video_story_fields` was hand-written
 * SQL with no `.json` snapshot, so `migrate:create` was diffing the config
 * against a snapshot that knew nothing about ~55 migrations' worth of tables
 * (CLAUDE.md §8b). The `.json` next to this file is the config's own snapshot,
 * generated without emitting SQL (`scripts/schema-drift.ts --write-snapshot`),
 * so from here on `migrate:create` diffs against the real current schema.
 *
 * `scripts/schema-drift.ts`, run against a restored copy of production, found
 * the database and config disagreeing in the ways fixed below. None loses
 * data: every row already satisfies the new constraints, the two `variant`
 * columns only hold `outline`/`brass`, and no contact submission has source
 * `appointment`.
 *
 * - 14 indexes the config declares but the hand-written SQL left out.
 * - `services_silicon_valley_loves_buttons.variant` and
 *   `site_settings_trust_intro_buttons.variant` were varchar; the config's
 *   `select` field makes them enums.
 * - The same buttons' `label`/`url` are `required`, i.e. NOT NULL; so is the
 *   navigation global's privacy-policy page.
 * - `enum_contact_submissions_source` still had `appointment`, removed from the
 *   field when bookings moved to the `appointments` collection.
 *
 * Tables and columns the database has but the config no longer defines are
 * deliberately left alone here — dropping them loses data and is its own,
 * separately approved change.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "services_hero_hero_image_secondary_idx" ON "services" USING btree ("hero_image_secondary_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_difference_videos_poster_idx" ON "pages_blocks_difference_videos" USING btree ("poster_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonial_videos_videos_video_idx" ON "pages_blocks_testimonial_videos_videos" USING btree ("video_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonial_videos_videos_poster_idx" ON "pages_blocks_testimonial_videos_videos" USING btree ("poster_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_review_highlights_badges_image_idx" ON "pages_blocks_review_highlights_badges" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "site_settings_trust_intro_stats_parent_id_idx" ON "site_settings_trust_intro_stats" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_settings_trust_intro_buttons_parent_id_idx" ON "site_settings_trust_intro_buttons" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_settings_reviews_reviews_google_icon_idx" ON "site_settings" USING btree ("reviews_google_icon_id");
    CREATE INDEX IF NOT EXISTS "site_settings_reviews_reviews_yelp_icon_idx" ON "site_settings" USING btree ("reviews_yelp_icon_id");
    CREATE INDEX IF NOT EXISTS "site_settings_trust_intro_trust_intro_image_idx" ON "site_settings" USING btree ("trust_intro_image_id");
    CREATE INDEX IF NOT EXISTS "booking_settings_slots_order_idx" ON "booking_settings_slots" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "booking_settings_closed_weekdays_order_idx" ON "booking_settings_closed_weekdays" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "booking_settings_closed_dates_order_idx" ON "booking_settings_closed_dates" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "booking_settings_date_capacities_order_idx" ON "booking_settings_date_capacities" USING btree ("_order");

    DO $$ BEGIN
      CREATE TYPE "public"."enum_services_silicon_valley_loves_buttons_variant" AS ENUM('outline', 'brass');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_settings_trust_intro_buttons_variant" AS ENUM('outline', 'brass');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "services_silicon_valley_loves_buttons" ALTER COLUMN "variant" DROP DEFAULT;
    ALTER TABLE "services_silicon_valley_loves_buttons"
      ALTER COLUMN "variant" SET DATA TYPE "public"."enum_services_silicon_valley_loves_buttons_variant"
      USING "variant"::"public"."enum_services_silicon_valley_loves_buttons_variant";
    ALTER TABLE "services_silicon_valley_loves_buttons" ALTER COLUMN "variant" SET DEFAULT 'outline';
    ALTER TABLE "services_silicon_valley_loves_buttons" ALTER COLUMN "label" SET NOT NULL;
    ALTER TABLE "services_silicon_valley_loves_buttons" ALTER COLUMN "url" SET NOT NULL;

    ALTER TABLE "site_settings_trust_intro_buttons" ALTER COLUMN "variant" DROP DEFAULT;
    ALTER TABLE "site_settings_trust_intro_buttons"
      ALTER COLUMN "variant" SET DATA TYPE "public"."enum_site_settings_trust_intro_buttons_variant"
      USING "variant"::"public"."enum_site_settings_trust_intro_buttons_variant";
    ALTER TABLE "site_settings_trust_intro_buttons" ALTER COLUMN "variant" SET DEFAULT 'outline';
    ALTER TABLE "site_settings_trust_intro_buttons" ALTER COLUMN "label" SET NOT NULL;
    ALTER TABLE "site_settings_trust_intro_buttons" ALTER COLUMN "url" SET NOT NULL;

    ALTER TABLE "navigation" ALTER COLUMN "footer_privacy_policy_page_id" SET NOT NULL;

    ALTER TYPE "public"."enum_contact_submissions_source" RENAME TO "enum_contact_submissions_source_old";
    CREATE TYPE "public"."enum_contact_submissions_source" AS ENUM('contact-page', 'service-page', 'location-page', 'landing-page', 'other');
    ALTER TABLE "contact_submissions" ALTER COLUMN "source" DROP DEFAULT;
    ALTER TABLE "contact_submissions"
      ALTER COLUMN "source" SET DATA TYPE "public"."enum_contact_submissions_source"
      USING "source"::text::"public"."enum_contact_submissions_source";
    ALTER TABLE "contact_submissions" ALTER COLUMN "source" SET DEFAULT 'contact-page';
    DROP TYPE "public"."enum_contact_submissions_source_old";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_contact_submissions_source" ADD VALUE IF NOT EXISTS 'appointment';

    ALTER TABLE "navigation" ALTER COLUMN "footer_privacy_policy_page_id" DROP NOT NULL;

    ALTER TABLE "site_settings_trust_intro_buttons" ALTER COLUMN "url" DROP NOT NULL;
    ALTER TABLE "site_settings_trust_intro_buttons" ALTER COLUMN "label" DROP NOT NULL;
    ALTER TABLE "site_settings_trust_intro_buttons" ALTER COLUMN "variant" DROP DEFAULT;
    ALTER TABLE "site_settings_trust_intro_buttons" ALTER COLUMN "variant" SET DATA TYPE varchar USING "variant"::text;
    ALTER TABLE "site_settings_trust_intro_buttons" ALTER COLUMN "variant" SET DEFAULT 'outline';

    ALTER TABLE "services_silicon_valley_loves_buttons" ALTER COLUMN "url" DROP NOT NULL;
    ALTER TABLE "services_silicon_valley_loves_buttons" ALTER COLUMN "label" DROP NOT NULL;
    ALTER TABLE "services_silicon_valley_loves_buttons" ALTER COLUMN "variant" DROP DEFAULT;
    ALTER TABLE "services_silicon_valley_loves_buttons" ALTER COLUMN "variant" SET DATA TYPE varchar USING "variant"::text;
    ALTER TABLE "services_silicon_valley_loves_buttons" ALTER COLUMN "variant" SET DEFAULT 'outline';

    DROP TYPE IF EXISTS "public"."enum_site_settings_trust_intro_buttons_variant";
    DROP TYPE IF EXISTS "public"."enum_services_silicon_valley_loves_buttons_variant";

    DROP INDEX IF EXISTS "booking_settings_date_capacities_order_idx";
    DROP INDEX IF EXISTS "booking_settings_closed_dates_order_idx";
    DROP INDEX IF EXISTS "booking_settings_closed_weekdays_order_idx";
    DROP INDEX IF EXISTS "booking_settings_slots_order_idx";
    DROP INDEX IF EXISTS "site_settings_trust_intro_trust_intro_image_idx";
    DROP INDEX IF EXISTS "site_settings_reviews_reviews_yelp_icon_idx";
    DROP INDEX IF EXISTS "site_settings_reviews_reviews_google_icon_idx";
    DROP INDEX IF EXISTS "site_settings_trust_intro_buttons_parent_id_idx";
    DROP INDEX IF EXISTS "site_settings_trust_intro_stats_parent_id_idx";
    DROP INDEX IF EXISTS "pages_blocks_review_highlights_badges_image_idx";
    DROP INDEX IF EXISTS "pages_blocks_testimonial_videos_videos_poster_idx";
    DROP INDEX IF EXISTS "pages_blocks_testimonial_videos_videos_video_idx";
    DROP INDEX IF EXISTS "pages_blocks_difference_videos_poster_idx";
    DROP INDEX IF EXISTS "services_hero_hero_image_secondary_idx";
  `)
}
