import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * FAQ page -> Pages collection.
 *
 * The /faq page rendered a 23KB hardcoded array (`src/lib/faq.ts`) while the
 * service pages already read the FAQs collection, so the same questions lived
 * in two places and the static copy had drifted (46 entries with one duplicated
 * question, against 45 clean rows in Payload).
 *
 * This adds the `faq-index` section block. It stores only the section's own
 * copy — eyebrow, heading, the line above the search field, the search
 * placeholder and the empty-state message. The questions themselves stay in
 * the FAQs collection, grouped by their FAQ Category relationship and read at
 * render time, which is the same split WordPress uses (an authored hero plus a
 * Bricks query loop over the FAQ taxonomy).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_faq_index" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "eyebrow" varchar,
      "heading" varchar,
      "description" varchar,
      "search_placeholder" varchar,
      "all_label" varchar,
      "empty_message" varchar,
      "block_name" varchar
    );
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_faq_index_parent_fk'
      ) THEN
        ALTER TABLE "pages_blocks_faq_index"
          ADD CONSTRAINT "pages_blocks_faq_index_parent_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_faq_index_order_idx" ON "pages_blocks_faq_index" ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_faq_index_parent_idx" ON "pages_blocks_faq_index" ("_parent_id");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_faq_index_path_idx" ON "pages_blocks_faq_index" ("_path");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "pages_blocks_faq_index";`)
}
