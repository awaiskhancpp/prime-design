import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The `navigation` global — the header menu and the footer's link columns.
 *
 * They were typed into `website.json`, so their wording could only change in
 * code. The tables below are the shape Payload generates for
 * `src/globals/Navigation.ts` (checked against `payload generate:db-schema`):
 * three nested array levels under the header, two arrays under the footer, and
 * a single `service_id` column wherever an entry links to a service. The
 * values are written by `scripts/seed-navigation.ts`.
 *
 * Additive. Hand-written for the reason in §8b of CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "navigation" (
      "id" serial PRIMARY KEY NOT NULL,
      "footer_copyright" varchar,
      "footer_privacy_policy_url" varchar,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "navigation_header_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "service_id" integer,
      "url" varchar
    );

    CREATE TABLE IF NOT EXISTS "navigation_header_items_children" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "service_id" integer,
      "url" varchar
    );

    CREATE TABLE IF NOT EXISTS "navigation_header_items_children_children" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "service_id" integer,
      "url" varchar
    );

    CREATE TABLE IF NOT EXISTS "navigation_footer_quick_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "url" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "navigation_footer_service_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "service_id" integer NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_service_id_services_id_fk"
        FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "navigation_header_items_children" ADD CONSTRAINT "navigation_header_items_children_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_items"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "navigation_header_items_children" ADD CONSTRAINT "navigation_header_items_children_service_id_services_id_fk"
        FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "navigation_header_items_children_children" ADD CONSTRAINT "navigation_header_items_children_children_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_items_children"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "navigation_header_items_children_children" ADD CONSTRAINT "navigation_header_items_children_children_service_id_services_id_fk"
        FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "navigation_footer_quick_links" ADD CONSTRAINT "navigation_footer_quick_links_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "navigation_footer_service_links" ADD CONSTRAINT "navigation_footer_service_links_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "navigation_footer_service_links" ADD CONSTRAINT "navigation_footer_service_links_service_id_services_id_fk"
        FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "navigation_header_items_order_idx" ON "navigation_header_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "navigation_header_items_parent_id_idx" ON "navigation_header_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "navigation_header_items_service_idx" ON "navigation_header_items" USING btree ("service_id");
    CREATE INDEX IF NOT EXISTS "navigation_header_items_children_order_idx" ON "navigation_header_items_children" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "navigation_header_items_children_parent_id_idx" ON "navigation_header_items_children" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "navigation_header_items_children_service_idx" ON "navigation_header_items_children" USING btree ("service_id");
    CREATE INDEX IF NOT EXISTS "navigation_header_items_children_children_order_idx" ON "navigation_header_items_children_children" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "navigation_header_items_children_children_parent_id_idx" ON "navigation_header_items_children_children" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "navigation_header_items_children_children_service_idx" ON "navigation_header_items_children_children" USING btree ("service_id");
    CREATE INDEX IF NOT EXISTS "navigation_footer_quick_links_order_idx" ON "navigation_footer_quick_links" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "navigation_footer_quick_links_parent_id_idx" ON "navigation_footer_quick_links" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "navigation_footer_service_links_order_idx" ON "navigation_footer_service_links" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "navigation_footer_service_links_parent_id_idx" ON "navigation_footer_service_links" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "navigation_footer_service_links_service_idx" ON "navigation_footer_service_links" USING btree ("service_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "navigation_header_items_children_children" CASCADE;
    DROP TABLE IF EXISTS "navigation_header_items_children" CASCADE;
    DROP TABLE IF EXISTS "navigation_header_items" CASCADE;
    DROP TABLE IF EXISTS "navigation_footer_quick_links" CASCADE;
    DROP TABLE IF EXISTS "navigation_footer_service_links" CASCADE;
    DROP TABLE IF EXISTS "navigation" CASCADE;
  `)
}
