import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Split Reviews out of Testimonials, and make Testimonial Cards pick from
 * Testimonials instead of storing copies.
 *
 * Before: `testimonials` held 124 Google and Yelp reviews and none of the
 * site's own testimonials, while the three real testimonials (Isabel E.,
 * Christian F., James G.) were copied — name, quote and avatar URL — into the
 * Testimonial Cards section of the Shaker Kitchen service and all 45
 * service-location pages: 46 identical copies.
 *
 * After:
 *   - `reviews` holds the 124 platform reviews, ids kept, with `location` set
 *     to the listing each was left on (below).
 *   - `testimonials` holds the three testimonials, their avatars as real Media
 *     documents (unnamed-5/4/3.png, which the copied URLs pointed at).
 *   - `testimonialCards.testimonials` on services and service-locations is a
 *     hasMany relationship to them, in the order the copies were in.
 *
 * Review locations come from the listing, not invented: every Google review is
 * on the one Google listing, cid 11837063325613881352, which Site Settings'
 * first address (416 East Campbell Ave) links to; every Yelp review's
 * `source_url` names its listing (…-san-jose, …-san-jose-2, …-santa-clara,
 * prime-kitchens-santa-clara). A Yelp review with no `source_url` is left
 * without a location.
 *
 * The old `*_testimonial_cards_items` tables are deliberately left in place,
 * unread by the new config, so `down()` can restore from them. Drop them in a
 * later migration once this has been confirmed on the live site.
 *
 * Hand-written for the reason in §8b of CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "reviews" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "quote" varchar NOT NULL,
      "location" varchar,
      "rating" numeric,
      "source" varchar,
      "source_url" varchar,
      "quote_is_excerpt" boolean DEFAULT false,
      "time_ago" varchar,
      "image_id" integer,
      "featured" boolean DEFAULT false,
      "sort_order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "reviews" ADD CONSTRAINT "reviews_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "reviews_image_idx" ON "reviews" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "reviews_sort_order_idx" ON "reviews" USING btree ("sort_order");
    CREATE INDEX IF NOT EXISTS "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews" USING btree ("created_at");

    -- Payload's document-locking table has one column per collection.
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "reviews_id" integer;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk"
        FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reviews_id_idx"
      ON "payload_locked_documents_rels" USING btree ("reviews_id");

    -- Move the platform reviews, ids and timestamps kept.
    INSERT INTO "reviews" ("id", "name", "quote", "location", "rating", "source", "source_url",
      "quote_is_excerpt", "time_ago", "image_id", "featured", "sort_order", "updated_at", "created_at")
    SELECT "id", "name", "quote",
      CASE
        WHEN lower("source") = 'google' THEN 'Campbell, CA'
        WHEN "source_url" ~ 'yelp\\.com/biz/[a-z-]*-san-jose(-2)?([?/]|$)' THEN 'San Jose, CA'
        WHEN "source_url" ~ 'yelp\\.com/biz/[a-z-]*-santa-clara([?/]|$)' THEN 'Santa Clara, CA'
        ELSE "location"
      END,
      "rating", "source", "source_url", "quote_is_excerpt", "time_ago", "image_id",
      "featured", "sort_order", "updated_at", "created_at"
    FROM "testimonials"
    WHERE lower(coalesce("source", '')) IN ('google', 'yelp')
    ON CONFLICT ("id") DO NOTHING;

    SELECT setval(pg_get_serial_sequence('reviews', 'id'), coalesce((SELECT max("id") FROM "reviews"), 1));

    DELETE FROM "testimonials" WHERE "id" IN (SELECT "id" FROM "reviews");

    -- The three testimonials, from the Shaker Kitchen service's copies (all 46
    -- copies are identical), avatars resolved to the Media documents their
    -- URLs named.
    INSERT INTO "testimonials" ("name", "quote", "image_id", "featured", "sort_order")
    SELECT i."name", i."quote", m."id", false, i."_order"
    FROM "services_testimonial_cards_items" i
    JOIN "services" s ON s."id" = i."_parent_id" AND s."slug" = 'shaker-kitchen'
    LEFT JOIN "media" m ON m."filename" = regexp_replace(i."avatar", '^.*/', '')
    WHERE i."quote" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "testimonials" t WHERE t."name" = i."name");

    -- Relationship storage. services_rels exists; service_locations_rels is new.
    ALTER TABLE "services_rels" ADD COLUMN IF NOT EXISTS "testimonials_id" integer;
    DO $$ BEGIN
      ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_testimonials_fk"
        FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "services_rels_testimonials_id_idx" ON "services_rels" USING btree ("testimonials_id");

    CREATE TABLE IF NOT EXISTS "service_locations_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "testimonials_id" integer
    );
    DO $$ BEGIN
      ALTER TABLE "service_locations_rels" ADD CONSTRAINT "service_locations_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."service_locations"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "service_locations_rels" ADD CONSTRAINT "service_locations_rels_testimonials_fk"
        FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "service_locations_rels_order_idx" ON "service_locations_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "service_locations_rels_parent_idx" ON "service_locations_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "service_locations_rels_path_idx" ON "service_locations_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "service_locations_rels_testimonials_id_idx"
      ON "service_locations_rels" USING btree ("testimonials_id");

    -- Each page's copies become links, in the same order.
    INSERT INTO "services_rels" ("order", "parent_id", "path", "testimonials_id")
    SELECT i."_order", i."_parent_id", 'testimonialCards.testimonials', t."id"
    FROM "services_testimonial_cards_items" i
    JOIN "testimonials" t ON t."name" = i."name"
    WHERE NOT EXISTS (
      SELECT 1 FROM "services_rels" r
      WHERE r."parent_id" = i."_parent_id" AND r."path" = 'testimonialCards.testimonials' AND r."testimonials_id" = t."id"
    );

    INSERT INTO "service_locations_rels" ("order", "parent_id", "path", "testimonials_id")
    SELECT i."_order", i."_parent_id", 'testimonialCards.testimonials', t."id"
    FROM "service_locations_testimonial_cards_items" i
    JOIN "testimonials" t ON t."name" = i."name"
    WHERE NOT EXISTS (
      SELECT 1 FROM "service_locations_rels" r
      WHERE r."parent_id" = i."_parent_id" AND r."path" = 'testimonialCards.testimonials' AND r."testimonials_id" = t."id"
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "service_locations_rels";
    ALTER TABLE "services_rels" DROP CONSTRAINT IF EXISTS "services_rels_testimonials_fk";
    DROP INDEX IF EXISTS "services_rels_testimonials_id_idx";
    ALTER TABLE "services_rels" DROP COLUMN IF EXISTS "testimonials_id";

    DELETE FROM "testimonials";
    INSERT INTO "testimonials" ("id", "name", "quote", "location", "rating", "source", "source_url",
      "quote_is_excerpt", "time_ago", "image_id", "featured", "sort_order", "updated_at", "created_at")
    SELECT "id", "name", "quote", NULL, "rating", "source", "source_url",
      "quote_is_excerpt", "time_ago", "image_id", "featured", "sort_order", "updated_at", "created_at"
    FROM "reviews";
    SELECT setval(pg_get_serial_sequence('testimonials', 'id'), coalesce((SELECT max("id") FROM "testimonials"), 1));

    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_reviews_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_reviews_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "reviews_id";
    DROP TABLE IF EXISTS "reviews";
  `)
}
