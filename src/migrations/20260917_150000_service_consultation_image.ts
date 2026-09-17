import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `services.consultationImage` — the Contact page's consultation card photo.
 *
 * The WordPress contact page (post 310) gives every consultation card its own
 * image, none of which is the matching service's hero:
 *
 *   Additions Consultation            wp 2203
 *   Complete Renovation Consultation  wp 2422
 *   ADU / Garage Conversion           wp 2008
 *   New Construction Consultation     wp 2216
 *   Kitchen Remodeling Consultation   wp 2188
 *   Bathroom Remodeling Consultation  wp 2168
 *
 * `resolveConsultations` had no field to read, so every card fell back to the
 * service hero and showed the wrong photo. This adds the field; the values are
 * populated by `scripts/fix-consultation-card-images.mjs`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "consultation_image_id" integer;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_consultation_image_fk'
      ) THEN
        ALTER TABLE "services"
          ADD CONSTRAINT "services_consultation_image_fk"
          FOREIGN KEY ("consultation_image_id") REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "services_consultation_image_idx"
      ON "services" ("consultation_image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "services_consultation_image_idx";`)
  await db.execute(sql`ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_consultation_image_fk";`)
  await db.execute(sql`ALTER TABLE "services" DROP COLUMN IF EXISTS "consultation_image_id";`)
}
