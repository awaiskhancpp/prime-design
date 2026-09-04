import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "services_blocks_project_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_asset_id" integer,
  	"image_alt" varchar,
  	"image_caption" varchar,
  	"image_source_attachment_id" numeric,
  	"image_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_blocks_project_grid" (
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
  
  CREATE TABLE "landing_pages_blocks_project_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_asset_id" integer,
  	"image_alt" varchar,
  	"image_caption" varchar,
  	"image_source_attachment_id" numeric,
  	"image_source_url" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"link_open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "landing_pages_blocks_project_grid" (
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
  
  ALTER TABLE "services_blocks_project_grid_items" ADD CONSTRAINT "services_blocks_project_grid_items_image_asset_id_media_id_fk" FOREIGN KEY ("image_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_project_grid_items" ADD CONSTRAINT "services_blocks_project_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_project_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_project_grid" ADD CONSTRAINT "services_blocks_project_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_project_grid_items" ADD CONSTRAINT "landing_pages_blocks_project_grid_items_image_asset_id_media_id_fk" FOREIGN KEY ("image_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_project_grid_items" ADD CONSTRAINT "landing_pages_blocks_project_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_project_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_project_grid" ADD CONSTRAINT "landing_pages_blocks_project_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_blocks_project_grid_items_order_idx" ON "services_blocks_project_grid_items" USING btree ("_order");
  CREATE INDEX "services_blocks_project_grid_items_parent_id_idx" ON "services_blocks_project_grid_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_project_grid_items_image_image_asset_idx" ON "services_blocks_project_grid_items" USING btree ("image_asset_id");
  CREATE INDEX "services_blocks_project_grid_order_idx" ON "services_blocks_project_grid" USING btree ("_order");
  CREATE INDEX "services_blocks_project_grid_parent_id_idx" ON "services_blocks_project_grid" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_project_grid_path_idx" ON "services_blocks_project_grid" USING btree ("_path");
  CREATE INDEX "landing_pages_blocks_project_grid_items_order_idx" ON "landing_pages_blocks_project_grid_items" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_project_grid_items_parent_id_idx" ON "landing_pages_blocks_project_grid_items" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_project_grid_items_image_image_asse_idx" ON "landing_pages_blocks_project_grid_items" USING btree ("image_asset_id");
  CREATE INDEX "landing_pages_blocks_project_grid_order_idx" ON "landing_pages_blocks_project_grid" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_project_grid_parent_id_idx" ON "landing_pages_blocks_project_grid" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_project_grid_path_idx" ON "landing_pages_blocks_project_grid" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services_blocks_project_grid_items" CASCADE;
  DROP TABLE "services_blocks_project_grid" CASCADE;
  DROP TABLE "landing_pages_blocks_project_grid_items" CASCADE;
  DROP TABLE "landing_pages_blocks_project_grid" CASCADE;`)
}
