import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Service card fields, and the WordPress publish date on projects.
 *
 * **`services.excerpt`** — WordPress writes a service twice, and the two
 * versions are different copy, not one truncated into the other:
 *
 *   - the services index (page 353) carries a full paragraph per card,
 *   - the homepage "Our Services" section carries a one-line summary,
 *     e.g. "Transform your home from ground up with our full home
 *     remodeling services." for Home Remodeling.
 *
 * `shortDescription` can only hold one of them, so the homepage line had
 * been overwriting the index paragraph (and vice versa). `excerpt` gives the
 * homepage line its own home: `shortDescription` is the services-index
 * paragraph, `excerpt` the homepage one-liner.
 *
 * **`services.featured_image_id`** — the same split applies to photography.
 * A service page's hero is not the photo either card grid uses; the homepage
 * section picks its own (Kitchen Remodeling: hero `wp 1`, homepage card
 * `wp 2123`). Nothing held that image, so every homepage card fell back to
 * the hero and showed the wrong photo.
 *
 * `services.featured` already exists and is already in `defaultColumns` —
 * it was simply never populated or read. No column needed for it.
 *
 * **`projects.published_date`** — the projects grid sorted on `createdAt`,
 * which is migration insertion time, so `/our-projects` listed the projects
 * in exactly the reverse of the WordPress order. WordPress sorts this
 * archive by post date descending (every project's `menu_order` is 0), so
 * the real date has to be stored to reproduce it. Matches the `blog`
 * collection's existing `published_date` column and index.
 *
 * Hand-written: `migrate:create` is blocked on this project (CLAUDE.md §8b).
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql.raw(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "excerpt" varchar;`),
  )
  await db.execute(
    sql.raw(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "featured_image_id" integer;`),
  )

  // Added separately from the column so a re-run after a dropped connection
  // does not fail on an existing constraint.
  await db.execute(
    sql.raw(`DO $$ BEGIN
      ALTER TABLE "services" ADD CONSTRAINT "services_featured_image_id_media_id_fk"
        FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`),
  )
  await db.execute(
    sql.raw(
      `CREATE INDEX IF NOT EXISTS "services_featured_image_idx" ON "services" USING btree ("featured_image_id");`,
    ),
  )

  await db.execute(
    sql.raw(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "published_date" timestamp(3) with time zone;`,
    ),
  )
  await db.execute(
    sql.raw(
      `CREATE INDEX IF NOT EXISTS "projects_published_date_idx" ON "projects" USING btree ("published_date");`,
    ),
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql.raw(`DROP INDEX IF EXISTS "projects_published_date_idx";`))
  await db.execute(sql.raw(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "published_date";`))
  await db.execute(sql.raw(`DROP INDEX IF EXISTS "services_featured_image_idx";`))
  await db.execute(
    sql.raw(
      `ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_featured_image_id_media_id_fk";`,
    ),
  )
  await db.execute(sql.raw(`ALTER TABLE "services" DROP COLUMN IF EXISTS "featured_image_id";`))
  await db.execute(sql.raw(`ALTER TABLE "services" DROP COLUMN IF EXISTS "excerpt";`))
}
