import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `landing_pages.service` — the service a Google Ads landing page advertises.
 *
 * Until now `src/lib/landingPageServices.ts` guessed it from the URL, and kept
 * its own copy of each service's consultation label in code. The mapping is
 * carried over unchanged (including `remodeling-information` →
 * Complete Renovation, which the project owner chose). The outdoor/hardscape
 * and siding pages have no matching service and stay empty, as before.
 *
 * Additive. Hand-written for the reason in §8b of CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "service_id" integer;
    DO $$ BEGIN
      ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_service_id_services_id_fk"
        FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "landing_pages_service_idx" ON "landing_pages" USING btree ("service_id");

    UPDATE "landing_pages" lp SET "service_id" = s."id"
    FROM (VALUES
      ('kitchen-remodeling-information', 'kitchen-remodeling'),
      ('bathroom-remodeling-information', 'bathroom-remodeling'),
      ('additions-remodeling-information', 'additions'),
      ('home-remodeling-information', 'home-remodeling'),
      ('remodeling-information', 'complete-renovation')
    ) AS m(page_slug, service_slug)
    JOIN "services" s ON s."slug" = m.service_slug
    WHERE lp."slug" = m.page_slug AND lp."service_id" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "landing_pages_service_idx";
    ALTER TABLE "landing_pages" DROP CONSTRAINT IF EXISTS "landing_pages_service_id_services_id_fk";
    ALTER TABLE "landing_pages" DROP COLUMN IF EXISTS "service_id";
  `)
}
