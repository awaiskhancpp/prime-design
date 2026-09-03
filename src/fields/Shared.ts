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
]

export const faqQuestionFields = (): Field[] => [
  { name: 'question', type: 'text', required: true },
  { name: 'answer', type: 'textarea', required: true },
  { name: 'sourceId', type: 'text' },
]

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
  { name: 'description', type: 'textarea' },
  ...mediaReferenceFields(),
  ...buttonGroupFields(),
  { name: 'alignment', type: 'select', options: ['left', 'right'] },
]

export const provenanceFields = (): Field[] => [
  { name: 'sourceId', type: 'text' },
  { name: 'sourceElementType', type: 'text' },
  { name: 'sourceAttachmentId', type: 'number' },
  { name: 'sourceMetadata', type: 'json' },
]
