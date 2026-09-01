import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const existing = await db.execute(sql`
    SELECT to_regclass('public.services_section_order') AS section_order
  `)
  if ((existing as unknown as { rows?: Array<{ section_order?: string | null }> }).rows?.[0]?.section_order) {
    return
  }

  await db.execute(sql`
   CREATE TYPE "public"."enum_services_section_order_section" AS ENUM('hero', 'intro', 'video', 'process', 'offerings', 'gallery', 'quote', 'craftsmanship', 'real-homes', 'why-choose-us', 'faq', 'estimate', 'reviews', 'silicon-valley-loves', 'home-repair-categories', 'contact');
  CREATE TABLE "services_section_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" "enum_services_section_order_section" NOT NULL
  );
  
  ALTER TABLE "services_section_order" ADD CONSTRAINT "services_section_order_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_section_order_order_idx" ON "services_section_order" USING btree ("_order");
  CREATE INDEX "services_section_order_parent_id_idx" ON "services_section_order" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services_section_order" CASCADE;
  DROP TYPE "public"."enum_services_section_order_section";`)
}
