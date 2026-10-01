import type { CollectionConfig } from 'payload'
import { SEOFields } from './fields/SEO'

export const Team: CollectionConfig = {
  slug: 'team',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'updatedAt'],
    description:
      'Team members: the grids on /about and /team, and each member’s own page at /team/<slug>.',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'The member’s page address: /team/<slug>.' },
    },
    { name: 'position', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'richText' },
    // On the member's page an empty title is their name and an empty
    // description is the bio's first 158 characters — what WordPress emitted.
    ...SEOFields,
  ],
}
