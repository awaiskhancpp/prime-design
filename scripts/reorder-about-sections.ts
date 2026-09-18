import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Put the Experts block above Guiding Principles on the About page, and add
 * the review-platform row between them.
 *
 * The About page's sections are `layout` blocks on the `about` record in the
 * Pages collection, so their order is data, not code — this rewrites the
 * array in the order below and Payload renumbers `_order` on save. Doing it
 * with `payload.update` rather than touching `_order` directly keeps the
 * block rows and their nested fields intact.
 *
 * Any block whose type is not listed keeps its relative position after the
 * ones that are, so the script does not silently drop a section that gets
 * added later.
 *
 *   npx tsx scripts/reorder-about-sections.ts [--dry]
 */

const dryRun = process.argv.includes('--dry')

/** The intended order, by blockType. */
const ORDER = [
  'hero',
  'team',
  'experts',
  'social-proof',
  'guiding-principle',
  'core-values',
  'faq',
  'service-areas',
]

/**
 * The review-platform row, inserted between Experts and Guiding Principles if
 * the page does not already have one. Only copy — the Yelp/Google/Houzz URLs
 * come from Site Settings.
 */
const SOCIAL_PROOF = {
  blockType: 'social-proof',
  eyebrow: 'Where to find us',
  heading: 'Reviewed by the homeowners we build for',
  description:
    'Our work and our reviews are public on every platform homeowners check before they hire.',
}

const payload = await getPayload({ config: configPromise })

const found = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'about' } },
  limit: 1,
  depth: 0,
})
const page = found.docs[0] as unknown as Record<string, unknown> | undefined
if (!page) throw new Error('no `about` page record')

const layout = (Array.isArray(page.layout) ? page.layout : []) as Array<Record<string, unknown>>
console.log('current order:')
layout.forEach((block, index) => console.log(`  ${index + 1}. ${String(block.blockType)}`))

const withSocial = layout.some((block) => block.blockType === 'social-proof')
  ? layout
  : [...layout, SOCIAL_PROOF as Record<string, unknown>]
if (withSocial !== layout) console.log('adding the social-proof block')

const rank = (block: Record<string, unknown>) => {
  const index = ORDER.indexOf(String(block.blockType))
  return index >= 0 ? index : ORDER.length
}
const reordered = withSocial
  .map((block, index) => ({ block, index }))
  // Stable: equal ranks keep their existing relative order.
  .sort((a, b) => rank(a.block) - rank(b.block) || a.index - b.index)
  .map(({ block }) => block)

console.log('\nnew order:')
reordered.forEach((block, index) => console.log(`  ${index + 1}. ${String(block.blockType)}`))

const unchanged =
  reordered.length === layout.length && reordered.every((block, index) => block === layout[index])
if (unchanged) {
  console.log('\nalready in this order — nothing to do')
} else if (dryRun) {
  console.log('\ndry run — not saved')
} else {
  await payload.update({
    collection: 'pages',
    id: page.id as number,
    data: { layout: reordered } as never,
  })
  console.log('\nsaved')
}

await payload.destroy()
