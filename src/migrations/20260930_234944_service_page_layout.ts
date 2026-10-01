import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Services → Page layout: the section list (generated with `migrate:create`;
 * the seed was added by hand). The `sectionOrder` array existed, hidden and
 * empty; it becomes the editable list of sections, each with a Show switch,
 * seeded with the exact sequence each of the 11 service pages rendered before
 * this change, so no page moves.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_section_order" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum_services_section_order_section";
  CREATE TYPE "public"."enum_services_section_order_section" AS ENUM('intro', 'video', 'estimate', 'offerings', 'process', 'client-approach', 'gallery', 'craftsmanship', 'real-homes', 'why-choose-us', 'prime-difference', 'prime-kitchens', 'image-checklist', 'icon-checklist-gallery', 'materials-showcase', 'testimonial-cards', 'quote', 'faq', 'silicon-valley-loves', 'reviews', 'contact', 'service-areas', 'areas-we-service', 'home-repair-categories', 'cms-body');
  ALTER TABLE "services_section_order" ALTER COLUMN "section" SET DATA TYPE "public"."enum_services_section_order_section" USING "section"::"public"."enum_services_section_order_section";
  ALTER TABLE "services_section_order" ALTER COLUMN "section" SET NOT NULL;
  ALTER TABLE "services_section_order" ADD COLUMN "enabled" boolean DEFAULT true;

  -- Seed each page with the sections it renders today, in that order (read
  -- off the rendered pages before this change), so nothing moves.
  INSERT INTO "services_section_order" ("_order", "_parent_id", "id", "section", "enabled")
  SELECT v.ord, s."id", substr(md5(random()::text || clock_timestamp()::text || v.ord), 1, 24),
    v.section::"public"."enum_services_section_order_section", true
  FROM (VALUES
      ('additions', 1, 'intro'),
      ('additions', 2, 'real-homes'),
      ('additions', 3, 'video'),
      ('additions', 4, 'estimate'),
      ('additions', 5, 'silicon-valley-loves'),
      ('additions', 6, 'why-choose-us'),
      ('additions', 7, 'reviews'),
      ('additions', 8, 'contact'),
      ('additions', 9, 'service-areas'),
      ('adu', 1, 'intro'),
      ('adu', 2, 'estimate'),
      ('adu', 3, 'craftsmanship'),
      ('adu', 4, 'why-choose-us'),
      ('adu', 5, 'reviews'),
      ('adu', 6, 'contact'),
      ('adu', 7, 'areas-we-service'),
      ('bathroom-remodeling', 1, 'estimate'),
      ('bathroom-remodeling', 2, 'process'),
      ('bathroom-remodeling', 3, 'offerings'),
      ('bathroom-remodeling', 4, 'gallery'),
      ('bathroom-remodeling', 5, 'craftsmanship'),
      ('bathroom-remodeling', 6, 'silicon-valley-loves'),
      ('bathroom-remodeling', 7, 'why-choose-us'),
      ('bathroom-remodeling', 8, 'faq'),
      ('bathroom-remodeling', 9, 'service-areas'),
      ('bathroom-remodeling', 10, 'reviews'),
      ('bathroom-remodeling', 11, 'contact'),
      ('bathroom-remodeling', 12, 'areas-we-service'),
      ('complete-renovation', 1, 'intro'),
      ('complete-renovation', 2, 'estimate'),
      ('complete-renovation', 3, 'client-approach'),
      ('complete-renovation', 4, 'craftsmanship'),
      ('complete-renovation', 5, 'reviews'),
      ('complete-renovation', 6, 'contact'),
      ('complete-renovation', 7, 'service-areas'),
      ('comprehensive-home-repair-installation-services-in-silicon-valley', 1, 'home-repair-categories'),
      ('comprehensive-home-repair-installation-services-in-silicon-valley', 2, 'why-choose-us'),
      ('comprehensive-home-repair-installation-services-in-silicon-valley', 3, 'areas-we-service'),
      ('custom-kitchen', 1, 'estimate'),
      ('custom-kitchen', 2, 'video'),
      ('custom-kitchen', 3, 'image-checklist'),
      ('custom-kitchen', 4, 'icon-checklist-gallery'),
      ('custom-kitchen', 5, 'materials-showcase'),
      ('custom-kitchen', 6, 'prime-kitchens'),
      ('custom-kitchen', 7, 'reviews'),
      ('custom-kitchen', 8, 'contact'),
      ('custom-kitchen', 9, 'areas-we-service'),
      ('european-kitchen', 1, 'estimate'),
      ('european-kitchen', 2, 'video'),
      ('european-kitchen', 3, 'prime-kitchens'),
      ('european-kitchen', 4, 'home-repair-categories'),
      ('european-kitchen', 5, 'reviews'),
      ('european-kitchen', 6, 'contact'),
      ('european-kitchen', 7, 'areas-we-service'),
      ('finance', 1, 'cms-body'),
      ('finance', 2, 'faq'),
      ('finance', 3, 'areas-we-service'),
      ('home-remodeling', 1, 'real-homes'),
      ('home-remodeling', 2, 'video'),
      ('home-remodeling', 3, 'estimate'),
      ('home-remodeling', 4, 'process'),
      ('home-remodeling', 5, 'gallery'),
      ('home-remodeling', 6, 'craftsmanship'),
      ('home-remodeling', 7, 'service-areas'),
      ('home-remodeling', 8, 'silicon-valley-loves'),
      ('home-remodeling', 9, 'why-choose-us'),
      ('home-remodeling', 10, 'faq'),
      ('home-remodeling', 11, 'reviews'),
      ('home-remodeling', 12, 'contact'),
      ('home-remodeling', 13, 'areas-we-service'),
      ('kitchen-remodeling', 1, 'estimate'),
      ('kitchen-remodeling', 2, 'video'),
      ('kitchen-remodeling', 3, 'offerings'),
      ('kitchen-remodeling', 4, 'process'),
      ('kitchen-remodeling', 5, 'silicon-valley-loves'),
      ('kitchen-remodeling', 6, 'service-areas'),
      ('kitchen-remodeling', 7, 'quote'),
      ('kitchen-remodeling', 8, 'faq'),
      ('kitchen-remodeling', 9, 'gallery'),
      ('kitchen-remodeling', 10, 'reviews'),
      ('kitchen-remodeling', 11, 'areas-we-service'),
      ('shaker-kitchen', 1, 'estimate'),
      ('shaker-kitchen', 2, 'video'),
      ('shaker-kitchen', 3, 'home-repair-categories'),
      ('shaker-kitchen', 4, 'prime-difference'),
      ('shaker-kitchen', 5, 'testimonial-cards'),
      ('shaker-kitchen', 6, 'contact'),
      ('shaker-kitchen', 7, 'areas-we-service')
  ) AS v(slug, ord, section)
  JOIN "services" s ON s."slug" = v.slug
  WHERE NOT EXISTS (SELECT 1 FROM "services_section_order" x WHERE x."_parent_id" = s."id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_section_order" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum_services_section_order_section";
  CREATE TYPE "public"."enum_services_section_order_section" AS ENUM('hero', 'intro', 'video', 'process', 'offerings', 'gallery', 'quote', 'craftsmanship', 'real-homes', 'why-choose-us', 'faq', 'estimate', 'reviews', 'silicon-valley-loves', 'home-repair-categories', 'contact');
  ALTER TABLE "services_section_order" ALTER COLUMN "section" SET DATA TYPE "public"."enum_services_section_order_section" USING "section"::"public"."enum_services_section_order_section";
  ALTER TABLE "services_section_order" ALTER COLUMN "section" DROP NOT NULL;
  ALTER TABLE "services_section_order" DROP COLUMN "enabled";`)
}
