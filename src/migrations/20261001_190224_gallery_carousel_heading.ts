import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_blocks_gallery_carousel" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "services_blocks_gallery_carousel" ADD COLUMN "heading" varchar;
  ALTER TABLE "services_blocks_gallery_carousel" ADD COLUMN "description" varchar;
  ALTER TABLE "_services_v_blocks_gallery_carousel" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_services_v_blocks_gallery_carousel" ADD COLUMN "heading" varchar;
  ALTER TABLE "_services_v_blocks_gallery_carousel" ADD COLUMN "description" varchar;
  ALTER TABLE "landing_pages_blocks_gallery_carousel" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "landing_pages_blocks_gallery_carousel" ADD COLUMN "heading" varchar;
  ALTER TABLE "landing_pages_blocks_gallery_carousel" ADD COLUMN "description" varchar;
  ALTER TABLE "_landing_pages_v_blocks_gallery_carousel" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_landing_pages_v_blocks_gallery_carousel" ADD COLUMN "heading" varchar;
  ALTER TABLE "_landing_pages_v_blocks_gallery_carousel" ADD COLUMN "description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_blocks_gallery_carousel" DROP COLUMN "eyebrow";
  ALTER TABLE "services_blocks_gallery_carousel" DROP COLUMN "heading";
  ALTER TABLE "services_blocks_gallery_carousel" DROP COLUMN "description";
  ALTER TABLE "_services_v_blocks_gallery_carousel" DROP COLUMN "eyebrow";
  ALTER TABLE "_services_v_blocks_gallery_carousel" DROP COLUMN "heading";
  ALTER TABLE "_services_v_blocks_gallery_carousel" DROP COLUMN "description";
  ALTER TABLE "landing_pages_blocks_gallery_carousel" DROP COLUMN "eyebrow";
  ALTER TABLE "landing_pages_blocks_gallery_carousel" DROP COLUMN "heading";
  ALTER TABLE "landing_pages_blocks_gallery_carousel" DROP COLUMN "description";
  ALTER TABLE "_landing_pages_v_blocks_gallery_carousel" DROP COLUMN "eyebrow";
  ALTER TABLE "_landing_pages_v_blocks_gallery_carousel" DROP COLUMN "heading";
  ALTER TABLE "_landing_pages_v_blocks_gallery_carousel" DROP COLUMN "description";`)
}
