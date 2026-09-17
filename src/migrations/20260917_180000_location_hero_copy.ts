import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Location hero copy moves into Payload.
 *
 * The copy above the quote form on every city page (lede, body, form subject
 * and the three feature blurbs) was hardcoded in ServiceLocationHeroForm,
 * keyed by service slug. WordPress authors it on the family template
 * (1495/1584/1639) rather than per city, so the default lives on `services`
 * and `service_locations` carries a per-city override; an empty city field
 * inherits the service, and an empty service field falls back to the built-in
 * template still shipped in the component.
 */
const TABLES = [
  ['services', 'services_location_hero_blurbs'],
  ['service_locations', 'service_locations_location_hero_blurbs'],
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [parent, child] of TABLES) {
    await db.execute(sql`
      ALTER TABLE ${sql.raw(`"${parent}"`)}
        ADD COLUMN IF NOT EXISTS "location_hero_lede" varchar,
        ADD COLUMN IF NOT EXISTS "location_hero_body" varchar,
        ADD COLUMN IF NOT EXISTS "location_hero_form_subject" varchar;
    `)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${sql.raw(`"${child}"`)} (
        "id" varchar PRIMARY KEY NOT NULL,
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "text" varchar
      );
    `)
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = ${sql.raw(`'${child}_parent_fk'`)}
        ) THEN
          ALTER TABLE ${sql.raw(`"${child}"`)}
            ADD CONSTRAINT ${sql.raw(`"${child}_parent_fk"`)}
            FOREIGN KEY ("_parent_id") REFERENCES ${sql.raw(`"public"."${parent}"`)}("id") ON DELETE cascade;
        END IF;
      END $$;
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS ${sql.raw(`"${child}_order_idx"`)}
        ON ${sql.raw(`"${child}"`)} ("_order");
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS ${sql.raw(`"${child}_parent_idx"`)}
        ON ${sql.raw(`"${child}"`)} ("_parent_id");
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [parent, child] of TABLES) {
    await db.execute(sql`DROP TABLE IF EXISTS ${sql.raw(`"${child}"`)};`)
    await db.execute(sql`
      ALTER TABLE ${sql.raw(`"${parent}"`)}
        DROP COLUMN IF EXISTS "location_hero_lede",
        DROP COLUMN IF EXISTS "location_hero_body",
        DROP COLUMN IF EXISTS "location_hero_form_subject";
    `)
  }
}
