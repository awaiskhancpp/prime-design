import type { CollectionConfig, CollectionSlug } from 'payload'
import { SEOFields } from './fields/SEO'
import {
  locationHeroGroup,
  quoteGroup,
  siliconValleyLovesGroup,
  testimonialCardsGroup,
} from './fields/sectionGroups'
import { servicePageBlocks } from '../blocks/LandingPageBlocks'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    group: 'Services',
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
        description:
          'The public name of this service (e.g. "Kitchen Remodeling", "ADU & Garage Conversions")',
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
        description:
          'Optional parent service (for sub-categories like Shaker Kitchen -> Kitchen Remodeling)',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured on homepage',
      admin: {
        position: 'sidebar',
        description:
          'Checked services appear in the homepage "Our Services" carousel, ordered by Sort Order. WordPress features six there; the rest of the catalogue still appears on /services.',
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
      name: 'consultationImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Consultation Card Image',
      admin: {
        position: 'sidebar',
        description:
          'Photo for this service’s card in the Contact consultation list. WordPress used a dedicated image per card, not the service hero — leave empty to fall back to the hero image.',
      },
    },
    {
      /**
       * How long this consultation runs, as the card prints it.
       *
       * Per service rather than per section: an ADU consultation and a
       * bathroom one are not the same appointment, and the number is the
       * kind of thing that changes for one service without changing for the
       * rest. Every card said "~1 Hour" because the resolver hardcoded it.
       */
      name: 'consultationDuration',
      type: 'text',
      label: 'Consultation Duration',
      admin: {
        description:
          'Shown on the Contact page card, e.g. \u201c~1 Hour\u201d. Empty prints no duration badge.',
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
              // Not `landingPageBlocks` — that palette includes landing-only
              // shapes (Benefits Grid, Craftsmanship) which have no place on
              // a service page, and "Benefits Grid" sat confusingly beside
              // this collection's own "Benefits" block.
              blocks: servicePageBlocks,
              admin: {
                description: 'Visual page blocks. Click "Add Block" below to compose your page.',
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
                description:
                  'The services-index card paragraph — the full WordPress copy shown on /services, in search and in the megamenu.',
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              admin: {
                description:
                  'The shorter one-line summary WordPress uses on the homepage "Our Services" cards. Distinct copy from Short Description, not an abbreviation of it.',
              },
            },
            {
              /**
               * The Overview section's own heading.
               *
               * `ServiceOverview` has read `introHeading` all along, but the
               * field existed only in the TypeScript type — there was no
               * Payload field and no column, so it could never be set and
               * every page fell back to "{Service title} — expanding your
               * living space". That fallback is invented copy, and it is
               * wrong on the two pages that say something else: the ADU page
               * reads "Accessory Dwelling Units (ADUs) - Expanding Your
               * Living Space" and the Additions page "Home Additions -
               * Enhancing Your Living Space".
               */
              name: 'introHeading',
              type: 'text',
              label: 'Overview heading',
              admin: {
                description:
                  'Heading above the overview photos, e.g. "Accessory Dwelling Units (ADUs) - Expanding Your Living Space". Empty falls back to the service title.',
              },
            },
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Featured image',
              admin: {
                description:
                  'The photo used when this service is shown as a card (homepage "Our Services"). WordPress picks a different image here from the page hero; falls back to the hero image when empty.',
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
                {
                  name: 'overviewImages',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  label: 'Overview photos',
                  admin: {
                    description:
                      'The project photos stacked beside the overview lists (WordPress puts two in this section). Falls back to the hero image + first gallery shots when empty.',
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
              name: 'craftsmanshipImages',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Craftsmanship photos',
              admin: {
                description:
                  'The two photos in the "Craftsmanship That Transforms" section (large + small overlap). The section renders without a photo when empty — nothing is substituted.',
              },
            },
            {
              name: 'craftsmanshipCta',
              type: 'group',
              label: 'Craftsmanship Section Button',
              admin: {
                description: 'Button under the craftsmanship copy. Leave empty for no button.',
              },
              fields: [
                { name: 'label', type: 'text' },
                { name: 'href', type: 'text' },
              ],
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
            locationHeroGroup({
              label: 'Location Hero Copy',
              description:
                'Hero copy above the quote form on this service’s city pages. WordPress keeps it on the family template (kitchen/bathroom/home) rather than per city, so this is the default all 45 city pages inherit. Use {City} for the city name and {Company} for the company name — both are substituted when the page renders. A city can override any field on its own record.',
            }),
            quoteGroup({
              label: 'Quote Section',
              description: 'Structured "Crafting Your Dream Home, Our Promise" pull-quote section.',
            }),
            siliconValleyLovesGroup({
              label: 'Silicon Valley Loves Section',
              description:
                'The trust section ("Silicon Valley loves working with us!"), rendered with the projects-page design. City pages use it wherever their own copy of this section is empty.',
            }),
            {
              name: 'whyChooseUs',
              type: 'group',
              label: 'Why Choose Us Section',
              admin: {
                description:
                  'Structured "Why Choose Prime Design & Build?" section (heading + items). Empty falls back to the built-in content.',
              },
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text' },
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
              name: 'realHomes',
              type: 'group',
              label: 'Real Homes Stories Section',
              admin: {
                description:
                  'Structured "Real Homes, Real Stories" section (heading + testimonial cards + CTA). Empty falls back to the built-in content.',
              },
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'heading', type: 'text' },
                { name: 'headingAccent', type: 'text' },
                { name: 'description', type: 'textarea' },
                {
                  name: 'testimonials',
                  type: 'array',
                  fields: [
                    { name: 'quote', type: 'textarea', required: true },
                    { name: 'attribution', type: 'text', required: true },
                  ],
                },
                {
                  name: 'cta',
                  type: 'group',
                  fields: [
                    { name: 'label', type: 'text' },
                    { name: 'href', type: 'text' },
                  ],
                },
              ],
            },
            {
              name: 'areasWeService',
              type: 'group',
              label: 'Areas We Service Section',
              admin: {
                description:
                  'Structured "Areas we service" section (heading only; cities are linked from service-locations).',
              },
              fields: [{ name: 'heading', type: 'text' }],
            },
            {
              name: 'locationFeatureImages',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              maxRows: 3,
              label: 'Location Page Feature Images',
              admin: {
                description:
                  'The three photos beside the hero blurbs on this service’s city pages. WordPress sets them on the family template (kitchen/bathroom/home), not per city. Empty falls back to the service gallery, which is what made every city page show the wrong photos.',
              },
            },
            {
              name: 'galleryImages',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Gallery Images',
              admin: {
                description:
                  'Photos shown in the gallery section. Empty falls back to the built-in gallery.',
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
                  name: 'imageSecondary',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Optional second hero image. When set (and no hero video), the hero crossfades between the two images with prev/next arrows — the same pair-slider design as the pages hero.',
                  },
                },
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
                        description:
                          'Image path (files live in /public, e.g. "/craftsmanship-in-every-project.svg").',
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
                  fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
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
                { name: 'image', type: 'upload', relationTo: 'media' },
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
            testimonialCardsGroup({
              label: 'Testimonial Cards Section',
              description: 'Three testimonial cards — the Shaker Kitchen page testimonial grid.',
              testimonialsDescription:
                'The testimonials to show, in order. The first is the large dark card.',
            }),
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
                    { name: 'image', type: 'upload', relationTo: 'media' },
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'textarea' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'FAQs & SEO',
          description: 'Which questions the FAQ section shows, and search engine metadata.',
          fields: [
            {
              // Replaces a hardcoded slug → category map in `lib/faq.server.ts`
              // and a `faqs` relationship nothing read. The questions
              // themselves live in the FAQs collection, under this category.
              name: 'faqCategory',
              type: 'relationship',
              relationTo: 'faq-categories',
              label: 'FAQ category',
              admin: {
                description:
                  'The FAQ section on this page lists every question in this category, in its own order. Empty hides the section.',
              },
            },
            ...SEOFields,
          ],
        },
      ],
    },
  ],
}
