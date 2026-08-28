import type { CollectionConfig } from 'payload'

export const ConsultationTypes: CollectionConfig = {
  slug: 'consultation-types',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'duration', 'active', 'sortOrder'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'duration', type: 'text', required: true, defaultValue: '~1 Hour' },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'bookingUrl', type: 'text', required: true, defaultValue: '#quote' },
    { name: 'active', type: 'checkbox', defaultValue: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0, index: true },
  ],
}
