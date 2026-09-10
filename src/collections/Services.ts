import type { Block, CollectionConfig, CollectionSlug } from 'payload'
import { SEOFields } from './fields/SEO'
import { landingPageBlocks } from '../blocks/LandingPageBlocks'

const textItems = (name = 'items') => ({
  name,
  type: 'array' as const,
  fields: [{ name: 'text', type: 'textarea' as const, required: true }],
})

const imageField = { name: 'image', type: 'upload' as const, relationTo: 'media' as const }

export const serviceContentBlocks: Block[] = [
  {
    slug: 'intro',
    labels: { singular: 'Intro', plural: 'Intro' },
    fields: [
      { name: 'eyebrow', type: 'text', required: false },
      { name: 'heading', type: 'text', required: true },
      { name: 'body', type: 'textarea', required: true },
      imageField,
      { name: 'imageSide', type: 'select', defaultValue: 'right', options: ['left', 'right'] },
    ],
  },
  {
    slug: 'feature-list',
    labels: { singular: 'Feature List', plural: 'Feature Lists' },
    fields: [{ name: 'heading', type: 'text', required: true }, textItems()],
  },
  {
    slug: 'benefits',
    labels: { singular: 'Benefits', plural: 'Benefits' },
    fields: [{ name: 'heading', type: 'text', required: true }, textItems()],
  },
  {
    slug: 'process',
    labels: { singular: 'Process', plural: 'Processes' },
    fields: [
      { name: 'heading', type: 'text', required: true },
      {
        name: 'steps',
        type: 'array',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          imageField,
        ],
      },
    ],
  },
  {
    slug: 'image-text',
    labels: { singular: 'Image and Text', plural: 'Image and Text' },
    fields: [
      { name: 'eyebrow', type: 'text' },
      { name: 'heading', type: 'text', required: true },
      { name: 'body', type: 'textarea', required: true },
      imageField,
      { name: 'imageSide', type: 'select', defaultValue: 'left', options: ['left', 'right'] },
    ],
  },
  {
    slug: 'gallery',
    labels: { singular: 'Gallery', plural: 'Galleries' },
    fields: [
      { name: 'heading', type: 'text' },
      { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    ],
  },
  {
    slug: 'sub-services',
    labels: { singular: 'Sub-services', plural: 'Sub-services' },
    fields: [
      { name: 'heading', type: 'text', required: true },
      {
        name: 'items',
        type: 'array',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          imageField,
          { name: 'link', type: 'text' },
        ],
      },
    ],
  },
  {
    slug: 'video',
    labels: { singular: 'Video', plural: 'Videos' },
    fields: [
      { name: 'heading', type: 'text' },
      {
        name: 'video',
        type: 'upload',
        relationTo: 'media',
        admin: {
          description: 'Optional uploaded video. If empty, the external video URL can be used.',
        },
      },
      { name: 'videoUrl', type: 'text' },
      { name: 'poster', type: 'upload', relationTo: 'media' },
    ],
  },
  {
    slug: 'icon-feature-list',
    labels: {
      singular: 'Feature List with Titles (e.g. "The Power of Customization")',
      plural: 'Feature Lists with Titles',
    },
    fields: [
      { name: 'heading', type: 'text', required: true },
      { name: 'intro', type: 'textarea' },
      imageField,
      { name: 'imageSide', type: 'select', defaultValue: 'left', options: ['left', 'right'] },
      {
        name: 'items',
        type: 'array',
        minRows: 1,
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
        ],
      },
    ],
  },
  {
    slug: 'checklist',
    labels: { singular: 'Feature Checklist (image + checklist)', plural: 'Feature Checklists' },
    fields: [
      { name: 'eyebrow', type: 'text' },
      { name: 'heading', type: 'text', required: true },
      {
        name: 'description',
        type: 'text',
        admin: {
          description:
            'Short italic lead-in line above the checklist, e.g. "Unleash the Beauty and Durability:"',
        },
      },
      imageField,
      { name: 'imageSide', type: 'select', defaultValue: 'left', options: ['left', 'right'] },
      textItems(),
    ],
  },
  {
    slug: 'quote',
    labels: { singular: 'Quote', plural: 'Quotes' },
    fields: [
      { name: 'quote', type: 'textarea', required: true },
      { name: 'attribution', type: 'text' },
    ],
  },
]

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'featured', 'sortOrder'],
    description:
      'Reusable remodeling and construction services shared by service and location pages.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The public name of this service (e.g. "Kitchen Remodeling", "ADU & Garage Conversions")',
      },
    },
    // Sidebar fields (metadata & publication settings)
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL slug (e.g. "kitchen-remodeling")',
      },
    },
    {
      name: 'parentService',
      type: 'relationship',
      relationTo: 'services' as CollectionSlug,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Optional parent service (for sub-categories like Shaker Kitchen -> Kitchen Remodeling)',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Highlight this service in featured sections and navigation',
      },
    },
    {
      name: 'showInConsultationForm',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show in Consultation Form',
      admin: {
        position: 'sidebar',
        description: 'Include in the service dropdown on booking and consultation forms',
      },
    },
    {
      name: 'consultationLabel',
      type: 'text',
      label: 'Consultation Label',
      admin: {
        position: 'sidebar',
        description:
          'Appointment name shown in the Contact consultation list — pre-filled with "{Service} Consultation". Empty falls back to that automatically.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order in navigation and menus (lower numbers first)',
      },
    },

    // Legacy migration fields (hidden from admin UI, but kept before tabs to preserve Drizzle table naming order)
    {
      name: 'sectionOrder',
      type: 'array',
      admin: {
        condition: () => false,
      },
      fields: [
        {
          name: 'section',
          type: 'select',
          required: true,
          options: [
            'hero',
            'intro',
            'video',
            'process',
            'offerings',
            'gallery',
            'quote',
            'craftsmanship',
            'real-homes',
            'why-choose-us',
            'faq',
            'estimate',
            'reviews',
            'silicon-valley-loves',
            'home-repair-categories',
            'contact',
          ],
        },
      ],
    },
    {
      name: 'contentBlocks',
      type: 'blocks',
      blocks: serviceContentBlocks,
      admin: {
        condition: () => false,
      },
    },

    // Main workspace organized in tabs
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Page Builder (Sections)',
          description:
            'Active sections that build the public page. Add, edit, or drag to reorder visual blocks (Hero, Process, Sub-services, Image & Text, Craftsmanship, Testimonials, Form, etc.).',
          fields: [
            {
              name: 'sections',
              type: 'blocks',
              blocks: landingPageBlocks,
              admin: {
                description:
                  'Visual page blocks. Click "Add Block" below to compose your page.',
              },
            },
          ],
        },
        {
          label: 'Overview & Hero Fallback',
          description:
            'General copy and hero fallback. Used in preview cards, directory listings, and when no hero block is in sections.',
          fields: [
            {
              name: 'shortDescription',
              type: 'textarea',
              admin: {
                description: 'Brief summary displayed in service cards, search, and megamenu.',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Full overview text describing this service.',
              },
            },
            {
              name: 'overview',
              type: 'group',
              label: 'Overview Lists (Key Features, Benefits, Process)',
              admin: {
                description:
                  'Rich text versions of the overview lists. When filled, they replace the built-in Key Features / Benefits / Process lists on the service page.',
              },
              fields: [
                {
                  name: 'keyFeatures',
                  type: 'richText',
                  label: 'Key Features',
                  admin: {
                    description:
                      'Bullet list of key features shown under the "Key Features" heading. Use bullet points; each line becomes one feature.',
                  },
                },
                {
                  name: 'benefits',
                  type: 'richText',
                  label: 'Benefits',
                  admin: {
                    description:
                      'Bullet list shown under the "Benefits of [Service]" heading. Use bullet points.',
                  },
                },
                {
                  name: 'process',
                  type: 'richText',
                  label: 'Process Steps',
                  admin: {
                    description:
                      'Numbered steps shown under the "Process" heading (only on pages that display the inline process). Use a numbered list.',
                  },
                },
              ],
            },
            {
              name: 'craftsmanship',
              type: 'richText',
              label: 'Craftsmanship Section',
              admin: {
                description:
                  'Optional "Craftsmanship That Transforms" split-image section shown below the process section. Use an H2 heading followed by body paragraphs.',
              },
            },
            {
              name: 'clientApproach',
              type: 'richText',
              label: 'Client-Centered Approach Section',
              admin: {
                description:
                  'Optional "A Client-Centered Approach to Home Remodeling" section shown below the estimate CTA. Use an H2 heading, a paragraph, and a numbered list of steps.',
              },
            },
            {
              name: 'clientApproachImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Client-Centered Approach Image',
              admin: {
                description:
                  'Side image shown next to the "A Client-Centered Approach" section (phone mockup). Falls back to the built-in image when empty.',
              },
            },
            {
              name: 'process',
              type: 'group',
              label: 'Process Section',
              admin: {
                description:
                  'Structured "We make it easy for you" process section (header + numbered steps with images).',
              },
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'title', type: 'text' },
                { name: 'description', type: 'textarea' },
                {
                  name: 'steps',
                  type: 'array',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'textarea', required: true },
                    { name: 'image', type: 'upload', relationTo: 'media' },
                  ],
                },
              ],
            },
            {
              name: 'quote',
              type: 'group',
              label: 'Quote Section',
              admin: {
                description: 'Structured "Crafting Your Dream Home, Our Promise" pull-quote section.',
              },
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'quote', type: 'textarea' },
                { name: 'attribution', type: 'text' },
                { name: 'image', type: 'upload', relationTo: 'media' },
              ],
            },
            {
              name: 'siliconValleyLoves',
              type: 'group',
              label: 'Silicon Valley Loves Section',
              admin: {
                description: 'Structured "Silicon Valley Loves Working With Us!" section.',
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
                    { name: 'detail', type: 'text' },
                  ],
                },
              ],
            },
            {
              name: 'areasWeService',
              type: 'group',
              label: 'Areas We Service Section',
              admin: {
                description: 'Structured "Areas we service" section (heading only; cities are linked from service-locations).',
              },
              fields: [
                { name: 'heading', type: 'text' },
              ],
            },
            {
              name: 'galleryImages',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Gallery Images',
              admin: {
                description: 'Photos shown in the gallery section. Empty falls back to the built-in gallery.',
              },
            },
            {
              name: 'hero',
              type: 'group',
              label: 'Hero Banner Fallback',
              admin: {
                description: 'Top banner copy and background media.',
              },
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text' },
                { name: 'lead', type: 'textarea' },
                { name: 'image', type: 'upload', relationTo: 'media' },
                {
                  name: 'video',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Optional uploaded background video. Use this instead of an external video URL when available.',
                  },
                },
                {
                  name: 'buttons',
                  type: 'array',
                  admin: {
                    description:
                      'Hero call-to-action buttons. Empty falls back to the built-in pair.',
                  },
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'url', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'primeKitchens',
              type: 'group',
              label: 'Prime Kitchens Difference Section',
              admin: {
                description:
                  '"Why Choose Prime Kitchens? / The Prime Difference" three-card section (European & Custom Kitchen pages).',
              },
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'title', type: 'text' },
                { name: 'description', type: 'textarea' },
                { name: 'passionHeading', type: 'text' },
                {
                  name: 'cards',
                  type: 'array',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    {
                      name: 'image',
                      type: 'text',
                      admin: {
                        description: 'Image path (files live in /public, e.g. "/craftsmanship-in-every-project.svg").',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'iconChecklistGallery',
              type: 'group',
              label: 'Icon Checklist Gallery Section',
              admin: {
                description:
                  '"Discover Your Signature Style" — icon cards with a photo gallery (Custom Kitchen page).',
              },
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text' },
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    {
                      name: 'icon',
                      type: 'text',
                      admin: {
                        description: 'WordPress themify icon name (e.g. "ti-heart").',
                      },
                    },
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'textarea' },
                  ],
                },
                {
                  name: 'images',
                  type: 'array',
                  fields: [
                    {
                      name: 'url',
                      type: 'text',
                      admin: {
                        description: 'Image URL (original WordPress URL or a /public path).',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'imageChecklist',
              type: 'group',
              label: 'Image Checklist Section',
              admin: {
                description:
                  '"The Power of Customization" — side image with a checklist (Custom Kitchen page).',
              },
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text' },
                { name: 'description', type: 'textarea' },
                { name: 'image', type: 'text' },
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'textarea' },
                  ],
                },
              ],
            },
            {
              name: 'testimonialCards',
              type: 'group',
              label: 'Testimonial Cards Section',
              admin: {
                description:
                  'Three review cards (name + quote + avatar) — the Shaker Kitchen page testimonial grid.',
              },
              fields: [
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'quote', type: 'textarea' },
                    { name: 'avatar', type: 'text' },
                  ],
                },
              ],
            },
            {
              name: 'materialsShowcase',
              type: 'group',
              label: 'Materials Showcase Section',
              admin: {
                description:
                  '"Materials Crafted to Perfection" — four-card materials grid (Custom Kitchen page).',
              },
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text' },
                { name: 'description', type: 'textarea' },
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    { name: 'image', type: 'text' },
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'textarea' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO & Relations',
          description: 'Search engine metadata and related pages.',
          fields: [
            {
              name: 'faqs',
              type: 'relationship',
              relationTo: 'faqs',
              hasMany: true,
              admin: { description: 'Select FAQs relevant to this service' },
            },
            {
              name: 'relatedServices',
              type: 'relationship',
              relationTo: 'services' as CollectionSlug,
              hasMany: true,
              admin: { description: 'Select services to recommend alongside this one' },
            },
            ...SEOFields,
          ],
        },
      ],
    },
  ],
}
