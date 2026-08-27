import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services_blocks_video" ADD COLUMN IF NOT EXISTS "video_id" integer;
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_blocks_video_video_id_media_id_fk'
      ) THEN
        ALTER TABLE "services_blocks_video"
          ADD CONSTRAINT "services_blocks_video_video_id_media_id_fk"
          FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
    CREATE INDEX IF NOT EXISTS "services_blocks_video_video_id_idx" ON "services_blocks_video" USING btree ("video_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "services_blocks_video_video_id_idx";
    ALTER TABLE "services_blocks_video" DROP CONSTRAINT IF EXISTS "services_blocks_video_video_id_media_id_fk";
    ALTER TABLE "services_blocks_video" DROP COLUMN IF EXISTS "video_id";
  `)
}
