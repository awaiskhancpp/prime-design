import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { parseWordPressXmlFile } from '../wordpress-migration/xmlParser'
import { parseBricksSerialized } from '../wordpress-migration/bricksParser'
import type { BricksTreeNode } from '../wordpress-migration/types'

/**
 * Fill the service card fields: `excerpt`, `featuredImage`, `featured` and
 * `sortOrder`.
 *
 * WordPress writes each service twice, and the two versions are different
 * copy and different photography, not one derived from the other:
 *
 *   - the services index (page 353) gives each card a full paragraph and its
 *     own photo — that pair is `shortDescription` + the `/services` card;
 *   - the homepage "Our Services" section gives the same service a one-line
 *     summary and a *different* photo — that pair is `excerpt` +
 *     `featuredImage`.
 *
 * Only `shortDescription` existed, so the two kept overwriting each other,
 * and the homepage cards had no image of their own and fell back to the page
 * hero — which is neither of the two. Everything here is read out of the
 * homepage's own Bricks tree rather than retyped.
 *
 * Six services appear on the WordPress homepage; those get `featured` and
 * `sortOrder` in the order the section lists them. The other five are
 * unfeatured and sorted after, and their `excerpt` is set from the copy
 * listed in `AUTHORED_EXCERPTS` below, because WordPress has no homepage
 * card for them to take one from.
 *
 *   npx tsx scripts/set-service-card-content.ts [xml] [--dry]
 */

const args = process.argv.slice(2)
const dryRun = args.includes('--dry')
const xmlPath =
  args.find((value) => !value.startsWith('--')) || 'primedesignampbuild.WordPress.2026-08-28.xml'

/** WordPress page id linked by a homepage card -> service slug. */
const POST_ID_TO_SLUG: Record<string, string> = {
  '335': 'home-remodeling',
  '327': 'kitchen-remodeling',
  '1976': 'adu',
  '1978': 'additions',
  '1980': 'complete-renovation',
  '337': 'bathroom-remodeling',
}

/**
 * Services with no homepage card, in the order the WordPress services index
 * lists them, with a short summary for each.
 *
 * The first three are each service's own WordPress `description` — one
 * sentence, already the right length, and real page copy. The last two have
 * no short sentence anywhere in WordPress (their pages open with a full
 * paragraph), so those two are written for this field and are the only
 * non-WordPress copy in this script.
 */
const AUTHORED_EXCERPTS: Array<{ slug: string; excerpt: string; source: 'wordpress' | 'written' }> =
  [
    {
      slug: 'european-kitchen',
      excerpt:
        'Experience the allure of European kitchens that blend elegance and functionality.',
      source: 'wordpress',
    },
    {
      slug: 'shaker-kitchen',
      excerpt:
        'Timeless Shaker cabinetry built on simplicity, function and careful craftsmanship.',
      source: 'written',
    },
    {
      slug: 'custom-kitchen',
      excerpt:
        'Unleash your creativity with a tailor-made kitchen that reflects your personal style.',
      source: 'wordpress',
    },
    {
      slug: 'finance',
      excerpt:
        'Let our tailored financing options pave the way to your dream home, combining style and affordability.',
      source: 'wordpress',
    },
    {
      slug: 'comprehensive-home-repair-installation-services-in-silicon-valley',
      excerpt:
        'Licensed repair and installation work for every corner of your home, from minor fixes to full overhauls.',
      source: 'written',
    },
  ]

const flat = (node: BricksTreeNode): BricksTreeNode[] => [
  node,
  ...(node.children || []).flatMap(flat),
]

const plain = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/\{acf_company_name\}/g, 'Prime Design & Build')
    .replace(/\s+/g, ' ')
    .trim()

const source = await parseWordPressXmlFile(xmlPath)
const homepage = source.pages.find(
  (page) => (page as { slug?: string }).slug === 'sample-page',
) as { bricksSerialized?: string } | undefined
if (!homepage?.bricksSerialized) throw new Error('homepage Bricks source not found')

/** slug -> { excerpt, attachment id }, read in document order. */
type Card = { excerpt?: string; attachmentId?: number }
const cards = new Map<string, Card>()
const order: string[] = []

