import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The craftsmanship section's button is now CMS content
 * (`services.craftsmanshipCta`) instead of a hardcoded label in the renderer.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services"
      ADD COLUMN IF NOT EXISTS "craftsmanship_cta_label" varchar,
      ADD COLUMN IF NOT EXISTS "craftsmanship_cta_href" varchar;
  `)
  // Seed the WordPress button for every service that renders the section.
  await db.execute(sql`
    UPDATE "services"
    SET "craftsmanship_cta_label" = 'Free on-site estimate',
        "craftsmanship_cta_href" = '/contact'
    WHERE "craftsmanship" IS NOT NULL
      AND ("craftsmanship_cta_label" IS NULL OR "craftsmanship_cta_label" = '');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services"
      DROP COLUMN IF EXISTS "craftsmanship_cta_label",
      DROP COLUMN IF EXISTS "craftsmanship_cta_href";
  `)
}
