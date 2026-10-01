import type { CollectionConfig } from 'payload'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    group: 'System',
    useAsTitle: 'oldPath',
    defaultColumns: ['oldPath', 'newPath', 'statusCode', 'updatedAt'],
    description:
      'Old URL → new URL, for any path on the site. Applied before the page renders (src/proxy.ts) with the status code chosen here; a change takes effect within a minute.',
  },
  // Public read: the proxy fetches the active rules to apply them. The rows
  // are old and new paths, nothing private.
  access: { read: () => true },
  fields: [
    {
      name: 'oldPath',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'The path that should move, e.g. /old-page. A trailing slash makes no difference.' },
    },
    {
      name: 'newPath',
      type: 'text',
      required: true,
      admin: { description: 'Where it goes: a path (/services/adu) or a full URL.' },
    },
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
