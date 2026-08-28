import { CollectionConfig } from 'payload'
import { revalidateCollection } from '@/lib/revalidate'

// Utility function to format slugs
const formatSlug = (val: string): string =>
  val
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

export const BlogCategories: CollectionConfig = {
  slug: 'blog-categories',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'slug', 'status', 'createdBy', 'updatedBy'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => {
            if (value && !siblingData.slug) {
              siblingData.slug = formatSlug(value)
            }
            return value
          },
        ],
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from the category name but editable if needed',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (value) return formatSlug(value)
            return value
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'createdBy',
      label: 'Added By',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'updatedBy',
      label: 'Last Updated By',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ req, data, originalDoc }) => {
        if (!req.user) return data

        if (!originalDoc || !originalDoc.createdBy) {
          data.createdBy = req.user.id
        }

        data.updatedBy = req.user.id

        return data
      },
    ],
    afterChange: [() => revalidateCollection('recent-blog-posts')],
  },
}
