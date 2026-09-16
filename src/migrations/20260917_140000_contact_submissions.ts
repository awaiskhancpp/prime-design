import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `contact-submissions` — leads captured by the site's forms.
 *
 * The record is stored and nothing is dispatched. The WordPress audit could not
 * recover the notification destination for the form the contact page actually
 * used (Fluent Forms keeps its settings in custom tables a WXR export omits),
 * so no destination has been assumed. `notification_status` / `crm_status` sit
 * at 'pending' until delivery is wired in `src/lib/leadIntegrations.ts`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_contact_submissions_project_type" AS ENUM (
        'kitchen-remodeling','bathroom-remodeling','home-remodeling',
        'additions','adu','complete-renovation'
      );
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_contact_submissions_source" AS ENUM (
        'contact-page','service-page','location-page','landing-page','appointment','other'
      );
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_contact_submissions_status" AS ENUM ('new','contacted','qualified','archived');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_contact_submissions_notification_status" AS ENUM ('pending','not-configured','sent','failed');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_contact_submissions_crm_status" AS ENUM ('pending','not-configured','synced','failed');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_contact_submissions_recaptcha_status" AS ENUM ('not-configured','verified','skipped');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "contact_submissions" (
      "id" serial PRIMARY KEY NOT NULL,
      "first_name" varchar NOT NULL,
      "last_name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "phone" varchar NOT NULL,
      "project_type" "enum_contact_submissions_project_type",
      "subject" varchar,
      "message" varchar NOT NULL,
      "address" varchar,
      "zip_code" varchar,
      "consultation_type" varchar,
      "preferred_date" varchar,
      "source" "enum_contact_submissions_source" DEFAULT 'contact-page' NOT NULL,
      "status" "enum_contact_submissions_status" DEFAULT 'new' NOT NULL,
      "source_url" varchar,
      "notification_status" "enum_contact_submissions_notification_status" DEFAULT 'pending',
      "crm_status" "enum_contact_submissions_crm_status" DEFAULT 'pending',
      "delivery_error" varchar,
      "recaptcha_status" "enum_contact_submissions_recaptcha_status" DEFAULT 'not-configured',
      "recaptcha_score" numeric,
      "meta" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "contact_submissions_email_idx" ON "contact_submissions" ("email");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "contact_submissions_status_idx" ON "contact_submissions" ("status");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "contact_submissions_created_at_idx" ON "contact_submissions" ("created_at");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "contact_submissions_updated_at_idx" ON "contact_submissions" ("updated_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "contact_submissions";`)
  for (const type of [
    'enum_contact_submissions_project_type',
    'enum_contact_submissions_source',
    'enum_contact_submissions_status',
    'enum_contact_submissions_notification_status',
    'enum_contact_submissions_crm_status',
    'enum_contact_submissions_recaptcha_status',
  ]) {
    await db.execute(sql`DROP TYPE IF EXISTS ${sql.raw(`"${type}"`)};`)
  }
}
