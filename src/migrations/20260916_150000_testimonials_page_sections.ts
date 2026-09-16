import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Testimonials page → Pages collection.
 *
 * The /testimonials page was built entirely from code: copy inline in
 * `TestimonialsPage.tsx`, review cards in `src/lib/testimonials.ts`, and the
 * video wall plus rating counts in `website.json`. It now becomes an ordinary
 * record in the Pages collection (slug `testimonials`), like the homepage,
 * About and Gallery pages.
 *
 * Three section blocks are added, mirroring how WordPress builds the page:
 *
 *  - `testimonial-videos`   the video wall (WP: seven `<video>` elements).
 *  - `review-highlights`    the rating badges and per-platform score/count.
 *                           WordPress renders this from a third-party plugin
 *                           shortcode (`[brb_collection id="1223"]`), so the
 *                           numbers live here rather than being scraped into
 *                           a JSON file.
 *  - `testimonials-spotlight` the review marquee's own copy only. WordPress
 *                           fills its slider from a query loop over the
 *                           `testimonial` post type, so the cards come from
 *                           the Testimonials collection at render time and
 *                           are NOT duplicated onto the page record.
 *
 * `testimonials.time_ago` is added because both the WordPress plugin strip and
 * the current page show a relative date ("5 months ago") that the collection
 * had nowhere to store.
 */

const BLOCK_TABLES = [
  'pages_blocks_testimonial_videos',
  'pages_blocks_review_highlights',
  'pages_blocks_testimonials_spotlight',
] as const

const CHILD_TABLES = [
  ['pages_blocks_testimonial_videos_videos', 'pages_blocks_testimonial_videos'],
  ['pages_blocks_review_highlights_badges', 'pages_blocks_review_highlights'],
  ['pages_blocks_review_highlights_stats', 'pages_blocks_review_highlights'],
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ---- block tables (parented to `pages`) ----------------------------------
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_testimonial_videos" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "description" varchar,
      "block_name" varchar
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_review_highlights" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "review_limit" numeric,
      "block_name" varchar
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_testimonials_spotlight" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "eyebrow" varchar,
      "heading" varchar,
      "body" jsonb,
      "cta_label" varchar,
      "cta_href" varchar,
      "cta_note" varchar,
      "review_limit" numeric,
      "block_name" varchar
    );
  `)

  // ---- array child tables (parented to their block) ------------------------
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_testimonial_videos_videos" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "speaker" varchar,
      "video_id" integer,
      "external_url" varchar,
      "poster_id" integer
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_review_highlights_badges" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer,
      "image_path" varchar,
      "alt" varchar
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_review_highlights_stats" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "rating" numeric,
      "count" numeric,
      "url" varchar,
      "link_label" varchar
    );
  `)

  // ---- foreign keys + indexes ---------------------------------------------
  for (const table of BLOCK_TABLES) {
    const fk = `${table}_parent_fk`
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = ${sql.raw(`'${fk}'`)}) THEN
          ALTER TABLE ${sql.raw(`"${table}"`)}
            ADD CONSTRAINT ${sql.raw(`"${fk}"`)}
            FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade;
        END IF;
      END $$;
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS ${sql.raw(`"${table}_order_idx"`)}
        ON ${sql.raw(`"${table}"`)} ("_order");
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS ${sql.raw(`"${table}_parent_idx"`)}
        ON ${sql.raw(`"${table}"`)} ("_parent_id");
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS ${sql.raw(`"${table}_path_idx"`)}
        ON ${sql.raw(`"${table}"`)} ("_path");
    `)
  }

  for (const [table, parent] of CHILD_TABLES) {
    const fk = `${table}_parent_fk`
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = ${sql.raw(`'${fk}'`)}) THEN
          ALTER TABLE ${sql.raw(`"${table}"`)}
            ADD CONSTRAINT ${sql.raw(`"${fk}"`)}
            FOREIGN KEY ("_parent_id") REFERENCES ${sql.raw(`"public"."${parent}"`)}("id") ON DELETE cascade;
        END IF;
      END $$;
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS ${sql.raw(`"${table}_order_idx"`)}
        ON ${sql.raw(`"${table}"`)} ("_order");
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS ${sql.raw(`"${table}_parent_idx"`)}
        ON ${sql.raw(`"${table}"`)} ("_parent_id");
    `)
  }

  // Media references on the array rows.
  for (const [table, column, fk] of [
    ['pages_blocks_testimonial_videos_videos', 'video_id', 'pages_blocks_tv_videos_video_fk'],
    ['pages_blocks_testimonial_videos_videos', 'poster_id', 'pages_blocks_tv_videos_poster_fk'],
    ['pages_blocks_review_highlights_badges', 'image_id', 'pages_blocks_rh_badges_image_fk'],
  ] as const) {
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = ${sql.raw(`'${fk}'`)}) THEN
          ALTER TABLE ${sql.raw(`"${table}"`)}
            ADD CONSTRAINT ${sql.raw(`"${fk}"`)}
            FOREIGN KEY (${sql.raw(`"${column}"`)}) REFERENCES "public"."media"("id") ON DELETE set null;
        END IF;
      END $$;
    `)
  }

  // ---- testimonials: relative date ----------------------------------------
  await db.execute(sql`
    ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "time_ago" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Children first — they cascade from the block tables.
  for (const [table] of CHILD_TABLES) {
    await db.execute(sql`DROP TABLE IF EXISTS ${sql.raw(`"${table}"`)};`)
  }
  for (const table of BLOCK_TABLES) {
    await db.execute(sql`DROP TABLE IF EXISTS ${sql.raw(`"${table}"`)};`)
  }
  await db.execute(sql`ALTER TABLE "testimonials" DROP COLUMN IF EXISTS "time_ago";`)
}
