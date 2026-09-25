import type { CollectionConfig } from 'payload'

export const FAQCategories: CollectionConfig = {
  slug: 'faq-categories',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'sortOrder', 'updatedAt'],
    description: 'Controlled categories used to organize service and page FAQs.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      /**
       * The order the categories appear in on /faq.
       *
       * It used to have none, and `resolveFaqIndex` sorted by `title` instead.
       * That is not the same thing: this database's collation is `C.UTF-8`, so
       * a title sort compares raw bytes and puts every capital before every
       * lowercase — which is why "ADU Questions" came out above "About Us
       * Questions", the reverse of the WordPress page. An explicit order also
       * means the sequence is a content decision somebody can change in the
       * admin rather than an accident of how two titles happen to spell.
       */
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lowest first on the FAQ page.' },
    },
  ],
}
