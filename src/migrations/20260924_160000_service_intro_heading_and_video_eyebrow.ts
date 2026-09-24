import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Two fields the pages render but nobody could edit.
 *
 * **`services.intro_heading`.** `ServiceOverview` reads `service.introHeading`
 * and has since it was written, but the name existed only in the TypeScript
 * type in `lib/services.ts` — there was no Payload field and no column behind
 * it, so the value was always `undefined` and every service page printed the
 * fallback, `"{Service title} — expanding your living space"`. That string is
 * invented copy, and on two pages it is also wrong: the live original reads
 * "Accessory Dwelling Units (ADUs) - Expanding Your Living Space" on /adu/
 * and "Home Additions - Enhancing Your Living Space" on /additions/.
 *
 * **`…_blocks_video.eyebrow`.** The video sections carry a line above the
 * heading — "#1 Kitchen Remodeling Company in Silicon Valley" on the kitchen
 * page. The block had no field for it, so the import put it in `description`
 * (where it renders as body copy under the heading) while the eyebrow the
 * section actually displays came from a hardcoded per-service table in
 * `ServiceVideoSection`. The column lets the real line be stored where it
 * belongs; `scripts/seed-service-headings.ts` moves the kitchen page's value
 * across and clears the description it was misfiled in.
 *
 * Both are additive text columns, so an unseeded row renders exactly as
 * before.
 */

/** Every table Payload generates for a `video` block, across the collections that use it. */
const VIDEO_BLOCK_TABLES = [
  'services_blocks_video',
  'landing_pages_blocks_video',
  'pages_blocks_video',
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "intro_heading" varchar;
  `)

  for (const table of VIDEO_BLOCK_TABLES) {
    // `to_regclass` rather than a plain ALTER: the block is shared between
    // collections and not every one of them has been used yet, so some of
    // these tables legitimately do not exist.
    await db.execute(
      sql.raw(`
        DO $$ BEGIN
          IF to_regclass('public.${table}') IS NOT NULL THEN
            ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "eyebrow" varchar;
          END IF;
        END $$;
      `),
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" DROP COLUMN IF EXISTS "intro_heading";
  `)

  for (const table of VIDEO_BLOCK_TABLES) {
    await db.execute(
      sql.raw(`
        DO $$ BEGIN
          IF to_regclass('public.${table}') IS NOT NULL THEN
            ALTER TABLE "${table}" DROP COLUMN IF EXISTS "eyebrow";
          END IF;
        END $$;
      `),
    )
  }
}
