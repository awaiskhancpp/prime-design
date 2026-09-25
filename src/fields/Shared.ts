import type { Field } from 'payload'

export const buttonGroupFields = (): Field[] => [
  {
    name: 'buttons',
    type: 'array',
    fields: [
      { name: 'label', type: 'text', required: true },
      { name: 'url', type: 'text', required: true },
      { name: 'variant', type: 'select', options: ['primary', 'secondary', 'text', 'outline'] },
      { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
    ],
  },
]

export const linkFields = (): Field[] => [
  { name: 'label', type: 'text' },
  { name: 'url', type: 'text' },
  { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
]

export const mediaReferenceFields = (name = 'media'): Field[] => [
  {
    name,
    type: 'group',
    fields: [
      { name: 'asset', type: 'upload', relationTo: 'media' },
      { name: 'alt', type: 'text' },
      { name: 'caption', type: 'text' },
      { name: 'sourceAttachmentId', type: 'number' },
      { name: 'sourceUrl', type: 'text' },
    ],
  },
]

export const iconReferenceFields = (name = 'icon'): Field[] => [
  {
    name,
    type: 'group',
    fields: [
      { name: 'iconMedia', type: 'upload', relationTo: 'media' },
      { name: 'iconLibrary', type: 'text' },
      { name: 'iconName', type: 'text' },
      { name: 'sourceSvgUrl', type: 'text' },
    ],
  },
]

export const featureCardFields = (): Field[] => [
  { name: 'title', type: 'text', required: true },
  { name: 'description', type: 'textarea' },
  ...iconReferenceFields(),
  ...mediaReferenceFields(),
  { name: 'link', type: 'group', fields: linkFields() },
]

export const galleryItemFields = (): Field[] => [
  { name: 'media', type: 'upload', relationTo: 'media' },
  { name: 'caption', type: 'text' },
  { name: 'alt', type: 'text' },
  { name: 'sourceOrder', type: 'number' },
  { name: 'sourceAttachmentId', type: 'number' },
  // Preserve the original WordPress URL when the source file is not
  // available locally. The frontend can use it as a read-only fallback.
  { name: 'sourceUrl', type: 'text' },
]

export const faqQuestionFields = (): Field[] => [
  { name: 'question', type: 'text', required: true },
  { name: 'answer', type: 'textarea', required: true },
  { name: 'sourceId', type: 'text' },
]

/**
 * An explicit order for the questions a page's FAQ section shows.
 *
 * WordPress does not agree with itself about this: Home Remodel Questions run
 * "how long / design services / can I make changes / what types" on /faq, and
 * "can I make changes / how long / design services / what types" on
 * /home-remodeling. One `sortOrder` on the FAQ record cannot be both, so a
 * page that needs its own sequence names it here. Left empty — which is every
 * other page — the section falls back to the category's own order.
 *
 * A relationship rather than a list of question strings: the FAQs collection
 * already holds these, and a text copy would be a second spelling of the
 * question to keep in step (see §7 of CLAUDE.md).
 */
export const faqOrderField = (): Field => ({
  name: 'faqOrder',
  type: 'relationship',
  relationTo: 'faqs',
  hasMany: true,
  admin: {
    description:
      'Optional. Show these questions, in this order, instead of the category’s own order.',
  },
})

export const faqCategoryFields = (): Field[] => [
  { name: 'title', type: 'text', required: true },
  {
    name: 'questions',
    type: 'array',
    fields: faqQuestionFields(),
  },
  { name: 'sourceQuery', type: 'json' },
  { name: 'sourceId', type: 'text' },
]

export const imageTextContentFields = (): Field[] => [
  { name: 'eyebrow', type: 'text' },
  { name: 'heading', type: 'text', required: true },
  // Rich text, not a textarea: these sections carry structured WordPress
  // bodies — a "Key Features:" lead-in followed by a real bullet list — and
  // flattening them to a paragraph lost the list. The section used to
  // re-derive bullets by pattern-matching the plain text, which only worked
  // when the source happened to use bullet characters.
  { name: 'description', type: 'richText' },
  ...mediaReferenceFields(),
  ...buttonGroupFields(),
  { name: 'alignment', type: 'select', options: ['left', 'right'] },
]

export const provenanceFields = (): Field[] => [
  {
    type: 'collapsible',
    label: 'Source Provenance (migration data)',
    admin: {
      initCollapsed: true,
      condition: () => false,
    },
    fields: [
      { name: 'sourceId', type: 'text' },
      { name: 'sourceElementType', type: 'text' },
      { name: 'sourceAttachmentId', type: 'number' },
      { name: 'sourceMetadata', type: 'json' },
    ],
  },
]
