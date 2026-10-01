import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Split the "Our Gallery" eyebrow out of the gallery section's description.
 *
 * WordPress's "Get Inspired" gallery section (identical on the
 * `kitchen-remodeling`, `bathroom-remodeling` and `home-remodeling` pages)
 * has three parts in this document order: the "Get Inspired" heading, the
 * "Client satisfaction…" paragraph, then a small `text-basic` "Our Gallery"
 * element that is styled as the eyebrow sitting above the heading.
 *
 * The migration imported the heading correctly but had nothing to do with
 * that trailing "Our Gallery" line except append it to `description`, and
 * left `eyebrow` empty — so `ServiceGallery.tsx` hardcoded the three pieces
 * instead of reading the section. Now that it reads them, move "Our Gallery"
 * into `eyebrow` where it belongs, and correct the copy's one WordPress typo
 * ("we rake on" → "we take on") while here.
 *
 * Guarded on the exact current text, so an edit made since this was written
 * is left alone rather than overwritten.
 */
const OLD_DESCRIPTION =
  'Client satisfaction is our #1 priority. No matter the type of project we rake on, the entire process, from the consultation to the finishing touches, is handled with a high level of professionalism.\n\nOur Gallery'
const NEW_DESCRIPTION =
  'Client satisfaction is our #1 priority. No matter the type of project we take on, the entire process, from the consultation to the finishing touches, is handled with a high level of professionalism.'
const EYEBROW = 'Our Gallery'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "services_blocks_gallery_2"
       SET "eyebrow" = ${EYEBROW},
           "description" = ${NEW_DESCRIPTION}
     WHERE "heading" = 'Get Inspired'
       AND "eyebrow" IS NULL
       AND "description" = ${OLD_DESCRIPTION};
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "services_blocks_gallery_2"
       SET "eyebrow" = NULL,
           "description" = ${OLD_DESCRIPTION}
     WHERE "heading" = 'Get Inspired'
       AND "eyebrow" = ${EYEBROW}
       AND "description" = ${NEW_DESCRIPTION};
  `)
}
