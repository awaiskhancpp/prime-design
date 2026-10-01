import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The kitchen page's "Crafting Your Dream Home, Our Promise" band uses the
 * page's own hero photograph as its background. WordPress uses a different
 * image, and so does every other surface on this site that shows the quote.
 *
 * The band comes from the Bricks section template `noah-quote-section`
 * (post 1160), whose background is attachment 1130 — "Kitchen And Bathroom
 * Images (1920 × 1080 px) (8)",
 * `2023/05/Kitchen-And-Bathroom-Images-1920-×-1080-px-8.png`. That is media
 * 670 here, and it is already what `shared_sections.quote_image_id` and all
 * fifteen city pages use. Only the kitchen service record pointed elsewhere:
 * at media 1, which is its `hero_image_id` — the quote was simply inheriting
 * the hero.
 *
 * Matching that attachment on filename finds the wrong row: media 206 is
 * *named* `Kitchen-And-Bathroom-Images-1920-×-1080-px-8.png` but is
 * attachment 1131, a different picture. The importer's collision suffixes
 * make `filename` unreliable; `wordpressId` (and `alt`, which keeps the
 * original WordPress name) are what identify an image.
 *
 * Guarded on the current value so it cannot move an image an editor has
 * since chosen deliberately.
 */

/** `Kitchen-And-Bathroom-Images-1920-×-1080-px-10.png` — WP attachment 1130. */
const QUOTE_BACKGROUND = 670
/** The kitchen hero photo the band was wrongly inheriting. */
const KITCHEN_HERO = 1

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "services"
       SET "quote_image_id" = ${QUOTE_BACKGROUND}
     WHERE "slug" = 'kitchen-remodeling'
       AND "quote_image_id" = ${KITCHEN_HERO};
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "services"
       SET "quote_image_id" = ${KITCHEN_HERO}
     WHERE "slug" = 'kitchen-remodeling'
       AND "quote_image_id" = ${QUOTE_BACKGROUND};
  `)
}
