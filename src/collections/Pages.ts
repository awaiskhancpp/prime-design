import type { CollectionConfig } from 'payload'
import { PageBlocks } from './blocks/PageBlocks'
import { SEOFields } from './fields/SEO'
import { buttonTextField, linkUrlField } from '../fields/Shared'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isGoogleAdsPage', 'updatedAt'],
    description: 'CMS-managed pages rendered by the shared page route.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      /**
       * A page's hero is one of two things, never both: pages built from
       * sections (home, about, contact, FAQ, gallery, testimonials) open with a
       * Hero section in their layout, and pages with a purpose-built body
       * (blog, services, our projects, privacy policy, thank you, customer
       * cabinet) take it from this group. No record uses both, but every page
       * used to show both, so an editor on the homepage saw a Hero group that
       * did nothing. It is hidden whenever the layout has a Hero section.
       *
       * Not merged into one field on purpose: the group's description is
       * plain text (seed scripts write it as a string), and the section's is
       * rich text (the About and FAQ heroes carry bold and italic), so either
       * direction would break a script or lose formatting.
       */
      name: 'hero',
      type: 'group',
      admin: {
        description:
          'This page’s hero. (Pages that open with a Hero section in the layout use that instead, and this group is hidden.)',
        condition: (data) =>
          !(Array.isArray(data?.layout) ? data.layout : []).some(
            (block: { blockType?: string }) => block?.blockType === 'hero',
          ),
      },
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'cta',
          type: 'group',
          fields: [buttonTextField('label'), linkUrlField('href')],
        },
      ],
    },
    { name: 'layout', type: 'blocks', blocks: PageBlocks },
    {
      name: 'isGoogleAdsPage',
      type: 'checkbox',
      defaultValue: false,
      label: 'Google Ads Page',
    },
    ...SEOFields,
  ],
}
