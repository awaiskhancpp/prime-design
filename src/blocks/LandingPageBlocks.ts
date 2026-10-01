import type { Block } from 'payload'
import {
  buttonGroupFields,
  faqCategoryFields,
  faqOrderField,
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
  admin: {
    // Every section row in the page builder is labelled with its own heading
    // instead of "Cta 12" — see the component for why. Applied here rather
    // than per block so a new block gets it for free.
    components: { Label: '/components/admin/BlockRowLabel#BlockRowLabel' },
  },
  fields: [...fields, ...provenanceFields()],
})

const INHERITS_NOTE_TEXT = 'Empty uses Shared Sections (Settings).'

/**
 * Migration provenance and integration plumbing (WordPress ids, LatePoint
 * shortcodes, raw Bricks layout JSON). Kept in the data — the import and the
 * renderers read some of it — but hidden in the admin, where it only got in
 * the way of the fields an editor actually changes.
 */
const internal = <T extends Record<string, unknown>>(field: T): T => ({
  ...field,
  admin: { ...((field.admin as Record<string, unknown>) ?? {}), hidden: true },
})

const text = (name: string, required = false) => ({ name, type: 'text' as const, required })
const description = (name = 'description') => ({ name, type: 'textarea' as const })

/**
 * Blocks that exist only for the Google Ads landing pages.
 *
 * `landingPageBlocks` is shared with the Services collection's page builder,
 * so anything added to it also appears in every service page's "Add Block"
 * list. These two are landing-page shapes — and `benefit-cards` would sit
 * next to the Services collection's own "Benefits" block, two entries with
 * near-identical names — so they are kept out of `servicePageBlocks` below.
 */
