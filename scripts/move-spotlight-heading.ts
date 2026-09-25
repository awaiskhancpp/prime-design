import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Take the Testimonials Spotlight section off the /testimonials page, keeping
 * its eyebrow and heading by moving them onto the Review Highlights section
 * above it.
 *
 * The spotlight sat underneath Review Highlights and introduced the same
 * thing — "Testimonials that Matter" / "Real Results, Real People" over a
 * second set of reviews from the same Testimonials collection. Removing it
 * leaves the review wall with no heading at all, so the two lines move up to
 * the section they were really describing, where `ReviewHighlights` renders
 * them centred above the badges and the All / Google / Yelp tabs.
 *
 * WHAT IS LOST, deliberately and on instruction: the spotlight's rich-text
 * body ("See why our clients rave about their stunning kitchens and how we can
 * bring your vision to life") and its call to action. Only the eyebrow and the
 * heading were asked for. The values are printed below before they go, so they
 * can be put back if that turns out to be wrong.
 *
 * The block TYPE is not removed. `testimonials-spotlight` is still used by the
 * Google Ads landing pages through `LandingBlockRenderer`, and it stays
 * available in the admin for any page that wants it.
 *
 *   npx tsx scripts/move-spotlight-heading.ts [--dry]
 */

const dryRun = process.argv.slice(2).includes('--dry')

const PAGE_SLUG = 'testimonials'

const payload = await getPayload({ config: configPromise })

const { docs } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: PAGE_SLUG } },
  depth: 0,
  limit: 1,
})
const page = docs[0] as unknown as { id: number; layout?: Array<Record<string, unknown>> }
if (!page) throw new Error(`No pages record for "${PAGE_SLUG}".`)

const layout = page.layout ?? []
const spotlight = layout.find((block) => block.blockType === 'testimonials-spotlight')
if (!spotlight) {
  console.log('Nothing to do: the page has no testimonials-spotlight section.')
  process.exit(0)
}

const eyebrow = typeof spotlight.eyebrow === 'string' ? spotlight.eyebrow : undefined
const heading = typeof spotlight.heading === 'string' ? spotlight.heading : undefined

console.log('Moving up:')
console.log(`  eyebrow: ${eyebrow ?? '(none)'}`)
console.log(`  heading: ${heading ?? '(none)'}`)
console.log('Dropping:')
console.log(`  body:     ${spotlight.body ? 'rich text, present' : '(none)'}`)
console.log(`  ctaLabel: ${spotlight.ctaLabel ?? '(none)'}`)
console.log(`  ctaHref:  ${spotlight.ctaHref ?? '(none)'}`)
console.log(`  ctaNote:  ${spotlight.ctaNote ?? '(none)'}`)

if (!layout.some((block) => block.blockType === 'review-highlights')) {
  throw new Error('The page has no review-highlights section to move the heading onto.')
}

/**
 * Written back with every other block untouched, `id`s included, so Payload
 * updates the rows in place and the order of what remains is preserved.
 */
const next = layout
  .filter((block) => block.blockType !== 'testimonials-spotlight')
  .map((block) => (block.blockType === 'review-highlights' ? { ...block, eyebrow, heading } : block))

if (dryRun) {
  console.log(`\nwould write ${next.length} sections (was ${layout.length})`)
  console.log(next.map((block, index) => `  ${index + 1}. ${block.blockType}`).join('\n'))
  process.exit(0)
}

await payload.update({ collection: 'pages', id: page.id, data: { layout: next } as never })
console.log(`\nupdated ${PAGE_SLUG}: ${next.length} sections (was ${layout.length})`)

process.exit(0)
