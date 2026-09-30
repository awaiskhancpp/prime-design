import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Schema for Shared Sections' service-page defaults, the services `cta`
 * block's explicit `layout`, and `faqOrder` on landing FAQ categories
 * (generated with `migrate:create`; additive). Content moves in
 * `20260930_234000_shared_service_content`.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_blocks_cta_layout" AS ENUM('estimate', 'finance-hub', 'finance-cta', 'standard');
  CREATE TYPE "public"."enum_shared_sections_services_estimate_band_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TABLE "landing_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer
  );
  
  CREATE TABLE "shared_sections_services_estimate_band_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_shared_sections_services_estimate_band_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "services_blocks_cta" ADD COLUMN "layout" "enum_services_blocks_cta_layout" DEFAULT 'standard';
  ALTER TABLE "shared_sections" ADD COLUMN "services_estimate_band_heading" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "services_estimate_band_description" jsonb;
  ALTER TABLE "shared_sections" ADD COLUMN "services_areas_heading" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "services_consultation_duration" varchar;
  ALTER TABLE "shared_sections" ADD COLUMN "services_client_approach_image_id" integer;
  ALTER TABLE "landing_pages_rels" ADD CONSTRAINT "landing_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_rels" ADD CONSTRAINT "landing_pages_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shared_sections_services_estimate_band_buttons" ADD CONSTRAINT "shared_sections_services_estimate_band_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shared_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "landing_pages_rels_order_idx" ON "landing_pages_rels" USING btree ("order");
  CREATE INDEX "landing_pages_rels_parent_idx" ON "landing_pages_rels" USING btree ("parent_id");
  CREATE INDEX "landing_pages_rels_path_idx" ON "landing_pages_rels" USING btree ("path");
  CREATE INDEX "landing_pages_rels_faqs_id_idx" ON "landing_pages_rels" USING btree ("faqs_id");
  CREATE INDEX "shared_sections_services_estimate_band_buttons_order_idx" ON "shared_sections_services_estimate_band_buttons" USING btree ("_order");
  CREATE INDEX "shared_sections_services_estimate_band_buttons_parent_id_idx" ON "shared_sections_services_estimate_band_buttons" USING btree ("_parent_id");
  ALTER TABLE "shared_sections" ADD CONSTRAINT "shared_sections_services_client_approach_image_id_media_id_fk" FOREIGN KEY ("services_client_approach_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "shared_sections_services_services_client_approach_image_idx" ON "shared_sections" USING btree ("services_client_approach_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "landing_pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shared_sections_services_estimate_band_buttons" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "landing_pages_rels" CASCADE;
  DROP TABLE "shared_sections_services_estimate_band_buttons" CASCADE;
  ALTER TABLE "shared_sections" DROP CONSTRAINT "shared_sections_services_client_approach_image_id_media_id_fk";
  
  DROP INDEX "shared_sections_services_services_client_approach_image_idx";
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_cta" DROP COLUMN "layout";
  ALTER TABLE "shared_sections" DROP COLUMN "services_estimate_band_heading";
  ALTER TABLE "shared_sections" DROP COLUMN "services_estimate_band_description";
  ALTER TABLE "shared_sections" DROP COLUMN "services_areas_heading";
  ALTER TABLE "shared_sections" DROP COLUMN "services_consultation_duration";
  ALTER TABLE "shared_sections" DROP COLUMN "services_client_approach_image_id";
  DROP TYPE "public"."enum_services_blocks_cta_layout";
  DROP TYPE "public"."enum_shared_sections_services_estimate_band_buttons_variant";`)
}
