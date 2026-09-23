import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `find-us` map pins on the **services** side.
 *
 * The `find-us` block is defined once in `landingPageBlocks` and mounted in two
 * places: the landing pages' layout, and the Services page builder (see
 * `servicePageBlocks`). Adding a field to the block therefore adds a table to
 * *both* collections — and a Payload query for `services` joins every block
 * sub-table whether or not any row uses it, so a missing table is not a section
 * that renders empty: it is `relation "services_blocks_find_us_map_pins" does
 * not exist` on every read of the collection, which took out every page that
 * lists services.
 *
 * The previous migration created only the landing-pages table. This one is the
 * services half. It has no rows to seed: no service record uses a `find-us`
 * block today (`services_blocks_find_us` is empty), and a service that adds one
 * later is authored in the admin.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "services_blocks_find_us_map_pins" (
      "_order" integer NOT NULL,
      -- varchar: the parent is a block row, and blocks carry Payload's
      -- generated varchar ids.
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "latitude" numeric,
      "longitude" numeric
    );
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "services_blocks_find_us_map_pins"
        ADD CONSTRAINT "services_blocks_find_us_map_pins_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_find_us"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "services_blocks_find_us_map_pins_order_idx"
      ON "services_blocks_find_us_map_pins" USING btree ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "services_blocks_find_us_map_pins_parent_id_idx"
      ON "services_blocks_find_us_map_pins" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "services_blocks_find_us_map_pins" CASCADE;`)
}
