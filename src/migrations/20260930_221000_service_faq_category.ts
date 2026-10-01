import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Seed `services.faqCategory` from the map it replaces.
 *
 * Which FAQ category a service page lists used to be decided by
 * `serviceFaqCategories` in `src/lib/faq.server.ts`, a slug → category title
 * table in code. The pairs below are that table, unchanged, so every service
 * page keeps exactly the questions it showed. Comprehensive Home Repair had
 * no entry and stays empty, as before.
 *
 * Only fills a service that has no category yet.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "services" s SET "faq_category_id" = c."id"
    FROM (VALUES
      ('kitchen-remodeling', 'Kitchen Remodel Questions'),
      ('custom-kitchen', 'Custom Kitchen Questions'),
      ('european-kitchen', 'European Kitchen Questions'),
      ('shaker-kitchen', 'Shaker Kitchen Questions'),
      ('bathroom-remodeling', 'Bathroom Remodel Questions'),
      ('home-remodeling', 'Home Remodel Questions'),
      ('complete-renovation', 'Complete Renovations Questions'),
      ('adu', 'ADU Questions'),
      ('additions', 'Room Additions Questions'),
      ('finance', 'Finance Questions')
    ) AS m(service_slug, category_title)
    JOIN "faq_categories" c ON c."title" = m.category_title
    WHERE s."slug" = m.service_slug AND s."faq_category_id" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`UPDATE "services" SET "faq_category_id" = NULL;`)
}
