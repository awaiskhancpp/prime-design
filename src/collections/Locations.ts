import type { CollectionConfig } from 'payload'
import { SEOFields } from './fields/SEO'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    group: 'Services',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    description: 'Reusable Silicon Valley service-area locations.',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'seoDescription', type: 'textarea' },
    {
      // Where this location's pin sits on the service-areas coverage map
      // (`ServiceAreasMap`). Before these existed the coordinates were a
      // hardcoded lookup keyed by city name in `LandscapingServiceAreas`, so
      // a location the table did not know about — "Silicon Valley" — was
      // silently dropped from the map while still appearing in the city list.
      type: 'row',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          admin: {
            width: '50%',
            step: 0.0001,
            description: 'Decimal degrees, north positive. Silicon Valley is around 37.4.',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          admin: {
            width: '50%',
            step: 0.0001,
            description:
              'Decimal degrees, east positive — so west of Greenwich is negative (-122.0).',
          },
        },
      ],
    },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    ...SEOFields,
  ],
}
