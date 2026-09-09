import type { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'sortOrder', 'updatedAt'],
    description: 'Frequently asked questions grouped by remodeling service.',
  },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'richText', required: true },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'faq-categories',
      required: true,
      index: true,
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'visible', type: 'checkbox', defaultValue: true },
  ],
}
