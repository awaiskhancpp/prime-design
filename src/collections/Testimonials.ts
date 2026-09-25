import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'location', 'rating', 'featured', 'updatedAt'],
    description: 'Reusable customer testimonials and review quotes.',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'location', type: 'text' },
    { name: 'rating', type: 'number', min: 1, max: 5 },
    { name: 'source', type: 'text' },
    {
      /**
       * The review on the platform it was left on.
       *
       * It matters most for Yelp. Yelp's API returns a text *excerpt* — about
       * 160 characters, cut mid-sentence and closed with "..." — and never the
       * full review, so 47 of the 49 Yelp reviews here are stubs. That is not
       * a migration loss: the WordPress site shows exactly the same truncated
       * text, because its review plugin reads the same API. Nothing on this
       * site can recover the rest, so a truncated review offers a link to
       * where the whole thing is instead of a dead "...".
       *
       * Google's API returns the full review, so Google records do not need
       * this and are not given one.
       */
      name: 'sourceUrl',
      type: 'text',
      admin: {
        description:
          'Link to this review on Yelp or Google. Shown as “Read the full review” when the stored text is a truncated excerpt.',
      },
    },
    {
      /**
       * True when `quote` is the platform's excerpt rather than the whole
       * review. Stored rather than re-detected in the browser so the CMS is
       * the thing that decides, and so an editor who pastes the full text in
       * can simply untick it.
       */
      name: 'quoteIsExcerpt',
      type: 'checkbox',
      defaultValue: false,
      label: 'Quote is a truncated excerpt',
    },
    {
      name: 'timeAgo',
      type: 'text',
      admin: {
        description:
          'Relative date as the review platform shows it, e.g. "5 months ago". Rendered beside the source on the Testimonials page.',
      },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'sortOrder', type: 'number', defaultValue: 0, index: true },
  ],
}
