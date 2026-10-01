import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Service-location social previews use the image selected in Page Settings.
 * Existing records may still contain the older independently imported SEO
 * image, so align those relations once when this migration is applied.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "service_locations"
       SET "seo_og_image_id" = "featured_image_id",
           "updated_at" = NOW()
     WHERE "featured_image_id" IS NOT NULL
       AND "seo_og_image_id" IS DISTINCT FROM "featured_image_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The previous SEO relations are not recoverable from the current record,
  // so reverting would be unsafe and could restore the wrong images.
  void db
}
