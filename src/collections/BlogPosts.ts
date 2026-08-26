import type { CollectionConfig } from 'payload'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'publishedAt', 'updatedAt'],
    description: 'Long-form articles used by the blog listing and detail pages.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'categories', type: 'array', minRows: 1, fields: [{ name: 'label', type: 'text', required: true }] },
    { name: 'author', type: 'text', required: true },
    { name: 'publishedAt', type: 'date', required: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'intro', type: 'textarea' },
    {
      name: 'sections',
      type: 'array',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'imageAlt', type: 'text' },
        { name: 'imagePosition', type: 'select', defaultValue: 'center', options: ['left', 'right', 'center'] },
      ],
    },
  ],
}
