import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The last copies of the retired phone number, (650) 220-9600.
 *
 * The owner confirmed (650) 235-4863 as the company's only number, and
 * `scripts/set-single-phone-number.ts` set every phone *field* to it. It did
 * not reach numbers stored inside buttons and card links, and these three
 * places still dialled the old one:
 *
 * - `home-remodeling-information`: the hero button and the luxury-CTA button,
 *   both labelled "(650) 220-9600" and linking `tel:6502209600`;
 * - the "Custom Bathtubs" offering card on the 15 bathroom city pages, linking
 *   `tel:+1-650-220-9600`.
 *
 * Each value keeps its own formatting; only the digits change. Lead tables
 * (what visitors typed) are not touched.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "landing_pages_blocks_hero_buttons"
    SET "label" = '(650) 235-4863', "url" = 'tel:6502354863'
    WHERE "label" = '(650) 220-9600' AND "url" = 'tel:6502209600';

    UPDATE "landing_pages_blocks_luxury_cta_buttons"
    SET "label" = '(650) 235-4863', "url" = 'tel:6502354863'
    WHERE "label" = '(650) 220-9600' AND "url" = 'tel:6502209600';

    UPDATE "service_locations_offerings_cards"
    SET "href" = 'tel:+1-650-235-4863'
    WHERE "href" = 'tel:+1-650-220-9600';
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Not reversed: the old number is out of service.
}
