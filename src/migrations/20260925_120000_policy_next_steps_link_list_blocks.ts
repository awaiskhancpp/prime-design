import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Three new page section blocks, so the last pages whose body copy lived in
 * `.tsx` literals can be edited in the CMS like every other page:
 *
 *   policy      the numbered legal document on /privacy-policy — 178 lines of
 *               `const sections: PolicySection[]` in
 *               `components/legal/PrivacyPolicyPage.tsx` until now.
 *   next-steps  "What happens next" on /thank-you.
 *   link-list   "In the meantime" on /thank-you.
 *
 * All three are Pages-only (`sectionBlocks` is used by `PageBlocks` and
 * nothing else), and all three are additive. Hand-written for the reason in
 * §8b of CLAUDE.md: `migrate:create` diffs against a schema snapshot that
 * predates seventeen hand-written migrations and reads their tables as
 * removals.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_policy" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "intro" varchar,
      "show_contact_details" boolean DEFAULT true,
      "block_name" varchar
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_policy_sections" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_policy_sections_paragraphs" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "lead" varchar,
      "body" varchar NOT NULL
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_next_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "block_name" varchar
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_next_steps_steps" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "detail" varchar
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_link_list" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "block_name" varchar
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_link_list_links" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "href" varchar NOT NULL
    );
  `)

  // Top-level blocks hang off the page; nested arrays hang off their block.
  const parents: Array<[string, string]> = [
    ['pages_blocks_policy', 'pages'],
    ['pages_blocks_policy_sections', 'pages_blocks_policy'],
    ['pages_blocks_policy_sections_paragraphs', 'pages_blocks_policy_sections'],
    ['pages_blocks_next_steps', 'pages'],
    ['pages_blocks_next_steps_steps', 'pages_blocks_next_steps'],
    ['pages_blocks_link_list', 'pages'],
    ['pages_blocks_link_list_links', 'pages_blocks_link_list'],
  ]

  for (const [table, parent] of parents) {
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE ${sql.raw(`"${table}"`)} ADD CONSTRAINT ${sql.raw(`"${table}_parent_id_fk"`)}
          FOREIGN KEY ("_parent_id") REFERENCES ${sql.raw(`"public"."${parent}"`)}("id")
          ON DELETE cascade ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS ${sql.raw(`"${table}_order_idx"`)} ON ${sql.raw(`"${table}"`)} ("_order");`,
    )
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS ${sql.raw(`"${table}_parent_id_idx"`)} ON ${sql.raw(`"${table}"`)} ("_parent_id");`,
    )
  }

  for (const table of ['pages_blocks_policy', 'pages_blocks_next_steps', 'pages_blocks_link_list']) {
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS ${sql.raw(`"${table}_path_idx"`)} ON ${sql.raw(`"${table}"`)} ("_path");`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Children first: each holds a cascading foreign key to its parent.
  for (const table of [
    'pages_blocks_policy_sections_paragraphs',
    'pages_blocks_policy_sections',
    'pages_blocks_policy',
    'pages_blocks_next_steps_steps',
    'pages_blocks_next_steps',
    'pages_blocks_link_list_links',
    'pages_blocks_link_list',
  ]) {
    await db.execute(sql`DROP TABLE IF EXISTS ${sql.raw(`"${table}"`)} CASCADE;`)
  }
}
