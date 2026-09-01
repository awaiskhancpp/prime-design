import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const existing = await db.execute(sql`SELECT to_regclass('public.landing_pages_projects_items') AS table_name`)
  const rows = (existing as unknown as { rows?: Array<{ table_name?: string | null }> }).rows
  if (rows?.[0]?.table_name) return

  await db.execute(sql`
  ALTER TYPE "public"."enum_landing_pages_section_order_section" ADD VALUE IF NOT EXISTS 'projects' BEFORE 'projectGallery';
  ALTER TYPE "public"."enum_landing_pages_section_order_section" ADD VALUE IF NOT EXISTS 'luxuryCta' BEFORE 'booking';
  ALTER TYPE "public"."enum_landing_pages_section_order_section" ADD VALUE IF NOT EXISTS 'findUs' BEFORE 'contactForm';
  CREATE TABLE "landing_pages_projects_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"link" varchar
  );
  
  CREATE TABLE "landing_pages_faq_categories_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pages_faq_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  ALTER TABLE "landing_pages" ADD COLUMN "projects_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "projects_eyebrow" varchar DEFAULT 'Our Projects';
  ALTER TABLE "landing_pages" ADD COLUMN "projects_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "projects_description" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "luxury_cta_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "luxury_cta_eyebrow" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "luxury_cta_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "luxury_cta_body" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "luxury_cta_link" varchar DEFAULT '/contact';
  ALTER TABLE "landing_pages" ADD COLUMN "find_us_enabled" boolean DEFAULT true;
  ALTER TABLE "landing_pages" ADD COLUMN "find_us_heading" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "find_us_phone" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "find_us_email" varchar;
  ALTER TABLE "landing_pages" ADD COLUMN "find_us_address" varchar;
  ALTER TABLE "landing_pages_projects_items" ADD CONSTRAINT "landing_pages_projects_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_projects_items" ADD CONSTRAINT "landing_pages_projects_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_faq_categories_items" ADD CONSTRAINT "landing_pages_faq_categories_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_faq_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_faq_categories" ADD CONSTRAINT "landing_pages_faq_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "landing_pages_projects_items_order_idx" ON "landing_pages_projects_items" USING btree ("_order");
  CREATE INDEX "landing_pages_projects_items_parent_id_idx" ON "landing_pages_projects_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_projects_items_image_idx" ON "landing_pages_projects_items" USING btree ("image_id");
  CREATE INDEX "landing_pages_faq_categories_items_order_idx" ON "landing_pages_faq_categories_items" USING btree ("_order");
  CREATE INDEX "landing_pages_faq_categories_items_parent_id_idx" ON "landing_pages_faq_categories_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_faq_categories_order_idx" ON "landing_pages_faq_categories" USING btree ("_order");
  CREATE INDEX "landing_pages_faq_categories_parent_id_idx" ON "landing_pages_faq_categories" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "landing_pages_projects_items" CASCADE;
  DROP TABLE "landing_pages_faq_categories_items" CASCADE;
  DROP TABLE "landing_pages_faq_categories" CASCADE;
  ALTER TABLE "landing_pages_section_order" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum_landing_pages_section_order_section";
  CREATE TYPE "public"."enum_landing_pages_section_order_section" AS ENUM('estimate', 'intro', 'subServices', 'primeDifference', 'projectGallery', 'reflectionGallery', 'video', 'whyChoose', 'serviceAreas', 'faq', 'testimonials', 'booking', 'contactForm');
  ALTER TABLE "landing_pages_section_order" ALTER COLUMN "section" SET DATA TYPE "public"."enum_landing_pages_section_order_section" USING "section"::"public"."enum_landing_pages_section_order_section";
  ALTER TABLE "landing_pages" DROP COLUMN "projects_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "projects_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "projects_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "projects_description";
  ALTER TABLE "landing_pages" DROP COLUMN "luxury_cta_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "luxury_cta_eyebrow";
  ALTER TABLE "landing_pages" DROP COLUMN "luxury_cta_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "luxury_cta_body";
  ALTER TABLE "landing_pages" DROP COLUMN "luxury_cta_link";
  ALTER TABLE "landing_pages" DROP COLUMN "find_us_enabled";
  ALTER TABLE "landing_pages" DROP COLUMN "find_us_heading";
  ALTER TABLE "landing_pages" DROP COLUMN "find_us_phone";
  ALTER TABLE "landing_pages" DROP COLUMN "find_us_email";
  ALTER TABLE "landing_pages" DROP COLUMN "find_us_address";`)
}
