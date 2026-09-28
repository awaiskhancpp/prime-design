import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * The "Winterization Checklist" post's rich text has one embedded image, a
 * Lexical `upload` node pointing at media id 439 — which does not exist in
 * the `media` table. Migration left an orphaned reference.
 *
 * SOURCE. Read from the live WordPress article
 * (https://primedesignandbuild.com/winterization-checklist-prepare-your-roof-for-the-winter-with-prime-design-and-build/,
 * inside `#brx-content`, excluding the header/related-posts markup outside
 * it). The article body has exactly two real photos: the featured image
 * (`Hardscape.png`, before the intro paragraph — handled separately as the
 * post's hero) and `ADU-3.png` (900x600→1238x825 at full size), which sits
 * precisely between "...prepare your roof for the winter months." and
 * "Gutter Maintenance:" — the same position as the orphaned upload node in
 * this post's stored content.
 *
 * `ADU-3.png` is already in the Media collection, just under an anonymized
 * filename: id 348, `wp-2004.png`, `sourceUrl` = the exact WordPress
 * attachment URL for `ADU-3.png`, dimensions 1238x825 matching the live
 * page's own `srcset` (`ADU-3.png 1238w`). (A different row, id 182,
 * is also named `ADU-3.png` but its `sourceUrl` actually points at
 * `ADU-2.png` — a pre-existing filename mismatch from an earlier migration,
 * left alone; id 348 is the one whose `sourceUrl` genuinely matches.) No new
 * upload is needed — this script only repoints the existing broken
 * reference at the media document that was already correctly imported.
 *
 *   npx tsx scripts/fix-winterization-upload-reference.ts [--dry]
 */

const dryRun = process.argv.slice(2).includes('--dry')

const SLUG = 'winterization-checklist-prepare-your-roof-for-the-winter-with-prime-design-and-build'
const BROKEN_MEDIA_ID = 439
const CORRECT_MEDIA_ID = 348

type LexicalNode = { type?: string; value?: unknown; children?: LexicalNode[] }

/** Finds every `upload` node pointing at `BROKEN_MEDIA_ID` and repoints it. */
function fixUploadNodes(node: LexicalNode): number {
  let fixed = 0
  if (node.type === 'upload' && node.value === BROKEN_MEDIA_ID) {
    node.value = CORRECT_MEDIA_ID
    fixed += 1
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) fixed += fixUploadNodes(child)
  }
  return fixed
}

const payload = await getPayload({ config: configPromise })

const result = await payload.find({
  collection: 'blog',
  where: { slug: { equals: SLUG } },
  limit: 1,
  // depth: 0 — at any higher depth Payload tries to populate the `upload`
  // node's `media` relation and, since id 439 doesn't exist, replaces
  // `value` with something other than the raw 439 before this script ever
  // sees it.
  depth: 0,
})
const post = result.docs[0]
if (!post) throw new Error(`No blog post found for slug "${SLUG}"`)

const content = post.content as { root: LexicalNode } | null
if (!content?.root) throw new Error('Post has no `content` rich text field to fix.')

const fixedCount = fixUploadNodes(content.root)
if (fixedCount === 0) {
  console.log(`No upload node with value ${BROKEN_MEDIA_ID} found — nothing to fix.`)
  process.exit(0)
}

console.log(`${dryRun ? 'would fix' : 'fixing'} ${fixedCount} upload node(s) (id ${post.id})`)

if (!dryRun) {
  await payload.update({
    collection: 'blog',
    id: post.id,
    data: { content } as never,
  })
  console.log('updated.')
}

process.exit(0)
