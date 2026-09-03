import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services_blocks_prime_difference_features" ADD CONSTRAINT "services_blocks_prime_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "services_blocks_prime_difference_features" ADD CONSTRAINT "services_blocks_prime_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "services_blocks_experience_difference_features" ADD CONSTRAINT "services_blocks_experience_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "services_blocks_experience_difference_features" ADD CONSTRAINT "services_blocks_experience_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "services_blocks_experience_difference" ADD CONSTRAINT "services_blocks_experience_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "services_blocks_repair_services_categories_features" ADD CONSTRAINT "services_blocks_repair_services_categories_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_repair_services_categories"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "services_blocks_repair_services_categories" ADD CONSTRAINT "services_blocks_repair_services_categories_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_sub_services_items" ADD CONSTRAINT "landing_pages_blocks_sub_services_items_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_prime_difference_features" ADD CONSTRAINT "landing_pages_blocks_prime_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_prime_difference_features" ADD CONSTRAINT "landing_pages_blocks_prime_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_prime_difference" ADD CONSTRAINT "landing_pages_blocks_prime_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_experience_difference_features" ADD CONSTRAINT "landing_pages_blocks_experience_difference_features_icon_icon_media_id_media_id_fk" FOREIGN KEY ("icon_icon_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_experience_difference_features" ADD CONSTRAINT "landing_pages_blocks_experience_difference_features_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_experience_difference_features" ADD CONSTRAINT "landing_pages_blocks_experience_difference_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_experience_difference"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_experience_difference" ADD CONSTRAINT "landing_pages_blocks_experience_difference_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_service_areas_areas" ADD CONSTRAINT "landing_pages_blocks_service_areas_areas_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_repair_services_categories_features" ADD CONSTRAINT "landing_pages_blocks_repair_services_categories_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_repair_services_categories"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_repair_services_categories" ADD CONSTRAINT "landing_pages_blocks_repair_services_categories_media_asset_id_media_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_testimonials_providers_reviews" ADD CONSTRAINT "landing_pages_blocks_testimonials_providers_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_testimonials_providers"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "landing_pages_blocks_gallery_carousel_items" ADD CONSTRAINT "landing_pages_blocks_gallery_carousel_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    CREATE INDEX "services_blocks_repair_services_categories_features_parent_id_idx" ON "services_blocks_repair_services_categories_features" USING btree ("_parent_id");
    CREATE INDEX "landing_pages_blocks_experience_difference_features_parent_id_idx" ON "landing_pages_blocks_experience_difference_features" USING btree ("_parent_id");
    CREATE INDEX "landing_pages_blocks_repair_services_categories_features_order_idx" ON "landing_pages_blocks_repair_services_categories_features" USING btree ("_order");
    CREATE INDEX "landing_pages_blocks_repair_services_categories_features_parent_id_idx" ON "landing_pages_blocks_repair_services_categories_features" USING btree ("_parent_id");
    CREATE INDEX "landing_pages_blocks_testimonials_providers_reviews_parent_id_idx" ON "landing_pages_blocks_testimonials_providers_reviews" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "services_blocks_repair_services_categories_features_parent_id_idx";
    DROP INDEX "landing_pages_blocks_experience_difference_features_parent_id_idx";
    DROP INDEX "landing_pages_blocks_repair_services_categories_features_order_idx";
    DROP INDEX "landing_pages_blocks_repair_services_categories_features_parent_id_idx";
    DROP INDEX "landing_pages_blocks_testimonials_providers_reviews_parent_id_idx";
    ALTER TABLE "services_blocks_prime_difference_features" DROP CONSTRAINT "services_blocks_prime_difference_features_icon_icon_media_id_media_id_fk";
    ALTER TABLE "services_blocks_prime_difference_features" DROP CONSTRAINT "services_blocks_prime_difference_features_media_asset_id_media_id_fk";
    ALTER TABLE "services_blocks_experience_difference_features" DROP CONSTRAINT "services_blocks_experience_difference_features_icon_icon_media_id_media_id_fk";
    ALTER TABLE "services_blocks_experience_difference_features" DROP CONSTRAINT "services_blocks_experience_difference_features_media_asset_id_media_id_fk";
    ALTER TABLE "services_blocks_experience_difference" DROP CONSTRAINT "services_blocks_experience_difference_media_asset_id_media_id_fk";
    ALTER TABLE "services_blocks_repair_services_categories_features" DROP CONSTRAINT "services_blocks_repair_services_categories_features_parent_id_fk";
    ALTER TABLE "services_blocks_repair_services_categories" DROP CONSTRAINT "services_blocks_repair_services_categories_media_asset_id_media_id_fk";
    ALTER TABLE "landing_pages_blocks_sub_services_items" DROP CONSTRAINT "landing_pages_blocks_sub_services_items_media_asset_id_media_id_fk";
    ALTER TABLE "landing_pages_blocks_prime_difference_features" DROP CONSTRAINT "landing_pages_blocks_prime_difference_features_icon_icon_media_id_media_id_fk";
    ALTER TABLE "landing_pages_blocks_prime_difference_features" DROP CONSTRAINT "landing_pages_blocks_prime_difference_features_media_asset_id_media_id_fk";
    ALTER TABLE "landing_pages_blocks_prime_difference" DROP CONSTRAINT "landing_pages_blocks_prime_difference_media_asset_id_media_id_fk";
    ALTER TABLE "landing_pages_blocks_experience_difference_features" DROP CONSTRAINT "landing_pages_blocks_experience_difference_features_icon_icon_media_id_media_id_fk";
    ALTER TABLE "landing_pages_blocks_experience_difference_features" DROP CONSTRAINT "landing_pages_blocks_experience_difference_features_media_asset_id_media_id_fk";
    ALTER TABLE "landing_pages_blocks_experience_difference_features" DROP CONSTRAINT "landing_pages_blocks_experience_difference_features_parent_id_fk";
    ALTER TABLE "landing_pages_blocks_experience_difference" DROP CONSTRAINT "landing_pages_blocks_experience_difference_media_asset_id_media_id_fk";
    ALTER TABLE "landing_pages_blocks_service_areas_areas" DROP CONSTRAINT "landing_pages_blocks_service_areas_areas_location_id_locations_id_fk";
    ALTER TABLE "landing_pages_blocks_repair_services_categories_features" DROP CONSTRAINT "landing_pages_blocks_repair_services_categories_features_parent_id_fk";
    ALTER TABLE "landing_pages_blocks_repair_services_categories" DROP CONSTRAINT "landing_pages_blocks_repair_services_categories_media_asset_id_media_id_fk";
    ALTER TABLE "landing_pages_blocks_testimonials_providers_reviews" DROP CONSTRAINT "landing_pages_blocks_testimonials_providers_reviews_parent_id_fk";
    ALTER TABLE "landing_pages_blocks_gallery_carousel_items" DROP CONSTRAINT "landing_pages_blocks_gallery_carousel_items_media_id_media_id_fk";
  `)
}
