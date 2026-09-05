import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "services_blocks_landing_testimonials_providers_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reviewer" varchar,
  	"rating" numeric,
  	"body" varchar,
  	"date" varchar,
  	"source_id" varchar
  );
  
  CREATE TABLE "services_blocks_landing_testimonials_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"collection_id" varchar,
  	"review_url" varchar,
  	"rating" numeric,
  	"review_count" numeric
  );
  
  CREATE TABLE "services_blocks_landing_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_landing_testimonials_providers_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reviewer" varchar,
  	"rating" numeric,
  	"body" varchar,
  	"date" varchar,
  	"source_id" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_landing_testimonials_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"collection_id" varchar,
  	"review_url" varchar,
  	"rating" numeric,
  	"review_count" numeric
  );
  
  CREATE TABLE "landing_pages_blocks_landing_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source_id" varchar,
  	"source_element_type" varchar,
  	"source_attachment_id" numeric,
  	"source_metadata" jsonb,
  	"block_name" varchar
  );
  
  ALTER TABLE "services_blocks_landing_testimonials_providers_reviews" ADD CONSTRAINT "services_blocks_landing_testimonials_providers_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_landing_testimonials_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_landing_testimonials_providers" ADD CONSTRAINT "services_blocks_landing_testimonials_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_landing_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_landing_testimonials" ADD CONSTRAINT "services_blocks_landing_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_landing_testimonials_providers_reviews" ADD CONSTRAINT "landing_pages_blocks_landing_testimonials_providers_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_landing_testimonials_providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_landing_testimonials_providers" ADD CONSTRAINT "landing_pages_blocks_landing_testimonials_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_landing_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_landing_testimonials" ADD CONSTRAINT "landing_pages_blocks_landing_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_blocks_landing_testimonials_providers_reviews_order_idx" ON "services_blocks_landing_testimonials_providers_reviews" USING btree ("_order");
  CREATE INDEX "services_blocks_landing_testimonials_providers_reviews_parent_id_idx" ON "services_blocks_landing_testimonials_providers_reviews" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_landing_testimonials_providers_order_idx" ON "services_blocks_landing_testimonials_providers" USING btree ("_order");
  CREATE INDEX "services_blocks_landing_testimonials_providers_parent_id_idx" ON "services_blocks_landing_testimonials_providers" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_landing_testimonials_order_idx" ON "services_blocks_landing_testimonials" USING btree ("_order");
  CREATE INDEX "services_blocks_landing_testimonials_parent_id_idx" ON "services_blocks_landing_testimonials" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_landing_testimonials_path_idx" ON "services_blocks_landing_testimonials" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_landing_testimonials_providers_reviews_order_idx" ON "landing_pages_blocks_landing_testimonials_providers_reviews" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_landing_testimonials_providers_reviews_parent_id_idx" ON "landing_pages_blocks_landing_testimonials_providers_reviews" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_landing_testimonials_providers_order_idx" ON "landing_pages_blocks_landing_testimonials_providers" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_landing_testimonials_providers_parent_id_idx" ON "landing_pages_blocks_landing_testimonials_providers" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_landing_testimonials_order_idx" ON "landing_pages_blocks_landing_testimonials" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_landing_testimonials_parent_id_idx" ON "landing_pages_blocks_landing_testimonials" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_landing_testimonials_path_idx" ON "landing_pages_blocks_landing_testimonials" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services_blocks_landing_testimonials_providers_reviews" CASCADE;
  DROP TABLE "services_blocks_landing_testimonials_providers" CASCADE;
  DROP TABLE "services_blocks_landing_testimonials" CASCADE;
  DROP TABLE "landing_pages_blocks_landing_testimonials_providers_reviews" CASCADE;
  DROP TABLE "landing_pages_blocks_landing_testimonials_providers" CASCADE;
  DROP TABLE "landing_pages_blocks_landing_testimonials" CASCADE;`)
}
