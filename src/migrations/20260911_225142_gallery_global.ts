import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "gallery_why_choose_us_reasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "gallery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_heading" varchar,
  	"hero_heading_highlight" varchar,
  	"hero_description" jsonb,
  	"hero_image_id" integer,
  	"why_choose_us_eyebrow" varchar,
  	"why_choose_us_eyebrow_accent" varchar,
  	"why_choose_us_heading" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_why_choose_us_reasons_parent_id_fk') THEN ALTER TABLE "gallery_why_choose_us_reasons" ADD CONSTRAINT "gallery_why_choose_us_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_hero_image_id_media_id_fk') THEN ALTER TABLE "gallery" ADD CONSTRAINT "gallery_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  CREATE INDEX IF NOT EXISTS "gallery_why_choose_us_reasons_order_idx" ON "gallery_why_choose_us_reasons" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "gallery_why_choose_us_reasons_parent_id_idx" ON "gallery_why_choose_us_reasons" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_hero_hero_image_idx" ON "gallery" USING btree ("hero_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "gallery_why_choose_us_reasons" CASCADE;
  DROP TABLE "gallery" CASCADE;`)
}
