import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The CTA body becomes rich text.
 *
 * The free-estimate band reads "Contact us here or reach us at
 * (650) 235-4863" — two links in one sentence, which a plain textarea cannot
 * carry, so the copy rendered as flat text with both the contact link and the
 * phone number dead.
 *
 * Three columns, because the same band is fed from three places:
 *
 *   - `landing_pages_blocks_cta.description` and
 *     `services_blocks_cta.description` come from the SAME block definition —
 *     `blocks/LandingPageBlocks.ts` is shared between the two collections, and
 *     migrating one side without the other previously broke every query
 *     against the other (see `20260917_192000_services_shared_landing_blocks`).
 *   - `pages_blocks_cta.body` is the Pages collection's own CTA block, which
 *     is what the blog page renders.
 *
 * Existing copy is converted to a single Lexical paragraph so nothing already
 * imported is lost; empty strings become NULL rather than an empty document.
 * `down` reverses it by flattening the text back out.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */


const TARGETS: Array<{ table: string; column: string }> = [
  { table: 'landing_pages_blocks_cta', column: 'description' },
  { table: 'services_blocks_cta', column: 'description' },
  { table: 'pages_blocks_cta', column: 'body' },
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { table, column } of TARGETS) {
    await db.execute(
      sql.raw(`
        DO $do$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = '${table}' AND column_name = '${column}'
            AND data_type <> 'jsonb'
        ) THEN
        ALTER TABLE "${table}"
          ALTER COLUMN "${column}" TYPE jsonb
          USING CASE
            WHEN "${column}" IS NULL OR btrim("${column}") = '' THEN NULL
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
                        'text', "${column}",
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
  }}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const { table, column } of TARGETS) {
    await db.execute(
      sql.raw(`
        ALTER TABLE "${table}"
          ALTER COLUMN "${column}" TYPE varchar
          USING CASE
            WHEN "${column}" IS NULL THEN NULL
            ELSE (
              SELECT string_agg(t->>'text', '')
              FROM jsonb_array_elements("${column}"->'root'->'children') AS c,
                   jsonb_array_elements(c->'children') AS t
            )
          END;
      `),
    )
  }
}
