import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `contactSubmissions.service` and `.formName`.
 *
 * Two gaps the stored leads had, both visible in the rows already in the
 * table: nothing recorded **what** the visitor wanted, and nothing recorded
 * **which** form they used.
 *
 * `projectType` was supposed to be the first of those — it has been in the
 * schema since the beginning with the six options the WordPress form offered
 * — but no form on the site ever rendered a selector for it, so it is null on
 * every row. Rather than wire a form to a fixed list of six strings, the
 * dropdown is built from the Services collection and the answer is stored as
 * a relationship to the service the visitor chose. `projectType` stays as a
 * column (it is what any WordPress-era import would land in) but is hidden in
 * the admin and nothing writes it.
 *
 * `formName` is the form's own name — "Hero estimate form", "Appointment
 * booking" — because `sourceUrl` only narrows a lead to a page, and the busy
 * pages carry three forms each. Fluent Forms, which the original site runs,
 * stores the form name on every entry for exactly this reason.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "contact_submissions"
      ADD COLUMN IF NOT EXISTS "service_id" integer,
      ADD COLUMN IF NOT EXISTS "form_name" varchar;
  `)

  // Set null rather than cascade: deleting a service must never delete the
  // leads that asked about it.
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "contact_submissions"
        ADD CONSTRAINT "contact_submissions_service_id_fk"
        FOREIGN KEY ("service_id") REFERENCES "services"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "contact_submissions_service_idx"
      ON "contact_submissions" ("service_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "contact_submissions_service_idx";`)
  await db.execute(sql`
    ALTER TABLE "contact_submissions"
      DROP COLUMN IF EXISTS "service_id",
      DROP COLUMN IF EXISTS "form_name";
  `)
}
