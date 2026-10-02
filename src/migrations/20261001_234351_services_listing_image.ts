import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ADD COLUMN "listing_image_id" integer;
  ALTER TABLE "_services_v" ADD COLUMN "version_listing_image_id" integer;
  ALTER TABLE "services" ADD CONSTRAINT "services_listing_image_id_media_id_fk" FOREIGN KEY ("listing_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_listing_image_id_media_id_fk" FOREIGN KEY ("version_listing_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_listing_image_idx" ON "services" USING btree ("listing_image_id");
  CREATE INDEX "_services_v_version_version_listing_image_idx" ON "_services_v" USING btree ("version_listing_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" DROP CONSTRAINT "services_listing_image_id_media_id_fk";
  
  ALTER TABLE "_services_v" DROP CONSTRAINT "_services_v_version_listing_image_id_media_id_fk";
  
  DROP INDEX "services_listing_image_idx";
  DROP INDEX "_services_v_version_version_listing_image_idx";
  ALTER TABLE "services" DROP COLUMN "listing_image_id";
  ALTER TABLE "_services_v" DROP COLUMN "version_listing_image_id";`)
}
