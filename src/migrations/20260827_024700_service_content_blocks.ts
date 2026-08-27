import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_services_blocks_intro_image_side" AS ENUM('left', 'right');
    CREATE TYPE "public"."enum_services_blocks_image_text_image_side" AS ENUM('left', 'right');
    CREATE TABLE "services_blocks_intro" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "eyebrow" varchar, "heading" varchar NOT NULL,
      "body" varchar NOT NULL, "image_id" integer, "image_side" "enum_services_blocks_intro_image_side" DEFAULT 'right', "block_name" varchar
    );
    CREATE TABLE "services_blocks_feature_list_items" (
      "_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "text" varchar NOT NULL
    );
    CREATE TABLE "services_blocks_feature_list" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "heading" varchar NOT NULL, "block_name" varchar
    );
    CREATE TABLE "services_blocks_benefits_items" (
      "_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "text" varchar NOT NULL
    );
    CREATE TABLE "services_blocks_benefits" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "heading" varchar NOT NULL, "block_name" varchar
    );
    CREATE TABLE "services_blocks_process_steps" (
      "_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL, "description" varchar NOT NULL, "image_id" integer
    );
    CREATE TABLE "services_blocks_process" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "heading" varchar NOT NULL, "block_name" varchar
    );
    CREATE TABLE "services_blocks_image_text" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "eyebrow" varchar, "heading" varchar NOT NULL,
      "body" varchar NOT NULL, "image_id" integer, "image_side" "enum_services_blocks_image_text_image_side" DEFAULT 'left', "block_name" varchar
    );
    CREATE TABLE "services_blocks_gallery" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "heading" varchar, "block_name" varchar
    );
    CREATE TABLE "services_blocks_sub_services_items" (
      "_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL, "description" varchar NOT NULL, "image_id" integer, "link" varchar
    );
    CREATE TABLE "services_blocks_sub_services" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "heading" varchar NOT NULL, "block_name" varchar
    );
    CREATE TABLE "services_blocks_video" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "heading" varchar, "video_url" varchar NOT NULL, "poster_id" integer, "block_name" varchar
    );
    CREATE TABLE "services_blocks_quote" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "quote" varchar NOT NULL, "attribution" varchar, "block_name" varchar
    );
    ALTER TABLE "services_blocks_intro" ADD CONSTRAINT "services_blocks_intro_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_feature_list" ADD CONSTRAINT "services_blocks_feature_list_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_feature_list_items" ADD CONSTRAINT "services_blocks_feature_list_items_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_feature_list"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_benefits" ADD CONSTRAINT "services_blocks_benefits_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_benefits_items" ADD CONSTRAINT "services_blocks_benefits_items_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_benefits"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_process" ADD CONSTRAINT "services_blocks_process_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_process_steps" ADD CONSTRAINT "services_blocks_process_steps_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_process"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_image_text" ADD CONSTRAINT "services_blocks_image_text_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_gallery" ADD CONSTRAINT "services_blocks_gallery_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_sub_services" ADD CONSTRAINT "services_blocks_sub_services_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_sub_services_items" ADD CONSTRAINT "services_blocks_sub_services_items_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_sub_services"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_video" ADD CONSTRAINT "services_blocks_video_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_quote" ADD CONSTRAINT "services_blocks_quote_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    CREATE INDEX "services_blocks_intro_parent_idx" ON "services_blocks_intro" USING btree ("_parent_id");
    CREATE INDEX "services_blocks_feature_list_parent_idx" ON "services_blocks_feature_list" USING btree ("_parent_id");
    CREATE INDEX "services_blocks_benefits_parent_idx" ON "services_blocks_benefits" USING btree ("_parent_id");
    CREATE INDEX "services_blocks_process_parent_idx" ON "services_blocks_process" USING btree ("_parent_id");
    CREATE INDEX "services_blocks_image_text_parent_idx" ON "services_blocks_image_text" USING btree ("_parent_id");
    CREATE INDEX "services_blocks_gallery_parent_idx" ON "services_blocks_gallery" USING btree ("_parent_id");
    CREATE INDEX "services_blocks_sub_services_parent_idx" ON "services_blocks_sub_services" USING btree ("_parent_id");
    CREATE INDEX "services_blocks_video_parent_idx" ON "services_blocks_video" USING btree ("_parent_id");
    CREATE INDEX "services_blocks_quote_parent_idx" ON "services_blocks_quote" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
    DROP TABLE "services_blocks_quote" CASCADE;
    DROP TYPE "public"."enum_services_blocks_intro_image_side";
    DROP TYPE "public"."enum_services_blocks_image_text_image_side";
  `)
}
