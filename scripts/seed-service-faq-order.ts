import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Give a service page's FAQ section its own question order, where WordPress
 * shows one different from the /faq page's.
 *
 * SOURCE. Read from the rendered Bricks markup of the live service pages —
 * each `<h3 class="fr-faq-card-bravo__question">` in document order. Four
 * service pages carry an FAQ section on the original site, and three of them
 * list their category in exactly the order /faq does. Home Remodeling does
 * not: /faq runs "how long / design services / can I make changes / what
 * types", and /home-remodeling puts "can I make changes" first. That is a
 * disagreement inside WordPress itself, not a migration error, so both orders
 * are kept — `sortOrder` on the FAQ records serves /faq, and this serves the
 * page.
 *
 * Only the pages listed here get an explicit order; everywhere else the
 * section falls back to the category's own, which is what should happen.
 *
 *   npx tsx scripts/seed-service-faq-order.ts [--dry]
 */

const dryRun = process.argv.slice(2).includes('--dry')

/** Service slug -> the questions that page shows, in the order it shows them. */
const PAGE_ORDERS: Record<string, string[]> = {
  'home-remodeling': [
    'Can I make changes to the design or scope of the project once it has started?',
    'How long does a typical home remodeling project take?',
    'Do you provide design services for home remodeling?',
    'What types of home remodeling projects do you specialize in?',
  ],
}

const normalise = (value: string) => value.replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()

const payload = await getPayload({ config: configPromise })

const { docs: faqDocs } = await payload.find({ collection: 'faqs', depth: 0, limit: 500 })
const faqs = faqDocs as unknown as Array<{ id: number; question: string }>

const gaps: string[] = []

for (const [slug, questions] of Object.entries(PAGE_ORDERS)) {
  const { docs } = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
  })
  const service = docs[0] as unknown as { id: number; sections?: Array<Record<string, unknown>> }
  if (!service) {
    gaps.push(`no service "${slug}"`)
    continue
  }

  const ids = questions.map((question) => {
    const match = faqs.find((faq) => normalise(faq.question) === normalise(question))
    if (!match) gaps.push(`${slug}: no FAQ matching "${question}"`)
    return match?.id
  })
  if (ids.some((id) => id === undefined)) continue

  /**
   * The order goes on the FAQ block's first category, which is where the
   * admin edits it. The rest of `sections` is written back untouched — block
   * `id`s included, so Payload updates the rows rather than replacing them.
   */
  const sections = (service.sections ?? []).map((block) => {
    if (block.blockType !== 'faq') return block
    const categories = Array.isArray(block.categories) ? block.categories : []
    const [first, ...rest] = categories as Array<Record<string, unknown>>
    return {
      ...block,
      categories: [{ ...(first ?? { title: 'Frequently Asked Questions' }), faqOrder: ids }, ...rest],
    }
  })

  if (!sections.some((block) => block.blockType === 'faq')) {
    gaps.push(`${slug}: the service has no faq section to order`)
    continue
  }

  if (dryRun) {
    console.log(`would set ${slug} -> [${ids.join(', ')}]`)
    continue
  }

  await payload.update({
    collection: 'services',
    id: service.id,
    data: { sections } as never,
  })
  console.log(`set ${slug} -> [${ids.join(', ')}]`)
}

if (gaps.length) {
  console.log('\nGAPS:')
  for (const gap of gaps) console.log(`  - ${gap}`)
}

process.exit(0)
