import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function seedPaloAlto() {
  const payload = await getPayload({ config: configPromise })

  console.log('--- Starting Palo Alto Test Record Seeding ---')

  // 1. Get or Create Kitchen Remodeling Service
  const existingServices = await payload.find({
    collection: 'services',
    where: { slug: { equals: 'kitchen-remodeling' } },
  })
  const serviceDoc = existingServices.docs[0]

  // 2. Upsert Palo Alto Location
  let locationDoc
  const existingLocations = await payload.find({
    collection: 'locations',
    where: { slug: { equals: 'palo-alto' } },
  })

  if (existingLocations.docs.length > 0) {
    locationDoc = existingLocations.docs[0]
  } else {
    locationDoc = await payload.create({
      collection: 'locations',
      data: { name: 'Palo Alto', slug: 'palo-alto' },
    })
    console.log(`[Location] Created: Palo Alto (${locationDoc.id})`)
  }

  // 3. Upsert ServiceLocation
  const targetSlug = 'kitchen-remodeling-in-palo-alto'
  const existingServiceLocations = await payload.find({
    collection: 'service-locations',
    where: { slug: { equals: targetSlug } },
  })

  if (existingServiceLocations.docs.length > 0) {
    console.log(`[ServiceLocation] Found existing: ${targetSlug}`)
  } else {
    const serviceLocationDoc = await payload.create({
      collection: 'service-locations',
      data: {
        title: 'Kitchen Remodeling in Palo Alto',
        slug: targetSlug,
        city: 'Palo Alto',
        service: serviceDoc.id,
        location: locationDoc.id,
      },
    })
    console.log(`[ServiceLocation] Created: ${serviceLocationDoc.slug} (${serviceLocationDoc.id})`)
  }

  console.log('--- Palo Alto Seeding Complete ---')
  process.exit(0)
}

seedPaloAlto().catch((err) => {
  console.error('Seeding error:', err)
  process.exit(1)
})
