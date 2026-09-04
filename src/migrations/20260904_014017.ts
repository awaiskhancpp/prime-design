import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "services_blocks_prime_difference_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"caption" varchar,
  	"source_video_id" varchar
  );
  
  CREATE TABLE "landing_pages_blocks_prime_difference_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"external_url" varchar,
  	"poster_id" integer,
  	"caption" varchar,
  	"source_video_id" varchar
  );
  
  ALTER TABLE "services_blocks_prime_difference_videos" ADD CONSTRAINT "services_blocks_prime_difference_videos_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_prime_difference_videos" ADD CONSTRAINT "services_blocks_prime_difference_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_prime_difference_videos" ADD CONSTRAINT "services_blocks_prime_difference_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_prime_difference_videos" ADD CONSTRAINT "landing_pages_blocks_prime_difference_videos_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_prime_difference_videos" ADD CONSTRAINT "landing_pages_blocks_prime_difference_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_blocks_prime_difference_videos" ADD CONSTRAINT "landing_pages_blocks_prime_difference_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages_blocks_prime_difference"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_blocks_prime_difference_videos_order_idx" ON "services_blocks_prime_difference_videos" USING btree ("_order");
  CREATE INDEX "services_blocks_prime_difference_videos_parent_id_idx" ON "services_blocks_prime_difference_videos" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_prime_difference_videos_video_idx" ON "services_blocks_prime_difference_videos" USING btree ("video_id");
  CREATE INDEX "services_blocks_prime_difference_videos_poster_idx" ON "services_blocks_prime_difference_videos" USING btree ("poster_id");
  CREATE INDEX "landing_pages_blocks_prime_difference_videos_order_idx" ON "landing_pages_blocks_prime_difference_videos" USING btree ("_order");
  CREATE INDEX "landing_pages_blocks_prime_difference_videos_parent_id_idx" ON "landing_pages_blocks_prime_difference_videos" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_blocks_prime_difference_videos_video_idx" ON "landing_pages_blocks_prime_difference_videos" USING btree ("video_id");
  CREATE INDEX "landing_pages_blocks_prime_difference_videos_poster_idx" ON "landing_pages_blocks_prime_difference_videos" USING btree ("poster_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services_blocks_prime_difference_videos" CASCADE;
  DROP TABLE "landing_pages_blocks_prime_difference_videos" CASCADE;`)
}
