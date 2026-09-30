import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Drop tables and columns left behind by earlier schema shapes.
 *
 * None of these is in the Payload config, so no code can read or write them,
 * and `migrate:create` does not know they exist (they are not in any
 * snapshot). `scripts/schema-drift.ts` lists them. Each was checked before
 * being dropped:
 *
 * - `gallery_categories_images`, `services_blocks_benefit_cards(_items)`,
 *   `services_blocks_craftsmanship(_images, _items)`: empty.
 * - `service_locations_testimonial_cards_items` (135 rows) and
 *   `services_testimonial_cards_items` (3): the old inline shape of the
 *   testimonial cards — three reviews (James G., Christian F., Isabel E.)
 *   copied onto every city page. The same three are Testimonials records
 *   126–128, linked from all 45 pages, quotes and photos included.
 * - `services.dont_settle_*`, `services.location_video_*`,
 *   `services.prime_difference_*` and `services_prime_difference_{reasons,
 *   checklist}` (kitchen, bathroom and home remodeling): an old parent-service
 *   template for the city pages. Every city page carries its own copy, and
 *   those are what WordPress shows ("Transform Your Bathroom into a Dream
 *   Space in Campbell" on the live Campbell page; the parent's generic "Your
 *   Dream {ServiceTitle} in {City}" appears nowhere). All 12 reasons and 15
 *   checklist items exist on the city pages.
 *
 * `down` cannot bring the rows back; restore from a backup if you need them.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "gallery_categories_images" CASCADE;
    DROP TABLE IF EXISTS "service_locations_testimonial_cards_items" CASCADE;
    DROP TABLE IF EXISTS "services_testimonial_cards_items" CASCADE;
    DROP TABLE IF EXISTS "services_blocks_benefit_cards_items" CASCADE;
    DROP TABLE IF EXISTS "services_blocks_benefit_cards" CASCADE;
    DROP TABLE IF EXISTS "services_blocks_craftsmanship_images" CASCADE;
    DROP TABLE IF EXISTS "services_blocks_craftsmanship_items" CASCADE;
    DROP TABLE IF EXISTS "services_blocks_craftsmanship" CASCADE;
    DROP TABLE IF EXISTS "services_prime_difference_checklist" CASCADE;
    DROP TABLE IF EXISTS "services_prime_difference_reasons" CASCADE;

    ALTER TABLE "services"
      DROP COLUMN IF EXISTS "dont_settle_body",
      DROP COLUMN IF EXISTS "dont_settle_cta_label",
      DROP COLUMN IF EXISTS "dont_settle_eyebrow",
      DROP COLUMN IF EXISTS "dont_settle_heading",
      DROP COLUMN IF EXISTS "dont_settle_heading_accent",
      DROP COLUMN IF EXISTS "location_video_description",
      DROP COLUMN IF EXISTS "location_video_eyebrow",
      DROP COLUMN IF EXISTS "location_video_poster",
      DROP COLUMN IF EXISTS "location_video_tagline",
      DROP COLUMN IF EXISTS "location_video_title",
      DROP COLUMN IF EXISTS "location_video_video_url",
      DROP COLUMN IF EXISTS "prime_difference_body",
      DROP COLUMN IF EXISTS "prime_difference_eyebrow",
      DROP COLUMN IF EXISTS "prime_difference_heading";
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Irreversible: the dropped rows were copies of content that lives elsewhere.
}
