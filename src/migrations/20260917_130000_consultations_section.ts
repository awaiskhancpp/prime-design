import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Contact page -> Pages collection.
 *
 * The /contact page hardcoded its hero copy in `ContactPage.tsx` while the
 * consultation cards and the phone number already came from Payload. This adds
 * the `consultations` section block so the page can become an ordinary Pages
 * record like the homepage, About, Gallery, Testimonials and FAQ pages.
 *
 * The block stores only the section's own copy. The cards stay in the
 * Consultations collection and are read at render time, mirroring the split
 * WordPress uses between authored section copy and repeated content.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_consultations" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "eyebrow" varchar,
      "heading" varchar,
      "description" varchar,
      "block_name" varchar
    );
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_consultations_parent_fk'
      ) THEN
        ALTER TABLE "pages_blocks_consultations"
          ADD CONSTRAINT "pages_blocks_consultations_parent_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_consultations_order_idx" ON "pages_blocks_consultations" ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_consultations_parent_idx" ON "pages_blocks_consultations" ("_parent_id");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_consultations_path_idx" ON "pages_blocks_consultations" ("_path");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "pages_blocks_consultations";`)
}
