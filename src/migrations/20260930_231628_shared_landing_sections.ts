import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Schema for Shared Sections' landing-page defaults (generated with
 * `migrate:create`). The landing blocks' headings stop being required so a
 * page can leave one empty and inherit the shared copy; the service-page
 * copies of the same blocks keep theirs. Drops the find-us `mapUrl` field,
 * which nothing read and no row filled. Content moves in
 * `20260930_231700_shared_landing_content`.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "shared_sections_landing_prime_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"icon_icon_media_id" integer,
  	"icon_icon_library" varchar,
  	"icon_icon_name" varchar,
  	"icon_source_svg_url" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "shared_sections_landing_experience_difference_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"icon_icon_media_id" integer,
  	"icon_icon_library" varchar,
  	"icon_icon_name" varchar,
  	"icon_source_svg_url" varchar,
  	"media_asset_id" integer,
  	"media_alt" varchar,
  	"media_caption" varchar,
  	"media_source_attachment_id" numeric,
  	"media_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "shared_sections_landing_service_areas_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"location_id" integer,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  ALTER TABLE "landing_pages_blocks_prime_difference" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_experience_difference" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_service_areas" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_luxury_cta" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_find_us" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_prime_difference_eyebrow" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_prime_difference_heading" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_experience_difference_eyebrow" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_experience_difference_heading" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_service_areas_eyebrow" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_service_areas_heading" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_service_areas_region_heading" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_service_areas_map_media_asset_id" integer;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_service_areas_map_media_alt" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_service_areas_map_media_caption" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_service_areas_map_media_source_attachment_id" numeric;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_service_areas_map_media_source_url" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_luxury_cta_heading" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "landing_find_us_heading" varchar;
  ALTER TABLE "shared_sections_landing_prime_difference_features" ADD CONSTRAINT "shared_sections_landing_prime_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shared_sections_landing_prime_difference_features" ADD CONSTRAINT "shared_sections_landing_prime_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shared_sections_landing_prime_difference_features" ADD CONSTRAINT "shared_sections_landing_prime_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shared_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shared_sections_landing_experience_difference_features" ADD CONSTRAINT "shared_sections_landing_experience_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shared_sections_landing_experience_difference_features" ADD CONSTRAINT "shared_sections_landing_experience_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shared_sections_landing_experience_difference_features" ADD CONSTRAINT "shared_sections_landing_experience_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shared_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shared_sections_landing_service_areas_areas" ADD CONSTRAINT "shared_sections_landing_service_areas_areas_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shared_sections_landing_service_areas_areas" ADD CONSTRAINT "shared_sections_landing_service_areas_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shared_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "shared_sections_landing_prime_difference_features_order_idx" ON "shared_sections_landing_prime_difference_features" USING btree ("_order");
  CREATE INDEX "shared_sections_landing_prime_difference_features_parent_id_idx" ON "shared_sections_landing_prime_difference_features" USING btree ("_parent_id");
  CREATE INDEX "shared_sections_landing_prime_difference_features_icon_i_idx" ON "shared_sections_landing_prime_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "shared_sections_landing_prime_difference_features_media__idx" ON "shared_sections_landing_prime_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "shared_sections_landing_experience_difference_features_order_idx" ON "shared_sections_landing_experience_difference_features" USING btree ("_order");
  CREATE INDEX "shared_sections_landing_experience_difference_features_parent_id_idx" ON "shared_sections_landing_experience_difference_features" USING btree ("_parent_id");
  CREATE INDEX "shared_sections_landing_experience_difference_features_i_idx" ON "shared_sections_landing_experience_difference_features" USING btree ("icon_icon_media_id");
  CREATE INDEX "shared_sections_landing_experience_difference_features_m_idx" ON "shared_sections_landing_experience_difference_features" USING btree ("media_asset_id");
  CREATE INDEX "shared_sections_landing_service_areas_areas_order_idx" ON "shared_sections_landing_service_areas_areas" USING btree ("_order");
  CREATE INDEX "shared_sections_landing_service_areas_areas_parent_id_idx" ON "shared_sections_landing_service_areas_areas" USING btree ("_parent_id");
  CREATE INDEX "shared_sections_landing_service_areas_areas_location_idx" ON "shared_sections_landing_service_areas_areas" USING btree ("location_id");
  ALTER TABLE "shared_sections" ADD CONSTRAINT "shared_sections_landing_service_areas_map_media_asset_id_media_id_fk" FOREIGN KEY ("landing_service_areas_map_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "shared_sections_landing_service_areas_map_media_landing__idx" ON "shared_sections" USING btree ("landing_service_areas_map_media_asset_id");
  ALTER TABLE "services_blocks_find_us" DROP COLUMN "map_url";
  ALTER TABLE "landing_pages_blocks_find_us" DROP COLUMN "map_url";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shared_sections_landing_prime_difference_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shared_sections_landing_experience_difference_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shared_sections_landing_service_areas_areas" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shared_sections_landing_prime_difference_features" CASCADE;
  DROP TABLE "shared_sections_landing_experience_difference_features" CASCADE;
  DROP TABLE "shared_sections_landing_service_areas_areas" CASCADE;
  ALTER TABLE "shared_sections" DROP CONSTRAINT "shared_sections_landing_service_areas_map_media_asset_id_media_id_fk";
  
  DROP INDEX "shared_sections_landing_service_areas_map_media_landing__idx";
  ALTER TABLE "landing_pages_blocks_prime_difference" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_experience_difference" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_service_areas" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_luxury_cta" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_find_us" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_find_us" ADD COLUMN "map_url" varchar;
  ALTER TABLE "landing_pages_blocks_find_us" ADD COLUMN "map_url" varchar;
  ALTER TABLE "shared_sections" DROP COLUMN "landing_prime_difference_eyebrow";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_prime_difference_heading";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_experience_difference_eyebrow";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_experience_difference_heading";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_service_areas_eyebrow";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_service_areas_heading";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_service_areas_region_heading";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_service_areas_map_media_asset_id";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_service_areas_map_media_alt";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_service_areas_map_media_caption";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_service_areas_map_media_source_attachment_id";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_service_areas_map_media_source_url";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_luxury_cta_heading";
  ALTER TABLE "shared_sections" DROP COLUMN "landing_find_us_heading";`)
}
