import type { CollectionConfig } from 'payload'

export const GalleryCategories: CollectionConfig = {
  slug: 'gallery-categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
  ],
}
