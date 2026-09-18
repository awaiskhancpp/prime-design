import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `prime-difference.comparisons` — before/after pairs in the section's media
 * column.
 *
 * On the siding and outdoor-hardscape landing pages, WordPress fills the
 * Prime Difference media column with an `xbeforeafterimage` rather than a
 * video slider, authored as a `before-after` Bricks section immediately
 * after the Prime Difference section. That is the same "one section, two
 * roots" split the video carousel already uses (CLAUDE.md §3), so the pair
 * is merged into this block instead of being imported as a section of its
 * own — which otherwise leaves the Prime Difference column empty and repeats
 * the comparison further down the page.
 *
 * Tables are created on **both** sides: `blocks/LandingPageBlocks.ts` is
 * shared between `LandingPages.sections` and the Services page-builder tab,
 * and migrating only the landing side previously broke every `services`
 * query site-wide.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */

const TABLES: Array<{ table: string; parent: string }> = [
  {
    table: 'landing_pages_blocks_prime_difference_comparisons',
    parent: 'landing_pages_blocks_prime_difference',
  },
  {
    table: 'services_blocks_prime_difference_comparisons',
    parent: 'services_blocks_prime_difference',
  },
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { table, parent } of TABLES) {
    await db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS "${table}" (
          "id" varchar PRIMARY KEY NOT NULL,
          "_order" integer NOT NULL,
          "_parent_id" varchar NOT NULL,
          "before_media_id" integer,
          "after_media_id" integer,
          "before_label" varchar,
          "after_label" varchar,
          "caption" varchar,
          "source_id" varchar
        );
      `),
    )
    await db.execute(
      sql.raw(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${table}_parent_id_fk') THEN
            ALTER TABLE "${table}" ADD CONSTRAINT "${table}_parent_id_fk"
              FOREIGN KEY ("_parent_id") REFERENCES "public"."${parent}"("id") ON DELETE cascade;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${table}_before_media_fk') THEN
            ALTER TABLE "${table}" ADD CONSTRAINT "${table}_before_media_fk"
              FOREIGN KEY ("before_media_id") REFERENCES "public"."media"("id") ON DELETE set null;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${table}_after_media_fk') THEN
            ALTER TABLE "${table}" ADD CONSTRAINT "${table}_after_media_fk"
              FOREIGN KEY ("after_media_id") REFERENCES "public"."media"("id") ON DELETE set null;
          END IF;
        END $$;
      `),
    )
    for (const [suffix, column] of [
      ['order_idx', '_order'],
      ['parent_id_idx', '_parent_id'],
      ['before_media_idx', 'before_media_id'],
      ['after_media_idx', 'after_media_id'],
    ] as const) {
      await db.execute(
        sql.raw(
          `CREATE INDEX IF NOT EXISTS "${table}_${suffix}" ON "${table}" ("${column}");`,
        ),
      )
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const { table } of TABLES) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}";`))
  }
}
