import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `faq_categories.sort_order` — the order the categories appear in on /faq.
 *
 * There was none, so `resolveFaqIndex` sorted by title. This database's
 * collation is `C.UTF-8`, which compares raw bytes: every capital sorts before
 * every lowercase, so "ADU Questions" came out above "About Us Questions" —
 * the reverse of the WordPress page, where About Us is first.
 *
 * `scripts/seed-faq-order.ts` fills it from the live page's order.
 *
 * Hand-written for the reason in §8b of CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "faq_categories" ADD COLUMN IF NOT EXISTS "sort_order" numeric DEFAULT 0;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "faq_categories" DROP COLUMN IF EXISTS "sort_order";`)
}
