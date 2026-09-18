import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Siding landing page — the `benefits` block, rich-text image+text bodies,
 * and an anchor on the contact form.
 *
 *  - **`benefits`**: the WordPress "Benefits of …" sections are a row of
 *    photo cards (`d1126c` = "Benefits of Siding", four cards). They typed as
 *    `image-text` upstream, which collapsed all four into a single run-on
 *    paragraph and kept only one unrelated image.
 *  - **`image_text.description` becomes rich text.** These bodies are
 *    structured in the source — a "Key Features:" lead-in over a real
 *    `<list>` — and a varchar column could not hold that, so the list was
 *    flattened and then guessed back apart at render time. Existing values
 *    are converted to a single Lexical paragraph rather than dropped.
 *  - **`contact_form.anchor_id`**: on these pages the contact form shares the
 *    "Find us" Bricks root, and that root carries `contact_form` — the id
 *    every "Schedule a Free Consultation" button links to.
 *
 * Applied to both the `landing_pages_blocks_*` and `services_blocks_*` sides:
 * `blocks/LandingPageBlocks.ts` is shared between the two collections, and
 * migrating only one side previously broke every `services` query site-wide.
 * The shared image+text block is `services_blocks_image_text_2` — Payload
 * suffixes it because Services also defines its own `image-text`.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */

const BENEFITS: Array<{ table: string; parent: string }> = [
  { table: 'landing_pages_blocks_benefit_cards', parent: 'landing_pages' },
  { table: 'services_blocks_benefit_cards', parent: 'services' },
]

const IMAGE_TEXT = ['landing_pages_blocks_image_text', 'services_blocks_image_text_2']
const CONTACT_FORM = ['landing_pages_blocks_contact_form', 'services_blocks_contact_form']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of CONTACT_FORM) {
    await db.execute(
      sql.raw(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "anchor_id" varchar;`),
    )
  }

  // varchar -> jsonb. Existing copy becomes one Lexical paragraph so nothing
  // already imported is lost; empty strings become NULL rather than an empty
  // document.
  // Guarded so the migration can be re-run after a dropped connection: once
  // the column is already jsonb the USING expression below would be applied
  // to a jsonb value and fail.
  for (const table of IMAGE_TEXT) {
    await db.execute(
      sql.raw(`
        DO $do$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = '${table}' AND column_name = 'description'
            AND data_type <> 'jsonb'
        ) THEN
        ALTER TABLE "${table}"
          ALTER COLUMN "description" TYPE jsonb
          USING CASE
            WHEN "description" IS NULL OR btrim("description") = '' THEN NULL
            ELSE jsonb_build_object(
              'root', jsonb_build_object(
                'type', 'root',
                'format', '',
                'indent', 0,
                'version', 1,
                'direction', 'ltr',
                'children', jsonb_build_array(
                  jsonb_build_object(
                    'type', 'paragraph',
                    'format', '',
                    'indent', 0,
                    'version', 1,
                    'direction', 'ltr',
                    'textFormat', 0,
                    'children', jsonb_build_array(
                      jsonb_build_object(
                        'type', 'text',
                        'detail', 0,
                        'format', 0,
                        'mode', 'normal',
                        'style', '',
                        'text', "description",
                        'version', 1
                      )
                    )
                  )
                )
              )
            )
          END;
        END IF;
        END $do$;
      `),
    )
  }

  for (const { table, parent } of BENEFITS) {
    await db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS "${table}" (
          "id" varchar PRIMARY KEY NOT NULL,
          "_order" integer NOT NULL,
          "_parent_id" integer NOT NULL,
          "_path" text NOT NULL,
          "eyebrow" varchar,
          "heading" varchar,
          "description" varchar,
          "decorative_media_asset_id" integer,
          "decorative_media_alt" varchar,
          "decorative_media_caption" varchar,
          "decorative_media_source_attachment_id" numeric,
          "decorative_media_source_url" varchar,
          "source_id" varchar,
          "source_element_type" varchar,
          "source_attachment_id" numeric,
          "source_metadata" jsonb,
          "block_name" varchar
        );
      `),
    )
    await db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS "${table}_items" (
          "id" varchar PRIMARY KEY NOT NULL,
          "_order" integer NOT NULL,
          "_parent_id" varchar NOT NULL,
          "title" varchar NOT NULL,
          "body" varchar,
          "media_asset_id" integer,
          "media_alt" varchar,
          "media_caption" varchar,
          "media_source_attachment_id" numeric,
          "media_source_url" varchar
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
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${table}_decorative_media_fk') THEN
            ALTER TABLE "${table}" ADD CONSTRAINT "${table}_decorative_media_fk"
              FOREIGN KEY ("decorative_media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${table}_items_parent_id_fk') THEN
            ALTER TABLE "${table}_items" ADD CONSTRAINT "${table}_items_parent_id_fk"
              FOREIGN KEY ("_parent_id") REFERENCES "public"."${table}"("id") ON DELETE cascade;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${table}_items_media_fk') THEN
            ALTER TABLE "${table}_items" ADD CONSTRAINT "${table}_items_media_fk"
              FOREIGN KEY ("media_asset_id") REFERENCES "public"."media"("id") ON DELETE set null;
          END IF;
        END $$;
      `),
    )
    for (const [suffix, target, column] of [
      ['order_idx', table, '_order'],
      ['parent_id_idx', table, '_parent_id'],
      ['path_idx', table, '_path'],
      ['decorative_media_idx', table, 'decorative_media_asset_id'],
      ['items_order_idx', `${table}_items`, '_order'],
      ['items_parent_id_idx', `${table}_items`, '_parent_id'],
      ['items_media_idx', `${table}_items`, 'media_asset_id'],
    ] as const) {
      await db.execute(
        sql.raw(`CREATE INDEX IF NOT EXISTS "${table}_${suffix}" ON "${target}" ("${column}");`),
      )
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const { table } of BENEFITS) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}_items";`))
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}";`))
  }
  // Back to varchar, keeping the plain text of whatever the document held.
  for (const table of IMAGE_TEXT) {
    await db.execute(
      sql.raw(`
        ALTER TABLE "${table}"
          ALTER COLUMN "description" TYPE varchar
          USING CASE
            WHEN "description" IS NULL THEN NULL
            ELSE (
              SELECT string_agg(t->>'text', '')
              FROM jsonb_array_elements("description"->'root'->'children') AS c,
                   jsonb_array_elements(c->'children') AS t
            )
          END;
      `),
    )
  }
  for (const table of CONTACT_FORM) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "anchor_id";`))
  }
}
