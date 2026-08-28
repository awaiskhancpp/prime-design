import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "faqs" RENAME COLUMN "faq_category_id" TO "category_id";
  ALTER TABLE "faqs" DROP CONSTRAINT "faqs_faq_category_id_faq_categories_id_fk";
  
  DROP INDEX "faqs_faq_category_idx";
  DROP INDEX "faqs_category_idx";
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_category_id_faq_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."faq_categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "faqs_category_idx" ON "faqs" USING btree ("category_id");
  ALTER TABLE "faqs" DROP COLUMN "category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "faqs" RENAME COLUMN "category_id" TO "category";
  ALTER TABLE "faqs" DROP CONSTRAINT "faqs_category_id_faq_categories_id_fk";
  
  DROP INDEX "faqs_category_idx";
  ALTER TABLE "faqs" ADD COLUMN "faq_category_id" integer;
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_faq_category_id_faq_categories_id_fk" FOREIGN KEY ("faq_category_id") REFERENCES "public"."faq_categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "faqs_faq_category_idx" ON "faqs" USING btree ("faq_category_id");
  CREATE INDEX "faqs_category_idx" ON "faqs" USING btree ("category");`)
}
