import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the optional poster frame to the "Prime Difference" video tiles
 * (the homepage thumbnail strip). The renderer already supports
 * `video.poster`; this adds its storage.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_difference_videos" ADD COLUMN IF NOT EXISTS "poster_id" integer;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_difference_videos_poster_fk'
      ) THEN
        ALTER TABLE "pages_blocks_difference_videos"
          ADD CONSTRAINT "pages_blocks_difference_videos_poster_fk"
          FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_difference_videos" DROP CONSTRAINT IF EXISTS "pages_blocks_difference_videos_poster_fk";
    ALTER TABLE "pages_blocks_difference_videos" DROP COLUMN IF EXISTS "poster_id";
  `)
}
