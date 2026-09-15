import type { Field } from 'payload'

/**
 * Shared SEO field group. Every field carries admin guidance (the numbers
 * the WordPress editors had in Rank Math), and the group renders a live
 * SEO score panel above the inputs.
 */
export const SEOFields: Field[] = [
  {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    admin: {
      description:
        'Search-engine and social-share metadata. Titles and descriptions are migrated from the WordPress Rank Math data — keep them unique per page.',
    },
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
        name: 'metaTitle',
        type: 'text',
        label: 'SEO title',
        admin: {
          description:
            'Shown as the blue link in search results. Aim for 50–60 characters. Leave empty to fall back to the page title plus the site name.',
        },
      },
      {
        name: 'metaDescription',
        type: 'textarea',
        label: 'Meta description',
        admin: {
          description:
            'The snippet under the title in search results. Aim for 120–160 characters.',
        },
      },
      {
        name: 'canonicalUrl',
        type: 'text',
        label: 'Canonical URL',
        admin: {
          description: 'The preferred URL for this page when it can be reached by more than one.',
        },
      },
      {
        name: 'noIndex',
        type: 'checkbox',
        label: 'Hide from search engines (no-index)',
        defaultValue: false,
        admin: {
          description: 'Tick only for pages that should stay out of Google (thank-you pages, duplicates).',
        },
      },
      {
        name: 'ogTitle',
        type: 'text',
        label: 'Social title (OG)',
        admin: {
          description: 'Title used when the page is shared on Facebook/LinkedIn. Empty falls back to the SEO title.',
        },
      },
      {
        name: 'ogDescription',
        type: 'textarea',
        label: 'Social description (OG)',
        admin: {
          description: 'Description used when the page is shared. Empty falls back to the meta description.',
        },
      },
      {
        name: 'ogImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Social share image (OG)',
        admin: {
          description: 'Preview image for social shares. Recommended 1200×630.',
        },
      },
    ],
  },
]
