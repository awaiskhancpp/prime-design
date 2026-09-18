import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import website from '../website.json'
import { parseBricksSerialized } from '../wordpress-migration/bricksParser'
import { normalizeBricksPage } from '../wordpress-migration/normalizer'
import { parseWordPressXmlFile } from '../wordpress-migration/xmlParser'
import type { BricksTreeNode, NormalizedSection } from '../wordpress-migration/types'

/**
 * Line-by-line comparison of every Google Ads landing page against its
 * WordPress source: copy, images and videos.
 *
 * For each page it reports
 *   - MISSING COPY   text in the Bricks source that reached no Payload field
 *   - EXTRA COPY     text in Payload that is nowhere in the source (§5: copy
 *                    must never be invented)
 *   - MISSING IMAGE  an image the source renders that the page does not
 *   - MISSING VIDEO  likewise for video
 *
 * Matching is deliberately forgiving on *form* and strict on *substance*:
 * whitespace and case are normalised and a source line counts as present if
 * it appears anywhere in the page's text, because the importer legitimately
 * splits and regroups copy between blocks. What it will not forgive is copy
 * that is absent altogether.
 *
 *   npx tsx scripts/audit-landing-content.ts [xml] [--only=slug,slug] [--verbose]
 */

const args = process.argv.slice(2)
const positional = args.filter((value) => !value.startsWith('--'))
const xmlPath = positional[0] || 'primedesignampbuild.WordPress.2026-08-28.xml'
const verbose = args.includes('--verbose')
const onlyArg = args.find((value) => value.startsWith('--only='))
const onlySlugs = onlyArg ? onlyArg.slice('--only='.length).split(',').map((s) => s.trim()) : undefined

const SLUGS = [
  'kitchen-remodeling-information',
  'bathroom-remodeling-information',
  'additions-remodeling-information',
  'home-remodeling-information',
  'outdoor-hardscape-outdoor-kitchen-information',
  'siding-installation-replacement-information',
  'remodeling-information',
]

// ---------------------------------------------------------------- normalise

/** The ACF tokens the importer substitutes, so both sides read the same. */
const sourcePhone = website.header.phoneCta
const ACF: Record<string, string> = {
  acf_address: website.footer.addresses[0],
  acf_company_address: website.footer.addresses[0],
  acf_company_email: website.footer.email,
  acf_company_license: website.meta.license,
  acf_company_name: website.meta.siteName,
  acf_company_phone_clean: sourcePhone,
  acf_city: website.header.location,
}

const stripTags = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#8217;|&rsquo;/gi, '’')

