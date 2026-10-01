import type { Field, TextField } from 'payload'

/**
 * The two halves of every button and link on the site, labelled the same way
 * wherever they appear.
 *
 * The stored names differ by schema — `url` in the landing and service
 * blocks, `href` in the page sections, `ctaHref` where a section has a single
 * button — because each was named when its block was first built, and the
 * names are database columns that scripts write to. Editors never see those
 * names, only these labels, so the admin speaks one vocabulary without
 * moving any data.
 */
/**
 * Postgres caps identifiers at 63 characters. Version tables (`_<table>_v_version_…`)
 * add 11 characters to every name, so a select inside a deeply nested group
 * can overflow there while its live name is fine. This returns Payload's own
 * default enum name whenever it fits — so no live name ever changes — and a
 * shortened one (no `_version`, then a hash suffix) only where it does not.
 */
export const fitEnumName =
  (fieldName: string) =>
  ({ tableName }: { tableName?: string }): string => {
    const name = `enum_${tableName}_${fieldName}`
    if (name.length <= 63) return name
    const shorter = name.replace('_v_version_', '_v_')
    if (shorter.length <= 63) return shorter
    let hash = 0
    for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
    return `${shorter.slice(0, 55)}_${hash.toString(36).slice(0, 7)}`
  }

export const buttonTextField = (name = 'label', required = false): TextField => ({
  name,
  type: 'text',
  label: 'Button text',
  required,
})

export const linkUrlField = (name = 'url', required = false): TextField => ({
  name,
  type: 'text',
  label: 'Link',
  required,
  admin: {
    description:
      'A page (/contact), a section on this page (#contact), a full URL, or tel: / mailto:.',
  },
})

export const buttonGroupFields = (): Field[] => [
  {
    name: 'buttons',
    type: 'array',
    fields: [
      buttonTextField('label', true),
      linkUrlField('url', true),
      {
        name: 'variant',
        type: 'select',
        enumName: fitEnumName('variant'),
        options: ['primary', 'secondary', 'text', 'outline'],
      },
      { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
    ],
  },
]

export const linkFields = (): Field[] => [
  buttonTextField('label'),
  linkUrlField('url'),
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
      { name: 'sourceAttachmentId', type: 'number', admin: { hidden: true } },
      { name: 'sourceUrl', type: 'text', admin: { hidden: true } },
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
  { name: 'sourceOrder', type: 'number', admin: { hidden: true } },
  { name: 'sourceAttachmentId', type: 'number', admin: { hidden: true } },
  // Preserve the original WordPress URL when the source file is not
  // available locally. The frontend can use it as a read-only fallback.
  { name: 'sourceUrl', type: 'text', admin: { hidden: true } },
]

export const faqQuestionFields = (): Field[] => [
  { name: 'question', type: 'text', required: true },
  { name: 'answer', type: 'textarea', required: true },
  { name: 'sourceId', type: 'text', admin: { hidden: true } },
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
  { name: 'sourceQuery', type: 'json', admin: { hidden: true } },
  { name: 'sourceId', type: 'text', admin: { hidden: true } },
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
      { name: 'sourceId', type: 'text', admin: { hidden: true } },
      { name: 'sourceElementType', type: 'text' },
      { name: 'sourceAttachmentId', type: 'number', admin: { hidden: true } },
      { name: 'sourceMetadata', type: 'json' },
    ],
  },
]
