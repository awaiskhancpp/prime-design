import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Repair-services category cards gained the WordPress accent line above the
 * heading (e.g. "Inspiration starts all around you" on the European Kitchen
 * page, "Key Elements of European Kitchens" cards).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Block-level eyebrow (the section header accent line, e.g. "Learn more
  // about European Kitchens") plus the per-card accent line.
  for (const table of [
    'services_blocks_repair_services',
    'landing_pages_blocks_repair_services',
    'services_blocks_repair_services_categories',
    'landing_pages_blocks_repair_services_categories',
  ]) {
    await db.execute(sql`
      ALTER TABLE ${sql.raw(`"${table}"`)}
        ADD COLUMN IF NOT EXISTS "eyebrow" varchar;
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of [
    'services_blocks_repair_services',
    'landing_pages_blocks_repair_services',
    'services_blocks_repair_services_categories',
    'landing_pages_blocks_repair_services_categories',
  ]) {
    await db.execute(sql`
      ALTER TABLE ${sql.raw(`"${table}"`)}
        DROP COLUMN IF EXISTS "eyebrow";
    `)
  }
}
