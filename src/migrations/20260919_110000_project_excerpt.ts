import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `projects.excerpt` — the one- or two-line description on a project card.
 *
 * The homepage project tiles had no copy at all: they showed a photo and the
 * title over a gradient, and nothing else. `summary` cannot fill that gap —
 * WordPress only wrote one for 6 of the 18 projects, and five of the six
 * projects the homepage features have none. It is also the long-form
 * paragraph used on the project page itself, not card copy.
 *
 * `excerpt` is card copy specifically, so the homepage tile and the
 * `/our-projects` grid have something to say about each project without
 * restating the page.
 *
 * `featured` and `featured_image_id` already exist on this collection and
 * are already populated correctly — the six the WordPress homepage query
 * selects (`post__in: 2754, 2502, 2133, 2449, 2448, 2220`) are the six
 * flagged — so neither needs a column here.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql.raw(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "excerpt" varchar;`))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql.raw(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "excerpt";`))
}
