import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "consultation_types" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "duration" varchar DEFAULT '~1 Hour' NOT NULL,
      "image_id" integer NOT NULL,
      "booking_url" varchar DEFAULT '#quote' NOT NULL,
      "active" boolean DEFAULT true,
      "sort_order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "consultation_types_id" integer;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'consultation_types_image_id_media_id_fk') THEN
        ALTER TABLE "consultation_types" ADD CONSTRAINT "consultation_types_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_consultation_types_fk') THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consultation_types_fk" FOREIGN KEY ("consultation_types_id") REFERENCES "public"."consultation_types"("id") ON DELETE cascade;
      END IF;
    END $$;
    CREATE UNIQUE INDEX IF NOT EXISTS "consultation_types_slug_idx" ON "consultation_types" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "consultation_types_image_idx" ON "consultation_types" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "consultation_types_sort_order_idx" ON "consultation_types" USING btree ("sort_order");
    CREATE INDEX IF NOT EXISTS "consultation_types_updated_at_idx" ON "consultation_types" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "consultation_types_created_at_idx" ON "consultation_types" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_consultation_types_id_idx" ON "payload_locked_documents_rels" USING btree ("consultation_types_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_consultation_types_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_consultation_types_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "consultation_types_id";
    DROP TABLE IF EXISTS "consultation_types" CASCADE;
  `)
}
