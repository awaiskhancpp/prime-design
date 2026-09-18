import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Google Ads landing pages — the fields the original import had nowhere to
 * put, and the section it dropped entirely.
 *
 * Written by hand: `migrate:create` is blocked on this project (see CLAUDE.md
 * §8b — the newest schema snapshot predates seventeen hand-written
 * migrations, so a generated diff would emit DROPs for their tables).
 *
 *  - `craftsmanship` blocks. The WordPress "Remodel Your Entire Home With
 *    Prime Design & Build" section had no case in `mapSection`, so it fell
 *    through to `default: return undefined` and never reached the database.
 *  - `hero.backgroundVideo`. The looping hero video existed only as a URL
 *    inside `sourceMetadata`, which is provenance, not an editable field.
 *  - `gallery.eyebrow` — the "Our Gallery" h5 beside the section heading.
 *  - `service_areas.regionHeading` / `mapMedia` — the "California" caption
 *    and the `ca-cities.png` state map at the end of the section.
 *  - `find_us.eyebrow`.
 *  - `booking` and `contact_form` copy. These sections carry a real eyebrow,
 *    heading and description in WordPress ("Contact Info" / "Receive a Free
 *    Estimate"); without fields for them the renderer fell back to the
 *    homepage contact defaults. `booking.anchor_id` stores the Bricks
 *    `_cssId` (`contact_form`) that the hero and CTA buttons link to.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ---- hero: real background-video media reference -----------------------
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_hero"
      ADD COLUMN IF NOT EXISTS "background_video_asset_id" integer,
      ADD COLUMN IF NOT EXISTS "background_video_alt" varchar,
      ADD COLUMN IF NOT EXISTS "background_video_caption" varchar,
      ADD COLUMN IF NOT EXISTS "background_video_source_attachment_id" numeric,
      ADD COLUMN IF NOT EXISTS "background_video_source_url" varchar;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'landing_pages_blocks_hero_background_video_asset_id_media_id'
      ) THEN
        ALTER TABLE "landing_pages_blocks_hero"
          ADD CONSTRAINT "landing_pages_blocks_hero_background_video_asset_id_media_id"
          FOREIGN KEY ("background_video_asset_id")
          REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_hero_background_video_asset_idx"
      ON "landing_pages_blocks_hero" ("background_video_asset_id");
  `)

  // ---- gallery: the small heading beside the section title ---------------
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_gallery"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar;
  `)

  // ---- service areas: state map + its caption ----------------------------
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_service_areas"
      ADD COLUMN IF NOT EXISTS "region_heading" varchar,
      ADD COLUMN IF NOT EXISTS "map_media_asset_id" integer,
      ADD COLUMN IF NOT EXISTS "map_media_alt" varchar,
      ADD COLUMN IF NOT EXISTS "map_media_caption" varchar,
      ADD COLUMN IF NOT EXISTS "map_media_source_attachment_id" numeric,
      ADD COLUMN IF NOT EXISTS "map_media_source_url" varchar;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'landing_pages_blocks_service_areas_map_media_asset_id_media_id'
      ) THEN
        ALTER TABLE "landing_pages_blocks_service_areas"
          ADD CONSTRAINT "landing_pages_blocks_service_areas_map_media_asset_id_media_id"
          FOREIGN KEY ("map_media_asset_id")
          REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_service_areas_map_media_asset_idx"
      ON "landing_pages_blocks_service_areas" ("map_media_asset_id");
  `)

  // ---- find us -----------------------------------------------------------
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_find_us"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar;
  `)

  // ---- booking + contact form copy ---------------------------------------
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_booking"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar,
      ADD COLUMN IF NOT EXISTS "heading" varchar,
      ADD COLUMN IF NOT EXISTS "anchor_id" varchar,
      ADD COLUMN IF NOT EXISTS "consultation_label" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_contact_form"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar,
      ADD COLUMN IF NOT EXISTS "heading" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar;
  `)

  // ---- craftsmanship block ----------------------------------------------
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "landing_pages_blocks_craftsmanship" (
      "id" varchar PRIMARY KEY NOT NULL,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "eyebrow" varchar,
      "heading" varchar,
      "description" varchar,
      "decorative_media_asset_id" integer,
      "decorative_media_alt" varchar,
      "decorative_media_caption" varchar,
      "decorative_media_source_attachment_id" numeric,
      "decorative_media_source_url" varchar,
      "source_id" varchar,
      "source_element_type" varchar,
      "source_attachment_id" numeric,
      "source_metadata" jsonb,
      "block_name" varchar
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "landing_pages_blocks_craftsmanship_items" (
      "id" varchar PRIMARY KEY NOT NULL,
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "title" varchar NOT NULL,
      "body" varchar,
      "media_asset_id" integer,
      "media_alt" varchar,
      "media_caption" varchar,
      "media_source_attachment_id" numeric,
      "media_source_url" varchar
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "landing_pages_blocks_craftsmanship_images" (
      "id" varchar PRIMARY KEY NOT NULL,
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "media_asset_id" integer,
      "media_alt" varchar,
      "media_caption" varchar,
      "media_source_attachment_id" numeric,
      "media_source_url" varchar
    );
  `)

  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'landing_pages_blocks_craftsmanship_parent_id_fk'
      ) THEN
        ALTER TABLE "landing_pages_blocks_craftsmanship"
          ADD CONSTRAINT "landing_pages_blocks_craftsmanship_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'landing_pages_blocks_craftsmanship_decorative_media_fk'
      ) THEN
        ALTER TABLE "landing_pages_blocks_craftsmanship"
          ADD CONSTRAINT "landing_pages_blocks_craftsmanship_decorative_media_fk"
          FOREIGN KEY ("decorative_media_asset_id")
          REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'landing_pages_blocks_craftsmanship_items_parent_id_fk'
      ) THEN
        ALTER TABLE "landing_pages_blocks_craftsmanship_items"
          ADD CONSTRAINT "landing_pages_blocks_craftsmanship_items_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."landing_pages_blocks_craftsmanship"("id") ON DELETE cascade;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'landing_pages_blocks_craftsmanship_items_media_fk'
      ) THEN
        ALTER TABLE "landing_pages_blocks_craftsmanship_items"
          ADD CONSTRAINT "landing_pages_blocks_craftsmanship_items_media_fk"
          FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'landing_pages_blocks_craftsmanship_images_parent_id_fk'
      ) THEN
        ALTER TABLE "landing_pages_blocks_craftsmanship_images"
          ADD CONSTRAINT "landing_pages_blocks_craftsmanship_images_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."landing_pages_blocks_craftsmanship"("id") ON DELETE cascade;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'landing_pages_blocks_craftsmanship_images_media_fk'
      ) THEN
        ALTER TABLE "landing_pages_blocks_craftsmanship_images"
          ADD CONSTRAINT "landing_pages_blocks_craftsmanship_images_media_fk"
          FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_craftsmanship_order_idx"
      ON "landing_pages_blocks_craftsmanship" ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_craftsmanship_parent_id_idx"
      ON "landing_pages_blocks_craftsmanship" ("_parent_id");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_craftsmanship_path_idx"
      ON "landing_pages_blocks_craftsmanship" ("_path");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_craftsmanship_decorative_media_idx"
      ON "landing_pages_blocks_craftsmanship" ("decorative_media_asset_id");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_craftsmanship_items_order_idx"
      ON "landing_pages_blocks_craftsmanship_items" ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_craftsmanship_items_parent_id_idx"
      ON "landing_pages_blocks_craftsmanship_items" ("_parent_id");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_craftsmanship_items_media_idx"
      ON "landing_pages_blocks_craftsmanship_items" ("media_asset_id");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_craftsmanship_images_order_idx"
      ON "landing_pages_blocks_craftsmanship_images" ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_craftsmanship_images_parent_id_idx"
      ON "landing_pages_blocks_craftsmanship_images" ("_parent_id");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "landing_pages_blocks_craftsmanship_images_media_idx"
      ON "landing_pages_blocks_craftsmanship_images" ("media_asset_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "landing_pages_blocks_craftsmanship_images";`)
  await db.execute(sql`DROP TABLE IF EXISTS "landing_pages_blocks_craftsmanship_items";`)
  await db.execute(sql`DROP TABLE IF EXISTS "landing_pages_blocks_craftsmanship";`)
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_contact_form"
      DROP COLUMN IF EXISTS "eyebrow",
      DROP COLUMN IF EXISTS "heading",
      DROP COLUMN IF EXISTS "description";
  `)
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_booking"
      DROP COLUMN IF EXISTS "eyebrow",
      DROP COLUMN IF EXISTS "heading",
      DROP COLUMN IF EXISTS "anchor_id",
      DROP COLUMN IF EXISTS "consultation_label";
  `)
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_find_us" DROP COLUMN IF EXISTS "eyebrow";
  `)
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_service_areas"
      DROP COLUMN IF EXISTS "region_heading",
      DROP COLUMN IF EXISTS "map_media_asset_id",
      DROP COLUMN IF EXISTS "map_media_alt",
      DROP COLUMN IF EXISTS "map_media_caption",
      DROP COLUMN IF EXISTS "map_media_source_attachment_id",
      DROP COLUMN IF EXISTS "map_media_source_url";
  `)
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_gallery" DROP COLUMN IF EXISTS "eyebrow";
  `)
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_hero"
      DROP COLUMN IF EXISTS "background_video_asset_id",
      DROP COLUMN IF EXISTS "background_video_alt",
      DROP COLUMN IF EXISTS "background_video_caption",
      DROP COLUMN IF EXISTS "background_video_source_attachment_id",
      DROP COLUMN IF EXISTS "background_video_source_url";
  `)
}
