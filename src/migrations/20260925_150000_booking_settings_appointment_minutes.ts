import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `booking_settings.appointment_minutes` — how long a consultation runs.
 *
 * An appointment's `ends_at` is worked out from its start plus this, so the
 * length had to become a real setting rather than a number in code. 60 matches
 * the "~1 Hour" every consultation card on the site shows. Visitors are never
 * asked for it; they pick a start slot.
 *
 * Its own migration because `20260925_140000_latepoint_field_parity` — which
 * introduced the field and left this column out — has already run, and §8b of
 * CLAUDE.md is right that rewriting an applied migration makes the file
 * history and the database disagree.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "booking_settings" ADD COLUMN IF NOT EXISTS "appointment_minutes" numeric DEFAULT 60;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "booking_settings" DROP COLUMN IF EXISTS "appointment_minutes";`)
}
