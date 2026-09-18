import type { CollectionConfig } from 'payload'
import { SEOFields } from './fields/SEO'
import { videoStoryFields } from './fields/videoStory'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'location', 'updatedAt'],
    description: 'Completed remodeling and construction projects.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'summary', type: 'textarea' },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description:
          'One or two lines describing this project, shown on the homepage project cards. Card copy — distinct from Summary, which is the longer paragraph on the project page.',
      },
    },
    { name: 'description', type: 'textarea' },
    { name: 'content', type: 'richText' },
    {
      name: 'publishedDate',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'WordPress publish date. /our-projects lists newest first on this field, which is how the WordPress archive orders it.',
      },
    },
    { name: 'location', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'address', type: 'textarea' },
    { name: 'videoUrl', type: 'text' },
    ...videoStoryFields({ prefix: 'video' }),
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured on homepage',
      admin: {
        description:
          'Checked projects are shown on the homepage "Our Latest Remodeling Projects" grid. When none are checked, the six most recent projects are shown instead.',
        position: 'sidebar',
      },
    },
    ...SEOFields,
  ],
}
