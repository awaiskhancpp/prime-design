import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Tag each review with the services it is about, so a service page's review
 * carousel shows reviews of that service.
 *
 * The rules read the review text for the work it describes. A review that
 * describes several kinds of work gets every matching service ("our kitchen
 * and three bathrooms" → Kitchen and Bathroom Remodeling), and a review that
 * names no work at all ("Very good customer service!") gets none. Untagged
 * reviews are the general ones, and every page shows them.
 *
 * Only top-level services get rules. European, Custom and Shaker Kitchen show
 * their parent Kitchen Remodeling's reviews, and Finance and Home Repair have
 * no reviews about them, so their pages fall back to the full set (see
 * `getSectionReviews`).
 *
 * The rules are a first pass. After it, the CMS is the source of truth: fix
 * any tag on the review in the admin, and a re-run leaves it alone, because
 * only reviews with no services yet are written.
 *
 *   npx tsx scripts/tag-review-services.ts [--dry]
 *
 * `--dry` prints what would be tagged and writes nothing.
 */

const dryRun = process.argv.includes('--dry')

const RULES: Record<string, RegExp[]> = {
  'kitchen-remodeling': [/\bkitchens?\b/i, /\bcabinet(s|ry)?\b/i, /\bcounter ?tops?\b/i, /\bbacksplash/i],
  'bathroom-remodeling': [
    /\bbath(room)?s?\b/i,
    /\bshowers?\b/i,
    /\b(bath)?tubs?\b/i,
    /\bvanit(y|ies)\b/i,
    /\bmaster bath/i,
  ],
  adu: [
    /\badus?\b/i,
    /accessory dwelling/i,
    /garage conversion/i,
    /convert(ed|ing)? (our|the|my|a) garage/i,
    /\bin-?law (unit|suite)/i,
    /backyard (cottage|unit)/i,
  ],
  additions: [
    // "In addition, …" and "the addition of more work" are phrases, not projects.
    /(?<!\bin )\baddition\b(?! of\b)(?! to (that|this|the (great|excellent|quality)))/i,
    /\badd(ed|ing)? (on )?to (my|our|the) (home|house)/i,
    /\bexpan(d|ded|ding|sion)( of)? (my|our|the) (home|house)/i,
    /second[- ]stor(y|ey)/i,
    /\bbump[- ]?out\b/i,
    /home extension|house extension/i,
  ],
  'complete-renovation': [
    // Not "a new construction company", which describes the firm.
    /new construction(?! company)/i,
    /ground[- ]up/i,
    /\bbuil(t|d) (our|a|my) (new |custom )?(home|house)\b/i,
    /tear[- ]?down/i,
  ],
  'home-remodeling': [
    /\b(whole|full|entire|complete)[- ](house|home)\b/i,
    /\b(home|house) (remodel|renovation|makeover)/i,
    /\bremodel(ed|ing)? (our|the|my) (entire )?(home|house)\b/i,
    /\brenovat(e|ed|ing) (our|the|my) (entire )?(home|house)\b/i,
    /\bflooring\b/i,
    /\bstucco\b/i,
    /\bsiding\b/i,
    /\broof(ing)?\b/i,
    /\bnew windows\b/i,
    /\bexterior\b/i,
    /\bbasement\b/i,
    /guest suite|convert(ed|ing)? (a|an|our|the|my) [a-z ]{0,20}room/i,
  ],
}

const payload = await getPayload({ config: configPromise })

const { docs: services } = await payload.find({ collection: 'services', depth: 0, limit: 100 })
const serviceId = new Map(
  (services as Array<{ id: number; slug: string }>).map((service) => [service.slug, service.id]),
)
for (const slug of Object.keys(RULES)) {
  if (!serviceId.has(slug)) throw new Error(`No service with slug "${slug}"`)
}

const { docs } = await payload.find({ collection: 'reviews', depth: 0, limit: 500, sort: 'id' })
const reviews = docs as unknown as Array<{
  id: number
  name: string
  quote: string
  rating?: number | null
  services?: (number | { id: number })[] | null
}>

const counts: Record<string, number> = {}
const untagged: string[] = []
const multi: string[] = []
const skipped: string[] = []
const writes: Array<{ id: number; name: string; slugs: string[] }> = []

for (const review of reviews) {
  if (review.services?.length) {
    skipped.push(`${review.id} ${review.name}`)
    continue
  }
  // "Prime Kitchens" is the company's former name, not a mention of a kitchen.
  const text = review.quote.replace(/\bPrime Kitchens?( Remodeling)?\b/gi, 'Prime')
  const slugs = Object.entries(RULES)
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(text)))
    .map(([slug]) => slug)
  for (const slug of slugs) counts[slug] = (counts[slug] ?? 0) + 1
  const line = `${review.id} ${review.name} (${review.rating ?? '?'}★): ${review.quote.replace(/\s+/g, ' ').slice(0, 90)}`
  if (!slugs.length) untagged.push(line)
  else {
    if (slugs.length > 1) multi.push(`${slugs.join(' + ')} ← ${line}`)
    writes.push({ id: review.id, name: review.name, slugs })
  }
}

console.log(`${reviews.length} reviews; ${skipped.length} already tagged, left alone`)
console.log('\nper service:')
for (const slug of Object.keys(RULES)) console.log(`  ${slug.padEnd(22)} ${counts[slug] ?? 0}`)
console.log(`\ntagged with more than one service (${multi.length}):`)
for (const line of multi) console.log(`  ${line}`)
console.log(`\ngeneral — no service named, shown on every page (${untagged.length}):`)
for (const line of untagged) console.log(`  ${line}`)

if (dryRun) {
  console.log(`\n--dry: would tag ${writes.length} reviews, wrote nothing`)
  process.exit(0)
}

const backup = `review-services-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
writeFileSync(
  backup,
  JSON.stringify(
    writes.map(({ id, name }) => ({ id, name, services: [] })),
    null,
    1,
  ),
)
console.log(`\nbackup: ${backup}`)

for (const write of writes) {
  await payload.update({
    collection: 'reviews',
    id: write.id,
    data: { services: write.slugs.map((slug) => serviceId.get(slug)!) } as never,
  })
}
console.log(`tagged ${writes.length} reviews`)
process.exit(0)
