import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The kitchen offerings cards show the city-page graphics instead of the
 * service page's own project photographs.
 *
 * WordPress's `kitchen-remodeling` page (post 327) builds the "Choose a
 * Kitchen That Reflects Your Unique Style and Vision." section from three
 * `article` cards, each holding its image above its heading:
 *
 *   Custom Kitchen    attachment 2392  WhatsApp-Image-2024-03-04-at-8.16.35-PM-2.jpeg
 *   European Kitchen  attachment 2411  WhatsApp-Image-2024-03-04-at-8.18.55-PM-1.jpeg
 *   Shaker Kitchen    attachment 2298  o-55.jpg
 *
 * Only the first card points at its own photograph. The other two were left
 * pointing at `European-Kitchen-new.png` and `Shaker-Kitchen-new.webp` — the
 * flat illustrations the *city* pages use. That split is deliberate and
 * documented on `ServiceLocations.offerings`: the city pages carry those
 * graphics "while the parent service page uses project photos". The same two
 * cards are wrong on the `kitchen-remodeling-information` landing page, whose
 * own `media_source_url` still records the right files
 * (…8.18.55-PM-1.jpeg.webp and o-55.jpg.webp).
 *
 * The replacements are the webp copies already imported for this section and
 * otherwise unused — the batch that also supplies the first card and all
 * three bathroom cards. Matching on filename is what went wrong here
 * originally: a WordPress upload keeps its original name in `alt`, while the
 * stored `filename` carries whatever collision suffix the importer gave it,
 * so the two disagree and only `alt` / `wordpressId` identify the picture.
 *
 * The city pages and `/services/bathroom-remodeling` are left alone; both
 * were checked and are correct.
 */

/** `WhatsApp-Image-2024-03-04-at-8.18.55-PM-1.jpeg.webp` — WP attachment 2411. */
const EUROPEAN_PHOTO = 632
/** `o-55.jpg.webp` — WP attachment 2298. */
const SHAKER_PHOTO = 634
/** `European-Kitchen-new.png`, the city pages' illustration. */
const EUROPEAN_GRAPHIC = 740
/** `Shaker-Kitchen-new.webp`, the city pages' illustration. */
const SHAKER_GRAPHIC = 741

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "services_blocks_sub_services_2_items" AS i
       SET "media_asset_id" = ${EUROPEAN_PHOTO},
           "media_source_url" = '/api/media/file/WhatsApp-Image-2024-03-04-at-8.18.55-PM-1.jpeg.webp'
      FROM "services_blocks_sub_services_2" b, "services" s
     WHERE b."id" = i."_parent_id" AND s."id" = b."_parent_id"
       AND s."slug" = 'kitchen-remodeling'
       AND i."title" = 'European Kitchen'
       AND i."media_asset_id" = ${EUROPEAN_GRAPHIC};

    UPDATE "services_blocks_sub_services_2_items" AS i
       SET "media_asset_id" = ${SHAKER_PHOTO},
           "media_source_url" = '/api/media/file/o-55.jpg.webp'
      FROM "services_blocks_sub_services_2" b, "services" s
     WHERE b."id" = i."_parent_id" AND s."id" = b."_parent_id"
       AND s."slug" = 'kitchen-remodeling'
       AND i."title" = 'Shaker Kitchen'
       AND i."media_asset_id" = ${SHAKER_GRAPHIC};

    UPDATE "landing_pages_blocks_benefit_cards_items" AS i
       SET "media_asset_id" = ${EUROPEAN_PHOTO}
      FROM "landing_pages_blocks_benefit_cards" b, "landing_pages" lp
     WHERE b."id" = i."_parent_id" AND lp."id" = b."_parent_id"
       AND lp."slug" = 'kitchen-remodeling-information'
       AND i."title" = 'European Kitchen'
       AND i."media_asset_id" = ${EUROPEAN_GRAPHIC};

    UPDATE "landing_pages_blocks_benefit_cards_items" AS i
       SET "media_asset_id" = ${SHAKER_PHOTO}
      FROM "landing_pages_blocks_benefit_cards" b, "landing_pages" lp
     WHERE b."id" = i."_parent_id" AND lp."id" = b."_parent_id"
       AND lp."slug" = 'kitchen-remodeling-information'
       AND i."title" = 'Shaker Kitchen'
       AND i."media_asset_id" = ${SHAKER_GRAPHIC};
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "services_blocks_sub_services_2_items" AS i
       SET "media_asset_id" = ${EUROPEAN_GRAPHIC},
           "media_source_url" = '/api/media/file/European-Kitchen-new.png'
      FROM "services_blocks_sub_services_2" b, "services" s
     WHERE b."id" = i."_parent_id" AND s."id" = b."_parent_id"
       AND s."slug" = 'kitchen-remodeling'
       AND i."title" = 'European Kitchen'
       AND i."media_asset_id" = ${EUROPEAN_PHOTO};

    UPDATE "services_blocks_sub_services_2_items" AS i
       SET "media_asset_id" = ${SHAKER_GRAPHIC},
           "media_source_url" = '/api/media/file/Shaker-Kitchen-new.webp'
      FROM "services_blocks_sub_services_2" b, "services" s
     WHERE b."id" = i."_parent_id" AND s."id" = b."_parent_id"
       AND s."slug" = 'kitchen-remodeling'
       AND i."title" = 'Shaker Kitchen'
       AND i."media_asset_id" = ${SHAKER_PHOTO};

    UPDATE "landing_pages_blocks_benefit_cards_items" AS i
       SET "media_asset_id" = ${EUROPEAN_GRAPHIC}
      FROM "landing_pages_blocks_benefit_cards" b, "landing_pages" lp
     WHERE b."id" = i."_parent_id" AND lp."id" = b."_parent_id"
       AND lp."slug" = 'kitchen-remodeling-information'
       AND i."title" = 'European Kitchen'
       AND i."media_asset_id" = ${EUROPEAN_PHOTO};

    UPDATE "landing_pages_blocks_benefit_cards_items" AS i
       SET "media_asset_id" = ${SHAKER_GRAPHIC}
      FROM "landing_pages_blocks_benefit_cards" b, "landing_pages" lp
     WHERE b."id" = i."_parent_id" AND lp."id" = b."_parent_id"
       AND lp."slug" = 'kitchen-remodeling-information'
       AND i."title" = 'Shaker Kitchen'
       AND i."media_asset_id" = ${SHAKER_PHOTO};
  `)
}
