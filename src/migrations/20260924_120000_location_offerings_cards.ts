import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `serviceLocations.offerings` gains its own heading, lede and cards.
 *
 * The offerings section was rendered entirely from the parent service's
 * `sub-services` block, with the city appended to each card title. Checked
 * against the live original, that was wrong on every count except the card
 * order:
 *
 *   kitchen pages   heading is "Kitchen Remodeling in {City} That Reflects
 *                   Your Unique Style and Vision.", the cards are
 *                   Custom-Kitchen.png / European-Kitchen.png /
 *                   Shaker-Kitchen.png, and there is one button
 *   bathroom pages  heading is "Witness the Beauty of Our Bathroom
 *                   Transformations", the cards are three specific
 *                   2023-05-05 photos — not the adjacent frames of the same
 *                   series the service page uses — the titles carry no city
 *                   ("Custom Bathtubs"), and there are two buttons
 *   home pages      the section does not exist at all
 *
 * The parent service's block cannot express any of that, so the section's own
 * content moves onto the location record. Both new columns and the new table
 * are additive: a record with no cards falls back to the parent service and
 * renders as before, which is what the 45 rows do until
 * `scripts/seed-location-offerings.ts` fills them.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "service_locations"
      ADD COLUMN IF NOT EXISTS "offerings_heading" varchar,
      ADD COLUMN IF NOT EXISTS "offerings_description" varchar;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "service_locations_offerings_cards" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY,
      "title" varchar NOT NULL,
      "description" varchar,
      "image_id" integer,
      "href" varchar
    );
  `)

  // Cascade on the parent, set-null on the photo: deleting a location takes
  // its cards with it, while deleting a photo must not delete the card that
  // used it — the text is the content, the image is a reference to it.
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "service_locations_offerings_cards"
        ADD CONSTRAINT "service_locations_offerings_cards_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "service_locations"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "service_locations_offerings_cards"
        ADD CONSTRAINT "service_locations_offerings_cards_image_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "service_locations_offerings_cards_order_idx"
      ON "service_locations_offerings_cards" ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "service_locations_offerings_cards_parent_id_idx"
      ON "service_locations_offerings_cards" ("_parent_id");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "service_locations_offerings_cards_image_id_idx"
      ON "service_locations_offerings_cards" ("image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "service_locations_offerings_cards";`)
  await db.execute(sql`
    ALTER TABLE "service_locations"
      DROP COLUMN IF EXISTS "offerings_heading",
      DROP COLUMN IF EXISTS "offerings_description";
  `)
}
