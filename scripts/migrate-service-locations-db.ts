import 'dotenv/config'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { parentServices, transformWordPressServiceLocations } from './transform-wordpress-service-locations'

const { Client } = createRequire(import.meta.url)('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')
const input = process.argv[2] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-26.xml'
const titles: Record<string, string> = {
  'kitchen-remodeling': 'Kitchen Remodeling',
  'bathroom-remodeling': 'Bathroom Remodeling',
  'home-remodeling': 'Home Remodeling',
}

const slugify = (value: string) => value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
try {
  const xml = await readFile(input, 'utf8')
  const records = transformWordPressServiceLocations(xml)
  await client.query('BEGIN')

  const serviceIds = new Map<string, number>()
  for (const serviceSlug of Object.values(parentServices)) {
    const result = await client.query(
      `INSERT INTO services (title, slug, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = NOW()
       RETURNING id`,
      [titles[serviceSlug], serviceSlug],
    )
    serviceIds.set(serviceSlug, result.rows[0].id)
  }

  const locationIds = new Map<string, number>()
  for (const record of records) {
    const locationSlug = slugify(record.city)
    if (!locationIds.has(locationSlug)) {
      const result = await client.query(
        `INSERT INTO locations (name, slug, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
         RETURNING id`,
        [record.city, locationSlug],
      )
      locationIds.set(locationSlug, result.rows[0].id)
    }
  }

  for (const record of records) {
    const serviceSlug = parentServices[record.parentId]
    const serviceId = serviceIds.get(serviceSlug)
    const locationId = locationIds.get(slugify(record.city))
    if (!serviceId || !locationId) throw new Error(`Could not resolve relationships for ${record.slug}`)
    await client.query(
      `INSERT INTO service_locations
         (title, slug, service_id, location_id, city, seo_meta_description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         service_id = EXCLUDED.service_id,
         location_id = EXCLUDED.location_id,
         city = EXCLUDED.city,
         seo_meta_description = EXCLUDED.seo_meta_description,
         updated_at = NOW()`,
      [record.title, record.slug, serviceId, locationId, record.city, record.seoDescription || null],
    )
  }
  await client.query('COMMIT')
  const count = await client.query("SELECT COUNT(*)::int AS count FROM service_locations WHERE slug LIKE '%-in-%'")
  console.log(`Migrated ${records.length} records; database now contains ${count.rows[0].count} service-location records.`)
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  await client.end()
}
