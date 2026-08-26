import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load .env.local if present, fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function seedSanJose() {
  const payload = await getPayload({ config: configPromise })

  console.log('--- Starting San Jose Test Record Seeding ---')

  // 1. Upsert Service
  let serviceDoc
  const existingServices = await payload.find({
    collection: 'services',
    where: { slug: { equals: 'kitchen-remodeling' } },
  })

  if (existingServices.docs.length > 0) {
    serviceDoc = existingServices.docs[0]
    console.log(`[Service] Found existing: Kitchen Remodeling (${serviceDoc.id})`)
  } else {
    serviceDoc = await payload.create({
      collection: 'services',
      data: {
        title: 'Kitchen Remodeling',
        slug: 'kitchen-remodeling',
      },
    })
    console.log(`[Service] Created: Kitchen Remodeling (${serviceDoc.id})`)
  }

  // 2. Upsert Location
  let locationDoc
  const existingLocations = await payload.find({
    collection: 'locations',
    where: { slug: { equals: 'san-jose' } },
  })

  if (existingLocations.docs.length > 0) {
    locationDoc = existingLocations.docs[0]
    console.log(`[Location] Found existing: San Jose (${locationDoc.id})`)
  } else {
    locationDoc = await payload.create({
      collection: 'locations',
      data: {
        name: 'San Jose',
        slug: 'san-jose',
      },
    })
    console.log(`[Location] Created: San Jose (${locationDoc.id})`)
  }

  // 3. Upsert ServiceLocation
  const targetSlug = 'kitchen-remodeling-in-san-jose'
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
        title: 'Kitchen Remodeling in San Jose',
        slug: targetSlug,
        city: 'San Jose',
        service: serviceDoc.id,
        location: locationDoc.id,
      },
    })
    console.log(`[ServiceLocation] Created: ${serviceLocationDoc.slug} (${serviceLocationDoc.id})`)
  }

  console.log('--- Seeding Complete ---')
  process.exit(0)
}

seedSanJose().catch((err) => {
  console.error('Seeding error:', err)
  process.exit(1)
})
