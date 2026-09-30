import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The footer's privacy link: a label and a link to the page record.
 *
 * Before this, its text ("Privacy Policy") was typed into `SiteFooter.tsx`,
 * and its destination was a copied path (`footer_privacy_policy_url`). Now
 * both live in the Navigation global, and the destination is the
 * `privacy-policy` Pages record itself, so the link follows the page. The
 * label is the WordPress footer's own wording.
 *
 * The existing path is converted to the page it names before its column is
 * dropped, so nothing is lost. Hand-written for the reason in §8b of
 * CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "navigation"
      ADD COLUMN IF NOT EXISTS "footer_privacy_policy_label" varchar DEFAULT 'Privacy Policy',
      ADD COLUMN IF NOT EXISTS "footer_privacy_policy_page_id" integer;

    UPDATE "navigation" n
      SET "footer_privacy_policy_page_id" = p."id"
      FROM "pages" p
      WHERE n."footer_privacy_policy_page_id" IS NULL
        AND p."slug" = COALESCE(NULLIF(trim(both '/' from n."footer_privacy_policy_url"), ''), 'privacy-policy');
    UPDATE "navigation" SET "footer_privacy_policy_label" = 'Privacy Policy'
      WHERE "footer_privacy_policy_label" IS NULL;

    ALTER TABLE "navigation" ALTER COLUMN "footer_privacy_policy_label" SET NOT NULL;

    DO $$ BEGIN
      ALTER TABLE "navigation" ADD CONSTRAINT "navigation_footer_privacy_policy_page_id_pages_id_fk"
        FOREIGN KEY ("footer_privacy_policy_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    CREATE INDEX IF NOT EXISTS "navigation_footer_privacy_policy_footer_privacy_policy_p_idx"
      ON "navigation" USING btree ("footer_privacy_policy_page_id");

    ALTER TABLE "navigation" DROP COLUMN IF EXISTS "footer_privacy_policy_url";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "navigation" ADD COLUMN IF NOT EXISTS "footer_privacy_policy_url" varchar;
    UPDATE "navigation" n SET "footer_privacy_policy_url" = '/' || p."slug"
      FROM "pages" p WHERE p."id" = n."footer_privacy_policy_page_id";
    DROP INDEX IF EXISTS "navigation_footer_privacy_policy_footer_privacy_policy_p_idx";
    ALTER TABLE "navigation" DROP CONSTRAINT IF EXISTS "navigation_footer_privacy_policy_page_id_pages_id_fk";
    ALTER TABLE "navigation"
      DROP COLUMN IF EXISTS "footer_privacy_policy_page_id",
      DROP COLUMN IF EXISTS "footer_privacy_policy_label";
  `)
}
