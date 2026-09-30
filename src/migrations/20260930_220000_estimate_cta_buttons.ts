import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The free-estimate band's "Get started" button, moved into the CMS.
 *
 * `ServiceEstimateCta` hardcoded it (`Get started` → `/contact`), so the
 * button could not be relabelled, repointed or removed from the admin, and
 * the band's CMS block had no buttons at all. The component now renders the
 * block's own first button and nothing when there is none, so this writes the
 * button it used to hardcode into every place it appeared — the nine service
 * pages' estimate blocks and the blog page's `cta` block. Nothing visible
 * changes.
 *
 * (WordPress's band has no button — just the heading and "Contact us here or
 * reach us at …". Keeping it and making it editable was the owner's call.)
 *
 * Only fills blocks that have no button yet, so a re-run or an edit made in
 * the admin first is left alone.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "services_blocks_cta_buttons" ("_order", "_parent_id", "id", "label", "url", "variant", "open_in_new_tab")
    SELECT 1, c."id", substr(md5(random()::text || c."id"), 1, 24), 'Get started', '/contact', 'primary', false
    FROM "services_blocks_cta" c
    WHERE c."heading" ILIKE '%free estimate%'
      AND NOT EXISTS (SELECT 1 FROM "services_blocks_cta_buttons" b WHERE b."_parent_id" = c."id");

    UPDATE "pages_blocks_cta" SET "label" = 'Get started', "href" = '/contact'
    WHERE "heading" ILIKE '%free estimate%' AND "label" IS NULL AND "href" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "services_blocks_cta_buttons" b
    USING "services_blocks_cta" c
    WHERE b."_parent_id" = c."id" AND c."heading" ILIKE '%free estimate%'
      AND b."label" = 'Get started' AND b."url" = '/contact';

    UPDATE "pages_blocks_cta" SET "label" = NULL, "href" = NULL
    WHERE "heading" ILIKE '%free estimate%' AND "label" = 'Get started' AND "href" = '/contact';
  `)
}
