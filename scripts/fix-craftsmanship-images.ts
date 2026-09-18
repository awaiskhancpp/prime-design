import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Point every service's "Craftsmanship That Transforms" photos at the images
 * its WordPress section actually uses.
 *
 * `services.craftsmanshipImages` is hand-authored — no importer writes it —
 * and two services were pointing at the wrong files:
 *
 *   kitchen-remodeling    the section is WP `process f6a1a9` ("We make it
 *                         easy for you"), whose two images are prime13-1.jpg
 *                         and Prime15-1.jpg. The second slot held
 *                         prime8-2.jpg, which belongs to `process zvpjyr` —
 *                         the six-image "Skilled Craftsmanship" steps
 *                         section further down the same page.
 *   complete-renovation   both images were right but reversed: WP
 *                         `craftsmanship jxiuun` renders Hardscape.png
 *                         first and New-Construction.png second, and the
 *                         section treats the first photo as the large one
 *                         and the second as the small overlap.
 *
 * Images are resolved by **WordPress attachment id**, never by filename: the
 * media library appends a suffix on upload collisions, so the file imported
 * from `prime13-1.jpg` is stored as `prime13-3.jpg`, and matching on the name
 * silently selects a different photo. `media.wordpressId` and
 * `media.sourceUrl` are the only reliable identifiers.
 *
 * Verified correct and deliberately left alone: bathroom-remodeling (WP `cta
 * gfpzcg`), home-remodeling and adu (both WP `craftsmanship spwvde`).
 *
 *   npx tsx scripts/fix-craftsmanship-images.ts [--dry]
 */

/** service slug -> the WordPress attachment ids, in source order. */
const EXPECTED: Record<string, { wordpressIds: number[]; sourceSection: string }> = {
  'kitchen-remodeling': { wordpressIds: [2681, 2748], sourceSection: 'process f6a1a9' },
  'complete-renovation': { wordpressIds: [2048, 2012], sourceSection: 'craftsmanship jxiuun' },
  'bathroom-remodeling': { wordpressIds: [2415, 2490], sourceSection: 'cta gfpzcg' },
  'home-remodeling': { wordpressIds: [693, 696], sourceSection: 'craftsmanship spwvde' },
  adu: { wordpressIds: [2010, 2006], sourceSection: 'craftsmanship spwvde' },
}

const dryRun = process.argv.includes('--dry')
const payload = await getPayload({ config: configPromise })

let changed = 0
for (const [slug, { wordpressIds, sourceSection }] of Object.entries(EXPECTED)) {
  const found = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
  })
  const service = found.docs[0] as unknown as Record<string, unknown> | undefined
  if (!service) {
    console.log(`! ${slug}: service not found`)
    continue
  }

  const resolved: number[] = []
  for (const wordpressId of wordpressIds) {
    const media = await payload.find({
      collection: 'media',
      where: { wordpressId: { equals: wordpressId } },
      depth: 0,
      limit: 1,
    })
    const doc = media.docs[0] as unknown as Record<string, unknown> | undefined
    if (!doc) {
      console.log(`! ${slug}: no media for WordPress attachment ${wordpressId}`)
      continue
    }
    resolved.push(Number(doc.id))
  }
  if (resolved.length !== wordpressIds.length) continue

  const current = (Array.isArray(service.craftsmanshipImages) ? service.craftsmanshipImages : [])
    .map((value) => (typeof value === 'object' && value ? Number((value as { id: unknown }).id) : Number(value)))
    .filter((value) => Number.isFinite(value))

  if (current.length === resolved.length && current.every((id, i) => id === resolved[i])) {
    console.log(`= ${slug}: already correct (${resolved.join(', ')}) — ${sourceSection}`)
    continue
  }

  console.log(`${dryRun ? '~' : '+'} ${slug}: ${current.join(', ') || '(empty)'} -> ${resolved.join(', ')}   [${sourceSection}]`)
  if (dryRun) continue

  await payload.update({
    collection: 'services',
    id: service.id as number,
    data: { craftsmanshipImages: resolved } as never,
  })
  changed += 1
}

console.log(dryRun ? 'dry run — nothing written' : `updated ${changed} service(s)`)
await payload.destroy()
