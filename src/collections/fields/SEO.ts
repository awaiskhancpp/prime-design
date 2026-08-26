import type { Field } from 'payload'

export const SEOFields: Field[] = [
  {
    name: 'seo',
    type: 'group',
    fields: [
      { name: 'metaTitle', type: 'text' },
      { name: 'metaDescription', type: 'textarea' },
      { name: 'canonicalUrl', type: 'text' },
      { name: 'noIndex', type: 'checkbox', defaultValue: false },
      { name: 'ogTitle', type: 'text' },
      { name: 'ogDescription', type: 'textarea' },
      { name: 'ogImage', type: 'upload', relationTo: 'media' },
    ],
  },
]
