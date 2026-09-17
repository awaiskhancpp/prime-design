import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds `contact_submissions_id` to `payload_locked_documents_rels`.
 *
 * Registering a collection in `payload.config.ts` also extends two of Payload's
 * internal tables: `payload_locked_documents_rels` (admin document locking) and
 * the polymorphic join it uses. Migration
 * `20260917_140000_contact_submissions` created the collection's own table but
 * not that column, so every admin request that reads locked documents failed:
 *
 *   column "contact_submissions_id" does not exist
 *
 * It surfaced from @payloadcms/ui's `getGlobalData`, which runs
 * `payload.find({ collection: 'payload-locked-documents', depth: 1 })` — depth 1
 * joins every registered collection, including the one whose column was
 * missing, so loading any global in the admin threw.
 *
 * The FK and index names follow the convention the other collections already
 * use in this table (`..._rels_<collection>_fk`, `..._rels_<collection>_id_idx`).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "contact_submissions_id" integer;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
         WHERE conname = 'payload_locked_documents_rels_contact_submissions_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk"
          FOREIGN KEY ("contact_submissions_id")
          REFERENCES "public"."contact_submissions"("id") ON DELETE cascade;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_contact_submissions_id_idx"
      ON "payload_locked_documents_rels" ("contact_submissions_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "payload_locked_documents_rels_contact_submissions_id_idx";`)
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_contact_submissions_fk";
  `)
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "contact_submissions_id";
  `)
}
