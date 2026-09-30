import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Site Settings' default social image: media 218 → media 660.
 *
 * The field was never read, so its value never mattered; it does now
 * (`buildSeoMetadata` falls back to it for every page without an image of its
 * own). It held 218, `cropped-Prime-Kitchens-Logo-1.png` — the 461×289
 * landscape logo, which link previews would crop. WordPress's default
 * `og:image` is `Prime-Kitchens-Open-Graph.gif` (1200×630, the homepage's
 * `<meta property="og:image">`), imported as media 660, and it is what the
 * code hardcoded until now. So nothing visible changes: the value in the CMS
 * is corrected to what the site already served.
 *
 * Only moves a row that still points at 218, and only if 660 exists.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings" SET "default_og_image_id" = 660
    WHERE "default_og_image_id" = 218
      AND EXISTS (SELECT 1 FROM "media" WHERE "id" = 660 AND "filename" = 'Prime-Kitchens-Open-Graph.gif');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings" SET "default_og_image_id" = 218 WHERE "default_og_image_id" = 660;
  `)
}
