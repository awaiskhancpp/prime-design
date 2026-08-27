import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services_rels" ADD COLUMN "media_id" integer;
    ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade;
    CREATE INDEX "services_rels_media_id_idx" ON "services_rels" USING btree ("media_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "services_rels_media_id_idx";
    ALTER TABLE "services_rels" DROP CONSTRAINT "services_rels_media_fk";
    ALTER TABLE "services_rels" DROP COLUMN "media_id";
  `)
}
