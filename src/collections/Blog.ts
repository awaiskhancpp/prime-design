import type { CollectionConfig } from 'payload'
import { pacificToUtcIso, parseDateParts, validateScheduledDate } from '@/lib/pacificTime'
import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

// Utility to format slugs
const formatSlug = (val: string): string =>
  val
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

export const Blog: CollectionConfig = {
  slug: 'blog',
  // Every save is kept (Version History): compare and restore any of the last 20.
  versions: { maxPerDoc: 20 },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedDate', 'status', 'createdBy', 'updatedBy'],
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          status: {
            equals: 'published',
          },
        }
      }
      return true
    },
  },
  fields: [
    {
      name: 'title',
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
        description: 'Auto-generated from title but editable',
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
    // Kept from the previous BlogPosts collection: needed so the WordPress
    // migration script can be re-run without creating duplicates, and so
    // legacy /blog/<old-slug> URLs can redirect to the right post.
    {
      name: 'wordpressId',
      type: 'number',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Original WordPress post ID — used to make the migration script idempotent.',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Original WordPress URL, for legacy redirects.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Scheduled', value: 'scheduled' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Set to "Scheduled" and pick a go-live time below. A background job publishes it automatically (checked every 6 hours).',
      },
    },
    {
      name: 'scheduledPublishDate',
      type: 'date',
      required: false,
      validate: validateScheduledDate,
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.status === 'scheduled',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'MMM d, yyyy' },
        description:
          'Calendar date to publish (interpreted in US Pacific Time). Must be tomorrow or later.',
      },
    },
    {
      name: 'scheduledPublishSlot',
      type: 'select',
      required: false,
      index: true,
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.status === 'scheduled',
        description:
          'Go-live time slot in US Pacific Time. The scheduler checks every 6 hours, so the post goes live at the next check after this slot.',
      },
      options: [
        { label: '12:00 AM (midnight) PT', value: '0' },
        { label: '6:00 AM PT', value: '6' },
        { label: '12:00 PM (noon) PT', value: '12' },
        { label: '6:00 PM PT', value: '18' },
      ],
    },
    {
      name: 'scheduledPublishAt',
      type: 'date',
      required: false,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: false,
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Auto-set to current date/time on save. Can be manually overridden.',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: false,
      maxLength: 300,
      admin: {
        description:
          'Short summary for the blog listing (150–300 characters). None of the migrated WordPress posts had one — write these after import.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Main blog post image' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Structured sections',
          description:
            'The current blog page design (BlogDetailPage.tsx) renders these blocks — eyebrow, heading, body, and an optional image per section. Use this for the standard post layout.',
          fields: [
            {
              name: 'intro',
              type: 'richText',
              admin: {
                description:
                  'Larger intro shown right under the title. Heading sizes are limited to H2/H3 to match the site type scale.',
              },
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
                ],
              }),
            },
            {
              name: 'sections',
              type: 'array',
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
                { name: 'image', type: 'upload', relationTo: 'media' },
                { name: 'imageAlt', type: 'text' },
                {
                  name: 'imagePosition',
                  type: 'select',
                  defaultValue: 'center',
                  options: ['left', 'right', 'center'],
                },
              ],
            },
          ],
        },
        {
          label: 'Free-form content (optional)',
          description:
            'Optional rich text for posts that don\u2019t fit the eyebrow/heading/body section pattern above — long-form writing, FAQs woven into the body, etc. Heading sizes are limited to H2/H3 to match the site\u2019s type scale (H1 is the post title, and H4\u2013H6 have no styling on the frontend).',
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: false,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
                ],
              }),
            },
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'blog-categories',
      hasMany: true,
      required: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'score',
          type: 'ui',
          admin: {
            components: {
              Field: '/components/admin/SeoScore#SeoScore',
            },
          },
        },
        {
          name: 'meta_title',
          type: 'text',
          required: false,
          admin: {
            description: 'Overrides the default title. Aim for 50–60 characters; source titles are not truncated.',
          },
        },
        {
          name: 'meta_description',
          type: 'textarea',
          required: false,
          admin: {
            description: 'SEO description for search results (150–160 characters recommended; no hard limit).',
          },
        },
        {
          name: 'meta_image',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Social sharing image (OG image). Leave blank to use featured image.',
          },
        },
        { name: 'keywords', type: 'text', required: false },
        { name: 'canonical_url', type: 'text', required: false },
        { name: 'no_index', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'createdBy',
      label: 'Added By',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'updatedBy',
      label: 'Last Updated By',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data, originalDoc }) => {
        if (!req.user) return data

        if (!data.publishedDate && data.status !== 'scheduled') {
          data.publishedDate = new Date().toISOString()
        }

        if (data.status === 'scheduled') {
          const parts = parseDateParts(data.scheduledPublishDate)
          const slot = data.scheduledPublishSlot
          if (parts && (slot === '0' || slot === '6' || slot === '12' || slot === '18')) {
            data.scheduledPublishAt = pacificToUtcIso(
              parts.year,
              parts.month0,
              parts.day,
              Number(slot),
            )
          }
        } else {
          data.scheduledPublishAt = null
        }

        if (!originalDoc || !originalDoc.createdBy) {
          data.createdBy = req.user.id
        }

        data.updatedBy = req.user.id

        return data
      },
    ],
  },
}
