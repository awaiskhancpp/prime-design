import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_gallery_page_blocks_hero_align" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum_gallery_page_blocks_custom_image_side" AS ENUM('right', 'left');
  CREATE TABLE IF NOT EXISTS "gallery_page_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_highlight" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"align" "enum_gallery_page_blocks_hero_align" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_page_blocks_gallery_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_page_blocks_why_choose_us_reasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_page_blocks_why_choose_us" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"eyebrow_accent" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_page_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city" varchar,
  	"poster_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_page_blocks_service_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_page_blocks_custom_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_page_blocks_custom" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"heading_highlight" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"image_side" "enum_gallery_page_blocks_custom_image_side" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Gallery Page' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "gallery_page_id" integer;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_hero_image_id_media_id_fk') THEN ALTER TABLE "gallery_page_blocks_hero" ADD CONSTRAINT "gallery_page_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_hero_parent_id_fk') THEN ALTER TABLE "gallery_page_blocks_hero" ADD CONSTRAINT "gallery_page_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_gallery_tabs_parent_id_fk') THEN ALTER TABLE "gallery_page_blocks_gallery_tabs" ADD CONSTRAINT "gallery_page_blocks_gallery_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_why_choose_us_reasons_parent_id_fk') THEN ALTER TABLE "gallery_page_blocks_why_choose_us_reasons" ADD CONSTRAINT "gallery_page_blocks_why_choose_us_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_page_blocks_why_choose_us"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_why_choose_us_parent_id_fk') THEN ALTER TABLE "gallery_page_blocks_why_choose_us" ADD CONSTRAINT "gallery_page_blocks_why_choose_us_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_contact_poster_id_media_id_fk') THEN ALTER TABLE "gallery_page_blocks_contact" ADD CONSTRAINT "gallery_page_blocks_contact_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_contact_parent_id_fk') THEN ALTER TABLE "gallery_page_blocks_contact" ADD CONSTRAINT "gallery_page_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_service_areas_parent_id_fk') THEN ALTER TABLE "gallery_page_blocks_service_areas" ADD CONSTRAINT "gallery_page_blocks_service_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_custom_buttons_parent_id_fk') THEN ALTER TABLE "gallery_page_blocks_custom_buttons" ADD CONSTRAINT "gallery_page_blocks_custom_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_page_blocks_custom"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_custom_image_id_media_id_fk') THEN ALTER TABLE "gallery_page_blocks_custom" ADD CONSTRAINT "gallery_page_blocks_custom_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_page_blocks_custom_parent_id_fk') THEN ALTER TABLE "gallery_page_blocks_custom" ADD CONSTRAINT "gallery_page_blocks_custom_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_hero_order_idx" ON "gallery_page_blocks_hero" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_hero_parent_id_idx" ON "gallery_page_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_hero_path_idx" ON "gallery_page_blocks_hero" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_hero_image_idx" ON "gallery_page_blocks_hero" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_gallery_tabs_order_idx" ON "gallery_page_blocks_gallery_tabs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_gallery_tabs_parent_id_idx" ON "gallery_page_blocks_gallery_tabs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_gallery_tabs_path_idx" ON "gallery_page_blocks_gallery_tabs" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_why_choose_us_reasons_order_idx" ON "gallery_page_blocks_why_choose_us_reasons" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_why_choose_us_reasons_parent_id_idx" ON "gallery_page_blocks_why_choose_us_reasons" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_why_choose_us_order_idx" ON "gallery_page_blocks_why_choose_us" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_why_choose_us_parent_id_idx" ON "gallery_page_blocks_why_choose_us" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_why_choose_us_path_idx" ON "gallery_page_blocks_why_choose_us" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_contact_order_idx" ON "gallery_page_blocks_contact" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_contact_parent_id_idx" ON "gallery_page_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_contact_path_idx" ON "gallery_page_blocks_contact" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_contact_poster_idx" ON "gallery_page_blocks_contact" USING btree ("poster_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_service_areas_order_idx" ON "gallery_page_blocks_service_areas" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_service_areas_parent_id_idx" ON "gallery_page_blocks_service_areas" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_service_areas_path_idx" ON "gallery_page_blocks_service_areas" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_custom_buttons_order_idx" ON "gallery_page_blocks_custom_buttons" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_custom_buttons_parent_id_idx" ON "gallery_page_blocks_custom_buttons" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_custom_order_idx" ON "gallery_page_blocks_custom" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_custom_parent_id_idx" ON "gallery_page_blocks_custom" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_custom_path_idx" ON "gallery_page_blocks_custom" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "gallery_page_blocks_custom_image_idx" ON "gallery_page_blocks_custom" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "gallery_page_updated_at_idx" ON "gallery_page" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "gallery_page_created_at_idx" ON "gallery_page" USING btree ("created_at");
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_gallery_page_fk') THEN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_page_fk" FOREIGN KEY ("gallery_page_id") REFERENCES "public"."gallery_page"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_gallery_page_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_page_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "gallery_page_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_page_blocks_gallery_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_page_blocks_why_choose_us_reasons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_page_blocks_why_choose_us" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_page_blocks_contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_page_blocks_service_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_page_blocks_custom_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_page_blocks_custom" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_page" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "gallery_page_blocks_hero" CASCADE;
  DROP TABLE "gallery_page_blocks_gallery_tabs" CASCADE;
  DROP TABLE "gallery_page_blocks_why_choose_us_reasons" CASCADE;
  DROP TABLE "gallery_page_blocks_why_choose_us" CASCADE;
  DROP TABLE "gallery_page_blocks_contact" CASCADE;
  DROP TABLE "gallery_page_blocks_service_areas" CASCADE;
  DROP TABLE "gallery_page_blocks_custom_buttons" CASCADE;
  DROP TABLE "gallery_page_blocks_custom" CASCADE;
  DROP TABLE "gallery_page" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_gallery_page_fk";
  
  DROP INDEX "payload_locked_documents_rels_gallery_page_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "gallery_page_id";
  DROP TYPE "public"."enum_gallery_page_blocks_hero_align";
  DROP TYPE "public"."enum_gallery_page_blocks_custom_image_side";`)
}
