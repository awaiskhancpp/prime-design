import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Point every Payload media relation that used the old Custom Kitchen asset at
 * the replacement upload. The application resolves these images from media
 * relations, so changing a source filename alone would not update the cards.
 *
 * The update is intentionally relation-wide: the same media record can be
 * used by service cards, service-location cards, section blocks, or SEO data.
 * WordPress exports are left unchanged because they remain migration source
 * material rather than runtime content.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE
      old_media_id integer;
      new_media_id integer;
      relation record;
    BEGIN
      SELECT id
        INTO old_media_id
        FROM media
       WHERE lower(filename) = lower('Custom-Kitchen.png')
       LIMIT 1;

      IF old_media_id IS NULL THEN
        RETURN;
      END IF;

      SELECT id
        INTO new_media_id
        FROM media
       WHERE lower(filename) = lower('Custom-Kitchen-new.png')
       LIMIT 1;

      IF new_media_id IS NULL THEN
        RAISE EXCEPTION
          'Cannot replace Custom-Kitchen.png: media record Custom-Kitchen-new.png was not found';
      END IF;

      IF old_media_id = new_media_id THEN
        RETURN;
      END IF;

      FOR relation IN
        SELECT DISTINCT
          tc.table_schema,
          tc.table_name,
          kcu.column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON kcu.constraint_schema = tc.constraint_schema
         AND kcu.constraint_name = tc.constraint_name
         AND kcu.table_schema = tc.table_schema
         AND kcu.table_name = tc.table_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_schema = tc.constraint_schema
         AND ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_schema = 'public'
          AND ccu.table_name = 'media'
          AND ccu.column_name = 'id'
      LOOP
        EXECUTE format(
          'UPDATE %I.%I SET %I = $1 WHERE %I = $2',
          relation.table_schema,
          relation.table_name,
          relation.column_name,
          relation.column_name
        ) USING new_media_id, old_media_id;
      END LOOP;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // This data migration is intentionally not reversed: restoring every
  // relation to the old asset could overwrite references created after it ran.
  void db
}
