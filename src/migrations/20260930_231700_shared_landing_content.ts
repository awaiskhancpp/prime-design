import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Store the landing pages' repeated sections once.
 *
 * Measured first, across the seven landing pages:
 * - Prime Difference (7 pages): one eyebrow ("Over 350+ Projects in Silicon
 *   Valley"), one heading ("The Prime Difference") and one set of five
 *   feature cards. The videos differ per page and stay on each page.
 * - Experience Difference (6): one eyebrow, heading and feature set.
 * - Service Areas (6): one eyebrow, heading ("Areas we service"), city list,
 *   region heading ("California") and map image.
 * - Luxury CTA (7): one heading; the eyebrow and copy differ and stay.
 * - Find Us (7): one heading ("Find us"); the phone, email and addresses
 *   were copies of Site Settings, which the block now reads when empty.
 *
 * The shared values go to Shared Sections (landing tab), copied from one
 * page. A page's value is cleared only where it equals the shared one (or,
 * for Find Us contact details, Site Settings). The migration aborts, changing
 * nothing, if any landing section would resolve differently afterwards.
 */

type Spec = {
  blockTable: string
  prefix: string
  scalars: string[]
  arrays: Array<{ suffix: string }>
}

const SPECS: Spec[] = [
  {
    blockTable: 'landing_pages_blocks_prime_difference',
    prefix: 'landing_prime_difference',
    scalars: ['eyebrow', 'heading'],
    arrays: [{ suffix: 'features' }],
  },
  {
    blockTable: 'landing_pages_blocks_experience_difference',
    prefix: 'landing_experience_difference',
    scalars: ['eyebrow', 'heading'],
    arrays: [{ suffix: 'features' }],
  },
  {
    blockTable: 'landing_pages_blocks_service_areas',
    prefix: 'landing_service_areas',
    scalars: [
      'eyebrow',
      'heading',
      'region_heading',
      'map_media_asset_id',
      'map_media_alt',
      'map_media_caption',
      'map_media_source_attachment_id',
      'map_media_source_url',
    ],
    arrays: [{ suffix: 'areas' }],
  },
  {
    blockTable: 'landing_pages_blocks_luxury_cta',
    prefix: 'landing_luxury_cta',
    scalars: ['heading'],
    arrays: [],
  },
  {
    blockTable: 'landing_pages_blocks_find_us',
    prefix: 'landing_find_us',
    scalars: ['heading'],
    arrays: [],
  },
]

const newId = `substr(md5(random()::text || clock_timestamp()::text), 1, 24)`

type Db = MigrateUpArgs['db']

async function columnsOf(db: Db, table: string): Promise<string[]> {
  const { rows } = await db.execute(
    sql`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${table} ORDER BY ordinal_position`,
  )
  return rows.map((row) => String(row.column_name))
}