/** Comparison key: case, punctuation spacing and entities folded away. */
const key = (value: string) =>
  stripTags(value)
    .replace(/\{(acf_[a-z0-9_]+)\}/gi, (_, k: string) => ACF[k.toLowerCase()] ?? '')
    .replace(/\{post_[a-z_]+\}/gi, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

/** An image/video identity: basename, minus a doubled `.webp` and a size suffix. */
const mediaKey = (value: string) => {
  const base = decodeURIComponent(String(value).split(/[?#]/)[0].split('/').pop() || '')
  return base
    .replace(/\.(jpe?g|png|gif|avif)\.webp$/i, '.$1')
    .replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ------------------------------------------------------------- WordPress side

const flat = (node: BricksTreeNode): BricksTreeNode[] => [
  node,
  ...(node.children || []).flatMap(flat),
]

function wordpressContent(section: NormalizedSection) {
  const tree = (section.data as Record<string, unknown>).sourceTree as BricksTreeNode | undefined
  const copy: string[] = []
  const images: string[] = []
  const videos: string[] = []
  if (!tree) return { copy, images, videos }

  for (const node of flat(tree)) {
    const s = node.settings as Record<string, unknown>

    for (const field of ['text', 'textBasic', 'content', 'heading', 'title', 'label']) {
      const value = s[field]
      if (typeof value === 'string' && key(value)) copy.push(value)
    }

    // Bricks list widgets hold their lines in `items`.
    if (s.items && typeof s.items === 'object') {
      for (const item of Object.values(s.items as Record<string, unknown>)) {
        if (!item || typeof item !== 'object') continue
        for (const field of ['title', 'description', 'text']) {
          const value = (item as Record<string, unknown>)[field]
          if (typeof value === 'string' && key(value)) copy.push(value)
        }
      }
    }

    if (node.name === 'image') {
      const image = s.image as Record<string, unknown> | undefined
      const name = image?.filename || image?.url || image?.full
      if (typeof name === 'string') images.push(name)
    }
    const background = s._background as Record<string, unknown> | undefined
    if (background?.image && typeof background.image === 'object') {
      const name = (background.image as Record<string, unknown>).filename
      if (typeof name === 'string') images.push(name)
    }
    if (typeof background?.videoUrl === 'string') videos.push(background.videoUrl)

    for (const value of Object.values(s)) {
      if (typeof value === 'string' && /\.mp4(\?|$)/i.test(value)) videos.push(value)
    }
  }
  return { copy, images, videos }
}

// --------------------------------------------------------------- Payload side

const PROVENANCE = new Set([
  'blockType', 'blockName', 'id', 'sourceId', 'sourceElementType', 'sourceElementId',
  'sourceAttachmentId', 'sourceMetadata', 'sourceUrl', 'sourcePath', 'sourceVideoId',
  'sourceGalleryType', 'sourceOrder', 'sourceQuery', 'url', 'href', 'filename', 'mimeType',
  'thumbnailURL', 'alt', 'variant', 'alignment', 'provider', 'shortcode', 'anchorId',
  'integrationMetadata', 'layout', 'createdAt', 'updatedAt', 'width', 'height', 'filesize',
  'focalX', 'focalY', 'wordpressId', 'collectionId', 'reviewUrl', 'iconLibrary', 'iconName',
  'sourceSvgUrl', 'openInNewTab', 'template', 'status', 'slug', 'sourceSlug', 'description_html',
])

type PayloadHarvest = { copy: string[]; media: string[]; videos: string[] }

function harvestPayload(node: unknown, out: PayloadHarvest, inMedia = false) {
  if (node === null || node === undefined) return
  if (Array.isArray(node)) {
    for (const item of node) harvestPayload(item, out, inMedia)
    return
  }
  if (typeof node !== 'object') return
  const record = node as Record<string, unknown>

  // A media document: record its identity, don't mine it for copy.
  if (typeof record.filename === 'string' && (record.mimeType || record.filesize)) {
    const source = typeof record.sourceUrl === 'string' ? record.sourceUrl : record.filename
    const id = mediaKey(String(source))
    if (String(record.mimeType || '').startsWith('video')) out.videos.push(id)
    else out.media.push(id)
    return
  }

  for (const [field, value] of Object.entries(record)) {
    if (PROVENANCE.has(field)) {
      // `externalUrl` on a video block is a real video reference.
      continue
    }
    if (field === 'externalUrl' && typeof value === 'string' && /\.mp4/i.test(value)) {
      out.videos.push(mediaKey(value))
      continue
    }
    if (typeof value === 'string') {
      if (key(value)) out.copy.push(value)
      continue
    }
    harvestPayload(value, out, inMedia)
  }
}

// --------------------------------------------------------------------- report

const payload = await getPayload({ config: configPromise })
const source = await parseWordPressXmlFile(xmlPath)

let totalMissingCopy = 0
let totalExtraCopy = 0
let totalMissingMedia = 0

for (const slug of SLUGS) {
  if (onlySlugs && !onlySlugs.includes(slug)) continue

  const page = source.pages.find((p) => p.slug === slug)
  const result = await payload.find({
    collection: 'landing-pages',
    where: { slug: { equals: slug } },
    depth: 3,
    limit: 1,
  })
  const doc = result.docs[0] as unknown as Record<string, unknown> | undefined
  if (!page?.bricksSerialized || !doc) {
    console.log(`\n### ${slug}: MISSING (source=${Boolean(page)}, payload=${Boolean(doc)})`)
    continue
  }

  const sections = normalizeBricksPage(page, parseBricksSerialized(page.bricksSerialized).roots)
  const visible = sections.filter((section) => {
    const tree = (section.data as Record<string, unknown>).sourceTree as BricksTreeNode | undefined
    const css = tree?.settings?._cssCustom
    const hidden = typeof css === 'string' && /display:\s*none/i.test(css)
    return !hidden && section.type !== 'utility'
  })

  const wp = { copy: [] as string[], images: [] as string[], videos: [] as string[] }
  for (const section of visible) {
    const part = wordpressContent(section)
    wp.copy.push(...part.copy)
    wp.images.push(...part.images)
    wp.videos.push(...part.videos)
  }

  const out: PayloadHarvest = { copy: [], media: [], videos: [] }
  harvestPayload(doc.sections, out)
  harvestPayload(doc.hero, out)

  const haystack = out.copy.map(key).join('  ')
  const wpHaystack = wp.copy.map(key).join('  ')
  const mediaSet = new Set(out.media)
  const videoSet = new Set(out.videos)

  const missingCopy = [...new Set(wp.copy.map(key))].filter(
    (line) => line.length > 3 && !haystack.includes(line),
  )
  const extraCopy = [...new Set(out.copy.map(key))].filter(
    (line) => line.length > 12 && !wpHaystack.includes(line),
  )
  const missingImages = [...new Set(wp.images.map(mediaKey))].filter(
    (id) => id && !mediaSet.has(id),
  )
  const missingVideos = [...new Set(wp.videos.map(mediaKey))].filter(
    (id) => id && !videoSet.has(id),
  )

  totalMissingCopy += missingCopy.length
  totalExtraCopy += extraCopy.length
  totalMissingMedia += missingImages.length + missingVideos.length

  console.log(`\n### ${slug}`)
  console.log(
    `    source: ${visible.length} sections, ${new Set(wp.copy.map(key)).size} copy lines, ` +
      `${new Set(wp.images.map(mediaKey)).size} images, ${new Set(wp.videos.map(mediaKey)).size} videos`,
  )
  console.log(
    `    payload: ${(doc.sections as unknown[]).length} blocks, ${mediaSet.size} images, ${videoSet.size} videos`,
  )

  if (missingCopy.length) {
    console.log(`    MISSING COPY (${missingCopy.length}):`)
    for (const line of missingCopy.slice(0, verbose ? 999 : 12))
      console.log(`      - ${line.slice(0, 150)}`)
    if (!verbose && missingCopy.length > 12)
      console.log(`      … ${missingCopy.length - 12} more (--verbose)`)
  }
  if (missingImages.length) {
    console.log(`    MISSING IMAGES (${missingImages.length}): ${missingImages.join(', ')}`)
  }
  if (missingVideos.length) {
    console.log(`    MISSING VIDEOS (${missingVideos.length}): ${missingVideos.join(', ')}`)
  }
  if (extraCopy.length) {
    console.log(`    EXTRA COPY not in source (${extraCopy.length}):`)
    for (const line of extraCopy.slice(0, verbose ? 999 : 8))
      console.log(`      + ${line.slice(0, 150)}`)
    if (!verbose && extraCopy.length > 8)
      console.log(`      … ${extraCopy.length - 8} more (--verbose)`)
  }
  if (!missingCopy.length && !missingImages.length && !missingVideos.length && !extraCopy.length)
    console.log('    OK — no differences')
}

console.log(
  `\n== totals: ${totalMissingCopy} missing copy lines, ${totalMissingMedia} missing media, ${totalExtraCopy} extra copy lines`,
)
await payload.destroy()
