import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Every Prime Difference video on the landing pages shows a locally generated
 * poster instead of the thumbnail WordPress actually specifies.
 *
 * Each WordPress `video` element under "The Prime Difference" carries both a
 * `fileUrl` (a bunny.net mp4) and a `videoPoster` attachment. The mp4s were
 * re-hosted here as local uploads and are matched correctly — the Cryer St
 * clip is on the kitchen page, Noah's intro on additions, and the same five
 * walkthroughs in the same order on bathroom / home-remodeling / remodeling.
 * The posters were not: all seventeen rows point at a `*-poster.jpg` made
 * during the import rather than at WordPress's own image.
 *
 * Two of those generated files are not frames of their video at all — media
 * 656 and 657 are byte-identical copies of a stock photograph of
 * architectural drawings, which is what the kitchen page has been showing.
 * WordPress's poster for that video is attachment 3275,
 * `2024/11/kitchen-remodeling.png` — the branded client still captioned
 * "Gary / Hayward, CA", matching the clip's own
 * `…2365 Cryer St Hayward.mp4`.
 *
 * The testimonials page already uses these same WordPress posters, which is
 * the reference the site itself was already keeping.
 *
 *   video (local upload)              WP clip                      WP poster
 *   647 prime-kitchens-cryer-st       2365 Cryer St Hayward        3275 -> 246
 *   642 noah-prime-intro              Prime Vid Noah               3128 -> 236
 *   643 noam-rosewood-atherton        41 Rosewood Dr Atherton      3127 -> 233
 *   644 ilay-alice-ave-kitchen        700 Alice Ave Mountain View  3129 -> 235
 *   645 josef-bluebonnet-morgan-hill  1840 Bluebonnet Ct Morgan H. 3130 -> 234
 *   646 first-floor-renovation        First Floor                  3131 -> 237
 *
 * Guarded on the generated posters it replaces, so a poster an editor has
 * since chosen is left alone.
 */

/** `video_id` -> the Payload media for that clip's WordPress `videoPoster`. */
const POSTERS: Array<[video: number, poster: number]> = [
  [647, 246],
  [642, 236],
  [643, 233],
  [644, 235],
  [645, 234],
  [646, 237],
]

/** The import-generated posters this replaces (`*-poster.jpg`, media 651-657). */
const GENERATED = [651, 652, 653, 654, 655, 656, 657]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [video, poster] of POSTERS) {
    await db.execute(sql`
      UPDATE "landing_pages_blocks_prime_difference_videos"
         SET "poster_id" = ${poster}
       WHERE "video_id" = ${video}
         AND "poster_id" = ANY(${sql.raw(`ARRAY[${GENERATED.join(',')}]`)}::int[]);
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The generated poster each row carried, to put back exactly what was there.
  const PREVIOUS: Array<[video: number, poster: number]> = [
    [647, 656],
    [642, 651],
    [643, 652],
    [644, 653],
    [645, 654],
    [646, 655],
  ]
  for (const [video, poster] of PREVIOUS) {
    const current = POSTERS.find(([v]) => v === video)?.[1]
    await db.execute(sql`
      UPDATE "landing_pages_blocks_prime_difference_videos"
         SET "poster_id" = ${poster}
       WHERE "video_id" = ${video}
         AND "poster_id" = ${current};
    `)
  }
}
