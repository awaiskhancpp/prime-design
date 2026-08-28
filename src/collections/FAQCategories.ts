import type { CollectionConfig } from 'payload'

export const FAQCategories: CollectionConfig = {
  slug: 'faq-categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Controlled categories used to organize service and page FAQs.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
  ],
}
