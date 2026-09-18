import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `pages_blocks_social_proof` — the review-platform row (Yelp, Google,
 * Houzz) as a page section.
 *
 * Only the copy is stored. The three profile URLs stay in Site Settings →
 * Social Links, where the homepage badge row already reads them, so the block
 * needs no link columns and the two places cannot drift apart.
 *
 * Column shape and the index/constraint names follow the other page block
 * tables created in `20260914_172948_pages_section_blocks`.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql.raw(`CREATE TABLE IF NOT EXISTS "pages_blocks_social_proof" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "eyebrow" varchar,
      "heading" varchar,
      "description" varchar,
      "block_name" varchar
    );`),
  )

  await db.execute(
    sql.raw(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_social_proof_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_social_proof"
          ADD CONSTRAINT "pages_blocks_social_proof_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;`),
  )

  for (const column of ['_order', '_parent_id', '_path']) {
    await db.execute(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS "pages_blocks_social_proof_${column.replace(/^_/, '')}_idx"
           ON "pages_blocks_social_proof" USING btree ("${column}");`,
      ),
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql.raw(`DROP TABLE IF EXISTS "pages_blocks_social_proof";`))
}
