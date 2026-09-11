import type { GlobalConfig } from 'payload'
import { SEOFields } from '@/collections/fields/SEO'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  fields: [
    {
      name: 'topBanner',
      type: 'group',
      label: 'Top Banner',
      admin: {
        description: 'The thin bar above the header showing location, contact info, and hours.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show top banner',
        },
      ],
    },
    {
      name: 'company',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'emailLink', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'phoneClean', type: 'text' },
        { name: 'phoneCta', type: 'text' },
        { name: 'license', type: 'text' },
        {
          name: 'hours',
          type: 'text',
          admin: { description: 'Working hours line, e.g. "Open: 8am - 6pm (Mon - Fri)".' },
        },
        {
          name: 'mapsUrl',
          type: 'text',
          label: 'Google Maps link',
          admin: {
            description:
              'Where the location text in the top banner links to — your Google Business Profile / Maps listing URL.',
          },
        },
        {
          name: 'addresses',
          type: 'array',
          fields: [
            { name: 'address', type: 'text' },
            {
              name: 'link',
              type: 'text',
              admin: {
                description:
                  'Optional link for this address (e.g. the Google Business profile). Leave empty for a plain-text address.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'googleBusiness', type: 'text' },
        { name: 'yelp', type: 'text' },
        { name: 'houzz', type: 'text' },
        { name: 'bbb', type: 'text' },
      ],
    },
    {
      name: 'serviceAreas',
      type: 'array',
      fields: [{ name: 'location', type: 'relationship', relationTo: 'locations' }],
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
    },
    ...SEOFields,
  ],
}
