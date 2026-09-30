import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Remove admin fields that did nothing when filled in (generated with
 * `migrate:create`, reviewed line by line).
 *
 * Every column or table dropped here was checked against the database and
 * the live WordPress site first. Nothing is lost that renders or that the
 * WordPress site shows:
 *
 * - Services → hidden `contentBlocks` list (`services_blocks_{intro,
 *   feature_list, benefits, process, quote, icon_feature_list, checklist,
 *   gallery, image_text, sub_services, video}`). Only three checklists held
 *   rows (Additions, ADU, Complete Renovation), and each services' overview
 *   renders ahead of them with the same bullets (the three small wording
 *   drifts were fixed in `20260930_220800_overview_wording`). The Page
 *   Builder's own gallery/image-text/sub-services/video blocks live in the
 *   `…_2` tables, which are kept (see `SERVICE_BLOCK_TABLES`).
 * - Services → the `hero` Page Builder block (11 rows, `services_blocks_hero`
 *   + buttons). Never rendered; the Hero group holds the same heading, copy
 *   and buttons, cleaned up.
 * - Services → `faqs` and `relatedServices` relationships (no rows) — replaced
 *   by `faqCategory`, seeded in `20260930_221000_service_faq_category`.
 * - Landing pages → the Hero group, `template` and the Campaign UTM group.
 *   The hero that renders is each page's first `hero` section; the group's
 *   headings and buttons are identical copies of it (one page's image had
 *   already drifted). The UTM group and the one-option template were never read.
 * - Landing and service `testimonials` block (no rows; the renderer ignored its data).
 * - Service locations → `heroHeading`, `heroDescription`, `intro`, `content`,
 *   and `sectionOverrides.heading/body/videoUrl` (no rows).
 *   `sectionOverrides.sectionKey` becomes a select of the real section keys.
 * - Blog → table of contents, FAQ, tags, related posts, `featured`,
 *   `readingTime` (no data beyond defaults; WordPress posts have none of them).
 * - Pages → `hero.video`, `projects.body`, `services.body`, and the FAQ
 *   index's `searchPlaceholder` (WordPress's FAQ page has no search box).
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_service_locations_section_overrides_section_key" AS ENUM('intro', 'video', 'offerings', 'quote', 'prime-difference', 'reviews', 'testimonial-cards', 'silicon-valley-loves', 'contact');
  ALTER TABLE "services_blocks_intro" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_feature_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_feature_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_benefits_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_benefits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_sub_services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_sub_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_icon_feature_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_icon_feature_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_hero_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_testimonials_providers_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_testimonials_providers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog_table_of_contents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_hero_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_testimonials_providers_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_testimonials_providers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_blocks_intro" CASCADE;
  DROP TABLE "services_blocks_feature_list_items" CASCADE;
  DROP TABLE "services_blocks_feature_list" CASCADE;
  DROP TABLE "services_blocks_benefits_items" CASCADE;
  DROP TABLE "services_blocks_benefits" CASCADE;
  DROP TABLE "services_blocks_process_steps" CASCADE;
  DROP TABLE "services_blocks_process" CASCADE;
  DROP TABLE "services_blocks_image_text" CASCADE;
  DROP TABLE "services_blocks_gallery" CASCADE;
  DROP TABLE "services_blocks_sub_services_items" CASCADE;
  DROP TABLE "services_blocks_sub_services" CASCADE;
  DROP TABLE "services_blocks_video" CASCADE;
  DROP TABLE "services_blocks_icon_feature_list_items" CASCADE;
  DROP TABLE "services_blocks_icon_feature_list" CASCADE;
  DROP TABLE "services_blocks_checklist_items" CASCADE;
  DROP TABLE "services_blocks_checklist" CASCADE;
  DROP TABLE "services_blocks_quote" CASCADE;
  DROP TABLE "services_blocks_hero_buttons" CASCADE;
  DROP TABLE "services_blocks_hero" CASCADE;
  DROP TABLE "services_blocks_testimonials_providers_reviews" CASCADE;
  DROP TABLE "services_blocks_testimonials_providers" CASCADE;
  DROP TABLE "services_blocks_testimonials" CASCADE;
  DROP TABLE "blog_table_of_contents" CASCADE;
  DROP TABLE "blog_faq" CASCADE;
  DROP TABLE "blog_texts" CASCADE;
  DROP TABLE "landing_pages_hero_buttons" CASCADE;
  DROP TABLE "landing_pages_blocks_testimonials_providers_reviews" CASCADE;
  DROP TABLE "landing_pages_blocks_testimonials_providers" CASCADE;
  DROP TABLE "landing_pages_blocks_testimonials" CASCADE;
  ALTER TABLE "services_rels" DROP CONSTRAINT "services_rels_services_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_video_id_media_id_fk";
  
  ALTER TABLE "blog_rels" DROP CONSTRAINT "blog_rels_blog_fk";
  
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_hero_background_media_id_media_id_fk";
  
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_hero_foreground_media_id_media_id_fk";
  
  DROP INDEX "services_rels_services_id_idx";
  DROP INDEX "pages_hero_hero_video_idx";
  DROP INDEX "blog_rels_blog_id_idx";
  DROP INDEX "landing_pages_hero_hero_background_media_idx";
  DROP INDEX "landing_pages_hero_hero_foreground_media_idx";
  ALTER TABLE "service_locations_section_overrides" ALTER COLUMN "section_key" SET DATA TYPE "public"."enum_service_locations_section_overrides_section_key" USING "section_key"::"public"."enum_service_locations_section_overrides_section_key";
  ALTER TABLE "services" ADD COLUMN "faq_category_id" integer;
  ALTER TABLE "services" ADD CONSTRAINT "services_faq_category_id_faq_categories_id_fk" FOREIGN KEY ("faq_category_id") REFERENCES "public"."faq_categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_faq_category_idx" ON "services" USING btree ("faq_category_id");
  ALTER TABLE "services_rels" DROP COLUMN "services_id";
  ALTER TABLE "service_locations_section_overrides" DROP COLUMN "heading";
  ALTER TABLE "service_locations_section_overrides" DROP COLUMN "body";
  ALTER TABLE "service_locations_section_overrides" DROP COLUMN "video_url";
  ALTER TABLE "service_locations" DROP COLUMN "hero_heading";
  ALTER TABLE "service_locations" DROP COLUMN "hero_description";
  ALTER TABLE "service_locations" DROP COLUMN "intro";
  ALTER TABLE "service_locations" DROP COLUMN "content";
  ALTER TABLE "pages_blocks_projects" DROP COLUMN "body";
  ALTER TABLE "pages_blocks_services" DROP COLUMN "body";
  ALTER TABLE "pages_blocks_faq_index" DROP COLUMN "search_placeholder";
  ALTER TABLE "pages" DROP COLUMN "hero_video_id";
  ALTER TABLE "blog" DROP COLUMN "enable_t_o_c";
  ALTER TABLE "blog" DROP COLUMN "toc_title";
  ALTER TABLE "blog" DROP COLUMN "faq_heading";
  ALTER TABLE "blog" DROP COLUMN "featured";
  ALTER TABLE "blog" DROP COLUMN "reading_time";
  ALTER TABLE "blog_rels" DROP COLUMN "blog_id";
  ALTER TABLE "landing_pages" DROP COLUMN "template";
  ALTER TABLE "landing_pages" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "hero_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "hero_description";
  ALTER TABLE "landing_pages" DROP COLUMN "hero_background_media_id";
  ALTER TABLE "landing_pages" DROP COLUMN "hero_foreground_media_id";
  ALTER TABLE "landing_pages" DROP COLUMN "campaign_tracking_campaign_name";
  ALTER TABLE "landing_pages" DROP COLUMN "campaign_tracking_source";
  ALTER TABLE "landing_pages" DROP COLUMN "campaign_tracking_medium";
  ALTER TABLE "landing_pages" DROP COLUMN "campaign_tracking_term";
  ALTER TABLE "landing_pages" DROP COLUMN "campaign_tracking_content";
  DROP TYPE "public"."enum_services_blocks_intro_image_side";
  DROP TYPE "public"."enum_services_blocks_image_text_image_side";
  DROP TYPE "public"."enum_services_blocks_icon_feature_list_image_side";
  DROP TYPE "public"."enum_services_blocks_checklist_image_side";
  DROP TYPE "public"."enum_services_blocks_hero_buttons_variant";
  DROP TYPE "public"."enum_landing_pages_hero_buttons_variant";
  DROP TYPE "public"."enum_landing_pages_template";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_blocks_intro_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_services_blocks_image_text_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_services_blocks_icon_feature_list_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_services_blocks_checklist_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_services_blocks_hero_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum_landing_pages_hero_buttons_variant" AS ENUM('primary', 'secondary', 'text', 'outline');
  CREATE TYPE "public"."enum_landing_pages_template" AS ENUM('information');
  CREATE TABLE "services_blocks_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"image_side" "enum_services_blocks_intro_image_side" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_feature_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_blocks_feature_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_benefits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_blocks_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "services_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"image_side" "enum_services_blocks_image_text_image_side" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_sub_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"link" varchar
  );
  
  CREATE TABLE "services_blocks_sub_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"video_id" integer,
  	"video_url" varchar,
  	"poster_id" integer,
  	"summary" jsonb,
  	"speaker_name" varchar,
  	"speaker_role" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_icon_feature_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "services_blocks_icon_feature_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"image_id" integer,
  	"image_side" "enum_services_blocks_icon_feature_list_image_side" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"image_side" "enum_services_blocks_checklist_image_side" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_services_blocks_hero_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"description" varchar,
  	"background_media_asset_id" integer,
  	"background_media_alt" varchar,
  	"background_media_caption" varchar,
  	"background_media_source_attachment_id" numeric,
  	"background_media_source_url" varchar,
  	"background_video_asset_id" integer,
  	"background_video_alt" varchar,
  	"background_video_caption" varchar,
  	"background_video_source_attachment_id" numeric,
  	"background_video_source_url" varchar,
  	"foreground_media_asset_id" integer,
  	"foreground_media_alt" varchar,
  	"foreground_media_caption" varchar,
  	"foreground_media_source_attachment_id" numeric,
  	"foreground_media_source_url" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_testimonials_providers_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reviewer" varchar,
  	"rating" numeric,
  	"body" varchar,
  	"date" timestamp(3) with time zone,
  	"source_id" varchar
  );
  
  CREATE TABLE "services_blocks_testimonials_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"shortcode" varchar,
  	"collection_id" varchar
  );
  
  CREATE TABLE "services_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "blog_table_of_contents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor_id" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "blog_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL
  );
  
  CREATE TABLE "blog_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "landing_pages_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"variant" "enum_landing_pages_hero_buttons_variant",
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_testimonials_providers_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reviewer" varchar,
  	"rating" numeric,
  	"body" varchar,
  	"date" timestamp(3) with time zone,
  	"source_id" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_testimonials_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"shortcode" varchar,
  	"collection_id" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  ALTER TABLE "services" DROP CONSTRAINT "services_faq_category_id_faq_categories_id_fk";
  
  DROP INDEX "services_faq_category_idx";
  ALTER TABLE "service_locations_section_overrides" ALTER COLUMN "section_key" SET DATA TYPE varchar;
  ALTER TABLE "services_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "service_locations_section_overrides" ADD COLUMN "heading" varchar;
  ALTER TABLE "service_locations_section_overrides" ADD COLUMN "body" varchar;
  ALTER TABLE "service_locations_section_overrides" ADD COLUMN "video_url" varchar;
  ALTER TABLE "service_locations" ADD COLUMN "hero_heading" varchar;
  ALTER TABLE "service_locations" ADD COLUMN "hero_description" varchar;
  ALTER TABLE "service_locations" ADD COLUMN "intro" varchar;
  ALTER TABLE "service_locations" ADD COLUMN "content" jsonb;
  ALTER TABLE "pages_blocks_projects" ADD COLUMN "body" jsonb;
  ALTER TABLE "pages_blocks_services" ADD COLUMN "body" jsonb;
  ALTER TABLE "pages_blocks_faq_index" ADD COLUMN "search_placeholder" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_video_id" integer;
  ALTER TABLE "blog" ADD COLUMN "enable_t_o_c" boolean DEFAULT false;
  ALTER TABLE "blog" ADD COLUMN "toc_title" varchar DEFAULT 'Table of Contents';
  ALTER TABLE "blog" ADD COLUMN "faq_heading" varchar;
  ALTER TABLE "blog" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "blog" ADD COLUMN "reading_time" numeric;
  ALTER TABLE "blog_rels" ADD COLUMN "blog_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "template" "enum_landing_pages_template" DEFAULT 'information';
  ALTER TABLE "landing_pages" ADD COLUMN "hero_eyebrow" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "hero_heading" varchar NOT NULL;
  ALTER TABLE "landing_pages" ADD COLUMN "hero_description" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "hero_background_media_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "hero_foreground_media_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "campaign_tracking_campaign_name" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "campaign_tracking_source" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "campaign_tracking_medium" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "campaign_tracking_term" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "campaign_tracking_content" varchar;
  ALTER TABLE "services_blocks_intro" ADD CONSTRAINT "services_blocks_intro_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_intro" ADD CONSTRAINT "services_blocks_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_feature_list_items" ADD CONSTRAINT "services_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_feature_list" ADD CONSTRAINT "services_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_benefits_items" ADD CONSTRAINT "services_blocks_benefits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_benefits" ADD CONSTRAINT "services_blocks_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_process_steps" ADD CONSTRAINT "services_blocks_process_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_process_steps" ADD CONSTRAINT "services_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_process" ADD CONSTRAINT "services_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image_text" ADD CONSTRAINT "services_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_text" ADD CONSTRAINT "services_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery" ADD CONSTRAINT "services_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_sub_services_items" ADD CONSTRAINT "services_blocks_sub_services_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_sub_services_items" ADD CONSTRAINT "services_blocks_sub_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_sub_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_sub_services" ADD CONSTRAINT "services_blocks_sub_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_video" ADD CONSTRAINT "services_blocks_video_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_video" ADD CONSTRAINT "services_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_video" ADD CONSTRAINT "services_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_icon_feature_list_items" ADD CONSTRAINT "services_blocks_icon_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_icon_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_icon_feature_list" ADD CONSTRAINT "services_blocks_icon_feature_list_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_icon_feature_list" ADD CONSTRAINT "services_blocks_icon_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_checklist_items" ADD CONSTRAINT "services_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_checklist" ADD CONSTRAINT "services_blocks_checklist_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_checklist" ADD CONSTRAINT "services_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_quote" ADD CONSTRAINT "services_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_hero_buttons" ADD CONSTRAINT "services_blocks_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_hero" ADD CONSTRAINT "services_blocks_hero_background_media_asset_id_media_id_fk" FOREIGN KEY ("background_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_hero" ADD CONSTRAINT "services_blocks_hero_background_video_asset_id_media_id_fk" FOREIGN KEY ("background_video_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_hero" ADD CONSTRAINT "services_blocks_hero_foreground_media_asset_id_media_id_fk" FOREIGN KEY ("foreground_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_hero" ADD CONSTRAINT "services_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_testimonials_providers_reviews" ADD CONSTRAINT "services_blocks_testimonials_providers_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_testimonials_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_testimonials_providers" ADD CONSTRAINT "services_blocks_testimonials_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_testimonials" ADD CONSTRAINT "services_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_table_of_contents" ADD CONSTRAINT "blog_table_of_contents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_faq" ADD CONSTRAINT "blog_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_texts" ADD CONSTRAINT "blog_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_hero_buttons" ADD CONSTRAINT "landing_pages_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_testimonials_providers_reviews" ADD CONSTRAINT "landing_pages_blocks_testimonials_providers_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_testimonials_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_testimonials_providers" ADD CONSTRAINT "landing_pages_blocks_testimonials_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_testimonials" ADD CONSTRAINT "landing_pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_blocks_intro_order_idx" ON "services_blocks_intro" USING btree ("_order");
  CREATE INDEX "services_blocks_intro_parent_id_idx" ON "services_blocks_intro" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_intro_path_idx" ON "services_blocks_intro" USING btree ("_path");
  CREATE INDEX "services_blocks_intro_image_idx" ON "services_blocks_intro" USING btree ("image_id");
  CREATE INDEX "services_blocks_feature_list_items_order_idx" ON "services_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "services_blocks_feature_list_items_parent_id_idx" ON "services_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_feature_list_order_idx" ON "services_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "services_blocks_feature_list_parent_id_idx" ON "services_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_feature_list_path_idx" ON "services_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "services_blocks_benefits_items_order_idx" ON "services_blocks_benefits_items" USING btree ("_order");
  CREATE INDEX "services_blocks_benefits_items_parent_id_idx" ON "services_blocks_benefits_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_benefits_order_idx" ON "services_blocks_benefits" USING btree ("_order");
  CREATE INDEX "services_blocks_benefits_parent_id_idx" ON "services_blocks_benefits" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_benefits_path_idx" ON "services_blocks_benefits" USING btree ("_path");
  CREATE INDEX "services_blocks_process_steps_order_idx" ON "services_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "services_blocks_process_steps_parent_id_idx" ON "services_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_process_steps_image_idx" ON "services_blocks_process_steps" USING btree ("image_id");
  CREATE INDEX "services_blocks_process_order_idx" ON "services_blocks_process" USING btree ("_order");
  CREATE INDEX "services_blocks_process_parent_id_idx" ON "services_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_process_path_idx" ON "services_blocks_process" USING btree ("_path");
  CREATE INDEX "services_blocks_image_text_order_idx" ON "services_blocks_image_text" USING btree ("_order");
  CREATE INDEX "services_blocks_image_text_parent_id_idx" ON "services_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_text_path_idx" ON "services_blocks_image_text" USING btree ("_path");
  CREATE INDEX "services_blocks_image_text_image_idx" ON "services_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "services_blocks_gallery_order_idx" ON "services_blocks_gallery" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_parent_id_idx" ON "services_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_path_idx" ON "services_blocks_gallery" USING btree ("_path");
  CREATE INDEX "services_blocks_sub_services_items_order_idx" ON "services_blocks_sub_services_items" USING btree ("_order");
  CREATE INDEX "services_blocks_sub_services_items_parent_id_idx" ON "services_blocks_sub_services_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_sub_services_items_image_idx" ON "services_blocks_sub_services_items" USING btree ("image_id");
  CREATE INDEX "services_blocks_sub_services_order_idx" ON "services_blocks_sub_services" USING btree ("_order");
  CREATE INDEX "services_blocks_sub_services_parent_id_idx" ON "services_blocks_sub_services" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_sub_services_path_idx" ON "services_blocks_sub_services" USING btree ("_path");
  CREATE INDEX "services_blocks_video_order_idx" ON "services_blocks_video" USING btree ("_order");
  CREATE INDEX "services_blocks_video_parent_id_idx" ON "services_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_video_path_idx" ON "services_blocks_video" USING btree ("_path");
  CREATE INDEX "services_blocks_video_video_idx" ON "services_blocks_video" USING btree ("video_id");
  CREATE INDEX "services_blocks_video_poster_idx" ON "services_blocks_video" USING btree ("poster_id");
  CREATE INDEX "services_blocks_icon_feature_list_items_order_idx" ON "services_blocks_icon_feature_list_items" USING btree ("_order");
  CREATE INDEX "services_blocks_icon_feature_list_items_parent_id_idx" ON "services_blocks_icon_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_icon_feature_list_order_idx" ON "services_blocks_icon_feature_list" USING btree ("_order");
  CREATE INDEX "services_blocks_icon_feature_list_parent_id_idx" ON "services_blocks_icon_feature_list" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_icon_feature_list_path_idx" ON "services_blocks_icon_feature_list" USING btree ("_path");
  CREATE INDEX "services_blocks_icon_feature_list_image_idx" ON "services_blocks_icon_feature_list" USING btree ("image_id");
  CREATE INDEX "services_blocks_checklist_items_order_idx" ON "services_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "services_blocks_checklist_items_parent_id_idx" ON "services_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_checklist_order_idx" ON "services_blocks_checklist" USING btree ("_order");
  CREATE INDEX "services_blocks_checklist_parent_id_idx" ON "services_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_checklist_path_idx" ON "services_blocks_checklist" USING btree ("_path");
  CREATE INDEX "services_blocks_checklist_image_idx" ON "services_blocks_checklist" USING btree ("image_id");
  CREATE INDEX "services_blocks_quote_order_idx" ON "services_blocks_quote" USING btree ("_order");
  CREATE INDEX "services_blocks_quote_parent_id_idx" ON "services_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_quote_path_idx" ON "services_blocks_quote" USING btree ("_path");
  CREATE INDEX "services_blocks_hero_buttons_order_idx" ON "services_blocks_hero_buttons" USING btree ("_order");
  CREATE INDEX "services_blocks_hero_buttons_parent_id_idx" ON "services_blocks_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_hero_order_idx" ON "services_blocks_hero" USING btree ("_order");
  CREATE INDEX "services_blocks_hero_parent_id_idx" ON "services_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_hero_path_idx" ON "services_blocks_hero" USING btree ("_path");
  CREATE INDEX "services_blocks_hero_background_media_background_media_a_idx" ON "services_blocks_hero" USING btree ("background_media_asset_id");
  CREATE INDEX "services_blocks_hero_background_video_background_video_a_idx" ON "services_blocks_hero" USING btree ("background_video_asset_id");
  CREATE INDEX "services_blocks_hero_foreground_media_foreground_media_a_idx" ON "services_blocks_hero" USING btree ("foreground_media_asset_id");
  CREATE INDEX "services_blocks_testimonials_providers_reviews_order_idx" ON "services_blocks_testimonials_providers_reviews" USING btree ("_order");
  CREATE INDEX "services_blocks_testimonials_providers_reviews_parent_id_idx" ON "services_blocks_testimonials_providers_reviews" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_testimonials_providers_order_idx" ON "services_blocks_testimonials_providers" USING btree ("_order");
  CREATE INDEX "services_blocks_testimonials_providers_parent_id_idx" ON "services_blocks_testimonials_providers" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_testimonials_order_idx" ON "services_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "services_blocks_testimonials_parent_id_idx" ON "services_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_testimonials_path_idx" ON "services_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "blog_table_of_contents_order_idx" ON "blog_table_of_contents" USING btree ("_order");
  CREATE INDEX "blog_table_of_contents_parent_id_idx" ON "blog_table_of_contents" USING btree ("_parent_id");
  CREATE INDEX "blog_faq_order_idx" ON "blog_faq" USING btree ("_order");
  CREATE INDEX "blog_faq_parent_id_idx" ON "blog_faq" USING btree ("_parent_id");
  CREATE INDEX "blog_texts_order_parent" ON "blog_texts" USING btree ("order","parent_id");
  CREATE INDEX "landing_pages_hero_buttons_order_idx" ON "landing_pages_hero_buttons" USING btree ("_order");
  CREATE INDEX "landing_pages_hero_buttons_parent_id_idx" ON "landing_pages_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_testimonials_providers_reviews_order_idx" ON "landing_pages_blocks_testimonials_providers_reviews" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_testimonials_providers_reviews_parent_id_idx" ON "landing_pages_blocks_testimonials_providers_reviews" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_testimonials_providers_order_idx" ON "landing_pages_blocks_testimonials_providers" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_testimonials_providers_parent_id_idx" ON "landing_pages_blocks_testimonials_providers" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_testimonials_order_idx" ON "landing_pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_testimonials_parent_id_idx" ON "landing_pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_testimonials_path_idx" ON "landing_pages_blocks_testimonials" USING btree ("_path");
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_rels" ADD CONSTRAINT "blog_rels_blog_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_hero_background_media_id_media_id_fk" FOREIGN KEY ("hero_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_hero_foreground_media_id_media_id_fk" FOREIGN KEY ("hero_foreground_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id");
  CREATE INDEX "pages_hero_hero_video_idx" ON "pages" USING btree ("hero_video_id");
  CREATE INDEX "blog_rels_blog_id_idx" ON "blog_rels" USING btree ("blog_id");
  CREATE INDEX "landing_pages_hero_hero_background_media_idx" ON "landing_pages" USING btree ("hero_background_media_id");
  CREATE INDEX "landing_pages_hero_hero_foreground_media_idx" ON "landing_pages" USING btree ("hero_foreground_media_id");
  ALTER TABLE "services" DROP COLUMN "faq_category_id";
  DROP TYPE "public"."enum_service_locations_section_overrides_section_key";`)
}
