import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * One definition for the sections services and city pages share, and real
 * Media references instead of typed image paths (generated with
 * `migrate:create`; the data copy and its guard were added by hand).
 *
 * - City pages' Silicon Valley Loves section gains the fields the service's
 *   copy had and the city copy lacked: `stats.showStars` and `buttons` (both
 *   empty, so each city still takes them from its service).
 * - Seven image fields become Media relationships: on the 45 city pages the
 *   quote, Silicon Valley Loves, "Don't Settle" and video-poster images; on
 *   services the icon-checklist gallery, image-checklist and materials
 *   showcase images. Each path is resolved to the Media document it names
 *   before the path column is dropped, and the migration aborts rather than
 *   drop one that names nothing.
 *
 * Left as paths on purpose: the Prime Difference reason icons and the Prime
 * Kitchens card icons are site icons in /public (CLAUDE.md §8c), not uploads.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_service_locations_silicon_valley_loves_buttons_variant" AS ENUM('outline', 'brass');
  CREATE TABLE "service_locations_silicon_valley_loves_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_service_locations_silicon_valley_loves_buttons_variant" DEFAULT 'outline'
  );
  
  ALTER TABLE "services_icon_checklist_gallery_images" ADD COLUMN "image_id" integer;
  ALTER TABLE "services_materials_showcase_items" ADD COLUMN "image_id" integer;
  ALTER TABLE "services" ADD COLUMN "image_checklist_image_id" integer;
  ALTER TABLE "service_locations_silicon_valley_loves_stats" ADD COLUMN "show_stars" boolean DEFAULT false;
  ALTER TABLE "service_locations" ADD COLUMN "location_video_poster_id" integer;
  ALTER TABLE "service_locations" ADD COLUMN "dont_settle_image_id" integer;
  ALTER TABLE "service_locations" ADD COLUMN "quote_image_id" integer;
  ALTER TABLE "service_locations" ADD COLUMN "silicon_valley_loves_image_id" integer;
  ALTER TABLE "service_locations_silicon_valley_loves_buttons" ADD CONSTRAINT "service_locations_silicon_valley_loves_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_locations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "service_locations_silicon_valley_loves_buttons_order_idx" ON "service_locations_silicon_valley_loves_buttons" USING btree ("_order");
  CREATE INDEX "service_locations_silicon_valley_loves_buttons_parent_id_idx" ON "service_locations_silicon_valley_loves_buttons" USING btree ("_parent_id");
  ALTER TABLE "services_icon_checklist_gallery_images" ADD CONSTRAINT "services_icon_checklist_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_materials_showcase_items" ADD CONSTRAINT "services_materials_showcase_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_image_checklist_image_id_media_id_fk" FOREIGN KEY ("image_checklist_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_locations" ADD CONSTRAINT "service_locations_location_video_poster_id_media_id_fk" FOREIGN KEY ("location_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_locations" ADD CONSTRAINT "service_locations_dont_settle_image_id_media_id_fk" FOREIGN KEY ("dont_settle_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_locations" ADD CONSTRAINT "service_locations_quote_image_id_media_id_fk" FOREIGN KEY ("quote_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_locations" ADD CONSTRAINT "service_locations_silicon_valley_loves_image_id_media_id_fk" FOREIGN KEY ("silicon_valley_loves_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_icon_checklist_gallery_images_image_idx" ON "services_icon_checklist_gallery_images" USING btree ("image_id");
  CREATE INDEX "services_materials_showcase_items_image_idx" ON "services_materials_showcase_items" USING btree ("image_id");
  CREATE INDEX "services_image_checklist_image_checklist_image_idx" ON "services" USING btree ("image_checklist_image_id");
  CREATE INDEX "service_locations_location_video_location_video_poster_idx" ON "service_locations" USING btree ("location_video_poster_id");
  CREATE INDEX "service_locations_dont_settle_dont_settle_image_idx" ON "service_locations" USING btree ("dont_settle_image_id");
  CREATE INDEX "service_locations_quote_quote_image_idx" ON "service_locations" USING btree ("quote_image_id");
  CREATE INDEX "service_locations_silicon_valley_loves_silicon_valley_lo_idx" ON "service_locations" USING btree ("silicon_valley_loves_image_id");
  -- Copy each image path into a reference to the Media document it names.
  -- Paths are "/api/media/file/<filename>"; one is URL-encoded ("×" as %C3%97).
  UPDATE "services_icon_checklist_gallery_images" x SET "image_id" = m."id"
    FROM "media" m WHERE '/api/media/file/' || m."filename" = replace(x."url", '%C3%97', '×');
  UPDATE "services_materials_showcase_items" x SET "image_id" = m."id"
    FROM "media" m WHERE '/api/media/file/' || m."filename" = replace(x."image", '%C3%97', '×');
  UPDATE "services" x SET "image_checklist_image_id" = m."id"
    FROM "media" m WHERE '/api/media/file/' || m."filename" = replace(x."image_checklist_image", '%C3%97', '×');
  UPDATE "service_locations" x SET "location_video_poster_id" = m."id"
    FROM "media" m WHERE '/api/media/file/' || m."filename" = replace(x."location_video_poster", '%C3%97', '×');
  UPDATE "service_locations" x SET "dont_settle_image_id" = m."id"
    FROM "media" m WHERE '/api/media/file/' || m."filename" = replace(x."dont_settle_image", '%C3%97', '×');
  UPDATE "service_locations" x SET "quote_image_id" = m."id"
    FROM "media" m WHERE '/api/media/file/' || m."filename" = replace(x."quote_image", '%C3%97', '×');
  UPDATE "service_locations" x SET "silicon_valley_loves_image_id" = m."id"
    FROM "media" m WHERE '/api/media/file/' || m."filename" = replace(x."silicon_valley_loves_image", '%C3%97', '×');

  -- Refuse to drop a path that did not resolve to a Media document.
  DO $$ DECLARE missing integer; BEGIN
    SELECT
      (SELECT count(*) FROM "services_icon_checklist_gallery_images" WHERE "url" IS NOT NULL AND "image_id" IS NULL) +
      (SELECT count(*) FROM "services_materials_showcase_items" WHERE "image" IS NOT NULL AND "image_id" IS NULL) +
      (SELECT count(*) FROM "services" WHERE "image_checklist_image" IS NOT NULL AND "image_checklist_image_id" IS NULL) +
      (SELECT count(*) FROM "service_locations" WHERE
        ("location_video_poster" IS NOT NULL AND "location_video_poster_id" IS NULL) OR
        ("dont_settle_image" IS NOT NULL AND "dont_settle_image_id" IS NULL) OR
        ("quote_image" IS NOT NULL AND "quote_image_id" IS NULL) OR
        ("silicon_valley_loves_image" IS NOT NULL AND "silicon_valley_loves_image_id" IS NULL))
    INTO missing;
    IF missing > 0 THEN
      RAISE EXCEPTION 'shared_section_groups: % image path(s) match no Media document', missing;
    END IF;
  END $$;
  ALTER TABLE "services_icon_checklist_gallery_images" ALTER COLUMN "image_id" SET NOT NULL;

  ALTER TABLE "services_icon_checklist_gallery_images" DROP COLUMN "url";
  ALTER TABLE "services_materials_showcase_items" DROP COLUMN "image";
  ALTER TABLE "services" DROP COLUMN "image_checklist_image";
  ALTER TABLE "service_locations" DROP COLUMN "location_video_poster";
  ALTER TABLE "service_locations" DROP COLUMN "dont_settle_image";
  ALTER TABLE "service_locations" DROP COLUMN "quote_image";
  ALTER TABLE "service_locations" DROP COLUMN "silicon_valley_loves_image";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "service_locations_silicon_valley_loves_buttons" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "service_locations_silicon_valley_loves_buttons" CASCADE;
  ALTER TABLE "services_icon_checklist_gallery_images" DROP CONSTRAINT "services_icon_checklist_gallery_images_image_id_media_id_fk";
  
  ALTER TABLE "services_materials_showcase_items" DROP CONSTRAINT "services_materials_showcase_items_image_id_media_id_fk";
  
  ALTER TABLE "services" DROP CONSTRAINT "services_image_checklist_image_id_media_id_fk";
  
  ALTER TABLE "service_locations" DROP CONSTRAINT "service_locations_location_video_poster_id_media_id_fk";
  
  ALTER TABLE "service_locations" DROP CONSTRAINT "service_locations_dont_settle_image_id_media_id_fk";
  
  ALTER TABLE "service_locations" DROP CONSTRAINT "service_locations_quote_image_id_media_id_fk";
  
  ALTER TABLE "service_locations" DROP CONSTRAINT "service_locations_silicon_valley_loves_image_id_media_id_fk";
  
  DROP INDEX "services_icon_checklist_gallery_images_image_idx";
  DROP INDEX "services_materials_showcase_items_image_idx";
  DROP INDEX "services_image_checklist_image_checklist_image_idx";
  DROP INDEX "service_locations_location_video_location_video_poster_idx";
  DROP INDEX "service_locations_dont_settle_dont_settle_image_idx";
  DROP INDEX "service_locations_quote_quote_image_idx";
  DROP INDEX "service_locations_silicon_valley_loves_silicon_valley_lo_idx";
  ALTER TABLE "services_icon_checklist_gallery_images" ADD COLUMN "url" varchar;
  ALTER TABLE "services_materials_showcase_items" ADD COLUMN "image" varchar;
  ALTER TABLE "services" ADD COLUMN "image_checklist_image" varchar;
  ALTER TABLE "service_locations" ADD COLUMN "location_video_poster" varchar;
  ALTER TABLE "service_locations" ADD COLUMN "dont_settle_image" varchar;
  ALTER TABLE "service_locations" ADD COLUMN "quote_image" varchar;
  ALTER TABLE "service_locations" ADD COLUMN "silicon_valley_loves_image" varchar;
  ALTER TABLE "services_icon_checklist_gallery_images" DROP COLUMN "image_id";
  ALTER TABLE "services_materials_showcase_items" DROP COLUMN "image_id";
  ALTER TABLE "services" DROP COLUMN "image_checklist_image_id";
  ALTER TABLE "service_locations_silicon_valley_loves_stats" DROP COLUMN "show_stars";
  ALTER TABLE "service_locations" DROP COLUMN "location_video_poster_id";
  ALTER TABLE "service_locations" DROP COLUMN "dont_settle_image_id";
  ALTER TABLE "service_locations" DROP COLUMN "quote_image_id";
  ALTER TABLE "service_locations" DROP COLUMN "silicon_valley_loves_image_id";
  DROP TYPE "public"."enum_service_locations_silicon_valley_loves_buttons_variant";`)
}
