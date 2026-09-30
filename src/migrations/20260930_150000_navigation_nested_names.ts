import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Rename the navigation global's nested menu arrays: `children` → `dropdown`,
 * and the level below it `children` → `subItems`.
 *
 * `20260930_140000_navigation_global` named both levels `children`, and
 * drizzle cannot build a query for an array nested inside another array of
 * the same name ("There are multiple relations with name "children" in table
 * navigation_header_items_children"), so the global could not be read or
 * written at all. Both tables were still empty when this ran. The earlier
 * migration is left as it is because it has already been applied; this one
 * moves its tables, constraints and indexes to the names Payload now expects.
 *
 * Hand-written for the reason in §8b of CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "navigation_header_items_children_children"
      RENAME TO "navigation_header_items_dropdown_sub_items";
    ALTER TABLE IF EXISTS "navigation_header_items_children"
      RENAME TO "navigation_header_items_dropdown";

    ALTER TABLE "navigation_header_items_dropdown"
      RENAME CONSTRAINT "navigation_header_items_children_parent_id_fk" TO "navigation_header_items_dropdown_parent_id_fk";
    ALTER TABLE "navigation_header_items_dropdown"
      RENAME CONSTRAINT "navigation_header_items_children_service_id_services_id_fk" TO "navigation_header_items_dropdown_service_id_services_id_fk";
    ALTER TABLE "navigation_header_items_dropdown_sub_items"
      RENAME CONSTRAINT "navigation_header_items_children_children_parent_id_fk" TO "navigation_header_items_dropdown_sub_items_parent_id_fk";
    ALTER TABLE "navigation_header_items_dropdown_sub_items"
      RENAME CONSTRAINT "navigation_header_items_children_children_service_id_services_id_fk" TO "navigation_header_items_dropdown_sub_items_service_id_services_id_fk";

    ALTER INDEX IF EXISTS "navigation_header_items_children_order_idx" RENAME TO "navigation_header_items_dropdown_order_idx";
    ALTER INDEX IF EXISTS "navigation_header_items_children_parent_id_idx" RENAME TO "navigation_header_items_dropdown_parent_id_idx";
    ALTER INDEX IF EXISTS "navigation_header_items_children_service_idx" RENAME TO "navigation_header_items_dropdown_service_idx";
    ALTER INDEX IF EXISTS "navigation_header_items_children_children_order_idx" RENAME TO "navigation_header_items_dropdown_sub_items_order_idx";
    ALTER INDEX IF EXISTS "navigation_header_items_children_children_parent_id_idx" RENAME TO "navigation_header_items_dropdown_sub_items_parent_id_idx";
    ALTER INDEX IF EXISTS "navigation_header_items_children_children_service_idx" RENAME TO "navigation_header_items_dropdown_sub_items_service_idx";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER INDEX IF EXISTS "navigation_header_items_dropdown_order_idx" RENAME TO "navigation_header_items_children_order_idx";
    ALTER INDEX IF EXISTS "navigation_header_items_dropdown_parent_id_idx" RENAME TO "navigation_header_items_children_parent_id_idx";
    ALTER INDEX IF EXISTS "navigation_header_items_dropdown_service_idx" RENAME TO "navigation_header_items_children_service_idx";
    ALTER INDEX IF EXISTS "navigation_header_items_dropdown_sub_items_order_idx" RENAME TO "navigation_header_items_children_children_order_idx";
    ALTER INDEX IF EXISTS "navigation_header_items_dropdown_sub_items_parent_id_idx" RENAME TO "navigation_header_items_children_children_parent_id_idx";
    ALTER INDEX IF EXISTS "navigation_header_items_dropdown_sub_items_service_idx" RENAME TO "navigation_header_items_children_children_service_idx";

    ALTER TABLE "navigation_header_items_dropdown_sub_items"
      RENAME CONSTRAINT "navigation_header_items_dropdown_sub_items_service_id_services_id_fk" TO "navigation_header_items_children_children_service_id_services_id_fk";
    ALTER TABLE "navigation_header_items_dropdown_sub_items"
      RENAME CONSTRAINT "navigation_header_items_dropdown_sub_items_parent_id_fk" TO "navigation_header_items_children_children_parent_id_fk";
    ALTER TABLE "navigation_header_items_dropdown"
      RENAME CONSTRAINT "navigation_header_items_dropdown_service_id_services_id_fk" TO "navigation_header_items_children_service_id_services_id_fk";
    ALTER TABLE "navigation_header_items_dropdown"
      RENAME CONSTRAINT "navigation_header_items_dropdown_parent_id_fk" TO "navigation_header_items_children_parent_id_fk";

    ALTER TABLE IF EXISTS "navigation_header_items_dropdown"
      RENAME TO "navigation_header_items_children";
    ALTER TABLE IF EXISTS "navigation_header_items_dropdown_sub_items"
      RENAME TO "navigation_header_items_children_children";
  `)
}
