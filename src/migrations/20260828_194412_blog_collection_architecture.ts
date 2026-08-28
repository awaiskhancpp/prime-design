import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_blog_sections_image_position" AS ENUM('left', 'right', 'center');
  CREATE TYPE "public"."enum_blog_status" AS ENUM('draft', 'published', 'scheduled');
  CREATE TYPE "public"."enum_blog_scheduled_publish_slot" AS ENUM('0', '6', '12', '18');
  CREATE TYPE "public"."enum_blog_categories_status" AS ENUM('draft', 'published');
  CREATE TABLE "blog_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"image_id" integer,
  	"image_alt" varchar,
  	"image_position" "enum_blog_sections_image_position" DEFAULT 'center'
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
  
  CREATE TABLE "blog" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"wordpress_id" numeric,
  	"source_url" varchar,
  	"status" "enum_blog_status" DEFAULT 'draft' NOT NULL,
  	"scheduled_publish_date" timestamp(3) with time zone,
  	"scheduled_publish_slot" "enum_blog_scheduled_publish_slot",
  	"scheduled_publish_at" timestamp(3) with time zone,
  	"published_date" timestamp(3) with time zone,
  	"author_id" integer,
  	"excerpt" varchar,
  	"featured_image_id" integer NOT NULL,
  	"intro" varchar,
  	"content" jsonb,
  	"enable_t_o_c" boolean DEFAULT false,
  	"toc_title" varchar DEFAULT 'Table of Contents',
  	"faq_heading" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_meta_image_id" integer,
  	"seo_keywords" varchar,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"featured" boolean DEFAULT false,
  	"reading_time" numeric,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blog_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "blog_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"blog_categories_id" integer,
  	"blog_id" integer
  );
  
  CREATE TABLE "blog_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_blog_categories_status" DEFAULT 'draft',
  	"description" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP TABLE IF EXISTS "blog_posts_categories" CASCADE;
  DROP TABLE IF EXISTS "blog_posts_tags" CASCADE;
  DROP TABLE IF EXISTS "blog_posts_sections" CASCADE;
  DROP TABLE IF EXISTS "blog_posts" CASCADE;
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_blog_posts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "blog_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "blog_categories_id" integer;
  ALTER TABLE "blog_sections" ADD CONSTRAINT "blog_sections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_sections" ADD CONSTRAINT "blog_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_table_of_contents" ADD CONSTRAINT "blog_table_of_contents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_faq" ADD CONSTRAINT "blog_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog" ADD CONSTRAINT "blog_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog" ADD CONSTRAINT "blog_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog" ADD CONSTRAINT "blog_seo_meta_image_id_media_id_fk" FOREIGN KEY ("seo_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog" ADD CONSTRAINT "blog_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog" ADD CONSTRAINT "blog_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_texts" ADD CONSTRAINT "blog_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_rels" ADD CONSTRAINT "blog_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_rels" ADD CONSTRAINT "blog_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_rels" ADD CONSTRAINT "blog_rels_blog_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "blog_sections_order_idx" ON "blog_sections" USING btree ("_order");
  CREATE INDEX "blog_sections_parent_id_idx" ON "blog_sections" USING btree ("_parent_id");
  CREATE INDEX "blog_sections_image_idx" ON "blog_sections" USING btree ("image_id");
  CREATE INDEX "blog_table_of_contents_order_idx" ON "blog_table_of_contents" USING btree ("_order");
  CREATE INDEX "blog_table_of_contents_parent_id_idx" ON "blog_table_of_contents" USING btree ("_parent_id");
  CREATE INDEX "blog_faq_order_idx" ON "blog_faq" USING btree ("_order");
  CREATE INDEX "blog_faq_parent_id_idx" ON "blog_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "blog_slug_idx" ON "blog" USING btree ("slug");
  CREATE UNIQUE INDEX "blog_wordpress_id_idx" ON "blog" USING btree ("wordpress_id");
  CREATE INDEX "blog_status_idx" ON "blog" USING btree ("status");
  CREATE INDEX "blog_scheduled_publish_slot_idx" ON "blog" USING btree ("scheduled_publish_slot");
  CREATE INDEX "blog_scheduled_publish_at_idx" ON "blog" USING btree ("scheduled_publish_at");
  CREATE INDEX "blog_published_date_idx" ON "blog" USING btree ("published_date");
  CREATE INDEX "blog_author_idx" ON "blog" USING btree ("author_id");
  CREATE INDEX "blog_featured_image_idx" ON "blog" USING btree ("featured_image_id");
  CREATE INDEX "blog_seo_seo_meta_image_idx" ON "blog" USING btree ("seo_meta_image_id");
  CREATE INDEX "blog_created_by_idx" ON "blog" USING btree ("created_by_id");
  CREATE INDEX "blog_updated_by_idx" ON "blog" USING btree ("updated_by_id");
  CREATE INDEX "blog_updated_at_idx" ON "blog" USING btree ("updated_at");
  CREATE INDEX "blog_created_at_idx" ON "blog" USING btree ("created_at");
  CREATE INDEX "blog_texts_order_parent" ON "blog_texts" USING btree ("order","parent_id");
  CREATE INDEX "blog_rels_order_idx" ON "blog_rels" USING btree ("order");
  CREATE INDEX "blog_rels_parent_idx" ON "blog_rels" USING btree ("parent_id");
  CREATE INDEX "blog_rels_path_idx" ON "blog_rels" USING btree ("path");
  CREATE INDEX "blog_rels_blog_categories_id_idx" ON "blog_rels" USING btree ("blog_categories_id");
  CREATE INDEX "blog_rels_blog_id_idx" ON "blog_rels" USING btree ("blog_id");
  CREATE UNIQUE INDEX "blog_categories_slug_idx" ON "blog_categories" USING btree ("slug");
  CREATE INDEX "blog_categories_status_idx" ON "blog_categories" USING btree ("status");
  CREATE INDEX "blog_categories_created_by_idx" ON "blog_categories" USING btree ("created_by_id");
  CREATE INDEX "blog_categories_updated_by_idx" ON "blog_categories" USING btree ("updated_by_id");
  CREATE INDEX "blog_categories_updated_at_idx" ON "blog_categories" USING btree ("updated_at");
  CREATE INDEX "blog_categories_created_at_idx" ON "blog_categories" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_blog_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_id");
  CREATE INDEX "payload_locked_documents_rels_blog_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_categories_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "blog_posts_id";
  DROP TYPE IF EXISTS "public"."enum_blog_posts_sections_image_position";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_blog_posts_sections_image_position" AS ENUM('left', 'right', 'center');
  CREATE TABLE "blog_posts_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "blog_posts_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "blog_posts_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"image_id" integer,
  	"image_alt" varchar,
  	"image_position" "enum_blog_posts_sections_image_position" DEFAULT 'center'
  );
  
  CREATE TABLE "blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar NOT NULL,
  	"author" varchar NOT NULL,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"hero_image_id" integer NOT NULL,
  	"intro" varchar,
  	"content" jsonb,
  	"wordpress_id" numeric,
  	"source_url" varchar,
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
  
  ALTER TABLE "blog_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog_table_of_contents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog_categories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "blog_sections" CASCADE;
  DROP TABLE "blog_table_of_contents" CASCADE;
  DROP TABLE "blog_faq" CASCADE;
  DROP TABLE "blog" CASCADE;
  DROP TABLE "blog_texts" CASCADE;
  DROP TABLE "blog_rels" CASCADE;
  DROP TABLE "blog_categories" CASCADE;
  
  
  DROP INDEX "payload_locked_documents_rels_blog_id_idx";
  DROP INDEX "payload_locked_documents_rels_blog_categories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "blog_posts_id" integer;
  ALTER TABLE "blog_posts_categories" ADD CONSTRAINT "blog_posts_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts_tags" ADD CONSTRAINT "blog_posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts_sections" ADD CONSTRAINT "blog_posts_sections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts_sections" ADD CONSTRAINT "blog_posts_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "blog_posts_categories_order_idx" ON "blog_posts_categories" USING btree ("_order");
  CREATE INDEX "blog_posts_categories_parent_id_idx" ON "blog_posts_categories" USING btree ("_parent_id");
  CREATE INDEX "blog_posts_tags_order_idx" ON "blog_posts_tags" USING btree ("_order");
  CREATE INDEX "blog_posts_tags_parent_id_idx" ON "blog_posts_tags" USING btree ("_parent_id");
  CREATE INDEX "blog_posts_sections_order_idx" ON "blog_posts_sections" USING btree ("_order");
  CREATE INDEX "blog_posts_sections_parent_id_idx" ON "blog_posts_sections" USING btree ("_parent_id");
  CREATE INDEX "blog_posts_sections_image_idx" ON "blog_posts_sections" USING btree ("image_id");
  CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
  CREATE INDEX "blog_posts_hero_image_idx" ON "blog_posts" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "blog_posts_wordpress_id_idx" ON "blog_posts" USING btree ("wordpress_id");
  CREATE INDEX "blog_posts_seo_seo_og_image_idx" ON "blog_posts" USING btree ("seo_og_image_id");
  CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts" USING btree ("updated_at");
  CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "blog_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "blog_categories_id";
  DROP TYPE "public"."enum_blog_sections_image_position";
  DROP TYPE "public"."enum_blog_status";
  DROP TYPE "public"."enum_blog_scheduled_publish_slot";
  DROP TYPE "public"."enum_blog_categories_status";`)
}
