import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Keep service relationships pointing at the right Page Builder section when
 * the hero blocks are dropped (`20260930_220925_remove_dead_fields`).
 *
 * Payload records a relationship inside a block by the block's *index* in the
 * list — `services_rels.path = 'sections.6.categories.0.faqOrder'` is the
 * seventh section. Removing each service's `hero` block shifts every section
 * after it down by one, so without this the Home Remodeling FAQ order (four
 * questions, the only such relationship today) would have attached to the
 * wrong section and the FAQ would have fallen back to the category's order.
 *
 * For every `sections.N.…` path this subtracts the number of hero blocks that
 * sit before position N in that service's list. Positions are computed from
 * every services block table, the way Payload assembles the list (by
 * `_order`), while the hero rows still exist.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const { rows: tables } = await db.execute(sql`
    SELECT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.column_name = '_path'
      AND c.table_name LIKE 'services\\_blocks\\_%' ESCAPE '\\'
      AND EXISTS (
        SELECT 1 FROM information_schema.columns p
        WHERE p.table_schema = 'public' AND p.table_name = c.table_name AND p.column_name = '_parent_id'
          AND p.data_type = 'integer'
      )
  `)
  if (!tables.length) return

  const union = tables
    .map(
      ({ table_name }) =>
        `SELECT "_parent_id" AS parent_id, "_order" AS ord, ${
          table_name === 'services_blocks_hero' ? 'true' : 'false'
        } AS is_hero FROM "${table_name}" WHERE "_path" = 'sections'`,
    )
    .join(' UNION ALL ')

  await db.execute(
    sql.raw(`
      WITH blocks AS (${union}),
      positioned AS (
        SELECT parent_id, is_hero, (row_number() OVER (PARTITION BY parent_id ORDER BY ord)) - 1 AS idx
        FROM blocks
      ),
      targets AS (
        SELECT r.id,
          (substring(r.path FROM '^sections\\.([0-9]+)\\.'))::int AS old_idx,
          r.parent_id
        FROM services_rels r
        WHERE r.path ~ '^sections\\.[0-9]+\\.'
      ),
      shifted AS (
        SELECT t.id, t.old_idx,
          t.old_idx - (
            SELECT count(*) FROM positioned p
            WHERE p.parent_id = t.parent_id AND p.is_hero AND p.idx < t.old_idx
          ) AS new_idx
        FROM targets t
      )
      UPDATE services_rels r
      SET path = regexp_replace(r.path, '^sections\\.[0-9]+\\.', 'sections.' || s.new_idx || '.')
      FROM shifted s
      WHERE r.id = s.id AND s.new_idx <> s.old_idx
    `),
  )
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Only meaningful together with the hero blocks it accounted for, which
  // `20260930_220925_remove_dead_fields` drops for good.
}
