import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Split consultation bookings out of `contact-submissions` into `customers`.
 *
 * A booking and an enquiry were sharing a table and disagreeing about what the
 * columns meant: half of `contact_submissions` was an "Appointment details"
 * group that is null on every enquiry, and `status = 'archived'` had to serve
 * as both "filed away" and "cancelled" — the latter being what gave a booked
 * slot back to the calendar. See `collections/Customers.ts`.
 *
 * Written by hand rather than generated. `migrate:create` diffs against the
 * newest schema snapshot, which is from before seventeen hand-written
 * migrations, so it reads their tables as removals; §8b of CLAUDE.md has the
 * detail. Everything here is additive apart from the six columns dropped at
 * the end, and those are dropped in the same transaction that copies their
 * contents to the new table.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_customers_status" AS ENUM ('booked','confirmed','completed','cancelled','no-show');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_customers_notification_status" AS ENUM ('pending','not-configured','sent','failed');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_customers_crm_status" AS ENUM ('pending','not-configured','synced','failed');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_customers_recaptcha_status" AS ENUM ('not-configured','verified','skipped');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "customers" (
      "id" serial PRIMARY KEY NOT NULL,
      "first_name" varchar NOT NULL,
      "last_name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "phone" varchar NOT NULL,
      "service_id" integer,
      "message" varchar NOT NULL,
      "preferred_date" varchar,
      "appointment_date" date,
      "appointment_slot" varchar,
      "consultation_type" varchar,
      "booking_reference" varchar,
      "address" varchar,
      "zip_code" varchar,
      "status" "enum_customers_status" DEFAULT 'booked' NOT NULL,
      "form_name" varchar,
      "source_url" varchar,
      "notification_status" "enum_customers_notification_status" DEFAULT 'pending',
      "crm_status" "enum_customers_crm_status" DEFAULT 'pending',
      "delivery_error" varchar,
      "recaptcha_status" "enum_customers_recaptcha_status" DEFAULT 'not-configured',
      "recaptcha_score" numeric,
      "meta" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "customers" ADD CONSTRAINT "customers_service_id_fk"
        FOREIGN KEY ("service_id") REFERENCES "public"."services"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "customers_email_idx" ON "customers" ("email");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "customers_service_idx" ON "customers" ("service_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "customers_appointment_date_idx" ON "customers" ("appointment_date");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "customers_booking_reference_idx" ON "customers" ("booking_reference");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "customers_status_idx" ON "customers" ("status");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "customers_created_at_idx" ON "customers" ("created_at");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "customers_updated_at_idx" ON "customers" ("updated_at");`)

  // Admin document locking keeps one nullable column per collection here.
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "customers_id" integer;`)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk"
        FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_customers_id_idx"
      ON "payload_locked_documents_rels" ("customers_id");
  `)

  /**
   * Move the bookings across.
   *
   * `source = 'appointment'` is exactly how `/api/contact` used to mark one.
   * `status` translates new/contacted/qualified → 'booked' and archived →
   * 'cancelled', which is the meaning archived actually carried for a booking:
   * it was the value that released the slot in `bookedCounts`. The booking
   * reference comes out of `meta->>'orderId'`, where it was buried, and is
   * removed from `meta` so there is one copy of it.
   */
  await db.execute(sql`
    INSERT INTO "customers" (
      "first_name","last_name","email","phone","service_id","message",
      "preferred_date","appointment_date","appointment_slot","consultation_type",
      "booking_reference","address","zip_code","status","form_name","source_url",
      "notification_status","crm_status","delivery_error",
      "recaptcha_status","recaptcha_score","meta","created_at","updated_at"
    )
    SELECT
      "first_name","last_name","email","phone","service_id","message",
      "preferred_date","appointment_date","appointment_slot","consultation_type",
      NULLIF("meta"->>'orderId',''),
      "address","zip_code",
      CASE WHEN "status" = 'archived' THEN 'cancelled' ELSE 'booked' END::"enum_customers_status",
      "form_name","source_url",
      "notification_status"::text::"enum_customers_notification_status",
      "crm_status"::text::"enum_customers_crm_status",
      "delivery_error",
      "recaptcha_status"::text::"enum_customers_recaptcha_status",
      "recaptcha_score",
      ("meta" - 'orderId'),
      "created_at","updated_at"
    FROM "contact_submissions"
    WHERE "source" = 'appointment';
  `)

  await db.execute(sql`DELETE FROM "contact_submissions" WHERE "source" = 'appointment';`)

  // The appointment-only columns are now empty on every remaining row.
  await db.execute(sql`
    ALTER TABLE "contact_submissions"
      DROP COLUMN IF EXISTS "address",
      DROP COLUMN IF EXISTS "zip_code",
      DROP COLUMN IF EXISTS "consultation_type",
      DROP COLUMN IF EXISTS "preferred_date",
      DROP COLUMN IF EXISTS "appointment_date",
      DROP COLUMN IF EXISTS "appointment_slot";
  `)
}

/**
 * Reverses the split: the columns come back, the bookings go back into
 * `contact_submissions` as `source = 'appointment'`, and `customers` is
 * dropped. `cancelled` and `no-show` both map back to `archived`, which is the
 * only lead status that meant the appointment was not happening.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "contact_submissions"
      ADD COLUMN IF NOT EXISTS "address" varchar,
      ADD COLUMN IF NOT EXISTS "zip_code" varchar,
      ADD COLUMN IF NOT EXISTS "consultation_type" varchar,
      ADD COLUMN IF NOT EXISTS "preferred_date" varchar,
      ADD COLUMN IF NOT EXISTS "appointment_date" date,
      ADD COLUMN IF NOT EXISTS "appointment_slot" varchar;
  `)

  await db.execute(sql`
    INSERT INTO "contact_submissions" (
      "first_name","last_name","email","phone","service_id","message",
      "address","zip_code","consultation_type","preferred_date",
      "appointment_date","appointment_slot","source","status",
      "form_name","source_url","notification_status","crm_status","delivery_error",
      "recaptcha_status","recaptcha_score","meta","created_at","updated_at"
    )
    SELECT
      "first_name","last_name","email","phone","service_id","message",
      "address","zip_code","consultation_type","preferred_date",
      "appointment_date","appointment_slot",
      'appointment'::"enum_contact_submissions_source",
      CASE WHEN "status" IN ('cancelled','no-show') THEN 'archived' ELSE 'new' END::"enum_contact_submissions_status",
      "form_name","source_url",
      "notification_status"::text::"enum_contact_submissions_notification_status",
      "crm_status"::text::"enum_contact_submissions_crm_status",
      "delivery_error",
      "recaptcha_status"::text::"enum_contact_submissions_recaptcha_status",
      "recaptcha_score",
      CASE
        WHEN "booking_reference" IS NULL THEN "meta"
        ELSE COALESCE("meta", '{}'::jsonb) || jsonb_build_object('orderId', "booking_reference")
      END,
      "created_at","updated_at"
    FROM "customers";
  `)

  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "customers_id";`)
  await db.execute(sql`DROP TABLE IF EXISTS "customers";`)
  for (const type of [
    'enum_customers_status',
    'enum_customers_notification_status',
    'enum_customers_crm_status',
    'enum_customers_recaptcha_status',
  ]) {
    await db.execute(sql`DROP TYPE IF EXISTS ${sql.raw(`"${type}"`)};`)
  }
}
