import type { CollectionConfig } from 'payload'

/**
 * Google and Yelp reviews.
 *
 * These used to live in Testimonials alongside the site's own customer
 * testimonials, which made one collection of 124 platform reviews and three
 * testimonials that were not in it at all (they were copied into every page's
 * Testimonial Cards section instead). They are two different things: a review
 * is imported from a platform and carries that platform's excerpt flag, link
 * and relative date; a testimonial is an endorsement the company chose to
 * feature. Reviews feed the "See what people are saying about us" carousel,
 * the review wall and the Testimonials page; Testimonials feed the
 * Testimonial Cards sections.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'source', 'location', 'rating', 'featured', 'updatedAt'],
    description:
      'Google and Yelp reviews. Tick Featured to show a review in the "See what people are saying about us" carousel.',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'quote', type: 'textarea', required: true },
    {
      /**
       * The business listing the review was left on, as a place — Google's
       * one listing is the Campbell office (Site Settings' first address,
       * whose link is that listing), and Yelp's four listings are named for
       * San Jose and Santa Clara.
       */
      name: 'location',
      type: 'text',
      admin: {
        description: 'Where the listing this review was left on is, e.g. "San Jose, CA".',
      },
    },
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
