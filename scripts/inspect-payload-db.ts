import 'dotenv/config'
import { createRequire } from 'node:module'

const { Client } = createRequire(import.meta.url)('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
for (const table of ['services', 'locations', 'service_locations', 'media', 'services_rels']) {
  const result = await client.query(`select column_name, data_type from information_schema.columns where table_name = '${table}' order by ordinal_position`)
  console.log(table, JSON.stringify(result.rows))
}
const summary = await client.query("select count(*)::int as records, count(distinct service_id)::int as services, count(distinct location_id)::int as locations from service_locations where slug like '%-in-%'")
console.log('summary', JSON.stringify(summary.rows))
const examples = await client.query("select sl.slug, s.slug as service, l.slug as location from service_locations sl join services s on s.id = sl.service_id join locations l on l.id = sl.location_id where sl.slug in ('kitchen-remodeling-in-san-jose', 'kitchen-remodeling-in-palo-alto', 'bathroom-remodeling-in-palo-alto', 'home-remodeling-in-palo-alto') order by sl.slug")
console.log('examples', JSON.stringify(examples.rows))
const media = await client.query("select count(*)::int as media_records from media")
const linkedMedia = await client.query("select count(*)::int as linked_service_location_media from service_locations where featured_image_id is not null")
console.log('media', JSON.stringify(media.rows), JSON.stringify(linkedMedia.rows))
await client.end()
