import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Schema for the Shared Sections global and the services' City Page Defaults
 * (generated with `migrate:create`; additive only). The content is moved in by
 * `20260930_230500_shared_sections_content`.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_shared_sections_silicon_valley_loves_buttons_variant" AS ENUM('outline', 'brass');
  CREATE TABLE "shared_sections_prime_difference_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "shared_sections_prime_difference_reasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"image" varchar
  );
  
  CREATE TABLE "shared_sections_silicon_valley_loves_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"detail" varchar,
  	"show_stars" boolean DEFAULT false
  );
  
  CREATE TABLE "shared_sections_silicon_valley_loves_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_shared_sections_silicon_valley_loves_buttons_variant" DEFAULT 'outline'
  );
  
  CREATE TABLE "shared_sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"location_video_eyebrow" varchar,
  	"location_video_title" varchar,
  	"location_video_description" varchar,
  	"location_video_tagline" varchar,
  	"location_video_video_url" varchar,
  	"location_video_poster_id" integer,
  	"dont_settle_eyebrow" varchar,
  	"dont_settle_heading" varchar,
  	"dont_settle_heading_accent" varchar,
  	"dont_settle_body" varchar,
  	"dont_settle_cta_label" varchar,
  	"dont_settle_image_id" integer,
  	"quote_heading" varchar,
  	"quote_quote" varchar,
  	"quote_attribution" varchar,
  	"quote_image_id" integer,
  	"prime_difference_eyebrow" varchar,
  	"prime_difference_heading" varchar,
  	"prime_difference_body" jsonb,
  	"silicon_valley_loves_eyebrow" varchar,
  	"silicon_valley_loves_heading" varchar,
  	"silicon_valley_loves_body" varchar,
  	"silicon_valley_loves_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "shared_sections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"testimonials_id" integer
  );
  
  ALTER TABLE "services" ADD COLUMN "dont_settle_eyebrow" varchar;
  ALTER TABLE "services" ADD COLUMN "dont_settle_heading" varchar;
  ALTER TABLE "services" ADD COLUMN "dont_settle_heading_accent" varchar;
  ALTER TABLE "services" ADD COLUMN "dont_settle_body" varchar;
  ALTER TABLE "services" ADD COLUMN "dont_settle_cta_label" varchar;
  ALTER TABLE "services" ADD COLUMN "dont_settle_image_id" integer;
  ALTER TABLE "services" ADD COLUMN "location_video_eyebrow" varchar;
  ALTER TABLE "services" ADD COLUMN "location_video_title" varchar;
  ALTER TABLE "services" ADD COLUMN "location_video_description" varchar;
  ALTER TABLE "services" ADD COLUMN "location_video_tagline" varchar;
  ALTER TABLE "services" ADD COLUMN "location_video_video_url" varchar;
  ALTER TABLE "services" ADD COLUMN "location_video_poster_id" integer;
  ALTER TABLE "shared_sections_prime_difference_checklist" ADD CONSTRAINT "shared_sections_prime_difference_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shared_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shared_sections_prime_difference_reasons" ADD CONSTRAINT "shared_sections_prime_difference_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shared_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shared_sections_silicon_valley_loves_stats" ADD CONSTRAINT "shared_sections_silicon_valley_loves_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shared_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shared_sections_silicon_valley_loves_buttons" ADD CONSTRAINT "shared_sections_silicon_valley_loves_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shared_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shared_sections" ADD CONSTRAINT "shared_sections_location_video_poster_id_media_id_fk" FOREIGN KEY ("location_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shared_sections" ADD CONSTRAINT "shared_sections_dont_settle_image_id_media_id_fk" FOREIGN KEY ("dont_settle_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shared_sections" ADD CONSTRAINT "shared_sections_quote_image_id_media_id_fk" FOREIGN KEY ("quote_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shared_sections" ADD CONSTRAINT "shared_sections_silicon_valley_loves_image_id_media_id_fk" FOREIGN KEY ("silicon_valley_loves_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shared_sections_rels" ADD CONSTRAINT "shared_sections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."shared_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shared_sections_rels" ADD CONSTRAINT "shared_sections_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "shared_sections_prime_difference_checklist_order_idx" ON "shared_sections_prime_difference_checklist" USING btree ("_order");
  CREATE INDEX "shared_sections_prime_difference_checklist_parent_id_idx" ON "shared_sections_prime_difference_checklist" USING btree ("_parent_id");
  CREATE INDEX "shared_sections_prime_difference_reasons_order_idx" ON "shared_sections_prime_difference_reasons" USING btree ("_order");
  CREATE INDEX "shared_sections_prime_difference_reasons_parent_id_idx" ON "shared_sections_prime_difference_reasons" USING btree ("_parent_id");
  CREATE INDEX "shared_sections_silicon_valley_loves_stats_order_idx" ON "shared_sections_silicon_valley_loves_stats" USING btree ("_order");
  CREATE INDEX "shared_sections_silicon_valley_loves_stats_parent_id_idx" ON "shared_sections_silicon_valley_loves_stats" USING btree ("_parent_id");
  CREATE INDEX "shared_sections_silicon_valley_loves_buttons_order_idx" ON "shared_sections_silicon_valley_loves_buttons" USING btree ("_order");
  CREATE INDEX "shared_sections_silicon_valley_loves_buttons_parent_id_idx" ON "shared_sections_silicon_valley_loves_buttons" USING btree ("_parent_id");
  CREATE INDEX "shared_sections_location_video_location_video_poster_idx" ON "shared_sections" USING btree ("location_video_poster_id");
  CREATE INDEX "shared_sections_dont_settle_dont_settle_image_idx" ON "shared_sections" USING btree ("dont_settle_image_id");
  CREATE INDEX "shared_sections_quote_quote_image_idx" ON "shared_sections" USING btree ("quote_image_id");
  CREATE INDEX "shared_sections_silicon_valley_loves_silicon_valley_love_idx" ON "shared_sections" USING btree ("silicon_valley_loves_image_id");
  CREATE INDEX "shared_sections_rels_order_idx" ON "shared_sections_rels" USING btree ("order");
  CREATE INDEX "shared_sections_rels_parent_idx" ON "shared_sections_rels" USING btree ("parent_id");
  CREATE INDEX "shared_sections_rels_path_idx" ON "shared_sections_rels" USING btree ("path");
  CREATE INDEX "shared_sections_rels_testimonials_id_idx" ON "shared_sections_rels" USING btree ("testimonials_id");
  ALTER TABLE "services" ADD CONSTRAINT "services_dont_settle_image_id_media_id_fk" FOREIGN KEY ("dont_settle_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_location_video_poster_id_media_id_fk" FOREIGN KEY ("location_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_dont_settle_dont_settle_image_idx" ON "services" USING btree ("dont_settle_image_id");
  CREATE INDEX "services_location_video_location_video_poster_idx" ON "services" USING btree ("location_video_poster_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shared_sections_prime_difference_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shared_sections_prime_difference_reasons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shared_sections_silicon_valley_loves_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shared_sections_silicon_valley_loves_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shared_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shared_sections_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shared_sections_prime_difference_checklist" CASCADE;
  DROP TABLE "shared_sections_prime_difference_reasons" CASCADE;
  DROP TABLE "shared_sections_silicon_valley_loves_stats" CASCADE;
  DROP TABLE "shared_sections_silicon_valley_loves_buttons" CASCADE;
  DROP TABLE "shared_sections" CASCADE;
  DROP TABLE "shared_sections_rels" CASCADE;
  ALTER TABLE "services" DROP CONSTRAINT "services_dont_settle_image_id_media_id_fk";
  
  ALTER TABLE "services" DROP CONSTRAINT "services_location_video_poster_id_media_id_fk";
  
  DROP INDEX "services_dont_settle_dont_settle_image_idx";
  DROP INDEX "services_location_video_location_video_poster_idx";
  ALTER TABLE "services" DROP COLUMN "dont_settle_eyebrow";
  ALTER TABLE "services" DROP COLUMN "dont_settle_heading";
  ALTER TABLE "services" DROP COLUMN "dont_settle_heading_accent";
  ALTER TABLE "services" DROP COLUMN "dont_settle_body";
  ALTER TABLE "services" DROP COLUMN "dont_settle_cta_label";
  ALTER TABLE "services" DROP COLUMN "dont_settle_image_id";
  ALTER TABLE "services" DROP COLUMN "location_video_eyebrow";
  ALTER TABLE "services" DROP COLUMN "location_video_title";
  ALTER TABLE "services" DROP COLUMN "location_video_description";
  ALTER TABLE "services" DROP COLUMN "location_video_tagline";
  ALTER TABLE "services" DROP COLUMN "location_video_video_url";
  ALTER TABLE "services" DROP COLUMN "location_video_poster_id";
  DROP TYPE "public"."enum_shared_sections_silicon_valley_loves_buttons_variant";`)
}
