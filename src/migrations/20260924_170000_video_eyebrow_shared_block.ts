import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Finishes the `eyebrow` column the previous migration only half-added.
 *
 * Two different blocks are called `video` in this project: the Services
 * collection declares one of its own (heading / upload / videoUrl / poster),
 * and the shared landing-page block of the same slug is also available in the
 * Services page builder. Payload keeps both and disambiguates the second
 * table with a numeric suffix, so the Services collection has **two** tables:
 *
 *   services_blocks_video     the collection's own block  (heading, poster…)
 *   services_blocks_video_2   the shared block            (heading, description…)
 *
 * The previous migration listed table names by hand and added the column only
 * to the unsuffixed one. Payload selects every column its config declares, so
 * the moment the field existed in the config, every read of a service with a
 * page builder failed with `column services_blocks_video_2.eyebrow does not
 * exist` — the kitchen page's video block lives in exactly that table.
 *
 * This one finds the tables instead of naming them: any table whose name ends
 * in `blocks_video` or `blocks_video_N` gets the column if it does not have
 * it. Adding it where it already exists is a no-op, so the two migrations
 * compose.
 */
const FOR_EACH_VIDEO_BLOCK_TABLE = (statement: string) => `
  DO $$
  DECLARE target text;
  BEGIN
    FOR target IN
      SELECT table_name
        FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name ~ '_blocks_video(_[0-9]+)?$'
    LOOP
      EXECUTE format('${statement}', target);
    END LOOP;
  END $$;
`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql.raw(FOR_EACH_VIDEO_BLOCK_TABLE('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "eyebrow" varchar')),
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(FOR_EACH_VIDEO_BLOCK_TABLE('ALTER TABLE %I DROP COLUMN IF EXISTS "eyebrow"')),
  )
}
