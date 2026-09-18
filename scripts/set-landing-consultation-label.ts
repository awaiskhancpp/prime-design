import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Set `booking.consultationLabel` on the Google Ads landing pages.
 *
 * This is the only string on these pages with no WordPress source. The
 * WordPress sections are a bare `[latepoint_book_form selected_service="7"]`
 * shortcode; the label the scheduler shows lives in LatePoint's own tables,
 * which are not part of the WXR export. It is therefore owner-authored copy,
 * supplied directly, not migrated content — which is why it is written here
 * as CMS data rather than defaulted in a component.
 *
 * `migrate-landing-pages.ts` carries an existing value forward on re-import,
 * so this only needs running once per page (or after a booking block is added
 * to a page that did not have one).
 *
 * Usage:
 *   npx tsx scripts/set-landing-consultation-label.ts ["<label>"] [slug ...]
 */

const DEFAULT_LABEL = 'Book Your Free Design Consultation'

const args = process.argv.slice(2)
const label = args[0] && !args[0].includes('-information') ? args[0] : DEFAULT_LABEL
const slugFilter = args.filter((value) => value !== label)

const payload = await getPayload({ config: configPromise })

const pages = await payload.find({
  collection: 'landing-pages',
  where: slugFilter.length ? { slug: { in: slugFilter } } : {},
  limit: 100,
  depth: 0,
})

let changed = 0
for (const page of pages.docs as unknown as Array<Record<string, unknown>>) {
  const sections = (page.sections || []) as Array<Record<string, unknown>>
  const bookingBlocks = sections.filter((section) => section.blockType === 'booking')
  if (!bookingBlocks.length) continue

  let touched = false
  for (const block of bookingBlocks) {
    if (block.consultationLabel === label) continue
    block.consultationLabel = label
    touched = true
  }
  if (!touched) {
    console.log(`= ${page.slug}: already set`)
    continue
  }

  await payload.update({
    collection: 'landing-pages',
    id: page.id as number,
    data: { sections } as never,
  })
  changed += 1
  console.log(`+ ${page.slug}: consultationLabel = ${JSON.stringify(label)}`)
}

const withoutBooking = (pages.docs as unknown as Array<Record<string, unknown>>)
  .filter((page) => !((page.sections || []) as Array<Record<string, unknown>>).some((s) => s.blockType === 'booking'))
  .map((page) => page.slug)
if (withoutBooking.length)
  console.log(`no booking block (nothing to set): ${withoutBooking.join(', ')}`)

console.log(`updated ${changed} page(s)`)
await payload.destroy()
