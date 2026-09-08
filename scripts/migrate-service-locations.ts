import 'dotenv/config'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import dotenv from 'dotenv'
import { getPayload } from 'payload'

import configPromise from '../src/payload.config'
import { parentServices, transformWordPressServiceLocations } from './transform-wordpress-service-locations'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const input =
  process.argv[2] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-28.xml'

const serviceTitles: Record<string, string> = {
  'kitchen-remodeling': 'Kitchen Remodeling',
  'bathroom-remodeling': 'Bathroom Remodeling',
  'home-remodeling': 'Home Remodeling',
  adu: 'ADU & Garage Conversions',
  additions: 'Room Additions',
  'complete-renovation': 'Complete Renovation',
  'european-kitchen': 'European Kitchen Remodeling',
  'custom-kitchen': 'Custom Kitchen Remodeling',
  'shaker-kitchen': 'Shaker Kitchen Remodeling',
}

async function upsert() {
  const xml = await readFile(input, 'utf8')
  const records = transformWordPressServiceLocations(xml)
  const payload = await getPayload({ config: configPromise })
  const services = new Map<string, number>()
  const locations = new Map<string, number>()

  for (const serviceSlug of Object.values(parentServices)) {
    const found = await payload.find({ collection: 'services', where: { slug: { equals: serviceSlug } }, limit: 1 })
    const service = found.docs[0] || await payload.create({
      collection: 'services',
      data: { title: serviceTitles[serviceSlug], slug: serviceSlug },
    })
    services.set(serviceSlug, service.id)
  }

  for (const record of records) {
    const serviceSlug = parentServices[record.parentId]
    const serviceId = services.get(serviceSlug)
    if (!serviceId) throw new Error(`Missing service relationship for ${serviceSlug}`)

    const locationSlug = record.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    let locationId = locations.get(locationSlug)
    if (!locationId) {
      const found = await payload.find({ collection: 'locations', where: { slug: { equals: locationSlug } }, limit: 1 })
      const location = found.docs[0] || await payload.create({
        collection: 'locations',
        data: { name: record.city, slug: locationSlug },
      })
      locationId = location.id
      locations.set(locationSlug, locationId)
    }

    const data = {
      title: record.title,
      slug: record.slug,
      city: record.city,
      service: serviceId,
      location: locationId,
      seo: record.seoDescription ? { metaDescription: record.seoDescription } : undefined,
    }
    const found = await payload.find({ collection: 'service-locations', where: { slug: { equals: record.slug } }, limit: 1 })
    if (found.docs[0]) {
      await payload.update({ collection: 'service-locations', id: found.docs[0].id, data })
    } else {
      await payload.create({ collection: 'service-locations', data })
    }
  }

  const count = await payload.count({ collection: 'service-locations', where: { slug: { like: '-in-' } } })
  console.log(`Migrated ${records.length} WordPress service-location records.`)
  console.log(`Database now contains ${count.totalDocs} matching service-location records.`)
  process.exit(0)
}

upsert().catch((error) => {
  console.error('Service-location migration failed:', error)
  process.exit(1)
})
