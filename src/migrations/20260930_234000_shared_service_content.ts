import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Service pages' repeated values stored once; landing FAQs point at the FAQs
 * collection instead of copying it.
 *
 * 1. Each services `cta` block gets its layout written down. The design used to
 *    be guessed from the heading's wording (ServiceSectionRenderer), and the
 *    same guess is applied here, so every block keeps the design it has.
 * 2. Measured first: the nine service estimate bands carried one heading ("Ready
 *    to schedule your free estimate?"), one paragraph and one button ("Get
 *    started" → /contact) — the blog's band the same three; all eleven services
 *    one "Areas we service" heading, one "~1 Hour" consultation duration (nine
 *    of them) and one Client-Centered Approach image. Those go to Shared
 *    Sections (Service pages) and are cleared where a page held an exact copy.
 * 3. The 22 FAQ categories on the landing pages carried 66 typed-in questions,
 *    every one of which is a record in the FAQs collection with the same
 *    answer (one answer's numbered steps are a real list there). Each category
 *    becomes an ordered list of those records (`faqOrder`, the page's own order)
 *    and the typed copies go. A category with a question that has no record
 *    keeps its typed questions.
 *
 * Aborts, changing nothing, if an estimate band or a service value would
 * resolve differently afterwards.
 */

const newId = `substr(md5(random()::text || clock_timestamp()::text), 1, 24)`

const norm = (value: unknown) =>
  String(value ?? '')
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }
const plain = (value: unknown): string => {
  if (typeof value === 'string') return value
  const out: string[] = []
  const walk = (node: LexicalNode) => {
    if (node.type === 'text') out.push(node.text ?? '')
    node.children?.forEach(walk)
    if (node.type === 'paragraph' || node.type === 'listitem') out.push(' ')
  }
  const root = (value as { root?: LexicalNode } | null)?.root
  if (root) walk(root)
  return out.join('')
}
/** Answer text without list numbering, which a list item carries as formatting. */
const answerKey = (value: unknown) =>
  norm(plain(value))
    .replace(/(^| )\d+ /g, ' ')
    .replace(/\s+/g, ' ')

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Layouts, from the old heading guess.
  await db.execute(sql`
    UPDATE "services_blocks_cta" SET "layout" = CASE
      WHEN lower(coalesce("heading", '')) LIKE '%one-stop hub%' THEN 'finance-hub'
      WHEN lower(coalesce("heading", '')) LIKE '%let''s work together%' THEN 'finance-cta'
      WHEN lower(coalesce("heading", '')) LIKE '%estimate%'
        OR lower(coalesce("heading", '')) LIKE '%schedule%'
        OR lower(coalesce("heading", '')) LIKE '%get started%' THEN 'estimate'
      ELSE 'standard' END::"public"."enum_services_blocks_cta_layout";
  `)

  const { rows: g } = await db.execute(sql`SELECT "id" FROM "shared_sections" LIMIT 1`)
  const sharedId = Number(g[0].id)

  // Snapshot of what renders today.
  await db.execute(sql`
    CREATE TEMP TABLE "before_bands" ON COMMIT DROP AS
      SELECT c."id", c."heading", c."description"::text AS description,
        (SELECT string_agg(b."label" || '|' || b."url", '#' ORDER BY b."_order")
           FROM "services_blocks_cta_buttons" b WHERE b."_parent_id" = c."id") AS buttons
      FROM "services_blocks_cta" c WHERE c."layout" = 'estimate';
    CREATE TEMP TABLE "before_services" ON COMMIT DROP AS
      SELECT "id", "areas_we_service_heading", "consultation_duration", "client_approach_image_id" FROM "services";
    CREATE TEMP TABLE "before_blog_band" ON COMMIT DROP AS
      SELECT "id", "heading", "body"::text AS body, "label", "href" FROM "pages_blocks_cta";
  `)

  // 2. Shared values, from the first estimate band and the services.
  await db.execute(
    sql.raw(`
      UPDATE "shared_sections" g SET
        "services_estimate_band_heading" = c."heading",
        "services_estimate_band_description" = c."description"
      FROM (SELECT * FROM "services_blocks_cta" WHERE "layout" = 'estimate' ORDER BY "_parent_id", "_order" LIMIT 1) c
      WHERE g."id" = ${sharedId}
    `),
  )
  await db.execute(
    sql.raw(`
      UPDATE "shared_sections" g SET
        "services_areas_heading" = (SELECT min("areas_we_service_heading") FROM "services" HAVING count(DISTINCT "areas_we_service_heading") = 1),
        "services_consultation_duration" = (SELECT min("consultation_duration") FROM "services" HAVING count(DISTINCT "consultation_duration") = 1),
        "services_client_approach_image_id" = (SELECT min("client_approach_image_id") FROM "services" HAVING count(DISTINCT "client_approach_image_id") = 1)
      WHERE g."id" = ${sharedId}
    `),
  )
  await db.execute(
    sql.raw(`
      INSERT INTO "shared_sections_services_estimate_band_buttons" ("_order", "_parent_id", "id", "label", "url", "variant", "open_in_new_tab")
      SELECT b."_order", ${sharedId}, ${newId}, b."label", b."url",
        b."variant"::text::"public"."enum_shared_sections_services_estimate_band_buttons_variant", b."open_in_new_tab"
      FROM "services_blocks_cta_buttons" b
      WHERE b."_parent_id" = (SELECT "id" FROM "services_blocks_cta" WHERE "layout" = 'estimate' ORDER BY "_parent_id", "_order" LIMIT 1)
        AND NOT EXISTS (SELECT 1 FROM "shared_sections_services_estimate_band_buttons");
    `),
  )

  // Clear exact copies.
  await db.execute(sql`
    UPDATE "services_blocks_cta" c SET "heading" = NULL FROM "shared_sections" g
      WHERE c."layout" = 'estimate' AND c."heading" = g."services_estimate_band_heading";
    UPDATE "services_blocks_cta" c SET "description" = NULL FROM "shared_sections" g
      WHERE c."layout" = 'estimate' AND c."description" = g."services_estimate_band_description";
    WITH shared AS (
      SELECT string_agg("label" || '|' || "url", '#' ORDER BY "_order") AS sig FROM "shared_sections_services_estimate_band_buttons"
    ), bands AS (
      SELECT b."_parent_id" AS parent, string_agg(b."label" || '|' || b."url", '#' ORDER BY b."_order") AS sig
      FROM "services_blocks_cta_buttons" b JOIN "services_blocks_cta" c ON c."id" = b."_parent_id"
      WHERE c."layout" = 'estimate' GROUP BY b."_parent_id"
    )
    DELETE FROM "services_blocks_cta_buttons" b USING bands x, shared s
      WHERE b."_parent_id" = x.parent AND x.sig = s.sig;

    UPDATE "services" s SET "areas_we_service_heading" = NULL FROM "shared_sections" g
      WHERE s."areas_we_service_heading" = g."services_areas_heading";
    UPDATE "services" s SET "consultation_duration" = NULL FROM "shared_sections" g
      WHERE s."consultation_duration" = g."services_consultation_duration";
    UPDATE "services" s SET "client_approach_image_id" = NULL FROM "shared_sections" g
      WHERE s."client_approach_image_id" = g."services_client_approach_image_id";

    UPDATE "pages_blocks_cta" p SET "heading" = NULL FROM "shared_sections" g
      WHERE p."heading" = g."services_estimate_band_heading";
    UPDATE "pages_blocks_cta" p SET "body" = NULL FROM "shared_sections" g
      WHERE p."body" = g."services_estimate_band_description";
    UPDATE "pages_blocks_cta" p SET "label" = NULL, "href" = NULL
      FROM "shared_sections_services_estimate_band_buttons" b
      WHERE b."_order" = 1 AND p."label" = b."label" AND p."href" = b."url";
  `)

  // Nothing renders differently.
  const { rows: changed } = await db.execute(sql`
    SELECT (
      (SELECT count(*) FROM "services_blocks_cta" c JOIN "before_bands" x ON x."id" = c."id" CROSS JOIN "shared_sections" g
        WHERE COALESCE(c."heading", g."services_estimate_band_heading") IS DISTINCT FROM x."heading"
           OR COALESCE(c."description"::text, g."services_estimate_band_description"::text) IS DISTINCT FROM x.description
           OR COALESCE(
                (SELECT string_agg(b."label" || '|' || b."url", '#' ORDER BY b."_order") FROM "services_blocks_cta_buttons" b WHERE b."_parent_id" = c."id"),
                (SELECT string_agg(b."label" || '|' || b."url", '#' ORDER BY b."_order") FROM "shared_sections_services_estimate_band_buttons" b)
              ) IS DISTINCT FROM x.buttons)
      + (SELECT count(*) FROM "services" s JOIN "before_services" x ON x."id" = s."id" CROSS JOIN "shared_sections" g
        WHERE COALESCE(s."areas_we_service_heading", g."services_areas_heading") IS DISTINCT FROM COALESCE(x."areas_we_service_heading", g."services_areas_heading")
           OR (x."consultation_duration" IS NOT NULL AND COALESCE(s."consultation_duration", g."services_consultation_duration") IS DISTINCT FROM x."consultation_duration")
           OR (x."client_approach_image_id" IS NOT NULL AND COALESCE(s."client_approach_image_id", g."services_client_approach_image_id") IS DISTINCT FROM x."client_approach_image_id"))
      + (SELECT count(*) FROM "pages_blocks_cta" p JOIN "before_blog_band" x ON x."id" = p."id" CROSS JOIN "shared_sections" g
        WHERE COALESCE(p."heading", g."services_estimate_band_heading") IS DISTINCT FROM x."heading"
           OR COALESCE(p."body"::text, g."services_estimate_band_description"::text) IS DISTINCT FROM x.body)
    )::int AS n
  `)
  if (Number(changed[0].n) > 0) {
    throw new Error(
      `shared_service_content: ${changed[0].n} service value(s) would render differently; nothing was changed`,
    )
  }

  // 3. Landing FAQ categories → ordered FAQs-collection records.
  const { rows: faqs } = await db.execute(sql`
    SELECT f."id", f."question", f."answer", c."title" AS category
    FROM "faqs" f LEFT JOIN "faq_categories" c ON c."id" = f."category_id"
  `)
  const { rows: inline } = await db.execute(sql`
    SELECT q."id" AS qid, q."_order" AS qorder, q."question", q."answer",
      cat."id" AS cid, cat."_order" AS corder, cat."title",
      blk."id" AS bid, blk."_parent_id" AS page_id, blk."_order" AS border
    FROM "landing_pages_blocks_faq_categories_questions" q
    JOIN "landing_pages_blocks_faq_categories" cat ON cat."id" = q."_parent_id"
    JOIN "landing_pages_blocks_faq" blk ON blk."id" = cat."_parent_id"
    WHERE blk."_path" = 'sections'
    ORDER BY cat."id", q."_order"
  `)
  if (!inline.length) return

  // A block's index in its page's `sections` list, the way Payload assembles
  // it (by `_order` across every landing block table) — that index is part of
  // the relationship path.
  const { rows: tables } = await db.execute(sql`
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = '_path'
      AND table_name LIKE 'landing\\_pages\\_blocks\\_%' ESCAPE '\\'
      AND table_name IN (SELECT table_name FROM information_schema.columns WHERE column_name = '_parent_id' AND data_type = 'integer')
  `)
  const union = tables
    .map(
      ({ table_name }) =>
        `SELECT "id"::text AS id, "_parent_id" AS page_id, "_order" AS ord FROM "${table_name}" WHERE "_path" = 'sections'`,
    )
    .join(' UNION ALL ')
  const { rows: positions } = await db.execute(
    sql.raw(
      `SELECT id, (row_number() OVER (PARTITION BY page_id ORDER BY ord)) - 1 AS idx FROM (${union}) b`,
    ),
  )
  const blockIndex = new Map(positions.map((row) => [String(row.id), Number(row.idx)]))
  const { rows: categoryRows } = await db.execute(sql`
    SELECT "id", "_parent_id" AS bid, (row_number() OVER (PARTITION BY "_parent_id" ORDER BY "_order")) - 1 AS idx
    FROM "landing_pages_blocks_faq_categories"
  `)
  const categoryIndex = new Map(categoryRows.map((row) => [String(row.id), Number(row.idx)]))

  const byCategory = new Map<string, typeof inline>()
  for (const row of inline) {
    const key = String(row.cid)
    byCategory.set(key, [...(byCategory.get(key) ?? []), row])
  }

  let converted = 0
  for (const [cid, questions] of byCategory) {
    const title = norm(questions[0].title)
    const ids: number[] = []
    for (const question of questions) {
      const candidates = faqs.filter((faq) => norm(faq.question) === norm(question.question))
      const match =
        candidates.find(
          (faq) =>
            norm(faq.category) === title && answerKey(faq.answer) === answerKey(question.answer),
        ) ?? candidates.find((faq) => answerKey(faq.answer) === answerKey(question.answer))
      if (!match) break
      ids.push(Number(match.id))
    }
    if (ids.length !== questions.length) continue

    const index = blockIndex.get(String(questions[0].bid))
    const catIndex = categoryIndex.get(cid)
    if (index === undefined || catIndex === undefined) continue
    const path = `sections.${index}.categories.${catIndex}.faqOrder`
    const pageId = Number(questions[0].page_id)
    await db.execute(
      sql`DELETE FROM "landing_pages_rels" WHERE "parent_id" = ${pageId} AND "path" = ${path}`,
    )
    for (const [order, id] of ids.entries()) {
      await db.execute(sql`
        INSERT INTO "landing_pages_rels" ("order", "parent_id", "path", "faqs_id")
        VALUES (${order + 1}, ${pageId}, ${path}, ${id})
      `)
    }
    await db.execute(
      sql`DELETE FROM "landing_pages_blocks_faq_categories_questions" WHERE "_parent_id" = ${cid}`,
    )
    converted += 1
  }
  if (converted !== byCategory.size) {
    throw new Error(
      `shared_service_content: only ${converted} of ${byCategory.size} landing FAQ categories matched the FAQs collection; nothing was changed`,
    )
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // The cleared values are the Shared Sections values, and the landing FAQ
  // answers are the FAQs collection's; restore from a backup if the copies
  // themselves are needed.
}
