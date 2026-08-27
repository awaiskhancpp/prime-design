import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services_blocks_video" ADD COLUMN "video_id" integer;
    ALTER TABLE "services_blocks_video" ADD CONSTRAINT "services_blocks_video_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null;
    CREATE INDEX "services_blocks_video_video_id_idx" ON "services_blocks_video" USING btree ("video_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "services_blocks_video_video_id_idx";
    ALTER TABLE "services_blocks_video" DROP CONSTRAINT "services_blocks_video_video_id_media_id_fk";
    ALTER TABLE "services_blocks_video" DROP COLUMN "video_id";
  `)
}
