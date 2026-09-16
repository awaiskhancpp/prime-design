import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Trust section content is now fully CMS-authored:
 *  - `services.siliconValleyLoves` gains CTA buttons and a `showStars` flag on
 *    its stats (the section renders the projects-page design).
 *  - `site_settings` gains the same `trustIntro` group so the Projects page
 *    reads its copy from Payload instead of hardcoded strings.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // services: stats.showStars + buttons array
  await db.execute(sql`
    ALTER TABLE "services_silicon_valley_loves_stats"
      ADD COLUMN IF NOT EXISTS "show_stars" boolean DEFAULT false;
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "services_silicon_valley_loves_buttons" (
      "id" varchar PRIMARY KEY NOT NULL,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "label" varchar,
      "url" varchar,
      "variant" varchar
    );
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_silicon_valley_loves_buttons_parent_fk'
      ) THEN
        ALTER TABLE "services_silicon_valley_loves_buttons"
          ADD CONSTRAINT "services_silicon_valley_loves_buttons_parent_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "services_silicon_valley_loves_buttons_order_idx"
      ON "services_silicon_valley_loves_buttons" ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "services_silicon_valley_loves_buttons_parent_idx"
      ON "services_silicon_valley_loves_buttons" ("_parent_id");
  `)

  // site_settings: trustIntro group
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "trust_intro_eyebrow" varchar,
      ADD COLUMN IF NOT EXISTS "trust_intro_heading" varchar,
      ADD COLUMN IF NOT EXISTS "trust_intro_body" varchar,
      ADD COLUMN IF NOT EXISTS "trust_intro_image_id" integer;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_trust_intro_image_fk'
      ) THEN
        ALTER TABLE "site_settings"
          ADD CONSTRAINT "site_settings_trust_intro_image_fk"
          FOREIGN KEY ("trust_intro_image_id") REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings_trust_intro_stats" (
      "id" varchar PRIMARY KEY NOT NULL,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "value" varchar,
      "label" varchar,
      "show_stars" boolean DEFAULT false
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings_trust_intro_buttons" (
      "id" varchar PRIMARY KEY NOT NULL,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "label" varchar,
      "url" varchar,
      "variant" varchar
    );
  `)
  for (const [table, fk] of [
    ['site_settings_trust_intro_stats', 'site_settings_trust_intro_stats_parent_fk'],
    ['site_settings_trust_intro_buttons', 'site_settings_trust_intro_buttons_parent_fk'],
  ] as const) {
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = ${sql.raw(`'${fk}'`)}) THEN
          ALTER TABLE ${sql.raw(`"${table}"`)}
            ADD CONSTRAINT ${sql.raw(`"${fk}"`)}
            FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade;
        END IF;
      END $$;
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS ${sql.raw(`"${table}_order_idx"`)}
        ON ${sql.raw(`"${table}"`)} ("_order");
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "services_silicon_valley_loves_stats" DROP COLUMN IF EXISTS "show_stars";`)
  await db.execute(sql`DROP TABLE IF EXISTS "services_silicon_valley_loves_buttons";`)
  await db.execute(sql`
    DROP TABLE IF EXISTS "site_settings_trust_intro_stats";
    DROP TABLE IF EXISTS "site_settings_trust_intro_buttons";
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings"
      DROP CONSTRAINT IF EXISTS "site_settings_trust_intro_image_fk";
    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "trust_intro_eyebrow",
      DROP COLUMN IF EXISTS "trust_intro_heading",
      DROP COLUMN IF EXISTS "trust_intro_body",
      DROP COLUMN IF EXISTS "trust_intro_image_id";
  `)
}
