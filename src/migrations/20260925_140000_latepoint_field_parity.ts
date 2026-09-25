import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Bring the three booking records in line with the fields the WordPress
 * (LatePoint) admin actually holds, and add the fourth: Order.
 *
 * Appointment
 *   - `starts_at` / `ends_at` replace `appointment_date` + `appointment_slot` +
 *     `preferred_date`. A date column, a "09:00 am" string and a sentence were
 *     three representations of one moment, none of which was the moment.
 *   - `buffer_before` / `buffer_after`, in minutes.
 *   - `order_id`, the parent order.
 *   - statuses become LatePoint's: Pending Approval / Approved / Completed /
 *     Cancelled / No Show. `booked` becomes `pending-approval` and `confirmed`
 *     becomes `approved`, which is what each meant.
 *
 * Customer
 *   - `account_status`, guest or registered.
 *   - the custom fields move into a `custom_fields` group: the existing address
 *     and zip code, plus `phone_number` (a SECOND number, deliberately not the
 *     primary one) and `comments` (the booking form's comment box).
 *
 * Order (new)
 *   - order status, fulfilment, payment status, coupon and the four money
 *     columns. Nothing on this site takes a payment; these open at zero because
 *     a consultation is free, which is exactly what WordPress shows.
 *
 * No form changes anywhere: `phone_number` and `customer_notes` are staff
 * fields and are never written by the site.
 *
 * Hand-written for the reason in §8b of CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ---------------------------------------------------------------- orders
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_orders_order_status" AS ENUM ('open','completed','cancelled');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_orders_fulfillment_status" AS ENUM ('not-fulfilled','partially-fulfilled','fulfilled');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_orders_payment_status" AS ENUM ('not-paid','partially-paid','paid','processing');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "orders" (
      "id" serial PRIMARY KEY NOT NULL,
      "reference" varchar,
      "customer_id" integer,
      "order_status" "enum_orders_order_status" DEFAULT 'open' NOT NULL,
      "fulfillment_status" "enum_orders_fulfillment_status" DEFAULT 'not-fulfilled' NOT NULL,
      "payment_status" "enum_orders_payment_status" DEFAULT 'not-paid' NOT NULL,
      "coupon" varchar,
      "subtotal" numeric DEFAULT 0,
      "total" numeric DEFAULT 0,
      "total_payments" numeric DEFAULT 0,
      "balance_due" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fk"
        FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  for (const column of ['reference', 'customer_id', 'order_status', 'payment_status', 'created_at', 'updated_at']) {
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS ${sql.raw(`"orders_${column.replace(/_id$/, '')}_idx"`)} ON "orders" (${sql.raw(`"${column}"`)});`,
    )
  }
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "orders_id" integer;`)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk"
        FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_orders_id_idx"
      ON "payload_locked_documents_rels" ("orders_id");
  `)

  // ------------------------------------------------------------- customers
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_customers_account_status" AS ENUM ('guest','registered');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    ALTER TABLE "customers"
      ADD COLUMN IF NOT EXISTS "account_status" "enum_customers_account_status" DEFAULT 'guest' NOT NULL;
  `)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "customers_account_status_idx" ON "customers" ("account_status");`)

  await db.execute(sql`ALTER TABLE "customers" RENAME COLUMN "address" TO "custom_fields_address";`)
  await db.execute(sql`ALTER TABLE "customers" RENAME COLUMN "zip_code" TO "custom_fields_zip_code";`)
  await db.execute(sql`
    ALTER TABLE "customers"
      ADD COLUMN IF NOT EXISTS "custom_fields_phone_number" varchar,
      ADD COLUMN IF NOT EXISTS "custom_fields_comments" varchar;
  `)
  /**
   * The booking's comment box was writing to `customer_notes`. It is the form's
   * "Comments" question, which is a custom field; `customer_notes` is
   * LatePoint's core "notes left by the customer" and is staff-edited. Move the
   * two existing values so every profile reads the same way.
   */
  await db.execute(sql`
    UPDATE "customers"
      SET "custom_fields_comments" = "customer_notes", "customer_notes" = NULL
      WHERE "customer_notes" IS NOT NULL;
  `)

  // ---------------------------------------------------------- appointments
  await db.execute(sql`
    ALTER TABLE "appointments"
      ADD COLUMN IF NOT EXISTS "starts_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "ends_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "buffer_before" numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "buffer_after" numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "order_id" integer;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "appointments" ADD CONSTRAINT "appointments_order_id_fk"
        FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "appointments_starts_at_idx" ON "appointments" ("starts_at");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "appointments_order_idx" ON "appointments" ("order_id");`)

  /**
   * The slot is a Pacific wall-clock time, so the day and the slot are joined
   * into a plain timestamp and then read `AT TIME ZONE 'America/Los_Angeles'`
   * to get the instant. Rows with no stored day keep a null start — they are
   * bookings taken before the calendar wrote one, and inventing a time for them
   * would be worse than leaving it blank.
   */
  await db.execute(sql`
    UPDATE "appointments"
      SET "starts_at" = (
            ("appointment_date"::text || ' ' || COALESCE(NULLIF("appointment_slot", ''), '09:00 am'))::timestamp
            AT TIME ZONE 'America/Los_Angeles'
          )
      WHERE "appointment_date" IS NOT NULL;
  `)
  await db.execute(sql`
    UPDATE "appointments" SET "ends_at" = "starts_at" + interval '60 minutes' WHERE "starts_at" IS NOT NULL;
  `)

  // LatePoint's five statuses. `booked` and `confirmed` are renamed, not
  // reinterpreted: each already meant what it now says.
  await db.execute(sql`ALTER TYPE "enum_appointments_status" RENAME TO "enum_appointments_status_old";`)
  await db.execute(sql`
    CREATE TYPE "enum_appointments_status" AS ENUM ('pending-approval','approved','completed','cancelled','no-show');
  `)
  await db.execute(sql`ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT;`)
  await db.execute(sql`
    ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "enum_appointments_status"
      USING (
        CASE "status"::text
          WHEN 'booked' THEN 'pending-approval'
          WHEN 'confirmed' THEN 'approved'
          ELSE "status"::text
        END
      )::"enum_appointments_status";
  `)
  await db.execute(sql`ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'pending-approval';`)
  await db.execute(sql`DROP TYPE "enum_appointments_status_old";`)

  await db.execute(sql`DROP INDEX IF EXISTS "appointments_appointment_date_idx";`)
  await db.execute(sql`
    ALTER TABLE "appointments"
      DROP COLUMN IF EXISTS "appointment_date",
      DROP COLUMN IF EXISTS "appointment_slot",
      DROP COLUMN IF EXISTS "preferred_date";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "appointments"
      ADD COLUMN IF NOT EXISTS "appointment_date" date,
      ADD COLUMN IF NOT EXISTS "appointment_slot" varchar,
      ADD COLUMN IF NOT EXISTS "preferred_date" varchar;
  `)
  await db.execute(sql`
    UPDATE "appointments"
      SET "appointment_date" = ("starts_at" AT TIME ZONE 'America/Los_Angeles')::date,
          "appointment_slot" = trim(to_char("starts_at" AT TIME ZONE 'America/Los_Angeles', 'HH12:MI am'))
      WHERE "starts_at" IS NOT NULL;
  `)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "appointments_appointment_date_idx" ON "appointments" ("appointment_date");`)

  await db.execute(sql`ALTER TYPE "enum_appointments_status" RENAME TO "enum_appointments_status_new";`)
  await db.execute(sql`
    CREATE TYPE "enum_appointments_status" AS ENUM ('booked','confirmed','completed','cancelled','no-show');
  `)
  await db.execute(sql`ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT;`)
  await db.execute(sql`
    ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "enum_appointments_status"
      USING (
        CASE "status"::text
          WHEN 'pending-approval' THEN 'booked'
          WHEN 'approved' THEN 'confirmed'
          ELSE "status"::text
        END
      )::"enum_appointments_status";
  `)
  await db.execute(sql`ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'booked';`)
  await db.execute(sql`DROP TYPE "enum_appointments_status_new";`)

  await db.execute(sql`
    ALTER TABLE "appointments"
      DROP COLUMN IF EXISTS "starts_at",
      DROP COLUMN IF EXISTS "ends_at",
      DROP COLUMN IF EXISTS "buffer_before",
      DROP COLUMN IF EXISTS "buffer_after",
      DROP COLUMN IF EXISTS "order_id";
  `)

  await db.execute(sql`
    UPDATE "customers"
      SET "customer_notes" = "custom_fields_comments"
      WHERE "custom_fields_comments" IS NOT NULL AND "customer_notes" IS NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "customers"
      DROP COLUMN IF EXISTS "custom_fields_phone_number",
      DROP COLUMN IF EXISTS "custom_fields_comments",
      DROP COLUMN IF EXISTS "account_status";
  `)
  await db.execute(sql`ALTER TABLE "customers" RENAME COLUMN "custom_fields_address" TO "address";`)
  await db.execute(sql`ALTER TABLE "customers" RENAME COLUMN "custom_fields_zip_code" TO "zip_code";`)
  await db.execute(sql`DROP TYPE IF EXISTS "enum_customers_account_status";`)

  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "orders_id";`)
  await db.execute(sql`DROP TABLE IF EXISTS "orders";`)
  for (const type of [
    'enum_orders_order_status',
    'enum_orders_fulfillment_status',
    'enum_orders_payment_status',
  ]) {
    await db.execute(sql`DROP TYPE IF EXISTS ${sql.raw(`"${type}"`)};`)
  }
}
