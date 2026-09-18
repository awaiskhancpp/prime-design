import type { Block } from 'payload'
import {
  buttonGroupFields,
  faqCategoryFields,
  featureCardFields,
  galleryItemFields,
  iconReferenceFields,
  imageTextContentFields,
  linkFields,
  mediaReferenceFields,
  provenanceFields,
} from '../fields/Shared'
import { videoStoryFields } from '../collections/fields/videoStory'

const labels = (singular: string, plural = `${singular}s`) => ({ singular, plural })

const base = (slug: string, singular: string, fields: Block['fields']): Block => ({
  slug,
  labels: labels(singular),
  fields: [...fields, ...provenanceFields()],
})

const text = (name: string, required = false) => ({ name, type: 'text' as const, required })
const description = (name = 'description') => ({ name, type: 'textarea' as const })

export const landingPageBlocks: Block[] = [
  base('hero', 'Hero', [
    text('eyebrow'),
    text('heading', true),
    description(),
    ...mediaReferenceFields('backgroundMedia'),
    // The Bricks hero sections play a looping video behind the copy
    // (`_background.videoUrl`). It used to survive only as a raw WordPress
    // URL inside `sourceMetadata`, which is provenance, not a field — so the
    // video could never be changed from the admin. `asset` is the real
    // uploaded Media document; `sourceUrl` keeps the WordPress origin.
    ...mediaReferenceFields('backgroundVideo'),
    ...mediaReferenceFields('foregroundMedia'),
    ...buttonGroupFields(),
  ]),
  base('cta', 'CTA', [
    text('eyebrow'),
    // Not required: some WordPress CTA sections are a bare button band with
    // no copy at all (`gyrixo` on home-remodeling-information is just a
    // "Schedule A Call" button). The import used to satisfy the requirement
    // by inventing "Ready to get started?" and writing it to the database.
    text('heading'),
    description(),
    ...mediaReferenceFields(),
    ...buttonGroupFields(),
  ]),
  base('image-text', 'Image and Text', imageTextContentFields()),
  // The WordPress "Benefits of …" sections (`d1126c` on the siding page): a
  // section title followed by a staggered row of photo cards, each an image
  // + its own heading + a line of copy, closing with a decorative graphic.
  // Imported as `image-text` before this existed, which collapsed all four
  // cards into one run-on paragraph and kept only an unrelated image.
  base('benefit-cards', 'Benefits Grid', [
    text('eyebrow'),
    text('heading'),
    description(),
    {
      name: 'items',
      type: 'array' as const,
      fields: [
        text('title', true),
        { name: 'body', type: 'textarea' as const },
        ...mediaReferenceFields(),
      ],
    },
    ...mediaReferenceFields('decorativeMedia'),
  ]),
  // The WordPress "Remodel Your Entire Home With Prime Design & Build"
  // section (`crempi` on remodeling-information): a three-column editorial
  // block whose first column carries the eyebrow + heading and one captioned
  // card, the middle column two standalone photos, and the third a second
  // card plus a decorative graphic. `items` are the captioned cards,
  // `images` the uncaptioned photos — they are different things in the
  // source and collapsing them would lose the card copy.
  base('craftsmanship', 'Craftsmanship', [
    text('eyebrow'),
    text('heading'),
    description(),
    {
      name: 'items',
      type: 'array' as const,
      fields: [text('title', true), { name: 'body', type: 'textarea' as const }, ...mediaReferenceFields()],
    },
    { name: 'images', type: 'array' as const, fields: mediaReferenceFields() },
    ...mediaReferenceFields('decorativeMedia'),
  ]),
  base('video', 'Video', [
    text('heading'),
    description(),
    { name: 'source', type: 'select' as const, options: ['media', 'externalUrl'] },
    { name: 'video', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'externalUrl', type: 'text' as const },
    { name: 'poster', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'controls', type: 'checkbox' as const, defaultValue: true },
    text('sourceVideoId'),
    ...videoStoryFields(),
  ]),
  base('gallery', 'Gallery', [
    // The WordPress gallery sections put a small h5 ("Our Gallery") beside
    // the h2. Without a field for it the line was dropped and the renderer
    // printed a hardcoded "Our Gallery" instead.
    text('eyebrow'),
    text('heading'),
    description(),
    { name: 'items', type: 'array' as const, fields: galleryItemFields() },
    {
      name: 'groups',
      type: 'array' as const,
      admin: {
        description:
          'Optional ordered gallery categories from the source page. Do not invent groups.',
      },
      fields: [
        text('label', true),
        text('heading'),
        description(),
        { name: 'items', type: 'array' as const, fields: galleryItemFields() },
      ],
    },
    { name: 'layout', type: 'json' as const },
    { name: 'lightbox', type: 'checkbox' as const, defaultValue: true },
    text('sourceGalleryType'),
  ]),
  base('project-grid', 'Project Grid', [
    text('eyebrow'),
    ...iconReferenceFields('eyebrowIcon'),
    text('heading'),
    description(),
    {
      name: 'items',
      type: 'array' as const,
      fields: [
        text('title', true),
        ...mediaReferenceFields('image'),
        { name: 'link', type: 'group' as const, fields: linkFields() },
      ],
    },
  ]),
  base('before-after', 'Before and After', [
    text('heading'),
    { name: 'beforeMedia', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'afterMedia', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'beforeLabel', type: 'text' as const },
    { name: 'afterLabel', type: 'text' as const },
  ]),
  base('sub-services', 'Sub-services', [
    text('eyebrow'),
    // Some WordPress sub-service groups have no section heading; their first
    // heading is the title of the first card. Do not require or invent one.
    text('heading'),
    description(),
    {
      name: 'items',
      type: 'array' as const,
      fields: [
        text('title', true),
        description(),
        // Body copy for cards whose WordPress content is paragraphs rather
        // than a bullet list (e.g. the Shaker Kitchen feature cards).
        { name: 'body', type: 'textarea' as const },
        // Lead-in line above the bullet list (e.g. "Here's what gives your
        // kitchen a European charm:"). Only some WordPress cards have one.
        text('label'),
        {
          name: 'features',
          type: 'array' as const,
          fields: [{ name: 'text', type: 'text' as const }],
        },
        ...mediaReferenceFields(),
        { name: 'link', type: 'group' as const, fields: linkFields() },
      ],
    },
  ]),
  base('prime-difference', 'Prime Difference', [
    text('eyebrow'),
    text('heading', true),
    description(),
    { name: 'features', type: 'array' as const, fields: featureCardFields() },
    {
      name: 'checklist',
      type: 'array' as const,
      admin: {
        description:
          'Checklist shown in the left column (e.g. the WordPress "Why Choose" list). Do not invent items.',
      },
      fields: [{ name: 'text', type: 'text' as const }],
    },
    {
      name: 'socials',
      type: 'array' as const,
      admin: {
        description:
          'Optional review badges (Google / Yelp / Houzz) shown under the checklist. Only pages whose WordPress section has them should add any.',
      },
      fields: [
        { name: 'image', type: 'text' as const },
        { name: 'url', type: 'text' as const },
      ],
    },
    {
      name: 'comparisons',
      type: 'array' as const,
      admin: {
        description:
          'Before/after pairs shown in this section\'s media column. WordPress authors them as an `xbeforeafterimage` in the Bricks section immediately after this one (siding, outdoor hardscape) — the same split the video carousel uses — so they belong here, not in a section of their own.',
      },
      fields: [
        { name: 'beforeMedia', type: 'upload' as const, relationTo: 'media' as const },
        { name: 'afterMedia', type: 'upload' as const, relationTo: 'media' as const },
        text('beforeLabel'),
        text('afterLabel'),
        text('caption'),
        text('sourceId'),
      ],
    },
    {
      name: 'videos',
      type: 'array' as const,
      admin: {
        description: 'Ordered videos embedded in the WordPress Prime Difference section.',
      },
      fields: [
        { name: 'video', type: 'upload' as const, relationTo: 'media' as const },
        text('externalUrl'),
        { name: 'poster', type: 'upload' as const, relationTo: 'media' as const },
        text('caption'),
        text('sourceVideoId'),
      ],
    },
    ...mediaReferenceFields(),
  ]),
  base('experience-difference', 'Experience Difference', [
    text('eyebrow'),
    text('heading', true),
    description(),
    { name: 'features', type: 'array' as const, fields: featureCardFields() },
    ...mediaReferenceFields(),
  ]),
  base('service-areas', 'Service Areas', [
    text('eyebrow'),
    text('heading', true),
    description(),
    {
      name: 'areas',
      type: 'array' as const,
      fields: [
        text('label', true),
        { name: 'location', type: 'relationship' as const, relationTo: 'locations' as const },
        { name: 'link', type: 'group' as const, fields: linkFields() },
      ],
    },
    // The WordPress section ends with a state map and its caption
    // ("California" over `ca-cities.png`). Without these the image and the
    // heading were dropped on import.
    text('regionHeading'),
    ...mediaReferenceFields('mapMedia'),
  ]),
  base('repair-services', 'Repair Services', [
    text('eyebrow'),
    text('heading', true),
    description(),
    {
      name: 'categories',
      type: 'array' as const,
      fields: [
        // Full WordPress heading (e.g. "Cabinet Repair & Installation") —
        // the section splits it into the gradient first word + heading rest.
        text('title', true),
        // The WordPress accent line above the heading (e.g. "Inspiration
        // starts all around you" on the European Kitchen page).
        text('eyebrow'),
        // The WordPress sub-heading above the bullet list ("Services
        // include:", "We service and install:", "Key benefits:", ...).
        text('label'),
        // Body copy — rich text so formatting is preserved in the editor.
        { name: 'description', type: 'richText' as const },
        {
          name: 'features',
          type: 'array' as const,
          fields: [{ name: 'text', type: 'text' as const }],
        },
        // Optional paragraph(s) after the list (Door, Flooring, Interior).
        { name: 'closingBody', type: 'richText' as const },
        ...mediaReferenceFields(),
        text('sourceId'),
      ],
    },
  ]),
  base('luxury-cta', 'Luxury CTA', [
    text('eyebrow'),
    text('heading', true),
    description(),
    ...mediaReferenceFields(),
    ...buttonGroupFields(),
  ]),
  base('booking', 'Booking', [
    // Most WordPress booking sections are a bare scheduler shortcode with no
    // copy of their own. These stay empty in that case — the section renders
    // without a heading rather than inventing one.
    text('eyebrow'),
    text('heading'),
    // The Bricks `_cssId` (e.g. `contact_form`). The hero and CTA buttons
    // link to `#contact_form`, so without this the section has no anchor
    // and those buttons go nowhere.
    text('anchorId'),
    // What the scheduler says is being booked. WordPress keeps this in
    // LatePoint's own tables (the shortcode only references
    // `selected_service="7"`), and LatePoint tables are not part of the WXR
    // export — so there is no source value to migrate and this is filled in
    // the admin. It is deliberately left empty rather than given a
    // plausible-sounding default.
    text('consultationLabel'),
    text('provider'),
    text('shortcode'),
    text('sourceElementId'),
    { name: 'integrationMetadata', type: 'json' as const },
  ]),
  base('contact-form', 'Contact Form', [
    // The WordPress contact sections carry real copy above the form
    // ("Contact Info" / "Receive a Free Estimate" / the response-time line).
    // Without these fields the renderer fell through to the homepage
    // contact defaults and the page's own copy was lost.
    text('eyebrow'),
    text('heading'),
    description(),
    // The Bricks `_cssId` of the section the form lives in. On the siding
    // page the contact form shares the "Find us" root, and that root carries
    // `contact_form` — the id every "Schedule a Free Consultation" button on
    // the page links to.
    text('anchorId'),
    text('provider'),
    text('shortcode'),
    text('sourceElementId'),
    { name: 'integrationMetadata', type: 'json' as const },
  ]),
  base('find-us', 'Find Us', [
    text('eyebrow'),
    text('heading', true),
    // Bare values only — no "Call Us" / "Email Now" / "Address" captions.
    // The section supplies those labels itself, and a stored value that
    // repeats them renders as "Call Us Call Us (650) 220-9600" and produces
    // a `mailto:` containing the caption.
    text('phone'),
    text('email'),
    { name: 'address', type: 'textarea' as const },
    text('mapUrl'),
  ]),
  base('testimonials', 'Testimonials', [
    text('heading'),
    {
      name: 'providers',
      type: 'array' as const,
      fields: [
        text('name', true),
        text('shortcode'),
        text('collectionId'),
        {
          name: 'reviews',
          type: 'array' as const,
          fields: [
            text('reviewer'),
            { name: 'rating', type: 'number' as const },
            { name: 'body', type: 'textarea' as const },
            { name: 'date', type: 'date' as const },
            text('sourceId'),
          ],
        },
      ],
    },
  ]),
  base('landing-testimonials', 'Landing Testimonials', [
    text('eyebrow'),
    text('heading'),
    description(),
    {
      name: 'providers',
      type: 'array' as const,
      fields: [
        text('name', true),
        text('collectionId'),
        text('reviewUrl'),
        { name: 'rating', type: 'number' as const },
        { name: 'reviewCount', type: 'number' as const },
        {
          name: 'reviews',
          type: 'array' as const,
          fields: [
            text('reviewer'),
            { name: 'rating', type: 'number' as const },
            { name: 'body', type: 'textarea' as const },
            text('date'),
            text('sourceId'),
          ],
        },
      ],
    },
  ]),
  base('faq', 'FAQ', [
    text('heading'),
    description(),
    { name: 'categories', type: 'array' as const, fields: faqCategoryFields() },
  ]),
  base('video-carousel', 'Video Carousel', [
    {
      name: 'items',
      type: 'array' as const,
      fields: [
        { name: 'video', type: 'upload' as const, relationTo: 'media' as const },
        text('externalUrl'),
        { name: 'poster', type: 'upload' as const, relationTo: 'media' as const },
        { name: 'caption', type: 'text' as const },
        text('sourceId'),
        { name: 'sourceOrder', type: 'number' as const },
      ],
    },
    { name: 'settings', type: 'json' as const },
  ]),
  base('gallery-carousel', 'Gallery Carousel', [
    { name: 'items', type: 'array' as const, fields: galleryItemFields() },
    { name: 'settings', type: 'json' as const },
  ]),
]