let current: string | undefined
for (const node of parseBricksSerialized(homepage.bricksSerialized).roots.flatMap(flat)) {
  const settings = node.settings as Record<string, unknown>
  const link = settings.link as Record<string, unknown> | undefined
  const postId = link?.postId !== undefined ? String(link.postId) : undefined

  // A card starts at the block whose link points at the service page.
  if (postId && POST_ID_TO_SLUG[postId]) {
    current = POST_ID_TO_SLUG[postId]
    if (!cards.has(current)) {
      cards.set(current, {})
      order.push(current)
    }
    continue
  }
  if (!current) continue

  const card = cards.get(current)!
  if (node.name === 'text-basic' && !card.excerpt) {
    const text = plain(String(settings.text ?? settings.content ?? ''))
    if (text) card.excerpt = text
  }
  const image = settings.image as Record<string, unknown> | undefined
  if (!card.attachmentId && typeof image?.id === 'number') card.attachmentId = image.id
}

console.log(`homepage "Our Services" cards, in WordPress order: ${order.join(', ')}\n`)

const payload = await getPayload({ config: configPromise })

/** WordPress order: the featured six first, then the rest. */
const sortOrder = new Map<string, number>()
order.forEach((slug, index) => sortOrder.set(slug, (index + 1) * 10))
AUTHORED_EXCERPTS.forEach(({ slug }, index) =>
  sortOrder.set(slug, (order.length + index + 1) * 10),
)

let changed = 0
let same = 0

async function applyTo(
  slug: string,
  values: { excerpt?: string; featured: boolean; featuredImage?: number; sortOrder?: number },
) {
  const found = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const service = found.docs[0] as unknown as Record<string, unknown> | undefined
  if (!service) {
    console.log(`! ${slug}: no service record`)
    return
  }

  const currentImage =
    typeof service.featuredImage === 'object' && service.featuredImage
      ? Number((service.featuredImage as Record<string, unknown>).id)
      : service.featuredImage
        ? Number(service.featuredImage)
        : undefined

  const diff: string[] = []
  if (values.excerpt !== undefined && service.excerpt !== values.excerpt)
    diff.push(`excerpt: ${JSON.stringify(String(service.excerpt ?? ''))} -> ${JSON.stringify(values.excerpt)}`)
  if (values.featuredImage !== undefined && currentImage !== values.featuredImage)
    diff.push(`featuredImage: media#${currentImage ?? '(empty)'} -> media#${values.featuredImage}`)
  if (Boolean(service.featured) !== values.featured)
    diff.push(`featured: ${Boolean(service.featured)} -> ${values.featured}`)
  if (values.sortOrder !== undefined && Number(service.sortOrder) !== values.sortOrder)
    diff.push(`sortOrder: ${service.sortOrder} -> ${values.sortOrder}`)

  if (!diff.length) {
    console.log(`= ${slug}: unchanged`)
    same += 1
    return
  }
  console.log(`${dryRun ? '~' : '+'} ${slug}`)
  for (const line of diff) console.log(`    ${line}`)
  changed += 1
  if (dryRun) return

  await payload.update({
    collection: 'services',
    id: service.id as number,
    data: {
      ...(values.excerpt !== undefined ? { excerpt: values.excerpt } : {}),
      ...(values.featuredImage !== undefined ? { featuredImage: values.featuredImage } : {}),
      featured: values.featured,
      ...(values.sortOrder !== undefined ? { sortOrder: values.sortOrder } : {}),
    } as never,
  })
}

for (const slug of order) {
  const card = cards.get(slug)!
  let mediaId: number | undefined
  if (card.attachmentId) {
    const media = await payload.find({
      collection: 'media',
      where: { wordpressId: { equals: card.attachmentId } },
      limit: 1,
      depth: 0,
    })
    mediaId = media.docs[0] ? Number(media.docs[0].id) : undefined
    if (!mediaId)
      console.log(`! ${slug}: WordPress attachment ${card.attachmentId} is not in Media`)
  }
  await applyTo(slug, {
    excerpt: card.excerpt,
    featured: true,
    featuredImage: mediaId,
    sortOrder: sortOrder.get(slug),
  })
}

for (const { slug, excerpt } of AUTHORED_EXCERPTS)
  await applyTo(slug, { excerpt, featured: false, sortOrder: sortOrder.get(slug) })

console.log(
  `\n${dryRun ? 'dry run — ' : ''}${changed} service(s) ${dryRun ? 'would change' : 'changed'}, ${same} already correct`,
)
await payload.destroy()
