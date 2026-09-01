import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Development mode may have already pushed this exact schema. In that case
  // only finalize the old Services coupling and let Payload record the
  // migration instead of replaying CREATE TABLE statements.
  const existing = await db.execute(sql`
    SELECT to_regclass('public.landing_pages') AS landing_pages
  `)
  if ((existing as unknown as { rows?: Array<{ landing_pages?: string | null }> }).rows?.[0]?.landing_pages) {
    await db.execute(sql`
      ALTER TABLE "services" DROP COLUMN IF EXISTS "page_template";
      DROP TYPE IF EXISTS "public"."enum_services_page_template";
    `)
    return
  }

  await db.execute(sql`
   CREATE TYPE "public"."enum_service_locations_section_overrides_section_key" AS ENUM('hero', 'intro', 'video', 'offerings', 'quote', 'reviews', 'prime-difference', 'silicon-valley-loves', 'contact');
  CREATE TYPE "public"."enum_landing_pages_blocks_intro_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_landing_pages_blocks_image_text_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_landing_pages_blocks_icon_feature_list_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_landing_pages_blocks_checklist_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_landing_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_landing_pages_template" AS ENUM('default', 'information');
  CREATE TABLE "service_locations_section_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_key" "enum_service_locations_section_overrides_section_key" NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"video_url" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"image_id" integer,
  	"image_side" "enum_landing_pages_blocks_intro_image_side" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_feature_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pages_blocks_feature_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_benefits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pages_blocks_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "landing_pages_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"image_id" integer,
  	"image_side" "enum_landing_pages_blocks_image_text_image_side" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_sub_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"image_id" integer,
  	"link" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_sub_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"video_id" integer,
  	"video_url" varchar,
  	"poster_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_icon_feature_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pages_blocks_icon_feature_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"intro" varchar,
  	"image_id" integer,
  	"image_side" "enum_landing_pages_blocks_icon_feature_list_image_side" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pages_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"image_side" "enum_landing_pages_blocks_checklist_image_side" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"attribution" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_landing_pages_status" DEFAULT 'draft',
  	"template" "enum_landing_pages_template" DEFAULT 'default',
  	"hero_eyebrow" varchar,
  	"hero_heading" varchar NOT NULL,
  	"hero_lead" varchar,
  	"hero_image_id" integer,
  	"cta_text" varchar DEFAULT 'Get Your Free Estimate',
  	"cta_link" varchar DEFAULT '/contact',
  	"cta_show_form" boolean DEFAULT true,
  	"campaign_tracking_campaign_name" varchar,
  	"campaign_tracking_campaign_source" varchar,
  	"campaign_tracking_campaign_medium" varchar,
  	"campaign_tracking_campaign_term" varchar,
  	"campaign_tracking_campaign_content" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "landing_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "landing_pages_id" integer;
  ALTER TABLE "service_locations_section_overrides" ADD CONSTRAINT "service_locations_section_overrides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "service_locations_section_overrides" ADD CONSTRAINT "service_locations_section_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_intro" ADD CONSTRAINT "landing_pages_blocks_intro_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_intro" ADD CONSTRAINT "landing_pages_blocks_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_feature_list_items" ADD CONSTRAINT "landing_pages_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_feature_list" ADD CONSTRAINT "landing_pages_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_benefits_items" ADD CONSTRAINT "landing_pages_blocks_benefits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_benefits" ADD CONSTRAINT "landing_pages_blocks_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_process_steps" ADD CONSTRAINT "landing_pages_blocks_process_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_process_steps" ADD CONSTRAINT "landing_pages_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_process" ADD CONSTRAINT "landing_pages_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_image_text" ADD CONSTRAINT "landing_pages_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_image_text" ADD CONSTRAINT "landing_pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_gallery" ADD CONSTRAINT "landing_pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_sub_services_items" ADD CONSTRAINT "landing_pages_blocks_sub_services_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_sub_services_items" ADD CONSTRAINT "landing_pages_blocks_sub_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_sub_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_sub_services" ADD CONSTRAINT "landing_pages_blocks_sub_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_video" ADD CONSTRAINT "landing_pages_blocks_video_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_video" ADD CONSTRAINT "landing_pages_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_video" ADD CONSTRAINT "landing_pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_icon_feature_list_items" ADD CONSTRAINT "landing_pages_blocks_icon_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_icon_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_icon_feature_list" ADD CONSTRAINT "landing_pages_blocks_icon_feature_list_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_icon_feature_list" ADD CONSTRAINT "landing_pages_blocks_icon_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_checklist_items" ADD CONSTRAINT "landing_pages_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_checklist" ADD CONSTRAINT "landing_pages_blocks_checklist_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_checklist" ADD CONSTRAINT "landing_pages_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_quote" ADD CONSTRAINT "landing_pages_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_rels" ADD CONSTRAINT "landing_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_rels" ADD CONSTRAINT "landing_pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "service_locations_section_overrides_order_idx" ON "service_locations_section_overrides" USING btree ("_order");
  CREATE INDEX "service_locations_section_overrides_parent_id_idx" ON "service_locations_section_overrides" USING btree ("_parent_id");
  CREATE INDEX "service_locations_section_overrides_image_idx" ON "service_locations_section_overrides" USING btree ("image_id");
  CREATE INDEX "landing_pages_blocks_intro_order_idx" ON "landing_pages_blocks_intro" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_intro_parent_id_idx" ON "landing_pages_blocks_intro" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_intro_path_idx" ON "landing_pages_blocks_intro" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_intro_image_idx" ON "landing_pages_blocks_intro" USING btree ("image_id");
  CREATE INDEX "landing_pages_blocks_feature_list_items_order_idx" ON "landing_pages_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_feature_list_items_parent_id_idx" ON "landing_pages_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_feature_list_order_idx" ON "landing_pages_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_feature_list_parent_id_idx" ON "landing_pages_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_feature_list_path_idx" ON "landing_pages_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_benefits_items_order_idx" ON "landing_pages_blocks_benefits_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_benefits_items_parent_id_idx" ON "landing_pages_blocks_benefits_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_benefits_order_idx" ON "landing_pages_blocks_benefits" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_benefits_parent_id_idx" ON "landing_pages_blocks_benefits" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_benefits_path_idx" ON "landing_pages_blocks_benefits" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_process_steps_order_idx" ON "landing_pages_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_process_steps_parent_id_idx" ON "landing_pages_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_process_steps_image_idx" ON "landing_pages_blocks_process_steps" USING btree ("image_id");
  CREATE INDEX "landing_pages_blocks_process_order_idx" ON "landing_pages_blocks_process" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_process_parent_id_idx" ON "landing_pages_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_process_path_idx" ON "landing_pages_blocks_process" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_image_text_order_idx" ON "landing_pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_image_text_parent_id_idx" ON "landing_pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_image_text_path_idx" ON "landing_pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_image_text_image_idx" ON "landing_pages_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "landing_pages_blocks_gallery_order_idx" ON "landing_pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_gallery_parent_id_idx" ON "landing_pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_gallery_path_idx" ON "landing_pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_sub_services_items_order_idx" ON "landing_pages_blocks_sub_services_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_sub_services_items_parent_id_idx" ON "landing_pages_blocks_sub_services_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_sub_services_items_image_idx" ON "landing_pages_blocks_sub_services_items" USING btree ("image_id");
  CREATE INDEX "landing_pages_blocks_sub_services_order_idx" ON "landing_pages_blocks_sub_services" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_sub_services_parent_id_idx" ON "landing_pages_blocks_sub_services" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_sub_services_path_idx" ON "landing_pages_blocks_sub_services" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_video_order_idx" ON "landing_pages_blocks_video" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_video_parent_id_idx" ON "landing_pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_video_path_idx" ON "landing_pages_blocks_video" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_video_video_idx" ON "landing_pages_blocks_video" USING btree ("video_id");
  CREATE INDEX "landing_pages_blocks_video_poster_idx" ON "landing_pages_blocks_video" USING btree ("poster_id");
  CREATE INDEX "landing_pages_blocks_icon_feature_list_items_order_idx" ON "landing_pages_blocks_icon_feature_list_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_icon_feature_list_items_parent_id_idx" ON "landing_pages_blocks_icon_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_icon_feature_list_order_idx" ON "landing_pages_blocks_icon_feature_list" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_icon_feature_list_parent_id_idx" ON "landing_pages_blocks_icon_feature_list" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_icon_feature_list_path_idx" ON "landing_pages_blocks_icon_feature_list" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_icon_feature_list_image_idx" ON "landing_pages_blocks_icon_feature_list" USING btree ("image_id");
  CREATE INDEX "landing_pages_blocks_checklist_items_order_idx" ON "landing_pages_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_checklist_items_parent_id_idx" ON "landing_pages_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_checklist_order_idx" ON "landing_pages_blocks_checklist" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_checklist_parent_id_idx" ON "landing_pages_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_checklist_path_idx" ON "landing_pages_blocks_checklist" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_checklist_image_idx" ON "landing_pages_blocks_checklist" USING btree ("image_id");
  CREATE INDEX "landing_pages_blocks_quote_order_idx" ON "landing_pages_blocks_quote" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_quote_parent_id_idx" ON "landing_pages_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_quote_path_idx" ON "landing_pages_blocks_quote" USING btree ("_path");
  CREATE UNIQUE INDEX "landing_pages_slug_idx" ON "landing_pages" USING btree ("slug");
  CREATE INDEX "landing_pages_hero_hero_image_idx" ON "landing_pages" USING btree ("hero_image_id");
  CREATE INDEX "landing_pages_seo_seo_og_image_idx" ON "landing_pages" USING btree ("seo_og_image_id");
  CREATE INDEX "landing_pages_updated_at_idx" ON "landing_pages" USING btree ("updated_at");
  CREATE INDEX "landing_pages_created_at_idx" ON "landing_pages" USING btree ("created_at");
  CREATE INDEX "landing_pages_rels_order_idx" ON "landing_pages_rels" USING btree ("order");
  CREATE INDEX "landing_pages_rels_parent_idx" ON "landing_pages_rels" USING btree ("parent_id");
  CREATE INDEX "landing_pages_rels_path_idx" ON "landing_pages_rels" USING btree ("path");
  CREATE INDEX "landing_pages_rels_media_id_idx" ON "landing_pages_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_landing_pages_fk" FOREIGN KEY ("landing_pages_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_landing_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("landing_pages_id");
  ALTER TABLE "services" DROP COLUMN "page_template";
  DROP TYPE "public"."enum_services_page_template";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_page_template" AS ENUM('service-detail', 'google-ads');
  ALTER TABLE "service_locations_section_overrides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_intro" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_feature_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_feature_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_benefits_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_benefits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_sub_services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_sub_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_icon_feature_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_icon_feature_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "service_locations_section_overrides" CASCADE;
  DROP TABLE "landing_pages_blocks_intro" CASCADE;
  DROP TABLE "landing_pages_blocks_feature_list_items" CASCADE;
  DROP TABLE "landing_pages_blocks_feature_list" CASCADE;
  DROP TABLE "landing_pages_blocks_benefits_items" CASCADE;
  DROP TABLE "landing_pages_blocks_benefits" CASCADE;
  DROP TABLE "landing_pages_blocks_process_steps" CASCADE;
  DROP TABLE "landing_pages_blocks_process" CASCADE;
  DROP TABLE "landing_pages_blocks_image_text" CASCADE;
  DROP TABLE "landing_pages_blocks_gallery" CASCADE;
  DROP TABLE "landing_pages_blocks_sub_services_items" CASCADE;
  DROP TABLE "landing_pages_blocks_sub_services" CASCADE;
  DROP TABLE "landing_pages_blocks_video" CASCADE;
  DROP TABLE "landing_pages_blocks_icon_feature_list_items" CASCADE;
  DROP TABLE "landing_pages_blocks_icon_feature_list" CASCADE;
  DROP TABLE "landing_pages_blocks_checklist_items" CASCADE;
  DROP TABLE "landing_pages_blocks_checklist" CASCADE;
  DROP TABLE "landing_pages_blocks_quote" CASCADE;
  DROP TABLE "landing_pages" CASCADE;
  DROP TABLE "landing_pages_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_landing_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_landing_pages_id_idx";
  ALTER TABLE "services" ADD COLUMN "page_template" "enum_services_page_template" DEFAULT 'service-detail';
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "landing_pages_id";
  DROP TYPE "public"."enum_service_locations_section_overrides_section_key";
  DROP TYPE "public"."enum_landing_pages_blocks_intro_image_side";
  DROP TYPE "public"."enum_landing_pages_blocks_image_text_image_side";
  DROP TYPE "public"."enum_landing_pages_blocks_icon_feature_list_image_side";
  DROP TYPE "public"."enum_landing_pages_blocks_checklist_image_side";
  DROP TYPE "public"."enum_landing_pages_status";
  DROP TYPE "public"."enum_landing_pages_template";`)
}
