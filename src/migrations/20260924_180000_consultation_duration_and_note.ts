import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The two strings the Contact page's consultation cards printed from code.
 *
 * Each card carried a duration badge that always read "~1 Hour" and a line of
 * small print that always read "Free · No commitment". Neither was editable:
 * the duration was a literal in `resolveConsultations()` and the note was a
 * literal in `ConsultationGrid`.
 *
 * They are deliberately stored in two different places, because they are two
 * different kinds of fact:
 *
 *   `services.consultation_duration`  — per service. An ADU consultation and
 *     a bathroom one are not the same appointment, and one can change without
 *     the others.
 *   `pages_blocks_consultations.assurance_note` — per section. It reads the
 *     same on all six cards because it is a promise about booking any of
 *     them; six copies of one sentence would only be six things to keep in
 *     step.
 *
 * `scripts/seed-consultation-card-copy.ts` writes today's wording into both,
 * so the page renders exactly as it does now and the words become editable
 * rather than changing.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "consultation_duration" varchar;
  `)

  // The block table only exists once a page has used the block; guard so this
  // migration is safe on a database where it has not been.
  await db.execute(sql`
    DO $$ BEGIN
      IF to_regclass('public.pages_blocks_consultations') IS NOT NULL THEN
        ALTER TABLE "pages_blocks_consultations"
          ADD COLUMN IF NOT EXISTS "assurance_note" varchar;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" DROP COLUMN IF EXISTS "consultation_duration";
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF to_regclass('public.pages_blocks_consultations') IS NOT NULL THEN
        ALTER TABLE "pages_blocks_consultations" DROP COLUMN IF EXISTS "assurance_note";
      END IF;
    END $$;
  `)
}
