import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_page_blocks_hero_align" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum_home_page_blocks_custom_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_about_page_blocks_hero_align" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum_about_page_blocks_custom_image_side" AS ENUM('right', 'left');
  CREATE TABLE IF NOT EXISTS "home_page_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"video_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"align" "enum_home_page_blocks_hero_align" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_difference_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lead" varchar,
  	"text" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_difference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_feature_blocks_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" jsonb,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"before_image_id" integer,
  	"after_image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_feature_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"title_highlight" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_service_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_custom_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "home_page_blocks_custom" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"heading_highlight" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"image_side" "enum_home_page_blocks_custom_image_side" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Homepage' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "about_page_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"image_secondary_id" integer,
  	"video_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"align" "enum_about_page_blocks_hero_align" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_page_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"body" jsonb,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"intro_heading" varchar,
  	"intro_subheading" varchar,
  	"intro_body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_page_blocks_guiding_principle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"image_secondary_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_page_blocks_core_values_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "about_page_blocks_core_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_page_blocks_experts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" jsonb,
  	"video_id" integer,
  	"poster_id" integer,
  	"badge_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_page_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_page_blocks_service_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_page_blocks_custom_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "about_page_blocks_custom" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"heading_highlight" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"image_side" "enum_about_page_blocks_custom_image_side" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'About Page' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "home_page_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "about_page_id" integer;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_hero_image_id_media_id_fk') THEN ALTER TABLE "home_page_blocks_hero" ADD CONSTRAINT "home_page_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_hero_video_id_media_id_fk') THEN ALTER TABLE "home_page_blocks_hero" ADD CONSTRAINT "home_page_blocks_hero_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_hero_parent_id_fk') THEN ALTER TABLE "home_page_blocks_hero" ADD CONSTRAINT "home_page_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_intro_image_id_media_id_fk') THEN ALTER TABLE "home_page_blocks_intro" ADD CONSTRAINT "home_page_blocks_intro_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_intro_parent_id_fk') THEN ALTER TABLE "home_page_blocks_intro" ADD CONSTRAINT "home_page_blocks_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_difference_checklist_parent_id_fk') THEN ALTER TABLE "home_page_blocks_difference_checklist" ADD CONSTRAINT "home_page_blocks_difference_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_difference"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_difference_parent_id_fk') THEN ALTER TABLE "home_page_blocks_difference" ADD CONSTRAINT "home_page_blocks_difference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_projects_parent_id_fk') THEN ALTER TABLE "home_page_blocks_projects" ADD CONSTRAINT "home_page_blocks_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_services_parent_id_fk') THEN ALTER TABLE "home_page_blocks_services" ADD CONSTRAINT "home_page_blocks_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_feature_blocks_items_before_image_id_media_id_fk') THEN ALTER TABLE "home_page_blocks_feature_blocks_items" ADD CONSTRAINT "home_page_blocks_feature_blocks_items_before_image_id_media_id_fk" FOREIGN KEY ("before_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_feature_blocks_items_after_image_id_media_id_fk') THEN ALTER TABLE "home_page_blocks_feature_blocks_items" ADD CONSTRAINT "home_page_blocks_feature_blocks_items_after_image_id_media_id_fk" FOREIGN KEY ("after_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_feature_blocks_items_parent_id_fk') THEN ALTER TABLE "home_page_blocks_feature_blocks_items" ADD CONSTRAINT "home_page_blocks_feature_blocks_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_feature_blocks"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_feature_blocks_parent_id_fk') THEN ALTER TABLE "home_page_blocks_feature_blocks" ADD CONSTRAINT "home_page_blocks_feature_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_contact_parent_id_fk') THEN ALTER TABLE "home_page_blocks_contact" ADD CONSTRAINT "home_page_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_service_areas_parent_id_fk') THEN ALTER TABLE "home_page_blocks_service_areas" ADD CONSTRAINT "home_page_blocks_service_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_custom_buttons_parent_id_fk') THEN ALTER TABLE "home_page_blocks_custom_buttons" ADD CONSTRAINT "home_page_blocks_custom_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_custom"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_custom_image_id_media_id_fk') THEN ALTER TABLE "home_page_blocks_custom" ADD CONSTRAINT "home_page_blocks_custom_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_blocks_custom_parent_id_fk') THEN ALTER TABLE "home_page_blocks_custom" ADD CONSTRAINT "home_page_blocks_custom_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_hero_image_id_media_id_fk') THEN ALTER TABLE "about_page_blocks_hero" ADD CONSTRAINT "about_page_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_hero_image_secondary_id_media_id_fk') THEN ALTER TABLE "about_page_blocks_hero" ADD CONSTRAINT "about_page_blocks_hero_image_secondary_id_media_id_fk" FOREIGN KEY ("image_secondary_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_hero_video_id_media_id_fk') THEN ALTER TABLE "about_page_blocks_hero" ADD CONSTRAINT "about_page_blocks_hero_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_hero_parent_id_fk') THEN ALTER TABLE "about_page_blocks_hero" ADD CONSTRAINT "about_page_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_team_parent_id_fk') THEN ALTER TABLE "about_page_blocks_team" ADD CONSTRAINT "about_page_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_guiding_principle_image_id_media_id_fk') THEN ALTER TABLE "about_page_blocks_guiding_principle" ADD CONSTRAINT "about_page_blocks_guiding_principle_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_guiding_principle_image_secondary_id_media_id_fk') THEN ALTER TABLE "about_page_blocks_guiding_principle" ADD CONSTRAINT "about_page_blocks_guiding_principle_image_secondary_id_media_id_fk" FOREIGN KEY ("image_secondary_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_guiding_principle_parent_id_fk') THEN ALTER TABLE "about_page_blocks_guiding_principle" ADD CONSTRAINT "about_page_blocks_guiding_principle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_core_values_values_parent_id_fk') THEN ALTER TABLE "about_page_blocks_core_values_values" ADD CONSTRAINT "about_page_blocks_core_values_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_blocks_core_values"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_core_values_parent_id_fk') THEN ALTER TABLE "about_page_blocks_core_values" ADD CONSTRAINT "about_page_blocks_core_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_experts_video_id_media_id_fk') THEN ALTER TABLE "about_page_blocks_experts" ADD CONSTRAINT "about_page_blocks_experts_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_experts_poster_id_media_id_fk') THEN ALTER TABLE "about_page_blocks_experts" ADD CONSTRAINT "about_page_blocks_experts_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_experts_badge_id_media_id_fk') THEN ALTER TABLE "about_page_blocks_experts" ADD CONSTRAINT "about_page_blocks_experts_badge_id_media_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_experts_parent_id_fk') THEN ALTER TABLE "about_page_blocks_experts" ADD CONSTRAINT "about_page_blocks_experts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_faq_parent_id_fk') THEN ALTER TABLE "about_page_blocks_faq" ADD CONSTRAINT "about_page_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_service_areas_parent_id_fk') THEN ALTER TABLE "about_page_blocks_service_areas" ADD CONSTRAINT "about_page_blocks_service_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_custom_buttons_parent_id_fk') THEN ALTER TABLE "about_page_blocks_custom_buttons" ADD CONSTRAINT "about_page_blocks_custom_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_blocks_custom"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_custom_image_id_media_id_fk') THEN ALTER TABLE "about_page_blocks_custom" ADD CONSTRAINT "about_page_blocks_custom_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_page_blocks_custom_parent_id_fk') THEN ALTER TABLE "about_page_blocks_custom" ADD CONSTRAINT "about_page_blocks_custom_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  CREATE INDEX IF NOT EXISTS "home_page_blocks_hero_order_idx" ON "home_page_blocks_hero" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_hero_parent_id_idx" ON "home_page_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_hero_path_idx" ON "home_page_blocks_hero" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_hero_image_idx" ON "home_page_blocks_hero" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_hero_video_idx" ON "home_page_blocks_hero" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_intro_order_idx" ON "home_page_blocks_intro" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_intro_parent_id_idx" ON "home_page_blocks_intro" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_intro_path_idx" ON "home_page_blocks_intro" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_intro_image_idx" ON "home_page_blocks_intro" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_difference_checklist_order_idx" ON "home_page_blocks_difference_checklist" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_difference_checklist_parent_id_idx" ON "home_page_blocks_difference_checklist" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_difference_order_idx" ON "home_page_blocks_difference" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_difference_parent_id_idx" ON "home_page_blocks_difference" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_difference_path_idx" ON "home_page_blocks_difference" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_projects_order_idx" ON "home_page_blocks_projects" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_projects_parent_id_idx" ON "home_page_blocks_projects" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_projects_path_idx" ON "home_page_blocks_projects" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_services_order_idx" ON "home_page_blocks_services" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_services_parent_id_idx" ON "home_page_blocks_services" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_services_path_idx" ON "home_page_blocks_services" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_feature_blocks_items_order_idx" ON "home_page_blocks_feature_blocks_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_feature_blocks_items_parent_id_idx" ON "home_page_blocks_feature_blocks_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_feature_blocks_items_before_image_idx" ON "home_page_blocks_feature_blocks_items" USING btree ("before_image_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_feature_blocks_items_after_image_idx" ON "home_page_blocks_feature_blocks_items" USING btree ("after_image_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_feature_blocks_order_idx" ON "home_page_blocks_feature_blocks" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_feature_blocks_parent_id_idx" ON "home_page_blocks_feature_blocks" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_feature_blocks_path_idx" ON "home_page_blocks_feature_blocks" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_contact_order_idx" ON "home_page_blocks_contact" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_contact_parent_id_idx" ON "home_page_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_contact_path_idx" ON "home_page_blocks_contact" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_service_areas_order_idx" ON "home_page_blocks_service_areas" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_service_areas_parent_id_idx" ON "home_page_blocks_service_areas" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_service_areas_path_idx" ON "home_page_blocks_service_areas" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_custom_buttons_order_idx" ON "home_page_blocks_custom_buttons" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_custom_buttons_parent_id_idx" ON "home_page_blocks_custom_buttons" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_custom_order_idx" ON "home_page_blocks_custom" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_custom_parent_id_idx" ON "home_page_blocks_custom" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_custom_path_idx" ON "home_page_blocks_custom" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "home_page_blocks_custom_image_idx" ON "home_page_blocks_custom" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "home_page_updated_at_idx" ON "home_page" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "home_page_created_at_idx" ON "home_page" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_hero_order_idx" ON "about_page_blocks_hero" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_hero_parent_id_idx" ON "about_page_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_hero_path_idx" ON "about_page_blocks_hero" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_hero_image_idx" ON "about_page_blocks_hero" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_hero_image_secondary_idx" ON "about_page_blocks_hero" USING btree ("image_secondary_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_hero_video_idx" ON "about_page_blocks_hero" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_team_order_idx" ON "about_page_blocks_team" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_team_parent_id_idx" ON "about_page_blocks_team" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_team_path_idx" ON "about_page_blocks_team" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_guiding_principle_order_idx" ON "about_page_blocks_guiding_principle" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_guiding_principle_parent_id_idx" ON "about_page_blocks_guiding_principle" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_guiding_principle_path_idx" ON "about_page_blocks_guiding_principle" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_guiding_principle_image_idx" ON "about_page_blocks_guiding_principle" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_guiding_principle_image_secondary_idx" ON "about_page_blocks_guiding_principle" USING btree ("image_secondary_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_core_values_values_order_idx" ON "about_page_blocks_core_values_values" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_core_values_values_parent_id_idx" ON "about_page_blocks_core_values_values" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_core_values_order_idx" ON "about_page_blocks_core_values" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_core_values_parent_id_idx" ON "about_page_blocks_core_values" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_core_values_path_idx" ON "about_page_blocks_core_values" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_experts_order_idx" ON "about_page_blocks_experts" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_experts_parent_id_idx" ON "about_page_blocks_experts" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_experts_path_idx" ON "about_page_blocks_experts" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_experts_video_idx" ON "about_page_blocks_experts" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_experts_poster_idx" ON "about_page_blocks_experts" USING btree ("poster_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_experts_badge_idx" ON "about_page_blocks_experts" USING btree ("badge_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_faq_order_idx" ON "about_page_blocks_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_faq_parent_id_idx" ON "about_page_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_faq_path_idx" ON "about_page_blocks_faq" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_service_areas_order_idx" ON "about_page_blocks_service_areas" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_service_areas_parent_id_idx" ON "about_page_blocks_service_areas" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_service_areas_path_idx" ON "about_page_blocks_service_areas" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_custom_buttons_order_idx" ON "about_page_blocks_custom_buttons" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_custom_buttons_parent_id_idx" ON "about_page_blocks_custom_buttons" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_custom_order_idx" ON "about_page_blocks_custom" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_custom_parent_id_idx" ON "about_page_blocks_custom" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_custom_path_idx" ON "about_page_blocks_custom" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "about_page_blocks_custom_image_idx" ON "about_page_blocks_custom" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "about_page_updated_at_idx" ON "about_page" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "about_page_created_at_idx" ON "about_page" USING btree ("created_at");
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_home_page_fk') THEN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_home_page_fk" FOREIGN KEY ("home_page_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_about_page_fk') THEN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_about_page_fk" FOREIGN KEY ("about_page_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_home_page_id_idx" ON "payload_locked_documents_rels" USING btree ("home_page_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_about_page_id_idx" ON "payload_locked_documents_rels" USING btree ("about_page_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_intro" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_difference_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_difference" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_feature_blocks_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_feature_blocks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_service_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_custom_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_custom" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_blocks_team" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_blocks_guiding_principle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_blocks_core_values_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_blocks_core_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_blocks_experts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_blocks_service_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_blocks_custom_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_blocks_custom" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "home_page_blocks_hero" CASCADE;
  DROP TABLE "home_page_blocks_intro" CASCADE;
  DROP TABLE "home_page_blocks_difference_checklist" CASCADE;
  DROP TABLE "home_page_blocks_difference" CASCADE;
  DROP TABLE "home_page_blocks_projects" CASCADE;
  DROP TABLE "home_page_blocks_services" CASCADE;
  DROP TABLE "home_page_blocks_feature_blocks_items" CASCADE;
  DROP TABLE "home_page_blocks_feature_blocks" CASCADE;
  DROP TABLE "home_page_blocks_contact" CASCADE;
  DROP TABLE "home_page_blocks_service_areas" CASCADE;
  DROP TABLE "home_page_blocks_custom_buttons" CASCADE;
  DROP TABLE "home_page_blocks_custom" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "about_page_blocks_hero" CASCADE;
  DROP TABLE "about_page_blocks_team" CASCADE;
  DROP TABLE "about_page_blocks_guiding_principle" CASCADE;
  DROP TABLE "about_page_blocks_core_values_values" CASCADE;
  DROP TABLE "about_page_blocks_core_values" CASCADE;
  DROP TABLE "about_page_blocks_experts" CASCADE;
  DROP TABLE "about_page_blocks_faq" CASCADE;
  DROP TABLE "about_page_blocks_service_areas" CASCADE;
  DROP TABLE "about_page_blocks_custom_buttons" CASCADE;
  DROP TABLE "about_page_blocks_custom" CASCADE;
  DROP TABLE "about_page" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_home_page_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_about_page_fk";
  
  DROP INDEX "payload_locked_documents_rels_home_page_id_idx";
  DROP INDEX "payload_locked_documents_rels_about_page_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "home_page_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "about_page_id";
  DROP TYPE "public"."enum_home_page_blocks_hero_align";
  DROP TYPE "public"."enum_home_page_blocks_custom_image_side";
  DROP TYPE "public"."enum_about_page_blocks_hero_align";
  DROP TYPE "public"."enum_about_page_blocks_custom_image_side";`)
}
