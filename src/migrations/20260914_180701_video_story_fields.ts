import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the shared "video story" fields (summary + optional speaker
 * attribution) to every video section:
 *
 *   - page sections: Prime Difference video tiles, Experts/Video
 *   - service pages: the Video block (both block fields)
 *   - landing pages: the Video block
 *   - project pages: the project video
 *
 * Written by hand: the auto-generated version of this migration was a catch-up
 * that also dropped the legacy homepage/about/gallery tables. Only the columns
 * below belong in it.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_difference_videos" ADD COLUMN IF NOT EXISTS "summary" jsonb;
    ALTER TABLE "pages_blocks_difference_videos" ADD COLUMN IF NOT EXISTS "speaker_name" varchar;
    ALTER TABLE "pages_blocks_difference_videos" ADD COLUMN IF NOT EXISTS "speaker_role" varchar;

    ALTER TABLE "pages_blocks_experts" ADD COLUMN IF NOT EXISTS "summary" jsonb;
    ALTER TABLE "pages_blocks_experts" ADD COLUMN IF NOT EXISTS "speaker_name" varchar;
    ALTER TABLE "pages_blocks_experts" ADD COLUMN IF NOT EXISTS "speaker_role" varchar;

    ALTER TABLE "services_blocks_video" ADD COLUMN IF NOT EXISTS "summary" jsonb;
    ALTER TABLE "services_blocks_video" ADD COLUMN IF NOT EXISTS "speaker_name" varchar;
    ALTER TABLE "services_blocks_video" ADD COLUMN IF NOT EXISTS "speaker_role" varchar;

    ALTER TABLE "services_blocks_video_2" ADD COLUMN IF NOT EXISTS "summary" jsonb;
    ALTER TABLE "services_blocks_video_2" ADD COLUMN IF NOT EXISTS "speaker_name" varchar;
    ALTER TABLE "services_blocks_video_2" ADD COLUMN IF NOT EXISTS "speaker_role" varchar;

    ALTER TABLE "landing_pages_blocks_video" ADD COLUMN IF NOT EXISTS "summary" jsonb;
    ALTER TABLE "landing_pages_blocks_video" ADD COLUMN IF NOT EXISTS "speaker_name" varchar;
    ALTER TABLE "landing_pages_blocks_video" ADD COLUMN IF NOT EXISTS "speaker_role" varchar;

    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "video_summary" jsonb;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "video_speaker_name" varchar;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "video_speaker_role" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_difference_videos" DROP COLUMN IF EXISTS "summary";
    ALTER TABLE "pages_blocks_difference_videos" DROP COLUMN IF EXISTS "speaker_name";
    ALTER TABLE "pages_blocks_difference_videos" DROP COLUMN IF EXISTS "speaker_role";

    ALTER TABLE "pages_blocks_experts" DROP COLUMN IF EXISTS "summary";
    ALTER TABLE "pages_blocks_experts" DROP COLUMN IF EXISTS "speaker_name";
    ALTER TABLE "pages_blocks_experts" DROP COLUMN IF EXISTS "speaker_role";

    ALTER TABLE "services_blocks_video" DROP COLUMN IF EXISTS "summary";
    ALTER TABLE "services_blocks_video" DROP COLUMN IF EXISTS "speaker_name";
    ALTER TABLE "services_blocks_video" DROP COLUMN IF EXISTS "speaker_role";

    ALTER TABLE "services_blocks_video_2" DROP COLUMN IF EXISTS "summary";
    ALTER TABLE "services_blocks_video_2" DROP COLUMN IF EXISTS "speaker_name";
    ALTER TABLE "services_blocks_video_2" DROP COLUMN IF EXISTS "speaker_role";

    ALTER TABLE "landing_pages_blocks_video" DROP COLUMN IF EXISTS "summary";
    ALTER TABLE "landing_pages_blocks_video" DROP COLUMN IF EXISTS "speaker_name";
    ALTER TABLE "landing_pages_blocks_video" DROP COLUMN IF EXISTS "speaker_role";

    ALTER TABLE "projects" DROP COLUMN IF EXISTS "video_summary";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "video_speaker_name";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "video_speaker_role";
  `)
}
