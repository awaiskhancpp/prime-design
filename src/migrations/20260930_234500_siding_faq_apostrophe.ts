import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * FAQ "Is new siding energy-efficient?": "home's" → "home’s".
 *
 * WordPress prints the curly apostrophe in this answer on both the siding
 * landing page and /faq. The FAQs record had a straight one; the landing page
 * showed the curly one only because it carried its own typed copy, which it
 * no longer does (`20260930_234000_shared_service_content`).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "faqs" SET "answer" = replace("answer"::text, 'home''s thermal performance', 'home’s thermal performance')::jsonb
    WHERE "question" = 'Is new siding energy-efficient?' AND "answer"::text LIKE '%home''s thermal performance%';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "faqs" SET "answer" = replace("answer"::text, 'home’s thermal performance', 'home''s thermal performance')::jsonb
    WHERE "question" = 'Is new siding energy-efficient?';
  `)
}
