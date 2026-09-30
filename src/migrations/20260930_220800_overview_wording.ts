import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Three service overview lines back to the WordPress wording.
 *
 * Found while checking that the hidden `contentBlocks` checklists (dropped in
 * the next migration) held nothing the live overview lacks. They don't — but
 * the comparison turned up three small drifts between the overview and the
 * live WordPress pages:
 *
 * - ADU, Key Features: "Expert guidance through the entire process" —
 *   WordPress says "throughout" (`/services/adu/`).
 * - Additions and Complete Renovation, Process: "we will add the finishing
 *   touches" — WordPress says "we’ll add the finishing touches"
 *   (`/services/additions/`, `/services/complete-renovation/`).
 *
 * Exact-string replacements on those records only.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "services"
    SET "overview_key_features" = replace("overview_key_features"::text,
      'Expert guidance through the entire process', 'Expert guidance throughout the entire process')::jsonb
    WHERE "slug" = 'adu';

    UPDATE "services"
    SET "overview_process" = replace("overview_process"::text,
      'we will add the finishing touches', 'we’ll add the finishing touches')::jsonb
    WHERE "slug" IN ('additions', 'complete-renovation');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "services"
    SET "overview_key_features" = replace("overview_key_features"::text,
      'Expert guidance throughout the entire process', 'Expert guidance through the entire process')::jsonb
    WHERE "slug" = 'adu';

    UPDATE "services"
    SET "overview_process" = replace("overview_process"::text,
      'we’ll add the finishing touches', 'we will add the finishing touches')::jsonb
    WHERE "slug" IN ('additions', 'complete-renovation');
  `)
}
