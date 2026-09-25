import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `site-settings.reviews` — the platform marks and headline figures the
 * "See what people are saying about us" sections render.
 *
 * The reviews themselves were already Payload records: the `testimonials`
 * collection holds 125 of them and the sections were meant to read it. What
 * was still hardcoded were the two things around them:
 *
 *   - the source mark on each review card (`/google.webp`, `/Yelp.png` as
 *     public files), and
 *   - the headline rating and review counts, read from `website.json`.
 *
 * Both are editorial values, so both become Site Settings fields: the marks
 * are real Media documents (the google-com / yelp-com SVGs uploaded to the
 * library) and the figures are numbers an admin can correct without a deploy.
 *
 * Seeded with the values the site was already showing — the WordPress
 * review-summary counts for each platform — so nothing moves on screen.
 * `google-com.svg` and `yelp-com.svg` are media 676 and 677.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */

const MEDIA = {
  google: 676,
  yelp: 677,
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "reviews_google_icon_id" integer;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "reviews_yelp_icon_id" integer;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "reviews_google_rating" numeric;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "reviews_google_review_count" numeric;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "reviews_yelp_rating" numeric;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "reviews_yelp_review_count" numeric;
  `)

  // Added separately from the columns so a re-run after a dropped connection
  // does not fail on an existing constraint.
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_reviews_google_icon_id_media_id_fk"
        FOREIGN KEY ("reviews_google_icon_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_reviews_yelp_icon_id_media_id_fk"
        FOREIGN KEY ("reviews_yelp_icon_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)

  // Seed only where nothing has been set, so re-running never overwrites an
  // edit made in the admin.
  await db.execute(sql`
    UPDATE "site_settings"
       SET "reviews_google_icon_id" = COALESCE("reviews_google_icon_id", ${MEDIA.google}),
           "reviews_yelp_icon_id" = COALESCE("reviews_yelp_icon_id", ${MEDIA.yelp}),
           "reviews_google_rating" = COALESCE("reviews_google_rating", 4.9),
           "reviews_google_review_count" = COALESCE("reviews_google_review_count", 56),
           "reviews_yelp_rating" = COALESCE("reviews_yelp_rating", 4.9),
           "reviews_yelp_review_count" = COALESCE("reviews_yelp_review_count", 64);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_reviews_google_icon_id_media_id_fk";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_reviews_yelp_icon_id_media_id_fk";`,
  )
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "reviews_yelp_review_count";`,
  )
  await db.execute(sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "reviews_yelp_rating";`)
  await db.execute(
    sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "reviews_google_review_count";`,
  )
  await db.execute(sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "reviews_google_rating";`)
  await db.execute(sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "reviews_yelp_icon_id";`)
  await db.execute(sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "reviews_google_icon_id";`)
}
