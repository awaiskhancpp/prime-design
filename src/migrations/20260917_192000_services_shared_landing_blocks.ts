import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Mirror the landing-block field additions onto the Services collection.
 *
 * `blocks/LandingPageBlocks.ts` is **shared**: `LandingPages.sections` uses
 * it, and so does the `sections` field inside the Services "Page Builder"
 * tab. Payload therefore builds a second set of tables for it under
 * `services_blocks_*`. The previous migration
 * (`20260917_190000_landing_information_sections`) added the new fields to
 * the `landing_pages_blocks_*` tables only, so every `services` query then
 * asked for columns that existed on one side and not the other and failed
 * with `column services__blocks_hero.background_video_asset_id does not
 * exist` — which took down every route that resolves a service, including
 * the homepage.
 *
 * Where a block slug collides with one of the Services collection's own
 * blocks, Payload disambiguates with a numeric suffix: the shared gallery
 * block is `services_blocks_gallery_2`, not `services_blocks_gallery`.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services_blocks_hero"
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
        WHERE conname = 'services_blocks_hero_background_video_asset_id_media_id_fk'
      ) THEN
        ALTER TABLE "services_blocks_hero"
          ADD CONSTRAINT "services_blocks_hero_background_video_asset_id_media_id_fk"
          FOREIGN KEY ("background_video_asset_id")
          REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "services_blocks_hero_background_video_asset_idx"
      ON "services_blocks_hero" ("background_video_asset_id");
  `)

  // The shared gallery block lands on `_2` because Services already defines
  // its own `gallery` block.
  await db.execute(sql`
    ALTER TABLE "services_blocks_gallery_2" ADD COLUMN IF NOT EXISTS "eyebrow" varchar;
  `)

  await db.execute(sql`
    ALTER TABLE "services_blocks_service_areas"
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
        WHERE conname = 'services_blocks_service_areas_map_media_asset_id_media_id_fk'
      ) THEN
        ALTER TABLE "services_blocks_service_areas"
          ADD CONSTRAINT "services_blocks_service_areas_map_media_asset_id_media_id_fk"
          FOREIGN KEY ("map_media_asset_id")
          REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "services_blocks_service_areas_map_media_asset_idx"
      ON "services_blocks_service_areas" ("map_media_asset_id");
  `)

  await db.execute(sql`
    ALTER TABLE "services_blocks_find_us" ADD COLUMN IF NOT EXISTS "eyebrow" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "services_blocks_booking"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar,
      ADD COLUMN IF NOT EXISTS "heading" varchar,
      ADD COLUMN IF NOT EXISTS "anchor_id" varchar,
      ADD COLUMN IF NOT EXISTS "consultation_label" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "services_blocks_contact_form"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar,
      ADD COLUMN IF NOT EXISTS "heading" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "services_blocks_cta" ALTER COLUMN "heading" DROP NOT NULL;
  `)

  // ---- craftsmanship block, Services side ---------------------------------
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "services_blocks_craftsmanship" (
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
    CREATE TABLE IF NOT EXISTS "services_blocks_craftsmanship_items" (
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
    CREATE TABLE IF NOT EXISTS "services_blocks_craftsmanship_images" (
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
        SELECT 1 FROM pg_constraint WHERE conname = 'services_blocks_craftsmanship_parent_id_fk'
      ) THEN
        ALTER TABLE "services_blocks_craftsmanship"
          ADD CONSTRAINT "services_blocks_craftsmanship_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_blocks_craftsmanship_decorative_media_fk'
      ) THEN
        ALTER TABLE "services_blocks_craftsmanship"
          ADD CONSTRAINT "services_blocks_craftsmanship_decorative_media_fk"
          FOREIGN KEY ("decorative_media_asset_id")
          REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_blocks_craftsmanship_items_parent_id_fk'
      ) THEN
        ALTER TABLE "services_blocks_craftsmanship_items"
          ADD CONSTRAINT "services_blocks_craftsmanship_items_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."services_blocks_craftsmanship"("id") ON DELETE cascade;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_blocks_craftsmanship_items_media_fk'
      ) THEN
        ALTER TABLE "services_blocks_craftsmanship_items"
          ADD CONSTRAINT "services_blocks_craftsmanship_items_media_fk"
          FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_blocks_craftsmanship_images_parent_id_fk'
      ) THEN
        ALTER TABLE "services_blocks_craftsmanship_images"
          ADD CONSTRAINT "services_blocks_craftsmanship_images_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."services_blocks_craftsmanship"("id") ON DELETE cascade;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_blocks_craftsmanship_images_media_fk'
      ) THEN
        ALTER TABLE "services_blocks_craftsmanship_images"
          ADD CONSTRAINT "services_blocks_craftsmanship_images_media_fk"
          FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
  `)
  for (const statement of [
    sql`CREATE INDEX IF NOT EXISTS "services_blocks_craftsmanship_order_idx" ON "services_blocks_craftsmanship" ("_order");`,
    sql`CREATE INDEX IF NOT EXISTS "services_blocks_craftsmanship_parent_id_idx" ON "services_blocks_craftsmanship" ("_parent_id");`,
    sql`CREATE INDEX IF NOT EXISTS "services_blocks_craftsmanship_path_idx" ON "services_blocks_craftsmanship" ("_path");`,
    sql`CREATE INDEX IF NOT EXISTS "services_blocks_craftsmanship_decorative_media_idx" ON "services_blocks_craftsmanship" ("decorative_media_asset_id");`,
    sql`CREATE INDEX IF NOT EXISTS "services_blocks_craftsmanship_items_order_idx" ON "services_blocks_craftsmanship_items" ("_order");`,
    sql`CREATE INDEX IF NOT EXISTS "services_blocks_craftsmanship_items_parent_id_idx" ON "services_blocks_craftsmanship_items" ("_parent_id");`,
    sql`CREATE INDEX IF NOT EXISTS "services_blocks_craftsmanship_items_media_idx" ON "services_blocks_craftsmanship_items" ("media_asset_id");`,
    sql`CREATE INDEX IF NOT EXISTS "services_blocks_craftsmanship_images_order_idx" ON "services_blocks_craftsmanship_images" ("_order");`,
    sql`CREATE INDEX IF NOT EXISTS "services_blocks_craftsmanship_images_parent_id_idx" ON "services_blocks_craftsmanship_images" ("_parent_id");`,
    sql`CREATE INDEX IF NOT EXISTS "services_blocks_craftsmanship_images_media_idx" ON "services_blocks_craftsmanship_images" ("media_asset_id");`,
  ]) {
    await db.execute(statement)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "services_blocks_craftsmanship_images";`)
  await db.execute(sql`DROP TABLE IF EXISTS "services_blocks_craftsmanship_items";`)
  await db.execute(sql`DROP TABLE IF EXISTS "services_blocks_craftsmanship";`)
  await db.execute(sql`
    UPDATE "services_blocks_cta" SET "heading" = '' WHERE "heading" IS NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "services_blocks_cta" ALTER COLUMN "heading" SET NOT NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "services_blocks_contact_form"
      DROP COLUMN IF EXISTS "eyebrow",
      DROP COLUMN IF EXISTS "heading",
      DROP COLUMN IF EXISTS "description";
  `)
  await db.execute(sql`
    ALTER TABLE "services_blocks_booking"
      DROP COLUMN IF EXISTS "eyebrow",
      DROP COLUMN IF EXISTS "heading",
      DROP COLUMN IF EXISTS "anchor_id",
      DROP COLUMN IF EXISTS "consultation_label";
  `)
  await db.execute(sql`ALTER TABLE "services_blocks_find_us" DROP COLUMN IF EXISTS "eyebrow";`)
  await db.execute(sql`
    ALTER TABLE "services_blocks_service_areas"
      DROP COLUMN IF EXISTS "region_heading",
      DROP COLUMN IF EXISTS "map_media_asset_id",
      DROP COLUMN IF EXISTS "map_media_alt",
      DROP COLUMN IF EXISTS "map_media_caption",
      DROP COLUMN IF EXISTS "map_media_source_attachment_id",
      DROP COLUMN IF EXISTS "map_media_source_url";
  `)
  await db.execute(sql`ALTER TABLE "services_blocks_gallery_2" DROP COLUMN IF EXISTS "eyebrow";`)
  await db.execute(sql`
    ALTER TABLE "services_blocks_hero"
      DROP COLUMN IF EXISTS "background_video_asset_id",
      DROP COLUMN IF EXISTS "background_video_alt",
      DROP COLUMN IF EXISTS "background_video_caption",
      DROP COLUMN IF EXISTS "background_video_source_attachment_id",
      DROP COLUMN IF EXISTS "background_video_source_url";
  `)
}
