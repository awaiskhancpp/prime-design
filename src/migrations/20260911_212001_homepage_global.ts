import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "hero_heading_highlight" varchar;
  ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "difference_heading_highlight" varchar;
  ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "feature_blocks_title_highlight" varchar;
  ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "contact_intro_heading_highlight" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage" DROP COLUMN "hero_heading_highlight";
  ALTER TABLE "homepage" DROP COLUMN "difference_heading_highlight";
  ALTER TABLE "homepage" DROP COLUMN "feature_blocks_title_highlight";
  ALTER TABLE "homepage" DROP COLUMN "contact_intro_heading_highlight";`)
}
