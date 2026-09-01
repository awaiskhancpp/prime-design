import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Two content-block types (`checklist`, `icon-feature-list`) were added to
// the Services collection config and picked up by generated types, but
// never got a matching schema migration — so neither block has ever had
// a real table in Postgres. Any content saved into them via the actual
// Payload admin (as opposed to local fallback data) would fail silently
// or error out. This creates both.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_services_blocks_checklist_image_side" AS ENUM('left', 'right');
    CREATE TYPE "public"."enum_services_blocks_icon_feature_list_image_side" AS ENUM('left', 'right');
    CREATE TABLE "services_blocks_checklist_items" (
      "_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "text" varchar NOT NULL
    );
    CREATE TABLE "services_blocks_checklist" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "eyebrow" varchar, "heading" varchar NOT NULL,
      "description" varchar, "image_id" integer, "image_side" "enum_services_blocks_checklist_image_side" DEFAULT 'left', "block_name" varchar
    );
    CREATE TABLE "services_blocks_icon_feature_list_items" (
      "_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL, "description" varchar NOT NULL
    );
    CREATE TABLE "services_blocks_icon_feature_list" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL, "heading" varchar NOT NULL, "intro" varchar,
      "image_id" integer, "image_side" "enum_services_blocks_icon_feature_list_image_side" DEFAULT 'left', "block_name" varchar
    );
    ALTER TABLE "services_blocks_checklist_items" ADD CONSTRAINT "services_blocks_checklist_items_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_checklist"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_checklist" ADD CONSTRAINT "services_blocks_checklist_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_icon_feature_list_items" ADD CONSTRAINT "services_blocks_icon_feature_list_items_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_icon_feature_list"("id") ON DELETE cascade;
    ALTER TABLE "services_blocks_icon_feature_list" ADD CONSTRAINT "services_blocks_icon_feature_list_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
    CREATE INDEX "services_blocks_checklist_parent_idx" ON "services_blocks_checklist" USING btree ("_parent_id");
    CREATE INDEX "services_blocks_icon_feature_list_parent_idx" ON "services_blocks_icon_feature_list" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "services_blocks_checklist_items" CASCADE;
    DROP TABLE "services_blocks_checklist" CASCADE;
    DROP TABLE "services_blocks_icon_feature_list_items" CASCADE;
    DROP TABLE "services_blocks_icon_feature_list" CASCADE;
    DROP TYPE "public"."enum_services_blocks_checklist_image_side";
    DROP TYPE "public"."enum_services_blocks_icon_feature_list_image_side";
  `)
}