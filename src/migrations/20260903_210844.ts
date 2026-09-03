import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_blocks_sub_services_2_items" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "services_blocks_sub_services_2_items" ALTER COLUMN "link_url" DROP NOT NULL;
  ALTER TABLE "services_blocks_prime_difference_features" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "services_blocks_prime_difference_features" ALTER COLUMN "link_url" DROP NOT NULL;
  ALTER TABLE "services_blocks_experience_difference_features" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "services_blocks_experience_difference_features" ALTER COLUMN "link_url" DROP NOT NULL;
  ALTER TABLE "services_blocks_service_areas_areas" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "services_blocks_service_areas_areas" ALTER COLUMN "link_url" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_sub_services_items" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_sub_services_items" ALTER COLUMN "link_url" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_prime_difference_features" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_prime_difference_features" ALTER COLUMN "link_url" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_experience_difference_features" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_experience_difference_features" ALTER COLUMN "link_url" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_service_areas_areas" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "landing_pages_blocks_service_areas_areas" ALTER COLUMN "link_url" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_blocks_sub_services_2_items" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "services_blocks_sub_services_2_items" ALTER COLUMN "link_url" SET NOT NULL;
  ALTER TABLE "services_blocks_prime_difference_features" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "services_blocks_prime_difference_features" ALTER COLUMN "link_url" SET NOT NULL;
  ALTER TABLE "services_blocks_experience_difference_features" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "services_blocks_experience_difference_features" ALTER COLUMN "link_url" SET NOT NULL;
  ALTER TABLE "services_blocks_service_areas_areas" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "services_blocks_service_areas_areas" ALTER COLUMN "link_url" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_sub_services_items" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_sub_services_items" ALTER COLUMN "link_url" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_prime_difference_features" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_prime_difference_features" ALTER COLUMN "link_url" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_experience_difference_features" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_experience_difference_features" ALTER COLUMN "link_url" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_service_areas_areas" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "landing_pages_blocks_service_areas_areas" ALTER COLUMN "link_url" SET NOT NULL;`)
}
