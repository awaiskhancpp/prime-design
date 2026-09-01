import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_landing_pages_section_order_section" AS ENUM('estimate', 'intro', 'subServices', 'primeDifference', 'projectGallery', 'reflectionGallery', 'video', 'whyChoose', 'serviceAreas', 'faq', 'testimonials', 'booking', 'contactForm');
  CREATE TABLE "landing_pages_section_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" "enum_landing_pages_section_order_section" NOT NULL
  );
  
  CREATE TABLE "landing_pages_sub_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"link" varchar
  );
  
  CREATE TABLE "landing_pages_prime_difference_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pages_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
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
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DATA TYPE text;
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DEFAULT 'information'::text;
  DROP TYPE "public"."enum_landing_pages_template";
  CREATE TYPE "public"."enum_landing_pages_template" AS ENUM('information', 'default');
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DEFAULT 'information'::"public"."enum_landing_pages_template";
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DATA TYPE "public"."enum_landing_pages_template" USING "template"::"public"."enum_landing_pages_template";
  ALTER TABLE "landing_pages" ADD COLUMN "estimate_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "estimate_heading" varchar DEFAULT 'Ready to schedule your free estimate?';
  ALTER TABLE "landing_pages" ADD COLUMN "estimate_body" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "estimate_link" varchar DEFAULT '/contact';
  ALTER TABLE "landing_pages" ADD COLUMN "intro_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "intro_eyebrow" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "intro_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "intro_body" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "intro_image_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "sub_services_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "sub_services_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "sub_services_body" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "prime_difference_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "prime_difference_eyebrow" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "prime_difference_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "prime_difference_heading_accent" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "prime_difference_body" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "project_gallery_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "project_gallery_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "reflection_gallery_enabled" boolean DEFAULT false;
  ALTER TABLE "landing_pages" ADD COLUMN "reflection_gallery_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "video_enabled" boolean DEFAULT false;
  ALTER TABLE "landing_pages" ADD COLUMN "video_eyebrow" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "video_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "video_description" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "video_video_url" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "video_video_file_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "video_poster_id" integer;
  ALTER TABLE "landing_pages" ADD COLUMN "why_choose_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "service_areas_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "faq_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "faq_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "testimonials_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "booking_enabled" boolean DEFAULT false;
  ALTER TABLE "landing_pages" ADD COLUMN "booking_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "booking_description" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "contact_form_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "contact_form_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "contact_form_description" varchar;
  ALTER TABLE "landing_pages_section_order" ADD CONSTRAINT "landing_pages_section_order_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_sub_services_items" ADD CONSTRAINT "landing_pages_sub_services_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_sub_services_items" ADD CONSTRAINT "landing_pages_sub_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_prime_difference_checklist" ADD CONSTRAINT "landing_pages_prime_difference_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_faq_items" ADD CONSTRAINT "landing_pages_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "landing_pages_section_order_order_idx" ON "landing_pages_section_order" USING btree ("_order");
  CREATE INDEX "landing_pages_section_order_parent_id_idx" ON "landing_pages_section_order" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_sub_services_items_order_idx" ON "landing_pages_sub_services_items" USING btree ("_order");
  CREATE INDEX "landing_pages_sub_services_items_parent_id_idx" ON "landing_pages_sub_services_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_sub_services_items_image_idx" ON "landing_pages_sub_services_items" USING btree ("image_id");
  CREATE INDEX "landing_pages_prime_difference_checklist_order_idx" ON "landing_pages_prime_difference_checklist" USING btree ("_order");
  CREATE INDEX "landing_pages_prime_difference_checklist_parent_id_idx" ON "landing_pages_prime_difference_checklist" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_faq_items_order_idx" ON "landing_pages_faq_items" USING btree ("_order");
  CREATE INDEX "landing_pages_faq_items_parent_id_idx" ON "landing_pages_faq_items" USING btree ("_parent_id");
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_intro_image_id_media_id_fk" FOREIGN KEY ("intro_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_video_video_file_id_media_id_fk" FOREIGN KEY ("video_video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_video_poster_id_media_id_fk" FOREIGN KEY ("video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "landing_pages_intro_intro_image_idx" ON "landing_pages" USING btree ("intro_image_id");
  CREATE INDEX "landing_pages_video_video_video_file_idx" ON "landing_pages" USING btree ("video_video_file_id");
  CREATE INDEX "landing_pages_video_video_poster_idx" ON "landing_pages" USING btree ("video_poster_id");
  DROP TYPE "public"."enum_landing_pages_blocks_intro_image_side";
  DROP TYPE "public"."enum_landing_pages_blocks_image_text_image_side";
  DROP TYPE "public"."enum_landing_pages_blocks_icon_feature_list_image_side";
  DROP TYPE "public"."enum_landing_pages_blocks_checklist_image_side";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_landing_pages_blocks_intro_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_landing_pages_blocks_image_text_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_landing_pages_blocks_icon_feature_list_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_landing_pages_blocks_checklist_image_side" AS ENUM('left', 'right');
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
  
  ALTER TABLE "landing_pages_section_order" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_sub_services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_prime_difference_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_pages_faq_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "landing_pages_section_order" CASCADE;
  DROP TABLE "landing_pages_sub_services_items" CASCADE;
  DROP TABLE "landing_pages_prime_difference_checklist" CASCADE;
  DROP TABLE "landing_pages_faq_items" CASCADE;
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_intro_image_id_media_id_fk";
  
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_video_video_file_id_media_id_fk";
  
  ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_video_poster_id_media_id_fk";
  
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DATA TYPE text;
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_landing_pages_template";
  CREATE TYPE "public"."enum_landing_pages_template" AS ENUM('default', 'information');
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DEFAULT 'default'::"public"."enum_landing_pages_template";
  ALTER TABLE "landing_pages" ALTER COLUMN "template" SET DATA TYPE "public"."enum_landing_pages_template" USING "template"::"public"."enum_landing_pages_template";
  DROP INDEX "landing_pages_intro_intro_image_idx";
  DROP INDEX "landing_pages_video_video_video_file_idx";
  DROP INDEX "landing_pages_video_video_poster_idx";
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
  ALTER TABLE "landing_pages" DROP COLUMN "estimate_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "estimate_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "estimate_body";
  ALTER TABLE "landing_pages" DROP COLUMN "estimate_link";
  ALTER TABLE "landing_pages" DROP COLUMN "intro_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "intro_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "intro_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "intro_body";
  ALTER TABLE "landing_pages" DROP COLUMN "intro_image_id";
  ALTER TABLE "landing_pages" DROP COLUMN "sub_services_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "sub_services_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "sub_services_body";
  ALTER TABLE "landing_pages" DROP COLUMN "prime_difference_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "prime_difference_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "prime_difference_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "prime_difference_heading_accent";
  ALTER TABLE "landing_pages" DROP COLUMN "prime_difference_body";
  ALTER TABLE "landing_pages" DROP COLUMN "project_gallery_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "project_gallery_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "reflection_gallery_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "reflection_gallery_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "video_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "video_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "video_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "video_description";
  ALTER TABLE "landing_pages" DROP COLUMN "video_video_url";
  ALTER TABLE "landing_pages" DROP COLUMN "video_video_file_id";
  ALTER TABLE "landing_pages" DROP COLUMN "video_poster_id";
  ALTER TABLE "landing_pages" DROP COLUMN "why_choose_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "service_areas_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "faq_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "faq_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "testimonials_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "booking_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "booking_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "booking_description";
  ALTER TABLE "landing_pages" DROP COLUMN "contact_form_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "contact_form_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "contact_form_description";
  DROP TYPE "public"."enum_landing_pages_section_order_section";`)
}