/** A row-set signature per parent: every column but the keys, in `_order`. */
const signature = (columns: string[], alias = '') =>
  `string_agg(concat_ws('|', ${columns.map((c) => `${alias}"${c}"::text`).join(', ')}), '#' ORDER BY ${alias}"_order")`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const { rows: globalRows } = await db.execute(sql`SELECT "id" FROM "shared_sections" LIMIT 1`)
  if (!globalRows.length) {
    await db.execute(
      sql`INSERT INTO "shared_sections" ("updated_at", "created_at") VALUES (now(), now())`,
    )
  }
  const { rows: g } = await db.execute(sql`SELECT "id" FROM "shared_sections" LIMIT 1`)
  const sharedId = Number(g[0].id)

  // Snapshot what every block resolves to today (its own values; all filled).
  for (const spec of SPECS) {
    await db.execute(
      sql.raw(`CREATE TEMP TABLE "before_${spec.prefix}" ON COMMIT DROP AS
               SELECT "id", ${spec.scalars.map((c) => `"${c}"`).join(', ')} FROM "${spec.blockTable}"`),
    )
    for (const array of spec.arrays) {
      const table = `${spec.blockTable}_${array.suffix}`
      const cols = (await columnsOf(db, table)).filter((c) => !['_parent_id', 'id'].includes(c))
      await db.execute(
        sql.raw(`CREATE TEMP TABLE "before_${spec.prefix}_${array.suffix}" ON COMMIT DROP AS
                 SELECT "_parent_id" AS parent, ${signature(cols)} AS sig FROM "${table}" GROUP BY "_parent_id"`),
      )
    }
  }
  await db.execute(
    sql.raw(`CREATE TEMP TABLE "before_find_us_contact" ON COMMIT DROP AS
             SELECT "id", "phone", "email", "address" FROM "landing_pages_blocks_find_us"`),
  )

  for (const spec of SPECS) {
    const { rows: source } = await db.execute(
      sql.raw(`SELECT "id" FROM "${spec.blockTable}" ORDER BY "_parent_id", "_order" LIMIT 1`),
    )
    if (!source.length) continue
    const sourceId = String(source[0].id)

    // Shared scalars, from the first page that has the block.
    await db.execute(
      sql.raw(`
        UPDATE "shared_sections" g SET ${spec.scalars
          .map((c) => `"${spec.prefix}_${c}" = b."${c}"`)
          .join(', ')}
        FROM "${spec.blockTable}" b WHERE b."id" = '${sourceId}' AND g."id" = ${sharedId};
      `),
    )
    for (const array of spec.arrays) {
      const from = `${spec.blockTable}_${array.suffix}`
      const to = `shared_sections_${spec.prefix}_${array.suffix}`
      const cols = (await columnsOf(db, from)).filter((c) => !['_parent_id', 'id'].includes(c))
      await db.execute(
        sql.raw(`
          INSERT INTO "${to}" ("_parent_id", "id", ${cols.map((c) => `"${c}"`).join(', ')})
          SELECT ${sharedId}, ${newId}, ${cols.map((c) => `"${c}"`).join(', ')}
          FROM "${from}" WHERE "_parent_id" = '${sourceId}'
          AND NOT EXISTS (SELECT 1 FROM "${to}");
        `),
      )
      // Remove a page's rows only where they are identical to the shared set.
      await db.execute(
        sql.raw(`
          WITH shared AS (SELECT ${signature(cols)} AS sig FROM "${to}" WHERE "_parent_id" = ${sharedId}),
          pages AS (SELECT "_parent_id" AS parent, ${signature(cols)} AS sig FROM "${from}" GROUP BY "_parent_id")
          DELETE FROM "${from}" r USING pages p, shared s
          WHERE r."_parent_id" = p.parent AND p.sig = s.sig;
        `),
      )
    }
    for (const c of spec.scalars) {
      await db.execute(
        sql.raw(`
          UPDATE "${spec.blockTable}" b SET "${c}" = NULL
          FROM "shared_sections" g
          WHERE g."id" = ${sharedId} AND b."${c}" IS NOT NULL AND b."${c}" = g."${spec.prefix}_${c}";
        `),
      )
    }
  }

  // Find Us contact details: clear the copies of Site Settings.
  await db.execute(sql`
    UPDATE "landing_pages_blocks_find_us" f SET "phone" = NULL
    FROM "site_settings" s WHERE f."phone" = s."company_phone";
    UPDATE "landing_pages_blocks_find_us" f SET "email" = NULL
    FROM "site_settings" s WHERE f."email" = s."company_email";
    UPDATE "landing_pages_blocks_find_us" f SET "address" = NULL
    WHERE f."address" = (
      SELECT string_agg("address", E'\n' ORDER BY "_order") FROM "site_settings_company_addresses"
    );
  `)

  // Prove nothing renders differently.
  let changed = 0
  for (const spec of SPECS) {
    for (const c of spec.scalars) {
      const { rows } = await db.execute(
        sql.raw(`
          SELECT count(*)::int AS n FROM "${spec.blockTable}" b
          JOIN "before_${spec.prefix}" x ON x."id" = b."id"
          CROSS JOIN "shared_sections" g
          WHERE g."id" = ${sharedId}
            AND COALESCE(b."${c}", g."${spec.prefix}_${c}") IS DISTINCT FROM x."${c}"
        `),
      )
      changed += Number(rows[0].n)
    }
    for (const array of spec.arrays) {
      const from = `${spec.blockTable}_${array.suffix}`
      const to = `shared_sections_${spec.prefix}_${array.suffix}`
      const cols = (await columnsOf(db, from)).filter((c) => !['_parent_id', 'id'].includes(c))
      const { rows } = await db.execute(
        sql.raw(`
          WITH shared AS (SELECT ${signature(cols)} AS sig FROM "${to}" WHERE "_parent_id" = ${sharedId}),
          now_pages AS (SELECT "_parent_id" AS parent, ${signature(cols)} AS sig FROM "${from}" GROUP BY "_parent_id")
          SELECT count(*)::int AS n
          FROM "before_${spec.prefix}_${array.suffix}" b
          LEFT JOIN now_pages p ON p.parent = b.parent
          CROSS JOIN shared s
          WHERE COALESCE(p.sig, s.sig) IS DISTINCT FROM b.sig
        `),
      )
      changed += Number(rows[0].n)
    }
  }
  const { rows: contact } = await db.execute(sql`
    SELECT count(*)::int AS n FROM "landing_pages_blocks_find_us" f
    JOIN "before_find_us_contact" x ON x."id" = f."id"
    CROSS JOIN "site_settings" s
    WHERE COALESCE(f."phone", s."company_phone") IS DISTINCT FROM x."phone"
       OR COALESCE(f."email", s."company_email") IS DISTINCT FROM x."email"
       OR COALESCE(f."address", (SELECT string_agg("address", E'\n' ORDER BY "_order") FROM "site_settings_company_addresses")) IS DISTINCT FROM x."address"
  `)
  changed += Number(contact[0].n)
  if (changed > 0) {
    throw new Error(
      `shared_landing_content: ${changed} landing value(s) would render differently; nothing was changed`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Put the shared values back on every block that inherits them.
  const { rows: g } = await db.execute(sql`SELECT "id" FROM "shared_sections" LIMIT 1`)
  if (!g.length) return
  const sharedId = Number(g[0].id)
  for (const spec of SPECS) {
    for (const c of spec.scalars) {
      await db.execute(
        sql.raw(`UPDATE "${spec.blockTable}" b SET "${c}" = g."${spec.prefix}_${c}"
                 FROM "shared_sections" g WHERE g."id" = ${sharedId} AND b."${c}" IS NULL`),
      )
    }
    for (const array of spec.arrays) {
      const from = `${spec.blockTable}_${array.suffix}`
      const to = `shared_sections_${spec.prefix}_${array.suffix}`
      const cols = (await columnsOf(db, to)).filter((c) => !['_parent_id', 'id'].includes(c))
      await db.execute(
        sql.raw(`
          INSERT INTO "${from}" ("_parent_id", "id", ${cols.map((c) => `"${c}"`).join(', ')})
          SELECT b."id", ${newId}, ${cols.map((c) => `s."${c}"`).join(', ')}
          FROM "${spec.blockTable}" b CROSS JOIN "${to}" s
          WHERE NOT EXISTS (SELECT 1 FROM "${from}" x WHERE x."_parent_id" = b."id");
        `),
      )
    }
  }
  await db.execute(sql`
    UPDATE "landing_pages_blocks_find_us" f SET
      "phone" = COALESCE(f."phone", s."company_phone"),
      "email" = COALESCE(f."email", s."company_email"),
      "address" = COALESCE(f."address", (SELECT string_agg("address", E'\n' ORDER BY "_order") FROM "site_settings_company_addresses"))
    FROM "site_settings" s;
  `)
}
