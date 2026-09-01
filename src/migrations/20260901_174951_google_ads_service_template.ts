import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_services_page_template" AS ENUM('service-detail', 'google-ads');
  ALTER TABLE "services" ADD COLUMN "page_template" "enum_services_page_template" DEFAULT 'service-detail';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "services" DROP COLUMN "page_template";
  DROP TYPE "public"."enum_services_page_template";`)
}
