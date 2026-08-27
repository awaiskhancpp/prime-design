import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" ADD COLUMN "hero_eyebrow" varchar;
    ALTER TABLE "services" ADD COLUMN "hero_heading" varchar;
    ALTER TABLE "services" ADD COLUMN "hero_lead" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" DROP COLUMN "hero_eyebrow";
    ALTER TABLE "services" DROP COLUMN "hero_heading";
    ALTER TABLE "services" DROP COLUMN "hero_lead";
  `)
}
