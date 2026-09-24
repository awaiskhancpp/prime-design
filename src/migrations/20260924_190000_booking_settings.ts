import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The booking calendar gets real rules, and bookings get a real date.
 *
 * ── Why the submissions need two new columns ──────────────────────────────
 *
 * Capacity ("only one appointment that day") cannot be enforced without
 * counting what is already booked on a date, and the only thing stored about
 * a booking was `preferred_date`: a display string such as
 * `"September 24, 2026 at 01:00 am"`. Counting by that means parsing English
 * dates, and two spellings of the same day would not match. `appointment_date`
 * (a real date) and `appointment_slot` (the chosen time, as offered) make the
 * count a `WHERE appointment_date = $1`. `preferred_date` stays as the line
 * the notification email reads.
 *
 * ── The global ────────────────────────────────────────────────────────────
 *
 * `booking_settings` and its four child tables hold the hours, the closed
 * weekdays and dates, the per-day capacity and the booking window — all of
 * which were hardcoded in `AppointmentModal`, most of them wrongly (the five
 * offered times were 12am, 1am, 2am, 3am and 10pm).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ---- structured booking fields on the lead -----------------------------
  await db.execute(sql`
    ALTER TABLE "contact_submissions"
      ADD COLUMN IF NOT EXISTS "appointment_date" date,
      ADD COLUMN IF NOT EXISTS "appointment_slot" varchar;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "contact_submissions_appointment_date_idx"
      ON "contact_submissions" ("appointment_date");
  `)

  // ---- the global --------------------------------------------------------
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "booking_settings" (
      "id" serial PRIMARY KEY,
      "min_notice_hours" numeric DEFAULT 24,
      "daily_capacity" numeric DEFAULT 3,
      "booking_window_days" numeric DEFAULT 90,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "booking_settings_slots" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY,
      "time" varchar NOT NULL
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "booking_settings_closed_dates" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY,
      "date" timestamp(3) with time zone NOT NULL,
      "note" varchar
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "booking_settings_date_capacities" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY,
      "date" timestamp(3) with time zone NOT NULL,
      "capacity" numeric NOT NULL
    );
  `)
  // `closedWeekdays` is a hasMany select, which Payload stores in its own
  // table of enum values rather than as a column.
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_booking_settings_closed_weekdays" AS ENUM ('0','1','2','3','4','5','6');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "booking_settings_closed_weekdays" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_booking_settings_closed_weekdays",
      "id" serial PRIMARY KEY
    );
  `)

  for (const [table, parent] of [
    ['booking_settings_slots', '_parent_id'],
    ['booking_settings_closed_dates', '_parent_id'],
    ['booking_settings_date_capacities', '_parent_id'],
    ['booking_settings_closed_weekdays', 'parent_id'],
  ] as const) {
    await db.execute(
      sql.raw(`
        DO $$ BEGIN
          ALTER TABLE "${table}"
            ADD CONSTRAINT "${table}_parent_fk"
            FOREIGN KEY ("${parent}") REFERENCES "booking_settings"("id")
            ON DELETE cascade ON UPDATE no action;
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `),
    )
    await db.execute(
      sql.raw(`CREATE INDEX IF NOT EXISTS "${table}_parent_idx" ON "${table}" ("${parent}");`),
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "booking_settings_slots";`)
  await db.execute(sql`DROP TABLE IF EXISTS "booking_settings_closed_dates";`)
  await db.execute(sql`DROP TABLE IF EXISTS "booking_settings_date_capacities";`)
  await db.execute(sql`DROP TABLE IF EXISTS "booking_settings_closed_weekdays";`)
  await db.execute(sql`DROP TYPE IF EXISTS "enum_booking_settings_closed_weekdays";`)
  await db.execute(sql`DROP TABLE IF EXISTS "booking_settings";`)
  await db.execute(sql`DROP INDEX IF EXISTS "contact_submissions_appointment_date_idx";`)
  await db.execute(sql`
    ALTER TABLE "contact_submissions"
      DROP COLUMN IF EXISTS "appointment_date",
      DROP COLUMN IF EXISTS "appointment_slot";
  `)
}
