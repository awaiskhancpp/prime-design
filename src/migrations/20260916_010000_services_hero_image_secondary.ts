import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the optional second hero image to services (`hero.imageSecondary`).
 * When set (and the service has no hero video), the service hero renders
 * the two-image crossfade slider with prev/next arrows — the same design
 * the pages hero already uses.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "hero_image_secondary_id" integer;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_hero_image_secondary_fk'
      ) THEN
        ALTER TABLE "services"
          ADD CONSTRAINT "services_hero_image_secondary_fk"
          FOREIGN KEY ("hero_image_secondary_id") REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_hero_image_secondary_fk";
    ALTER TABLE "services" DROP COLUMN IF EXISTS "hero_image_secondary_id";
  `)
}
