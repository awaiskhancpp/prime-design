import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the rich text overview fields (Key Features / Benefits / Process)
 * to the services collection, plus schema drift reconciliation:
 *
 *   - DROP NOT NULL on legacy block columns whose `required` flags were
 *     removed from the collection config after those tables were created
 *     (verified still NOT NULL in the live database).
 *   - CREATE INDEX for the project-grid eyebrow_icon media relations. The
 *     columns and FK constraints already exist (added by
 *     20260906_010000_project_grid_eyebrow_icon — note Postgres truncated
 *     the constraint names to 63 chars), but the relation indexes were
 *     never created.
 *
 * Statements for re-adding the eyebrow_icon columns/constraints from the
 * auto-generated version of this migration were removed: they already
 * exist, which made the generated migration fail.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_section_order" ALTER COLUMN "section" DROP NOT NULL;
  ALTER TABLE "services_blocks_intro" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "services_blocks_intro" ALTER COLUMN "body" DROP NOT NULL;
  ALTER TABLE "services_blocks_feature_list_items" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "services_blocks_feature_list" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "services_blocks_benefits_items" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "services_blocks_benefits" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "services_blocks_process_steps" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "services_blocks_process_steps" ALTER COLUMN "description" DROP NOT NULL;
  ALTER TABLE "services_blocks_process" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "services_blocks_image_text" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "services_blocks_image_text" ALTER COLUMN "body" DROP NOT NULL;
  ALTER TABLE "services_blocks_sub_services_items" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "services_blocks_sub_services_items" ALTER COLUMN "description" DROP NOT NULL;
  ALTER TABLE "services_blocks_sub_services" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "services_blocks_icon_feature_list_items" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "services_blocks_icon_feature_list_items" ALTER COLUMN "description" DROP NOT NULL;
  ALTER TABLE "services_blocks_icon_feature_list" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "services_blocks_checklist_items" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "services_blocks_checklist" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "services_blocks_quote" ALTER COLUMN "quote" DROP NOT NULL;
  ALTER TABLE "services_blocks_sub_services_2" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_sub_services" ALTER COLUMN "heading" DROP NOT NULL;
  CREATE INDEX "services_blocks_project_grid_eyebrow_icon_eyebrow_icon_i_idx" ON "services_blocks_project_grid" USING btree ("eyebrow_icon_icon_media_id");
  ALTER TABLE "services" ADD COLUMN "overview_key_features" jsonb;
  ALTER TABLE "services" ADD COLUMN "overview_benefits" jsonb;
  ALTER TABLE "services" ADD COLUMN "overview_process" jsonb;
  CREATE INDEX "landing_pages_blocks_project_grid_eyebrow_icon_eyebrow_icon_i_idx" ON "landing_pages_blocks_project_grid" USING btree ("eyebrow_icon_icon_media_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "landing_pages_blocks_project_grid_eyebrow_icon_eyebrow_icon_i_idx";
  ALTER TABLE "services" DROP COLUMN "overview_process";
  ALTER TABLE "services" DROP COLUMN "overview_benefits";
  ALTER TABLE "services" DROP COLUMN "overview_key_features";
  DROP INDEX "services_blocks_project_grid_eyebrow_icon_eyebrow_icon_i_idx";
  ALTER TABLE "landing_pages_blocks_sub_services" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_sub_services_2" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_quote" ALTER COLUMN "quote" SET NOT NULL;
  ALTER TABLE "services_blocks_checklist" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_checklist_items" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "services_blocks_icon_feature_list" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_icon_feature_list_items" ALTER COLUMN "description" SET NOT NULL;
  ALTER TABLE "services_blocks_icon_feature_list_items" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "services_blocks_sub_services" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_sub_services_items" ALTER COLUMN "description" SET NOT NULL;
  ALTER TABLE "services_blocks_sub_services_items" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "services_blocks_image_text" ALTER COLUMN "body" SET NOT NULL;
  ALTER TABLE "services_blocks_image_text" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_process" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_process_steps" ALTER COLUMN "description" SET NOT NULL;
  ALTER TABLE "services_blocks_process_steps" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "services_blocks_benefits" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_benefits_items" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "services_blocks_feature_list" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_blocks_feature_list_items" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "services_blocks_intro" ALTER COLUMN "body" SET NOT NULL;
  ALTER TABLE "services_blocks_intro" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "services_section_order" ALTER COLUMN "section" SET NOT NULL;`)
}
