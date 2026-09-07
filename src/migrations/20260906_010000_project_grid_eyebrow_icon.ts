import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services_blocks_project_grid"
      ADD COLUMN "eyebrow_icon_icon_media_id" integer,
      ADD COLUMN "eyebrow_icon_icon_library" varchar,
      ADD COLUMN "eyebrow_icon_icon_name" varchar,
      ADD COLUMN "eyebrow_icon_source_svg_url" varchar;

    ALTER TABLE "landing_pages_blocks_project_grid"
      ADD COLUMN "eyebrow_icon_icon_media_id" integer,
      ADD COLUMN "eyebrow_icon_icon_library" varchar,
      ADD COLUMN "eyebrow_icon_icon_name" varchar,
      ADD COLUMN "eyebrow_icon_source_svg_url" varchar;

    ALTER TABLE "services_blocks_project_grid"
      ADD CONSTRAINT "services_blocks_project_grid_eyebrow_icon_icon_media_id_media_id_fk"
      FOREIGN KEY ("eyebrow_icon_icon_media_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;

    ALTER TABLE "landing_pages_blocks_project_grid"
      ADD CONSTRAINT "landing_pages_blocks_project_grid_eyebrow_icon_icon_media_id_media_id_fk"
      FOREIGN KEY ("eyebrow_icon_icon_media_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services_blocks_project_grid"
      DROP CONSTRAINT "services_blocks_project_grid_eyebrow_icon_icon_media_id_media_id_fk";
    ALTER TABLE "landing_pages_blocks_project_grid"
      DROP CONSTRAINT "landing_pages_blocks_project_grid_eyebrow_icon_icon_media_id_media_id_fk";

    ALTER TABLE "services_blocks_project_grid"
      DROP COLUMN "eyebrow_icon_icon_media_id",
      DROP COLUMN "eyebrow_icon_icon_library",
      DROP COLUMN "eyebrow_icon_icon_name",
      DROP COLUMN "eyebrow_icon_source_svg_url";

    ALTER TABLE "landing_pages_blocks_project_grid"
      DROP COLUMN "eyebrow_icon_icon_media_id",
      DROP COLUMN "eyebrow_icon_icon_library",
      DROP COLUMN "eyebrow_icon_icon_name",
      DROP COLUMN "eyebrow_icon_source_svg_url";
  `)
}
