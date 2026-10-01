import { randomBytes } from 'node:crypto'
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `home-remodeling-information` has a `gallery-carousel` section the
 * migration never finished: WordPress's Bricks "carousel" widget isn't the
 * "image-gallery" grid widget the importer knew how to read, so it parsed as
 * an unsupported element — the 26 photos and the "Our Gallery" / heading /
 * body copy were preserved only as raw `source_metadata` on an empty block,
 * never turned into real `items` rows or section text. The result is a
 * silent gap: the page's whole gallery section renders nothing.
 *
 * `20261001_190224_gallery_carousel_heading` added `eyebrow`/`heading`/
 * `description` to this block (the same fields the sibling `gallery` block
 * already has, which `GalleryCarouselBlock` already reads — it delegates to
 * `GalleryBlock`). This migration fills them in, plus the 26 items, from the
 * WordPress source (`home-remodeling-information`, Bricks element `ypcwed`):
 * eyebrow "Our Gallery", heading "A reflection of our remodeling projects in
 * Silicon Valley", description "See our kitchen remodeling, bathroom
 * remodeling, and other home remodeling work here at Prime Design & Build's
 * gallery." — identical, word for word, to `remodeling-information`'s own
 * (already-migrated) gallery copy, which is what this page's copy should
 * read like too.
 *
 * Images are matched by WordPress attachment id (`wordpressId`), never by
 * filename — collision-renamed imports mean a media row's `filename` often
 * does not match its original WordPress name (its `alt` does). All 26
 * attachments resolved to real Payload media with no gaps.
 */

const CAROUSEL_SLUG = 'home-remodeling-information'
const EYEBROW = 'Our Gallery'
const HEADING = 'A reflection of our remodeling projects in Silicon Valley'
const DESCRIPTION =
  "See our kitchen remodeling, bathroom remodeling, and other home remodeling work here at Prime Design & Build's gallery."

/** `[WordPress attachment id, Payload media id]`, in the carousel's own order. */
const IMAGES: Array<[number, number]> = [
  [503, 133],
  [3759, 263],
  [3755, 264],
  [3752, 265],
  [3745, 266],
  [1936, 267],
  [1776, 211],
  [545, 137],
  [534, 143],
  [528, 146],
  [521, 268],
  [502, 169],
  [482, 269],
  [471, 270],
  [3742, 271],
  [3738, 278],
  [1938, 118],
  [537, 286],
  [525, 294],
  [489, 303],
  [509, 310],
  [3772, 317],
  [3770, 323],
  [3766, 324],
  [3764, 325],
  [3762, 326],
]

const hexId = () => randomBytes(12).toString('hex')

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const updated = await db.execute(sql`
    UPDATE "landing_pages_blocks_gallery_carousel" AS b
       SET "eyebrow" = ${EYEBROW},
           "heading" = ${HEADING},
           "description" = ${DESCRIPTION}
      FROM "landing_pages" lp
     WHERE lp."id" = b."_parent_id"
       AND lp."slug" = ${CAROUSEL_SLUG}
       AND b."eyebrow" IS NULL
     RETURNING b."id";
  `)
  const parentId = (updated.rows as Array<{ id: string }>)[0]?.id
  if (!parentId) return // Already populated (or the block no longer exists) — nothing to insert.

  const existing = await db.execute(sql`
    SELECT COUNT(*)::int AS n FROM "landing_pages_blocks_gallery_carousel_items"
     WHERE "_parent_id" = ${parentId};
  `)
  if (((existing.rows as Array<{ n: number }>)[0]?.n ?? 0) > 0) return // Already filled.

  for (const [order, [wpId, mediaId]] of IMAGES.entries()) {
    await db.execute(sql`
      INSERT INTO "landing_pages_blocks_gallery_carousel_items"
        ("id", "_order", "_parent_id", "media_id", "alt", "source_order", "source_attachment_id")
      VALUES
        (${hexId()}, ${order + 1}, ${parentId}, ${mediaId}, ${`Gallery image ${order + 1}`}, ${order + 1}, ${wpId});
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "landing_pages_blocks_gallery_carousel_items" AS i
     USING "landing_pages_blocks_gallery_carousel" b, "landing_pages" lp
     WHERE b."_parent_id" = lp."id"
       AND lp."slug" = ${CAROUSEL_SLUG}
       AND i."_parent_id" = b."id";
  `)
  await db.execute(sql`
    UPDATE "landing_pages_blocks_gallery_carousel" AS b
       SET "eyebrow" = NULL,
           "heading" = NULL,
           "description" = NULL
      FROM "landing_pages" lp
     WHERE lp."id" = b."_parent_id"
       AND lp."slug" = ${CAROUSEL_SLUG}
       AND b."eyebrow" = ${EYEBROW};
  `)
}
