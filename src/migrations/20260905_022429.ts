import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_blocks_gallery_2_items" ADD COLUMN "source_url" varchar;
  ALTER TABLE "services_blocks_gallery_2_groups_items" ADD COLUMN "source_url" varchar;
  ALTER TABLE "services_blocks_gallery_carousel_items" ADD COLUMN "source_url" varchar;
  ALTER TABLE "landing_pages_blocks_gallery_items" ADD COLUMN "source_url" varchar;
  ALTER TABLE "landing_pages_blocks_gallery_groups_items" ADD COLUMN "source_url" varchar;
  ALTER TABLE "landing_pages_blocks_gallery_carousel_items" ADD COLUMN "source_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_blocks_gallery_2_items" DROP COLUMN "source_url";
  ALTER TABLE "services_blocks_gallery_2_groups_items" DROP COLUMN "source_url";
  ALTER TABLE "services_blocks_gallery_carousel_items" DROP COLUMN "source_url";
  ALTER TABLE "landing_pages_blocks_gallery_items" DROP COLUMN "source_url";
  ALTER TABLE "landing_pages_blocks_gallery_groups_items" DROP COLUMN "source_url";
  ALTER TABLE "landing_pages_blocks_gallery_carousel_items" DROP COLUMN "source_url";`)
}
