import type { Field, GlobalConfig } from 'payload'

/**
 * A menu entry: the words shown, and where it goes. A service link names the
 * service itself, so its URL follows the service (`serviceHref`) rather than
 * being a copied path. Anything else — a page, "#" for a menu that only opens
 * a dropdown — is a plain URL.
 */
const linkFields: Field[] = [
  { name: 'label', type: 'text', required: true },
  {
    name: 'service',
    type: 'relationship',
    relationTo: 'services',
    admin: { description: 'Link to a service page. Leave empty to use the URL below instead.' },
  },
  {
    name: 'url',
    type: 'text',
    admin: {
      description: 'Used when no service is chosen, e.g. "/about". "#" makes a menu that only opens its dropdown.',
    },
  },
]

/**
 * The header menu and the footer's link columns.
 *
 * These used to be typed into `website.json`, where nobody could change them
 * without a code change. The labels are the WordPress site's own, and they
 * differ on purpose from place to place — the header says "ADU", the footer
 * lists "ADU" and "Garage Conversion" as two links to the same page, and the
 * service's page title is "ADU & Garage Conversions". Each place keeps its own
 * wording here rather than all reading the service's title.
 */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: { group: 'Settings' },
  // Every save is kept; a bad edit can be compared and restored.
  versions: { max: 20 },
  fields: [
    {
      name: 'header',
      type: 'group',
      label: 'Header menu',
      fields: [
        {
          name: 'items',
          type: 'array',
          label: 'Menu items',
          fields: [
            ...linkFields,
            {
              name: 'dropdown',
              type: 'array',
              label: 'Dropdown items',
              fields: [
                ...linkFields,
                {
                  // Not "children" again: a nested array with its parent's
                  // name trips drizzle ("multiple relations with name").
                  name: 'subItems',
                  type: 'array',
                  label: 'Sub-menu items',
                  admin: { description: 'A second level, e.g. the kitchen styles under Kitchen Remodeling.' },
                  fields: linkFields,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      label: 'Footer',
      fields: [
        {
          name: 'quickLinks',
          type: 'array',
          label: 'Quick links',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
        {
          name: 'serviceLinks',
          type: 'array',
          label: 'Service links',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'service', type: 'relationship', relationTo: 'services', required: true },
          ],
        },
        {
          name: 'copyright',
          type: 'text',
          admin: { description: 'The year in it is replaced with the current year when the page is shown.' },
        },
        {
          // The legal link in the footer's bottom row. It names the page
          // record rather than a copied path, like the service links do.
          name: 'privacyPolicy',
          type: 'group',
          label: 'Privacy policy link',
          fields: [
            { name: 'label', type: 'text', required: true, defaultValue: 'Privacy Policy' },
            { name: 'page', type: 'relationship', relationTo: 'pages', required: true },
          ],
        },
      ],
    },
  ],
}
