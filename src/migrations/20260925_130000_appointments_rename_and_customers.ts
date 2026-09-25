import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Rename `customers` to `appointments`, and give the name `customers` to what
 * it should mean: the person, not the visit.
 *
 * The collection added an hour ago as `customers` was really the appointment —
 * a service, a day, a slot and a status. A customer is the reusable contact
 * profile behind it, and one person can hold several appointments. Three
 * records now, each meaning one thing: Lead (an enquiry), Customer (a person),
 * Appointment (a visit). Payment is not modelled at all; an order status is not
 * an appointment status, and these consultations are free.
 *
 * ORDER MATTERS. The old table has to surrender the name `customers` — and
 * with it its sequence, primary key and every index — before the new table can
 * take it, because index and sequence names are unique per schema. Renaming
 * the table alone leaves `customers_id_seq` and `customers_pkey` behind, and
 * creating the new table then fails on the collision.
 *
 * Hand-written for the reason in §8b of CLAUDE.md: `migrate:create` diffs
 * against a schema snapshot that predates seventeen hand-written migrations
 * and reads their tables as removals.
 */

/** Old name -> new name, for everything that carries the word `customers`. */
const RENAMES = {
  indexes: [
    ['customers_pkey', 'appointments_pkey'],
    ['customers_email_idx', 'appointments_email_idx'],
    ['customers_service_idx', 'appointments_service_idx'],
    ['customers_appointment_date_idx', 'appointments_appointment_date_idx'],
    ['customers_booking_reference_idx', 'appointments_booking_reference_idx'],
    ['customers_status_idx', 'appointments_status_idx'],
    ['customers_created_at_idx', 'appointments_created_at_idx'],
    ['customers_updated_at_idx', 'appointments_updated_at_idx'],
    [
      'payload_locked_documents_rels_customers_id_idx',
      'payload_locked_documents_rels_appointments_id_idx',
    ],
  ],
  types: [
    ['enum_customers_status', 'enum_appointments_status'],
    ['enum_customers_notification_status', 'enum_appointments_notification_status'],
    ['enum_customers_crm_status', 'enum_appointments_crm_status'],
    ['enum_customers_recaptcha_status', 'enum_appointments_recaptcha_status'],
  ],
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // --- 1. the old table gives up the name, and everything attached to it ---
  await db.execute(sql`ALTER TABLE "customers" RENAME TO "appointments";`)
  await db.execute(sql`ALTER SEQUENCE "customers_id_seq" RENAME TO "appointments_id_seq";`)
  await db.execute(sql`
    ALTER TABLE "appointments" RENAME CONSTRAINT "customers_service_id_fk" TO "appointments_service_id_fk";
  `)
  for (const [from, to] of RENAMES.indexes) {
    await db.execute(sql`ALTER INDEX ${sql.raw(`"${from}"`)} RENAME TO ${sql.raw(`"${to}"`)};`)
  }
  for (const [from, to] of RENAMES.types) {
    await db.execute(sql`ALTER TYPE ${sql.raw(`"${from}"`)} RENAME TO ${sql.raw(`"${to}"`)};`)
  }
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "customers_id" TO "appointments_id";
  `)
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      RENAME CONSTRAINT "payload_locked_documents_rels_customers_fk" TO "payload_locked_documents_rels_appointments_fk";
  `)

  // --- 2. the contact profile ---
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "customers" (
      "id" serial PRIMARY KEY NOT NULL,
      "first_name" varchar NOT NULL,
      "last_name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "phone" varchar,
      "address" varchar,
      "zip_code" varchar,
      "customer_notes" varchar,
      "admin_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)
  // Unique, not merely indexed: two rows sharing an address are precisely the
  // duplicate this collection exists to prevent, and the endpoint that looks
  // before inserting cannot make that true on its own under concurrency.
  await db.execute(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_idx" ON "customers" ("email");`,
  )
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "customers_phone_idx" ON "customers" ("phone");`)
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "customers_created_at_idx" ON "customers" ("created_at");`,
  )
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "customers_updated_at_idx" ON "customers" ("updated_at");`,
  )

  // --- 3. the link, and admin locking for the new collection ---
  await db.execute(sql`ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "customer_id" integer;`)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_fk"
        FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "appointments_customer_idx" ON "appointments" ("customer_id");`,
  )

  await db.execute(
    sql`ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "customers_id" integer;`,
  )
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
   * Backfill: every appointment already stored names somebody, so each one
   * gets a profile.
   *
   * `DISTINCT ON (lower(email))` collapses repeat bookers into one profile and
   * takes their most recent booking as the current details — the same rule the
   * endpoint follows from now on. Matching here is on email alone: phone
   * fallback is a judgement the endpoint can make at the moment of booking,
   * whereas doing it in bulk over historical rows risks merging two people who
   * once shared a landline.
   */
  await db.execute(sql`
    INSERT INTO "customers" ("first_name","last_name","email","phone","address","zip_code","customer_notes","created_at","updated_at")
    SELECT DISTINCT ON (lower("email"))
      "first_name","last_name",lower("email"),"phone","address","zip_code","message","created_at","updated_at"
    FROM "appointments"
    ORDER BY lower("email"), "created_at" DESC
    ON CONFLICT ("email") DO NOTHING;
  `)
  await db.execute(sql`
    UPDATE "appointments" a
      SET "customer_id" = c."id"
      FROM "customers" c
      WHERE lower(a."email") = c."email" AND a."customer_id" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "appointments" DROP COLUMN IF EXISTS "customer_id";`)
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "customers_id";`)
  await db.execute(sql`DROP TABLE IF EXISTS "customers";`)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      RENAME CONSTRAINT "payload_locked_documents_rels_appointments_fk" TO "payload_locked_documents_rels_customers_fk";
  `)
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "appointments_id" TO "customers_id";
  `)
  for (const [from, to] of RENAMES.types) {
    await db.execute(sql`ALTER TYPE ${sql.raw(`"${to}"`)} RENAME TO ${sql.raw(`"${from}"`)};`)
  }
  for (const [from, to] of RENAMES.indexes) {
    await db.execute(sql`ALTER INDEX ${sql.raw(`"${to}"`)} RENAME TO ${sql.raw(`"${from}"`)};`)
  }
  await db.execute(sql`
    ALTER TABLE "appointments" RENAME CONSTRAINT "appointments_service_id_fk" TO "customers_service_id_fk";
  `)
  await db.execute(sql`ALTER SEQUENCE "appointments_id_seq" RENAME TO "customers_id_seq";`)
  await db.execute(sql`ALTER TABLE "appointments" RENAME TO "customers";`)
}
