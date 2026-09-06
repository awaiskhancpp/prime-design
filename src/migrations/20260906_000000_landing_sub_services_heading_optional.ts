import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing_pages_blocks_sub_services"
      ALTER COLUMN "heading" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "landing_pages_blocks_sub_services"
    SET "heading" = ''
    WHERE "heading" IS NULL;

    ALTER TABLE "landing_pages_blocks_sub_services"
      ALTER COLUMN "heading" SET NOT NULL;
  `)
}
