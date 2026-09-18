import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Remove the three review cards from the Kitchen Remodeling service page.
 *
 * `ServiceTestimonialCardsSection` renders whenever
 * `services.testimonialCards.items` is non-empty — there is no layout flag
 * for it — so the section is removed by clearing the items on that one
 * service. Every other service keeps its own cards.
 *
 *   npx tsx scripts/clear-kitchen-testimonial-cards.ts [--dry]
 */

const dryRun = process.argv.includes('--dry')
const payload = await getPayload({ config: configPromise })

const found = await payload.find({
  collection: 'services',
  where: { slug: { equals: 'kitchen-remodeling' } },
  limit: 1,
  depth: 0,
})
const service = found.docs[0] as unknown as Record<string, unknown> | undefined
if (!service) throw new Error('kitchen-remodeling service not found')

const group = (service.testimonialCards || {}) as Record<string, unknown>
const items = Array.isArray(group.items) ? group.items : []
console.log(`kitchen-remodeling testimonialCards.items: ${items.length}`)
for (const item of items as Array<Record<string, unknown>>)
  console.log(`  - ${String(item.name ?? '(no name)')}`)

if (!items.length) {
  console.log('\nalready empty — nothing to do')
} else if (dryRun) {
  console.log('\ndry run — would clear all of them')
} else {
  await payload.update({
    collection: 'services',
    id: service.id as number,
    data: { testimonialCards: { ...group, items: [] } } as never,
  })
  console.log('\ncleared')
}

await payload.destroy()
