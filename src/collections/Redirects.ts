import type { CollectionConfig } from 'payload'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'oldPath',
    defaultColumns: ['oldPath', 'newPath', 'statusCode', 'updatedAt'],
    description: 'Permanent and temporary URL redirects used during migration.',
  },
  fields: [
    { name: 'oldPath', type: 'text', required: true, unique: true, index: true },
    { name: 'newPath', type: 'text', required: true },
    {
      name: 'statusCode',
      type: 'select',
      required: true,
      defaultValue: '308',
      options: [
        { label: 'Permanent (308)', value: '308' },
        { label: 'Permanent (301)', value: '301' },
        { label: 'Temporary (307)', value: '307' },
        { label: 'Temporary (302)', value: '302' },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}
