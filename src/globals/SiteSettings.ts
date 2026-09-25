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
      name: 'reviews',
      type: 'group',
      label: 'Reviews',
      admin: {
        description:
          'The "See what people are saying about us" sections. The reviews themselves are the Testimonials collection (mark the ones you want with Featured); these are the platform marks shown beside each review and the headline figures above them.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'googleIcon',
              type: 'upload',
              relationTo: 'media',
              label: 'Google mark',
              admin: {
                width: '50%',
                description: 'Shown on each review whose source is Google.',
              },
            },
            {
              name: 'yelpIcon',
              type: 'upload',
              relationTo: 'media',
              label: 'Yelp mark',
              admin: {
                width: '50%',
                description: 'Shown on each review whose source is Yelp.',
              },
            },
          ],
        },
        { name: 'googleRating', type: 'number', admin: { step: 0.1, description: 'e.g. 4.9' } },
        {
          name: 'googleReviewCount',
          type: 'number',
          admin: { description: 'e.g. 56 — the platform total, not the number of records here.' },
        },
        { name: 'yelpRating', type: 'number', admin: { step: 0.1, description: 'e.g. 4.9' } },
        {
          name: 'yelpReviewCount',
          type: 'number',
          admin: { description: 'e.g. 64' },
        },
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
    {
      name: 'trustIntro',
      type: 'group',
      label: 'Trust Section (Projects page)',
      admin: {
        description:
          'The "Silicon Valley loves working with us!" section as shown on the Projects page. Service pages use their own copy of this section (Services → Silicon Valley Loves).',
      },
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'stats',
          type: 'array',
          fields: [
            { name: 'value', type: 'text' },
            { name: 'label', type: 'text' },
            {
              name: 'showStars',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'buttons',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
            {
              name: 'variant',
              type: 'select',
              defaultValue: 'outline',
              options: [
                { label: 'Outlined', value: 'outline' },
                { label: 'Brass (filled)', value: 'brass' },
              ],
            },
          ],
        },
      ],
    },
    ...SEOFields,
  ],
}