const LANDING_ONLY_BLOCK_SLUGS = new Set(['benefit-cards', 'craftsmanship'])

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
    // Rich text, not a textarea: the free-estimate band's copy is
    // "Contact us here or reach us at (650) 235-4863" — two links in one
    // sentence, which plain text cannot carry.
    { name: 'description', type: 'richText' as const },
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
      fields: [
        text('title', true),
        { name: 'body', type: 'textarea' as const },
        ...mediaReferenceFields(),
      ],
    },
    { name: 'images', type: 'array' as const, fields: mediaReferenceFields() },
    ...mediaReferenceFields('decorativeMedia'),
  ]),
  base('video', 'Video', [
    // The WordPress video sections carry a small line above the heading
    // ("#1 Kitchen Remodeling Company in Silicon Valley"). With no field for
    // it the import put that line in `description`, where it rendered as body
    // copy under the heading, and the eyebrow the section does show came from
    // a hardcoded per-service table in `ServiceVideoSection` instead.
    text('eyebrow'),
    text('heading'),
    description(),
    { name: 'source', type: 'select' as const, options: ['media', 'externalUrl'] },
    { name: 'video', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'externalUrl', type: 'text' as const },
    { name: 'poster', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'controls', type: 'checkbox' as const, defaultValue: true },
    internal(text('sourceVideoId')),
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
    internal({ name: 'layout', type: 'json' as const }),
    { name: 'lightbox', type: 'checkbox' as const, defaultValue: true },
    internal(text('sourceGalleryType')),
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
    // The pair of calls to action beside the heading. WordPress puts two
    // buttons on these sections ("View our gallery" / "Talk to an expert")
    // and the block had nowhere to keep them, so they never rendered.
    // Two named slots rather than a repeatable array: the section's layout
    // is a primary and a secondary action, not an open-ended row.
    {
      name: 'primaryCta',
      type: 'group' as const,
      label: 'Primary button',
      fields: [text('label'), text('href')],
    },
    {
      name: 'secondaryCta',
      type: 'group' as const,
      label: 'Secondary button',
      fields: [text('label'), text('href')],
    },
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
    { ...text('eyebrow'), admin: { description: INHERITS_NOTE_TEXT } },
    { ...text('heading'), admin: { description: INHERITS_NOTE_TEXT } },
    description(),
    {
      name: 'features',
      type: 'array' as const,
      fields: featureCardFields(),
      admin: { description: INHERITS_NOTE_TEXT },
    },
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
          "Before/after pairs shown in this section's media column. WordPress authors them as an `xbeforeafterimage` in the Bricks section immediately after this one (siding, outdoor hardscape) — the same split the video carousel uses — so they belong here, not in a section of their own.",
      },
      fields: [
        { name: 'beforeMedia', type: 'upload' as const, relationTo: 'media' as const },
        { name: 'afterMedia', type: 'upload' as const, relationTo: 'media' as const },
        text('beforeLabel'),
        text('afterLabel'),
        text('caption'),
        internal(text('sourceId')),
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
        internal(text('sourceVideoId')),
      ],
    },
    ...mediaReferenceFields(),
  ]),
  base('experience-difference', 'Experience Difference', [
    { ...text('eyebrow'), admin: { description: INHERITS_NOTE_TEXT } },
    { ...text('heading'), admin: { description: INHERITS_NOTE_TEXT } },
    description(),
    {
      name: 'features',
      type: 'array' as const,
      fields: featureCardFields(),
      admin: { description: INHERITS_NOTE_TEXT },
    },
    ...mediaReferenceFields(),
  ]),
  base('service-areas', 'Service Areas', [
    { ...text('eyebrow'), admin: { description: INHERITS_NOTE_TEXT } },
    { ...text('heading'), admin: { description: INHERITS_NOTE_TEXT } },
    description(),
    {
      name: 'areas',
      type: 'array' as const,
      admin: { description: INHERITS_NOTE_TEXT },
      fields: [
        text('label', true),
        { name: 'location', type: 'relationship' as const, relationTo: 'locations' as const },
        { name: 'link', type: 'group' as const, fields: linkFields() },
      ],
    },
    // The WordPress section ends with a state map and its caption
    // ("California" over `ca-cities.png`). Without these the image and the
    // heading were dropped on import.
    { ...text('regionHeading'), admin: { description: INHERITS_NOTE_TEXT } },
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
        internal(text('sourceId')),
      ],
    },
  ]),
  base('luxury-cta', 'Luxury CTA', [
    text('eyebrow'),
    { ...text('heading'), admin: { description: INHERITS_NOTE_TEXT } },
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
    internal(text('provider')),
    internal(text('shortcode')),
    internal(text('sourceElementId')),
    internal({ name: 'integrationMetadata', type: 'json' as const }),
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
    internal(text('provider')),
    internal(text('shortcode')),
    internal(text('sourceElementId')),
    internal({ name: 'integrationMetadata', type: 'json' as const }),
  ]),
  base('find-us', 'Find Us', [
    text('eyebrow'),
    { ...text('heading'), admin: { description: INHERITS_NOTE_TEXT } },
    // Bare values only — no "Call Us" / "Email Now" / "Address" captions.
    // The section supplies those labels itself, and a stored value that
    // repeats them renders as "Call Us Call Us (650) 235-4863" and produces
    // a `mailto:` containing the caption.
    //
    // Empty uses Site Settings (company phone, email, office addresses): all
    // seven landing pages stored the same copy of those, so a new number
    // meant eight edits. Fill a field only for a page that should differ.
    {
      name: 'phone',
      type: 'text' as const,
      admin: { description: 'Empty uses the phone number in Site Settings.' },
    },
    {
      name: 'email',
      type: 'text' as const,
      admin: { description: 'Empty uses the email in Site Settings.' },
    },
    {
      name: 'address',
      type: 'textarea' as const,
      admin: { description: 'One office per line. Empty uses the addresses in Site Settings.' },
    },
    // Where the offices sit on the map under the cards. The map used to be a
    // Google Maps embed addressed by the first line of `address`, which meant
    // Google re-geocoded a postal address on every page load and the section
    // carried no coordinates of its own. These are real fields now, filled
    // from the addresses above and editable in the admin.
    {
      name: 'mapPins',
      type: 'array' as const,
      labels: labels('Map pin'),
      admin: {
        description:
          'One pin per office on the map below the cards. Leave empty and the map is not shown; the addresses above still are.',
      },
      fields: [
        {
          type: 'row' as const,
          fields: [
            {
              name: 'latitude',
              type: 'number' as const,
              admin: {
                width: '50%',
                step: 0.000001,
                description: 'Decimal degrees, north positive. Campbell is around 37.287.',
              },
            },
            {
              name: 'longitude',
              type: 'number' as const,
              admin: {
                width: '50%',
                step: 0.000001,
                description:
                  'Decimal degrees, east positive — so west of Greenwich is negative (-121.94).',
              },
            },
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
        internal(text('collectionId')),
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
            internal(text('sourceId')),
          ],
        },
      ],
    },
  ]),
  base('faq', 'FAQ', [
    text('heading'),
    description(),
    {
      name: 'categories',
      type: 'array' as const,
      // `faqOrder` names the page's questions, in the page's order, from the
      // FAQs collection — the same record /faq shows. The inline
      // `questions` array is only for a question that exists nowhere else.
      fields: [...faqCategoryFields(), faqOrderField()],
    },
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
        internal(text('sourceId')),
        internal({ name: 'sourceOrder', type: 'number' as const }),
      ],
    },
    internal({ name: 'settings', type: 'json' as const }),
  ]),
  base('gallery-carousel', 'Gallery Carousel', [
    { name: 'items', type: 'array' as const, fields: galleryItemFields() },
    internal({ name: 'settings', type: 'json' as const }),
  ]),
]

