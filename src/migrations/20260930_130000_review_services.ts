import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `reviews.services` — which service pages a review belongs on.
 *
 * Every page's review carousel used to show the same 14 Featured reviews. It
 * now shows a service page the reviews about that service (plus the general
 * ones that name no particular work), and a main page all of them. The
 * relationship is filled by `scripts/tag-review-services.ts` and editable in
 * the CMS afterwards.
 *
 * Additive: one new `reviews_rels` table, shaped as Payload stores a hasMany
 * relationship. Hand-written for the reason in §8b of CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "reviews_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "services_id" integer
    );
    DO $$ BEGIN
      ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_services_fk"
        FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "reviews_rels_order_idx" ON "reviews_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "reviews_rels_parent_idx" ON "reviews_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "reviews_rels_path_idx" ON "reviews_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "reviews_rels_services_id_idx" ON "reviews_rels" USING btree ("services_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "reviews_rels" CASCADE;
  `)
}
