import type { CollectionBeforeValidateHook, CollectionConfig, CollectionSlug } from 'payload'
import { SEOFields } from './fields/SEO'

const relationId = (value: unknown) =>
  typeof value === 'object' && value !== null && 'id' in value
    ? String((value as { id: string | number }).id)
    : value === undefined || value === null
      ? undefined
      : String(value)

const ensureUniqueServiceLocation: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const serviceId = relationId(data?.service)
  const locationId = relationId(data?.location)
  if (!serviceId || !locationId) return data

  const existing = await req.payload.find({
    collection: 'service-locations',
    where: {
      and: [
        { service: { equals: serviceId } },
        { location: { equals: locationId } },
      ],
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs[0] && String(existing.docs[0].id) !== String(originalDoc?.id)) {
    throw new Error('A ServiceLocation already exists for this service and location.')
  }

  return data
}

export const ServiceLocations: CollectionConfig = {
  slug: 'service-locations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'service', 'location', 'slug'],
    description: 'The small service + location record. Shared page layout comes from the frontend template.',
  },
  hooks: { beforeValidate: [ensureUniqueServiceLocation] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'service', type: 'relationship', relationTo: 'services' as CollectionSlug, required: true, index: true },
    { name: 'location', type: 'relationship', relationTo: 'locations' as CollectionSlug, required: true, index: true },
    { name: 'city', type: 'text', admin: { description: 'Legacy WordPress city value; retained for import compatibility.' } },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'heroHeading', type: 'text' },
    { name: 'heroDescription', type: 'textarea' },
    { name: 'intro', type: 'textarea' },
    { name: 'content', type: 'richText' },
    ...SEOFields,
  ],
}
