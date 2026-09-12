import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "about_core_values_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_heading" varchar,
  	"hero_heading_highlight" varchar,
  	"hero_description" jsonb,
  	"hero_image_id" integer,
  	"hero_image_secondary_id" integer,
  	"hero_video_id" integer,
  	"hero_cta_label" varchar,
  	"hero_cta_href" varchar,
  	"team_eyebrow" varchar,
  	"team_heading" varchar,
  	"team_heading_highlight" varchar,
  	"team_body" jsonb,
  	"team_cta_label" varchar,
  	"team_cta_href" varchar,
  	"team_intro_heading" varchar,
  	"team_intro_subheading" varchar,
  	"team_intro_body" jsonb,
  	"guiding_principle_eyebrow" varchar,
  	"guiding_principle_heading" varchar,
  	"guiding_principle_heading_highlight" varchar,
  	"guiding_principle_body" jsonb,
  	"guiding_principle_image_id" integer,
  	"guiding_principle_image_secondary_id" integer,
  	"guiding_principle_cta_label" varchar,
  	"guiding_principle_cta_href" varchar,
  	"core_values_heading" varchar,
  	"core_values_description" varchar,
  	"experts_eyebrow" varchar,
  	"experts_heading" varchar,
  	"experts_description" jsonb,
  	"experts_video_id" integer,
  	"experts_poster_id" integer,
  	"experts_badge_id" integer,
  	"experts_cta_label" varchar,
  	"experts_cta_href" varchar,
  	"faq_heading" varchar,
  	"faq_description" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_core_values_values_parent_id_fk') THEN ALTER TABLE "about_core_values_values" ADD CONSTRAINT "about_core_values_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_hero_image_id_media_id_fk') THEN ALTER TABLE "about" ADD CONSTRAINT "about_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_hero_image_secondary_id_media_id_fk') THEN ALTER TABLE "about" ADD CONSTRAINT "about_hero_image_secondary_id_media_id_fk" FOREIGN KEY ("hero_image_secondary_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_hero_video_id_media_id_fk') THEN ALTER TABLE "about" ADD CONSTRAINT "about_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_guiding_principle_image_id_media_id_fk') THEN ALTER TABLE "about" ADD CONSTRAINT "about_guiding_principle_image_id_media_id_fk" FOREIGN KEY ("guiding_principle_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_guiding_principle_image_secondary_id_media_id_fk') THEN ALTER TABLE "about" ADD CONSTRAINT "about_guiding_principle_image_secondary_id_media_id_fk" FOREIGN KEY ("guiding_principle_image_secondary_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_experts_video_id_media_id_fk') THEN ALTER TABLE "about" ADD CONSTRAINT "about_experts_video_id_media_id_fk" FOREIGN KEY ("experts_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_experts_poster_id_media_id_fk') THEN ALTER TABLE "about" ADD CONSTRAINT "about_experts_poster_id_media_id_fk" FOREIGN KEY ("experts_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'about_experts_badge_id_media_id_fk') THEN ALTER TABLE "about" ADD CONSTRAINT "about_experts_badge_id_media_id_fk" FOREIGN KEY ("experts_badge_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;
  CREATE INDEX IF NOT EXISTS "about_core_values_values_order_idx" ON "about_core_values_values" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_core_values_values_parent_id_idx" ON "about_core_values_values" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_hero_hero_image_idx" ON "about" USING btree ("hero_image_id");
  CREATE INDEX IF NOT EXISTS "about_hero_hero_image_secondary_idx" ON "about" USING btree ("hero_image_secondary_id");
  CREATE INDEX IF NOT EXISTS "about_hero_hero_video_idx" ON "about" USING btree ("hero_video_id");
  CREATE INDEX IF NOT EXISTS "about_guiding_principle_guiding_principle_image_idx" ON "about" USING btree ("guiding_principle_image_id");
  CREATE INDEX IF NOT EXISTS "about_guiding_principle_guiding_principle_image_secondar_idx" ON "about" USING btree ("guiding_principle_image_secondary_id");
  CREATE INDEX IF NOT EXISTS "about_experts_experts_video_idx" ON "about" USING btree ("experts_video_id");
  CREATE INDEX IF NOT EXISTS "about_experts_experts_poster_idx" ON "about" USING btree ("experts_poster_id");
  CREATE INDEX IF NOT EXISTS "about_experts_experts_badge_idx" ON "about" USING btree ("experts_badge_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "about_core_values_values" CASCADE;
  DROP TABLE "about" CASCADE;`)
}