/**
 * The block palette offered on service pages: everything the landing pages
 * have, minus the landing-only shapes. Keeping this a filtered view (rather
 * than a second hand-maintained list) means a block added for landing pages
 * never silently appears in the Services admin again.
 */
/**
 * Not offered on service pages at all: the service hero is the collection's
 * own Hero group (`ServiceHero` renders it). Every service used to carry a
 * `hero` block as well — a stale copy of the same heading, copy and buttons
 * that nothing rendered (`ServiceDetailPage` filtered it out), so an edit to
 * it did nothing.
 */
const LANDING_ONLY_ON_SERVICES = new Set([...LANDING_ONLY_BLOCK_SLUGS, 'hero'])

/**
 * Table names these four blocks already have in the services schema.
 *
 * The Services collection used to have a second, hidden block list
 * (`contentBlocks`) that reused the slugs `gallery`, `image-text`,
 * `sub-services` and `video` with different fields. Payload stores one table
 * per block slug per collection, so it gave these Page Builder blocks their own
 * `…_2` tables and left the plain names to the hidden list. With that list
 * gone the default names would be the plain ones again, which a migration can
 * only reach by dropping the `_2` tables and their rows. Pinning the names
 * keeps the data exactly where it is.
 */
const SERVICE_BLOCK_TABLES: Record<string, string> = {
  gallery: 'services_blocks_gallery_2',
  'image-text': 'services_blocks_image_text_2',
  'sub-services': 'services_blocks_sub_services_2',
  video: 'services_blocks_video_2',
}

/**
 * Landing pages fill these blocks' empty fields from Shared Sections; service
 * pages do not, so on a service page the fields keep their original meaning:
 * no "Empty uses Shared Sections" note, and the heading stays required.
 */
const SHARED_ON_LANDING_ONLY = new Set([
  'prime-difference',
  'experience-difference',
  'service-areas',
  'luxury-cta',
  'find-us',
])
const INHERITS_NOTE = INHERITS_NOTE_TEXT
const withoutSharedDefaults = (block: Block): Block =>
  SHARED_ON_LANDING_ONLY.has(block.slug)
    ? {
        ...block,
        fields: block.fields.map((field) => {
          if (!('name' in field)) return field
          const admin =
            field.admin && 'description' in field.admin && field.admin.description === INHERITS_NOTE
              ? { ...field.admin, description: undefined }
              : field.admin
          const required = field.name === 'heading' ? { required: true } : {}
          return { ...field, admin, ...required } as typeof field
        }),
      }
    : block

/**
 * On a service page a `cta` block is one of four designs. Which one used to
 * be guessed from the words in its heading ("one-stop hub", "let's work
 * together", "estimate"…), so rewording a heading could silently switch the
 * section to a different design — and an estimate band could not leave its
 * heading empty to use the shared one. The choice is a field now.
 */
const withServiceCtaLayout = (block: Block): Block =>
  block.slug === 'cta'
    ? {
        ...block,
        fields: [
          {
            name: 'layout',
            type: 'select' as const,
            label: 'Layout',
            defaultValue: 'standard',
            options: [
              { label: 'Free-estimate band (brass)', value: 'estimate' },
              { label: 'Finance: one-stop hub (image + text)', value: 'finance-hub' },
              { label: 'Finance: closing call to action', value: 'finance-cta' },
              { label: 'Standard call to action', value: 'standard' },
            ],
            admin: {
              description:
                'The free-estimate band uses Shared Sections (Settings → Service pages) for any field left empty here.',
            },
          },
          ...block.fields,
        ],
      }
    : block

export const servicePageBlocks: Block[] = landingPageBlocks
  .filter((block) => !LANDING_ONLY_ON_SERVICES.has(block.slug))
  .map(withoutSharedDefaults)
  .map(withServiceCtaLayout)
  .map((block) =>
    SERVICE_BLOCK_TABLES[block.slug] ? { ...block, dbName: SERVICE_BLOCK_TABLES[block.slug] } : block,
  )
