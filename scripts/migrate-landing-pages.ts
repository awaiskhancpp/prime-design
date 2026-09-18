import 'dotenv/config'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import website from '../website.json'
import { testimonials as sourceTestimonials } from '../src/lib/testimonials'
import { parseBricksSerialized } from '../wordpress-migration/bricksParser'
import { normalizeBricksPage } from '../wordpress-migration/normalizer'
import { parseWordPressXmlFile } from '../wordpress-migration/xmlParser'
import type {
  BricksTreeNode,
  NormalizedGalleryItem,
  NormalizedImage,
  NormalizedSection,
  WordPressPage,
  WordPressProject,
  WordPressSource,
} from '../wordpress-migration/types'

const args = process.argv.slice(2)
const positional = args.filter((value) => !value.startsWith('--'))
const xmlPath =
  positional[0] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-28.xml'
const uploadsPath = positional[1]

/**
 * `--only=slug[,slug]` re-imports just those pages. A full run takes minutes
 * and re-resolves every image on all seven pages, which is a lot of waiting
 * when iterating on one page.
 */
const onlyArg = args.find((value) => value.startsWith('--only='))
const onlySlugs = onlyArg
  ? onlyArg
      .slice('--only='.length)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  : undefined

const allTargetSlugs = [
  'kitchen-remodeling-information',
  'bathroom-remodeling-information',
  'additions-remodeling-information',
  'home-remodeling-information',
  'outdoor-hardscape-outdoor-kitchen-information',
  'siding-installation-replacement-information',
  // NOTE: comprehensive-home-repair-… is a SERVICE (canonical slug under
  // /services/, migrated by migrate-services.ts), not a landing page — its
  // root URL redirects there via the service resolver.
  'remodeling-information',
]

const unknownSlugs = (onlySlugs || []).filter((slug) => !allTargetSlugs.includes(slug))
if (unknownSlugs.length) {
  console.error(`Unknown --only slug(s): ${unknownSlugs.join(', ')}`)
  console.error(`Known slugs: ${allTargetSlugs.join(', ')}`)
  process.exit(1)
}
const targetSlugs = onlySlugs?.length
  ? allTargetSlugs.filter((slug) => onlySlugs.includes(slug))
  : allTargetSlugs

const sourcePhone = website.header.phoneCta
const sourcePhoneClean = sourcePhone.replace(/[^\d+]/g, '')
const acfValues: Record<string, string> = {
  acf_address: website.footer.addresses[0],
  acf_company_address: website.footer.addresses[0],
  acf_company_email: website.footer.email,
  acf_company_email_link: `mailto:${website.footer.email}`,
  acf_company_license: website.meta.license,
  acf_company_name: website.meta.siteName,
  acf_company_phone: `tel:${sourcePhoneClean}`,
  acf_company_phone_clean: sourcePhone,
  acf_city: website.header.location,
}
const unresolvedAcfTokens = new Set<string>()

const replaceAcfTokens = (value: string) =>
  value.replace(/\{(acf_[a-z0-9_]+)\}/gi, (token, key: string) => {
    const normalizedKey = key.toLowerCase()
    const replacement = acfValues[normalizedKey]
    if (replacement) return replacement
    unresolvedAcfTokens.add(token)
    return ''
  })

const unresolvedDynamicTokens = new Set<string>()
const stripUnresolvedDynamicTags = (value: string) =>
  value.replace(/\{(post_[a-z0-9_]+)(?::\d+)?\}/gi, (token) => {
    unresolvedDynamicTokens.add(token)
    return ''
  })

const clean = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const result = stripUnresolvedDynamicTags(replaceAcfTokens(value))
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return result || undefined
}

const first = (values: unknown[]) =>
  values.map(clean).find((value): value is string => Boolean(value))
const dataOf = (section: NormalizedSection) => section.data as Record<string, unknown>
const meta = (page: WordPressPage, key: string) => page.meta.find((item) => item.key === key)?.value

async function fileIndex(directory?: string) {
  const result = new Map<string, string>()
  if (!directory) return result
  const walk = async (current: string) => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (!result.has(entry.name.toLowerCase())) result.set(entry.name.toLowerCase(), full)
    }
  }
  try {
    await walk(directory)
  } catch {
    /* diagnostics are emitted when a reference cannot be resolved */
  }
  return result
}

function sourceButtons(section: NormalizedSection, pagesById: Map<number, WordPressPage>) {
  const buttons: Array<Record<string, unknown>> = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const value = node as Record<string, unknown>
    if (value.name === 'button' && value.settings && typeof value.settings === 'object') {
      const settings = value.settings as Record<string, unknown>
      const link =
        settings.link && typeof settings.link === 'object'
          ? (settings.link as Record<string, unknown>)
          : undefined
      const postId = link && typeof link.postId === 'string' ? Number(link.postId) : undefined
      buttons.push({
        label: settings.text,
        href:
          typeof link?.url === 'string'
            ? link.url
            : postId && pagesById.get(postId)
              ? `/${pagesById.get(postId)?.slug}`
              : undefined,
      })
    }
    if (Array.isArray(value.children)) value.children.forEach(walk)
  }
  walk(dataOf(section).sourceTree)
  return buttons
}

function buttonData(section: NormalizedSection, pagesById: Map<number, WordPressPage>) {
  const source = sourceButtons(section, pagesById)
  const normalized = (dataOf(section).buttons as Array<Record<string, unknown>> | undefined) || []
  return [...source, ...normalized]
    .filter(
      (button, index, all) =>
        all.findIndex(
          (candidate) => candidate.label === button.label && candidate.href === button.href,
        ) === index,
    )
    .map((button) => ({
      label: clean(button.label) || 'Learn more',
      url: typeof button.href === 'string' ? button.href : undefined,
      variant: 'primary',
      openInNewTab: false,
    }))
    .filter(
      (button): button is { label: string; url: string; variant: string; openInNewTab: boolean } =>
        Boolean(button.label && button.url),
    )
}

/**
 * Match a video URL to an already-imported Media document.
 *
 * The site's videos live in the Media collection but were imported from the
 * CDN, so they carry no WordPress attachment id and `resolveMediaId` (which
 * looks up `wordpressId`, then a local file) can never find them. The same
 * asset is also addressed by two different URLs: Bricks plays the hero video
 * from `…/wp-content/uploads/2024/09/Prime-Design-Updated-Home-Video.mp4`
 * while the Media document records the CDN original,
 * `…/Prime%20Design%20Updated%20Home%20Video.mp4`.
 *
 * Reducing both to a slug of the file's basename makes them the same key, so
 * the hero and the five Prime Difference videos resolve to real media
 * documents instead of staying as off-site hotlinks.
 */
const videoKey = (url: string) => {
  const basename = decodeURIComponent(url.split(/[?#]/)[0].split('/').pop() || '')
  return basename
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * The real attachment filename behind a Bricks image reference.
 *
 * WordPress's WebP plugin rewrites some references to a doubled extension —
 * `o-55.jpg.webp`, `Prime15-1.jpg.webp` — and those elements carry no
 * attachment id at all, only the filename. Left as-is they match nothing in
 * the Media collection, so the image silently imports empty (this is why the
 * kitchen page's Custom / European / Shaker Kitchen cards had no photos).
 * Strip the trailing `.webp` only when a real image extension remains.
 */
/**
 * The Prime Design & Build logo (WordPress attachment 2850,
 * `cropped-Prime-Kitchens-Logo.png`). It is placed inside the hero of every
 * landing page as a brand mark, so it is never the image a section is
 * *about* — the hero's own photo is its CSS background.
 */
function isBrandLogo(image: { sourceId?: number; filename?: string }) {
  if (image.sourceId === 2850) return true
  return /prime-kitchens-logo/i.test(image.filename || '')
}

function sourceFilename(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined
  const match = value.match(/^(.+\.(?:jpe?g|png|gif|avif))\.webp$/i)
  return match ? match[1] : value
}

function mediaRef(image: { sourceId?: number; filename?: string; url?: string }, mediaId?: number) {
  return {
    asset: mediaId,
    alt: image.filename || 'Prime Design & Build',
    sourceAttachmentId: image.sourceId,
    sourceUrl: image.url,
  }
}

function base(section: NormalizedSection) {
  const data = dataOf(section)
  const sourceHeadings = Array.isArray(data.headings)
    ? data.headings.map(clean).filter((value): value is string => Boolean(value))
    : []
  const sourceBody = Array.isArray(data.body)
    ? data.body.map(clean).filter((value): value is string => Boolean(value))
    : []
  return {
    sourceId: section.sourceId,
    sourceElementType: section.sourceElement,
    sourceMetadata: {
      sourcePageSlug: data.sourcePageSlug,
      nestedElementIds: data.nestedElementIds,
      sourceOrder: section.order,
      sourceType: section.type,
      classification: section.classification,
      sourceHeadings,
      sourceBody,
      unsupportedElements: section.unsupportedElements,
    },
  }
}

const treeNodes = (section: NormalizedSection) => {
  const result: BricksTreeNode[] = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const value = node as BricksTreeNode
    result.push(value)
    value.children?.forEach(walk)
  }
  walk(dataOf(section).sourceTree)
  return result
}

function sourceImages(section: NormalizedSection): NormalizedImage[] {
  return treeNodes(section).flatMap((node) => {
    if (node.name !== 'image' || !node.settings.image || typeof node.settings.image !== 'object')
      return []
    const image = node.settings.image as Record<string, unknown>
    return [
      {
        sourceId: typeof image.id === 'number' ? image.id : undefined,
        filename: sourceFilename(image.filename),
        url:
          typeof image.full === 'string'
            ? image.full
            : typeof image.url === 'string'
              ? image.url
              : undefined,
        status: 'unresolved' as const,
      },
    ]
  })
}

function isHiddenSourceSection(section: NormalizedSection) {
  const tree = dataOf(section).sourceTree as BricksTreeNode | undefined
  const settings = tree?.settings || {}
  const ownSelectorHidden =
    typeof settings._cssCustom === 'string' &&
    tree?.id &&
    new RegExp(`#brxe-${tree.id}\\s*\\{[^}]*display\\s*:\\s*none`, 'i').test(settings._cssCustom)
  return (
    settings._visibility === 'hidden' || settings._opacity === '0' || Boolean(ownSelectorHidden)
  )
}

function sourceVideoUrl(section: NormalizedSection) {
  const values: unknown[] = []
  const collect = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(collect)
    if (!value || typeof value !== 'object') return values.push(value)
    Object.values(value).forEach(collect)
  }
  treeNodes(section).forEach((node) => collect(node.settings))
  return values.find(
    (value): value is string =>
      typeof value === 'string' && /(?:youtube|youtu\.be|vimeo|\.mp4|\.webm|\.mov)/i.test(value),
  )
}

function sourceImageMediaId(
  image: NormalizedImage | undefined,
  mediaIds: Map<number | string, number>,
) {
  return image?.sourceId
    ? mediaIds.get(image.sourceId)
    : image?.filename
      ? mediaIds.get(image.filename)
      : undefined
}

function imageFromTreeNode(node: BricksTreeNode): NormalizedImage | undefined {
  const imageNode =
    node.name === 'image'
      ? node
      : [node, ...node.children.flatMap((child) => treeNodesFromNode(child))].find(
          (child) => child.name === 'image',
        )

  if (!imageNode?.settings.image || typeof imageNode.settings.image !== 'object') {
    return undefined
  }

  const image = imageNode.settings.image as Record<string, unknown>
  return {
    sourceId: typeof image.id === 'number' ? image.id : undefined,
    filename: sourceFilename(image.filename),
    url:
      typeof image.full === 'string'
        ? image.full
        : typeof image.url === 'string'
          ? image.url
          : undefined,
    status: 'unresolved',
  }
}

function treeNodesFromNode(node: BricksTreeNode): BricksTreeNode[] {
  return [node, ...node.children.flatMap((child) => treeNodesFromNode(child))]
}

/** A single styled inline text run. `format: 1` is Lexical's bold bit. */
const lexicalText = (value: string, bold = false) => ({
  type: 'text',
  detail: 0,
  format: bold ? 1 : 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

const lexicalParagraph = (value: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: [lexicalText(value)],
})

const lexicalBulletList = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: items.map((item, index) => ({
    type: 'listitem',
    value: index + 1,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [lexicalText(item)],
  })),
})

/**
 * Build a Lexical document from the parts of a WordPress body.
 *
 * `image-text` bodies are structured in the source — a lead-in line such as
 * "Key Features:" followed by a real `<list>` element — so they are stored as
 * rich text rather than flattened into a textarea and pattern-matched back
 * apart at render time.
 */
function lexicalDocument(blocks: Array<{ kind: 'paragraph' | 'list'; value: string | string[] }>) {
  const children: Record<string, unknown>[] = []
  for (const entry of blocks) {
    if (entry.kind === 'list') {
      const items = (entry.value as string[]).filter(Boolean)
      if (items.length) children.push(lexicalBulletList(items))
      continue
    }
    const value = entry.value as string
    if (value) children.push(lexicalParagraph(value))
  }
  if (!children.length) return undefined
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }
}

/**
 * The innermost blocks that hold a photo card — an image plus its own
 * heading. An ancestor block that also satisfies the test is the column, not
 * the card, so it is excluded.
 */
function photoCardRoots(tree: BricksTreeNode) {
  const isCard = (node: BricksTreeNode) =>
    treeNodesFromNode(node).some((child) => child.name === 'image') &&
    treeNodesFromNode(node).some(
      (child) => child.name === 'heading' && clean(child.settings.text),
    )
  return treeNodesFromNode(tree).filter((node) => {
    if (node.name !== 'block' || !isCard(node)) return false
    return !node.children.some((child) =>
      treeNodesFromNode(child).some(
        (grandchild) => grandchild.name === 'block' && isCard(grandchild),
      ),
    )
  })
}

/**
 * The WordPress "craftsmanship" sections (`crempi` on remodeling-information)
 * are a three-column layout of two captioned photo cards, some standalone
 * photos, and a decorative graphic. `mapSection` used to have no case for
 * this type, so the whole section fell through to `default: return undefined`
 * and vanished from the imported page.
 *
 * A card is the innermost block holding both an image and a heading. Every
 * other image in the section is a standalone photo, except that Bricks marks
 * the real photographs with a shared global class and leaves the decorative
 * graphic without one — that is what separates `circle-dots.png` from the
 * project photos here.
 */
function craftsmanshipContent(
  section: NormalizedSection,
  mediaIds: Map<number | string, number>,
) {
  const sourceTree = dataOf(section).sourceTree as BricksTreeNode | undefined
  if (!sourceTree) return { items: [], images: [], decorativeMedia: undefined }

  const all = treeNodesFromNode(sourceTree)
  const cardRoots = all.filter((node) => {
    if (node.name !== 'block') return false
    const descendants = treeNodesFromNode(node)
    const hasBoth =
      descendants.some((child) => child.name === 'image') &&
      descendants.some((child) => child.name === 'heading' && clean(child.settings.text))
    if (!hasBoth) return false
    // Innermost only — an ancestor block that also satisfies the test is the
    // column, not the card.
    return !node.children.some((child) =>
      treeNodesFromNode(child).some(
        (grandchild) =>
          grandchild.name === 'block' &&
          treeNodesFromNode(grandchild).some((n) => n.name === 'image') &&
          treeNodesFromNode(grandchild).some(
            (n) => n.name === 'heading' && clean(n.settings.text),
          ),
      ),
    )
  })

  const cardNodeIds = new Set(cardRoots.flatMap((card) => treeNodesFromNode(card).map((n) => n.id)))

  const items = cardRoots.flatMap((card) => {
    const nodes = treeNodesFromNode(card)
    const title = clean(nodes.find((n) => n.name === 'heading')?.settings.text)
    if (!title) return []
    const body = nodes
      .filter((n) => n.name === 'text-basic')
      .map((n) => clean(n.settings.text))
      .filter((value): value is string => Boolean(value))
      .join('\n\n')
    const image = imageFromTreeNode(card)
    return [
      {
        title,
        body: body || undefined,
        media: image
          ? mediaRef(image, sourceImageMediaId(image, mediaIds))
          : undefined,
      },
    ]
  })

  const looseImages = all.filter((node) => node.name === 'image' && !cardNodeIds.has(node.id))
  const hasPhotoClass = (node: BricksTreeNode) => {
    const classes = node.settings._cssGlobalClasses
    return Boolean(classes && typeof classes === 'object' && Object.keys(classes).length)
  }
  const photos = looseImages.filter(hasPhotoClass)
  const decoration = looseImages.find((node) => !hasPhotoClass(node))

  const toRef = (node: BricksTreeNode) => {
    const image = imageFromTreeNode(node)
    return image
      ? mediaRef(image, sourceImageMediaId(image, mediaIds))
      : undefined
  }

  return {
    items,
    images: (photos.length ? photos : looseImages)
      .map((node) => ({ media: toRef(node) }))
      .filter((entry) => entry.media),
    decorativeMedia: decoration ? toRef(decoration) : undefined,
  }
}

/**
 * Before/after pairs for a Prime Difference section, taken from the
 * `before-after` section merged into it.
 *
 * The labels are real source values: the Bricks `xbeforeafterimage` element
 * stores them as `beforeText` / `afterText` (both "Before" / "After" on the
 * pages that use it). They are read rather than assumed so a page that
 * renames them keeps its own wording.
 */
function comparisonItems(section: NormalizedSection, mediaIds: Map<number | string, number>) {
  const merged = dataOf(section).mergedBeforeAfter as NormalizedSection | undefined
  if (!merged) return []
  const images = sourceImages(merged)
  if (images.length < 2) return []

  const widget = treeNodes(merged).find((node) => node.name === 'xbeforeafterimage')
  const beforeLabel = clean(widget?.settings.beforeText)
  const afterLabel = clean(widget?.settings.afterText)

  const pairs: Array<Record<string, unknown>> = []
  for (let index = 0; index + 1 < images.length; index += 2) {
    const beforeMedia = sourceImageMediaId(images[index], mediaIds)
    const afterMedia = sourceImageMediaId(images[index + 1], mediaIds)
    if (!beforeMedia || !afterMedia) continue
    pairs.push({
      beforeMedia,
      afterMedia,
      beforeLabel,
      afterLabel,
      sourceId: merged.sourceId,
    })
  }
  return pairs
}

/**
 * Cards for a "Benefits of …" section (`d1126c`, "Benefits of Siding").
 *
 * The section is a row of equal columns, each an image + its own h2 + a line
 * of copy, closing with a decorative graphic. It types as `image-text`
 * upstream, which collapsed all four cards into one paragraph and kept only
 * one unrelated image, so the card shape is detected here instead.
 */
function benefitsContent(section: NormalizedSection, mediaIds: Map<number | string, number>) {
  const tree = dataOf(section).sourceTree as BricksTreeNode | undefined
  if (!tree) return { items: [], decorativeMedia: undefined }
  const cardRoots = photoCardRoots(tree)
  const cardNodeIds = new Set(cardRoots.flatMap((card) => treeNodesFromNode(card).map((n) => n.id)))

  const items = cardRoots.flatMap((card) => {
    const nodes = treeNodesFromNode(card)
    const title = clean(nodes.find((n) => n.name === 'heading')?.settings.text)
    if (!title) return []
    const body = nodes
      .filter((n) => n.name === 'text-basic' || n.name === 'text')
      .map((n) => clean(n.settings.text))
      .filter((value): value is string => Boolean(value))
      .join('\n\n')
    const image = imageFromTreeNode(card)
    return [
      {
        title,
        body: body || undefined,
        media: image
          ? mediaRef(image, sourceImageMediaId(image, mediaIds))
          : undefined,
      },
    ]
  })

  // Anything left over that is not part of a card is decoration (the shared
  // `circle-dots.png` graphic).
  const loose = treeNodesFromNode(tree).find(
    (node) => node.name === 'image' && !cardNodeIds.has(node.id),
  )
  const decoration = loose ? imageFromTreeNode(loose) : undefined

  return {
    items,
    decorativeMedia: decoration
      ? mediaRef(decoration, sourceImageMediaId(decoration, mediaIds))
      : undefined,
  }
}

/**
 * The intro half of a sub-services section.
 *
 * On the newer landing pages (additions, outdoor hardscape, siding) the
 * services Bricks root holds two unrelated things: an image+text intro — a
 * heading, a "Key Features:" lead-in, a real bullet `<list>`, a CTA button
 * and a photo — followed by the grid of six service cards. Imported as a
 * single `sub-services` block, the whole intro was dropped: the list, the
 * button and the photo never reached the CMS at all.
 *
 * The `<list>` element is what identifies the intro; card containers never
 * contain one.
 */
function subServicesIntro(
  section: NormalizedSection,
  mediaIds: Map<number | string, number>,
  pagesById: Map<number, WordPressPage>,
) {
  const tree = dataOf(section).sourceTree as BricksTreeNode | undefined
  if (!tree) return undefined

  // The intro is the container that carries the section's own copy; the card
  // containers hold linked service cards (`customTag: li` with a `link`).
  // Most pages mark the intro with a `<list>` ("Key Features:"), but the
  // kitchen page's intro is just heading + paragraph + button + photo, so
  // "has a heading and holds no linked cards" is the general test.
  const isCardContainer = (node: BricksTreeNode) =>
    treeNodesFromNode(node).some(
      (child) =>
        child.name === 'block' &&
        (child.settings.customTag === 'li' ||
          (child.settings.link && typeof child.settings.link === 'object')),
    )
  const introContainer = tree.children.find(
    (child) =>
      !isCardContainer(child) &&
      treeNodesFromNode(child).some(
        (node) => node.name === 'heading' && clean(node.settings.text),
      ),
  )
  if (!introContainer) return undefined
  // Only split when there really are cards to split away from.
  if (!tree.children.some(isCardContainer)) return undefined
  // And only when the intro is a section in its own right — it must bring
  // its own photo or feature list, not just a heading. On
  // remodeling-information and home-remodeling the services root opens with
  // nothing but the grid's own heading ("We always provide the best
  // service" / "Services"), and splitting that produced an empty image+text
  // block while stripping the grid of its title.
  if (
    !treeNodesFromNode(introContainer).some(
      (node) =>
        node.name === 'list' ||
        (node.name === 'image' && !isBrandLogo({ filename: sourceFilename(
          (node.settings.image as Record<string, unknown> | undefined)?.filename,
        ) })),
    )
  )
    return undefined

  const nodes = treeNodesFromNode(introContainer)
  const headings = nodes.filter((node) => node.name === 'heading')
  const heading = clean(
    headings.find((node) => ['h1', 'h2', 'h3'].includes(headingTag(node)))?.settings.text,
  )
  if (!heading) return undefined

  // The lead-in above the list ("Key Features:") is a smaller heading.
  const leadIn = clean(
    headings.find((node) => node !== headings[0] && node.settings.text !== heading)?.settings.text,
  )

  const listItems = nodes
    .filter((node) => node.name === 'list')
    .flatMap((node) => {
      const items = node.settings.items
      if (!items || typeof items !== 'object') return []
      return Object.values(items as Record<string, unknown>)
        .map((item) =>
          item && typeof item === 'object'
            ? clean((item as Record<string, unknown>).title)
            : undefined,
        )
        .filter((value): value is string => Boolean(value))
    })

  const paragraphs = nodes
    .filter((node) => node.name === 'text-basic' || node.name === 'text')
    .map((node) => clean(node.settings.text))
    .filter((value): value is string => Boolean(value))

  const description = lexicalDocument([
    ...paragraphs.map((value) => ({ kind: 'paragraph' as const, value })),
    ...(leadIn ? [{ kind: 'paragraph' as const, value: leadIn }] : []),
    { kind: 'list' as const, value: listItems },
  ])

  const image = imageFromTreeNode(introContainer)
  const buttons = treeNodesFromNode(introContainer)
    .filter((node) => node.name === 'button')
    .map((node) => {
      const link =
        node.settings.link && typeof node.settings.link === 'object'
          ? (node.settings.link as Record<string, unknown>)
          : undefined
      const postId = typeof link?.postId === 'string' ? Number(link.postId) : undefined
      const url =
        typeof link?.url === 'string'
          ? link.url
          : postId && pagesById.get(postId)
            ? `/${pagesById.get(postId)?.slug}`
            : undefined
      const label = clean(node.settings.text)
      return label && url ? { label, url, variant: 'primary', openInNewTab: false } : undefined
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  return {
    blockType: 'image-text',
    ...base(section),
    sourceId: `${section.sourceId}-intro`,
    eyebrow: undefined,
    heading,
    description,
    media: image
      ? mediaRef(image, sourceImageMediaId(image, mediaIds))
      : undefined,
    buttons,
    alignment: 'left',
  }
}

/**
 * The contact-form half of a find-us section.
 *
 * On the newer landing pages the "Find us" Bricks root also contains the
 * page's contact form — an `xfluentform` under its own "Contact Info" /
 * "Keep In Touch" copy. Typed as a single `find-us` section, the entire
 * contact block was dropped, so those pages ended with no contact form at
 * all and the `#contact_form` links had no target.
 */
function findUsContactForm(section: NormalizedSection) {
  const tree = dataOf(section).sourceTree as BricksTreeNode | undefined
  if (!tree) return undefined
  const nodes = treeNodesFromNode(tree)
  const form = nodes.find((node) => FORM_ELEMENT_NAMES.has(node.name))
  if (!form) return undefined

  const findUsHeading = clean(
    nodes.find((node) => headingTag(node) === 'h2')?.settings.text,
  )
  const headings = nodes.filter((node) => node.name === 'heading')
  const heading = clean(
    headings
      .filter((node) => ['h1', 'h2', 'h3'].includes(headingTag(node)))
      .map((node) => clean(node.settings.text))
      .find((value) => value && value !== findUsHeading),
  )
  const eyebrow = clean(
    headings.find((node) => SMALL_HEADING_TAGS.has(headingTag(node)))?.settings.text,
  )
  const description = nodes
    .filter((node) => node.name === 'text-basic' || node.name === 'text')
    .map((node) => clean(node.settings.text))
    .find((value): value is string => Boolean(value))

  if (!heading && !description) return undefined

  return {
    blockType: 'contact-form',
    ...base(section),
    sourceId: `${section.sourceId}-form`,
    eyebrow,
    heading,
    description,
    anchorId: clean(tree.settings?._cssId),
    provider: form.name,
    sourceElementId: form.id,
  }
}

function subServiceItems(
  section: NormalizedSection,
  mediaIds: Map<number | string, number>,
  pagesById: Map<number, WordPressPage>,
) {
  const nodes = treeNodes(section)
  const sourceTree = dataOf(section).sourceTree as BricksTreeNode | undefined
  const cardRoots = sourceTree
    ? sourceTree.children
        .filter((node) => node.name === 'container')
        .flatMap((container) => container.children)
        .filter((node) => {
          if (node.name !== 'block') return false
          const descendants = treeNodesFromNode(node)
          return (
            descendants.some((child) => child.name === 'heading' && clean(child.settings.text)) &&
            descendants.some((child) => child.name === 'image')
          )
        })
    : []

  if (cardRoots.length) {
    return cardRoots.flatMap((card, index) => {
      const cardNodes = treeNodesFromNode(card)
      const headingNode = cardNodes.find(
        (node) => node.name === 'heading' && clean(node.settings.text),
      )
      const title = clean(headingNode?.settings.text)
      const descriptionNode = cardNodes.find(
        (node) => node.name === 'text-basic' && clean(node.settings.text),
      )
      const image = imageFromTreeNode(card)

      if (!title || !image) return []

      const link =
        headingNode?.settings.link && typeof headingNode.settings.link === 'object'
          ? (headingNode.settings.link as Record<string, unknown>)
          : undefined
      const postId = typeof link?.postId === 'string' ? Number(link.postId) : undefined
      const sourcePage = postId ? pagesById.get(postId) : pagesByIdByTitle(pagesById, title)
      const url =
        typeof link?.url === 'string'
          ? link.url
          : sourcePage?.slug
            ? `/${sourcePage.slug}`
            : undefined
      const mediaId = image.sourceId
        ? mediaIds.get(image.sourceId)
        : image.filename
          ? mediaIds.get(image.filename)
          : undefined
      const item: Record<string, unknown> = {
        title,
        description: clean(descriptionNode?.settings.text),
        media: mediaRef(image, mediaId),
        sourceOrder: index,
      }

      if (url) item.link = { label: 'Learn more', url, openInNewTab: false }
      return [item]
    })
  }

  const headings = nodes.filter((node) => node.name === 'heading' && clean(node.settings.text))
  const images = sourceImages(section).slice(1)
  return headings.slice(1).map((node, index) => {
    const headingIndex = nodes.indexOf(node)
    const description = nodes
      .slice(headingIndex + 1)
      .find((candidate) => candidate.name === 'text-basic' && clean(candidate.settings.text))
    const image = images[index]
    const link =
      node.settings.link && typeof node.settings.link === 'object'
        ? (node.settings.link as Record<string, unknown>)
        : undefined
    const postId = typeof link?.postId === 'string' ? Number(link.postId) : undefined
    const sourcePage = postId
      ? pagesById.get(postId)
      : pagesByIdByTitle(pagesById, clean(node.settings.text))
    const url =
      typeof link?.url === 'string'
        ? link.url
        : sourcePage?.slug
          ? `/${sourcePage.slug}`
          : undefined
    const item: Record<string, unknown> = {
      title: clean(node.settings.text) || `Service ${index + 1}`,
      description: clean(description?.settings.text),
      media: image
        ? mediaRef(
            image,
            image.sourceId
              ? mediaIds.get(image.sourceId)
              : image.filename
                ? mediaIds.get(image.filename)
                : undefined,
          )
        : undefined,
    }
    if (url) item.link = { label: 'Learn more', url, openInNewTab: false }
    return item
  })
}

function pagesByIdByTitle(pagesById: Map<number, WordPressPage>, title?: string) {
  if (!title) return undefined
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  return [...pagesById.values()].find(
    (page) =>
      page.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim() === normalized,
  )
}

function serviceSlugForAreas(section: NormalizedSection, pagesById: Map<number, WordPressPage>) {
  const queryNode = treeNodes(section).find(
    (node) => node.settings.query && typeof node.settings.query === 'object',
  )
  const query = queryNode?.settings.query as Record<string, unknown> | undefined
  const parentId = typeof query?.post_parent === 'string' ? Number(query.post_parent) : undefined
  return parentId ? pagesById.get(parentId)?.slug : undefined
}

/**
 * The Find-us details.
 *
 * Each detail is a Bricks icon-box whose `content` is an <h4> caption
 * followed by the value, e.g.
 *
 *   <h4>Call Us</h4>\n<a href="tel:6502209600">(650) 220-9600</a>
 *
 * Reading the whole thing through `clean()` produced "Call Us (650)
 * 220-9600", which the section then rendered under its own "Call Us" label —
 * so the page showed "Call Us Call Us (650) 220-9600" and built a `mailto:`
 * that included the caption. Drop the caption and keep only the value; the
 * address's `<br>` becomes a real newline so the two offices stay on
 * separate lines.
 */
function findUsData(section: NormalizedSection) {
  const values: string[] = []
  const mapUrls: string[] = []

  for (const node of treeNodes(section)) {
    const settings = node.settings
    if (node.name === 'icon-box' && typeof settings.content === 'string') {
      const withoutCaption = settings.content.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i, '')
      const withBreaks = withoutCaption.replace(/<br\s*\/?>/gi, '\n')
      const value = withBreaks
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n')
      if (value) values.push(value)
      continue
    }
    for (const value of [settings.text, settings.title, settings.label]) {
      const cleaned = clean(value)
      if (cleaned) values.push(cleaned)
    }
    const link = settings.link
    if (link && typeof link === 'object') {
      const url = (link as Record<string, unknown>).url
      if (typeof url === 'string' && /maps|google\./i.test(url)) mapUrls.push(url)
    }
  }

  return {
    phone: values.find((value) => /(?:\+?1\s*)?\(?\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}/.test(value)),
    email: values.find((value) => /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value)),
    address: values.find((value) =>
      /\b(?:ave|avenue|street|st\.?|road|rd\.?|blvd\.?)\b/i.test(value),
    ),
    mapUrl: mapUrls[0],
  }
}

function featureItems(section: NormalizedSection) {
  const nodes = treeNodes(section)

  return nodes
    .filter((node) => node.name === 'icon-box' || node.name === 'list')
    .flatMap((node) => {
      if (node.name === 'list') {
        const items = node.settings.items
        if (!items || typeof items !== 'object') return []
        return Object.values(items as Record<string, unknown>)
          .map((item) =>
            item && typeof item === 'object'
              ? clean((item as Record<string, unknown>).title)
              : undefined,
          )
          .filter((title): title is string => Boolean(title))
          .map((title) => ({ title }))
      }

      const rawContent =
        typeof node.settings.content === 'string' ? node.settings.content : undefined
      const title = rawContent
        ? clean(rawContent.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1])
        : clean(node.settings.text || node.settings.title)
      const description = rawContent
        ? clean(rawContent.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i, ''))
        : undefined

      if (!title) return []

      return [
        {
          title,
          ...(description ? { description } : {}),
        },
      ]
    })
    .filter((item): item is { title: string; description?: string } => Boolean(item.title))
    .filter((item) => !/^why choose|^experience the|^the prime difference/i.test(item.title))
    .filter((item) => !/^over 350\+ projects/i.test(item.title))
}

function headingFromMarkup(value: unknown) {
  if (typeof value !== 'string') return undefined
  const match = value.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i)
  return clean(match?.[1])
}

const headingTag = (node: { name: string; settings: Record<string, unknown> }) =>
  node.name === 'heading' && typeof node.settings.tag === 'string'
    ? node.settings.tag.toLowerCase()
    : ''

const SMALL_HEADING_TAGS = new Set(['h4', 'h5', 'h6'])

/** Bricks elements that render a real form. */
const FORM_ELEMENT_NAMES = new Set(['xfluentform', 'forminator', 'xproform'])

/**
 * Service grids that are deliberately NOT imported, by page slug and Bricks
 * section id. **An accepted divergence from the WordPress export** (CLAUDE.md
 * §8c), not a migration gap — the source does contain these cards.
 *
 * The same six generic cards (Home Remodeling, Kitchen Remodeling, ADU &
 * Garage Conversions, Home Additions, New Construction, Bathroom Remodeling)
 * are pasted into the services root of most landing pages. On the pages that
 * are about remodeling in general they are the point of the section and carry
 * a heading that introduces them. On a page about one specific trade they are
 * off-topic cross-links, and because the heading on those pages belongs to the
 * image+text intro that shares the same Bricks root, the grid renders with no
 * heading at all — six unrelated cards floating with no context.
 *
 * Removing the grid does not remove the intro: they are separate blocks, and
 * the intro (heading, "Key Features" list, CTA button, photo) still imports.
 */
const EXCLUDED_SERVICE_GRIDS: Record<string, string[]> = {
  'siding-installation-replacement-information': ['63c060'],
  'kitchen-remodeling-information': ['73aa13'],
  // Same headingless, off-topic grid on the two remaining trade-specific
  // pages: a home-additions page listing "Bathroom Remodeling", an
  // outdoor-hardscape page listing "Kitchen Remodeling".
  'additions-remodeling-information': ['5ec355'],
  'outdoor-hardscape-outdoor-kitchen-information': ['c34197'],
}

/**
 * The section's real title.
 *
 * The normalizer returns headings in document order and takes the first one,
 * regardless of its tag. Several Bricks sections put the small kicker after
 * the h2 — on remodeling-information, `olbtqg` is h5 "Experience the "Prime
 * Difference"" followed by h2 "Why choose Prime Design & Build?" — so the
 * kicker won and the real h2 was never imported at all. Prefer the largest
 * heading present, and only fall back to document order when the section has
 * nothing but small headings.
 */
function sectionHeading(section: NormalizedSection) {
  const nodes = treeNodes(section)
  const large = nodes
    .filter((node) => ['h1', 'h2', 'h3'].includes(headingTag(node)))
    .map((node) => clean(node.settings.text))
    .find((value): value is string => Boolean(value))
  if (large) return large
  const data = dataOf(section)
  return first([data.heading, ...(Array.isArray(data.headings) ? data.headings : [])])
}

function sectionEyebrow(section: NormalizedSection) {
  const nodes = treeNodes(section)
  const mainHeading = sectionHeading(section)
  const mainHeadingIndex = mainHeading
    ? nodes.findIndex((node) => clean(node.settings.text) === mainHeading)
    : -1

  const precedingNodes = mainHeadingIndex >= 0 ? nodes.slice(0, mainHeadingIndex) : nodes

  // Kept ahead of the generic rules below so the established Prime
  // Difference stat line ("Over 350+ Projects in Silicon Valley") keeps
  // winning on every page that has one.
  if (section.type === 'prime-difference') {
    const projectCount = nodes
      .filter((node) => node.name === 'icon-box')
      .map((node) => headingFromMarkup(node.settings.content))
      .find((value) => value && /^over 350\+ projects/i.test(value))
    if (projectCount) return projectCount
  }

  // A small heading (h4/h5/h6) is the section's kicker wherever it sits
  // relative to the h2. Scoping this to nodes *before* the h2 meant the
  // "Services" kicker on `wekxhi` and the "Experience the "Prime
  // Difference"" kicker on `olbtqg` were both dropped, because WordPress
  // authors them after the big heading.
  const smallHeading = nodes
    .filter((node) => SMALL_HEADING_TAGS.has(headingTag(node)))
    .map((node) => clean(node.settings.text))
    .find((value): value is string => Boolean(value))
  if (smallHeading) return smallHeading

  // Sections whose kicker is an icon-box with an <h4> inside it rather than a
  // heading element (luxury-cta's "Need a new kitchen…", service-areas' "Our
  // Service Areas", project-grid's "Our Projects").
  const kicker = precedingNodes.find((node) => node.name === 'icon-box')
  const kickerText = headingFromMarkup(kicker?.settings.content)
  if (kickerText) return kickerText

  return precedingNodes
    .filter((node) => node.name === 'text-basic')
    .map((node) => clean(node.settings.text))
    .find((value) => value && value.length <= 120)
}

function htmlListItems(value: unknown) {
  if (typeof value !== 'string') return []
  return [...value.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => clean(match[1]))
    .filter((item): item is string => Boolean(item))
}

function projectGalleryIds(project: WordPressProject) {
  const value = project.meta.find((item) => item.key === 'project_gallery')?.value || ''
  return [...value.matchAll(/i:\d+;s:\d+:"(\d+)";/g)].map((match) => Number(match[1]))
}

function dynamicHappyFilesImages(section: NormalizedSection, source: WordPressSource) {
  // A `happyfiles-gallery` node stores the folder it displays as a numeric
  // term_id in settings.ids (e.g. { 0: "8" }). That id only resolves to a
  // slug via the WXR's top-level term registry, and only attachments carry
  // the slug directly. Previously this data was captured as a `galleryId`
  // pointer and then silently dropped downstream because it had no mediaId
  // — which is why curated galleries (e.g. the ~50-photo "Kitchens (GALLERY)"
  // folder) fell through to the much larger, unscoped "all projects" pool.
  const folderIds = treeNodes(section)
    .filter((node) => node.name === 'happyfiles-gallery' || node.name === 'image-gallery')
    .map((node) => {
      const ids = node.settings.ids as Record<string, unknown> | undefined
      return typeof ids?.['0'] === 'string' || typeof ids?.['0'] === 'number'
        ? String(ids['0'])
        : undefined
    })
    .filter((id): id is string => Boolean(id))
  if (folderIds.length === 0) return []

  const slugs = new Set(folderIds.map((id) => source.happyfilesFolders[id]).filter(Boolean))
  if (slugs.size === 0) return []

  // Deliberately NOT capped here: this list also drives media resolution, and
  // trimming it first would stop the later attachments from ever being
  // imported. The widget's `max` is applied once the items are resolved —
  // see `happyFilesMax`.
  return source.attachments
    .filter((attachment) => attachment.happyfilesCategorySlugs?.some((slug) => slugs.has(slug)))
    .map((attachment) => ({ sourceId: attachment.id, status: 'unresolved' as const }))
}

/**
 * How many photos the gallery widget actually shows.
 *
 * Ignoring it published the entire folder (26 images on the kitchen page
 * where WordPress shows 18). It must be applied to the *resolved* items:
 * the raw attachment list contains files that were never imported into the
 * Media collection, so slicing before resolution picks a mostly-empty set.
 */
function happyFilesMax(nodes: BricksTreeNode[]) {
  return nodes
    .filter((node) => node.name === 'happyfiles-gallery' || node.name === 'image-gallery')
    .map((node) => Number(node.settings.max))
    .find((value) => Number.isFinite(value) && value > 0)
}

const capped = <T,>(items: T[], max?: number) => (max ? items.slice(0, max) : items)

function cssClasses(node: BricksTreeNode) {
  const direct = node.settings._cssClasses
  const hidden = node.settings._hidden
  const hiddenClasses =
    hidden && typeof hidden === 'object'
      ? (hidden as Record<string, unknown>)._cssClasses
      : undefined
  return [direct, hiddenClasses]
    .filter((value): value is string => typeof value === 'string')
    .flatMap((value) => value.split(/\s+/).filter(Boolean))
}

function textFromNode(node: BricksTreeNode) {
  return first(
    treeNodesFromNode(node)
      .filter((child) => child.name === 'text-basic' || child.name === 'heading')
      .map((child) => child.settings.text),
  )
}

function dynamicGalleryGroups(
  section: NormalizedSection,
  source: WordPressSource,
  mediaIds: Map<number | string, number>,
) {
  const tabs = treeNodes(section).find((node) => node.name === 'tabs-nested')
  const tabGroups = tabs
    ? (() => {
        const titles = treeNodesFromNode(tabs).filter((node) =>
          cssClasses(node).includes('tab-title'),
        )
        const panes = treeNodesFromNode(tabs).filter((node) =>
          cssClasses(node).includes('tab-pane'),
        )
        if (!titles.length || titles.length !== panes.length) return []
        return titles.flatMap((titleNode, index) => {
          const pane = panes[index]
          const label = textFromNode(titleNode)
          return label && pane ? [{ label, root: pane }] : []
        })
      })()
    : []

  const sourceTree = dataOf(section).sourceTree as BricksTreeNode | undefined
  const containerGroups = sourceTree
    ? treeNodesFromNode(sourceTree)
        .filter((node) => node.name === 'container')
        .flatMap((container) => {
          const label = textFromNode(container)
          const hasGallery = treeNodesFromNode(container).some(
            (node) => node.name === 'happyfiles-gallery' || node.name === 'image-gallery',
          )
          return label && hasGallery ? [{ label, root: container }] : []
        })
    : []

  const groups = tabGroups.length ? tabGroups : containerGroups
  return groups.flatMap(({ label, root }) => {
    const folderIds = treeNodesFromNode(root)
      .filter((node) => node.name === 'happyfiles-gallery' || node.name === 'image-gallery')
      .map((node) => {
        const ids = node.settings.ids as Record<string, unknown> | undefined
        return typeof ids?.['0'] === 'string' || typeof ids?.['0'] === 'number'
          ? String(ids['0'])
          : undefined
      })
      .filter((id): id is string => Boolean(id))
    const slugs = new Set(folderIds.map((id) => source.happyfilesFolders[id]).filter(Boolean))
    // Each tab's widget caps its own folder (both tabs on
    // remodeling-information are `max: 18`). Applied after resolution, for
    // the same reason as the single-gallery path.
    const max = happyFilesMax(treeNodesFromNode(root))
    const items = capped(
      source.attachments
        .filter((attachment) => attachment.happyfilesCategorySlugs?.some((slug) => slugs.has(slug)))
        .filter((attachment) => mediaIds.get(attachment.id)),
      max,
    )
      .map((attachment, itemIndex) => ({
        media: mediaIds.get(attachment.id),
        caption: undefined,
        alt: attachment.title || `${label} image ${itemIndex + 1}`,
        sourceOrder: itemIndex,
        sourceAttachmentId: attachment.id,
      }))

    // Keep unresolved source IDs during the discovery pass. The importer
    // resolves media after it has collected every attachment ID, including
    // IDs found inside tab panes.
    return items.length ? [{ label, items }] : []
  })
}

/**
 * Bricks serialises PHP arrays as objects keyed by index (`{"0":"962",
 * "1":"2305"}`), so `Array.isArray` is false for every list in a query —
 * `post__in` included. Reading it with `Array.isArray` silently produced
 * "no pinned posts" and the project grid fell back to every project on the
 * site.
 */
function bricksArray(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>)
  return undefined
}

function projectQueryProjects(section: NormalizedSection, projects: WordPressProject[]) {
  const projectQueries = treeNodes(section)
    .map((node) => node.settings.query)
    .filter(
      (query): query is Record<string, unknown> =>
        Boolean(query) && typeof query === 'object' && JSON.stringify(query).includes('project'),
    )
  if (projectQueries.length === 0) return []

  const byId = new Map(projects.map((project) => [project.id, project]))
  const result: WordPressProject[] = []

  // A `post__in` is an explicit editorial selection — the kitchen page pins
  // six projects, the bathroom page two. These sections also carry a second,
  // unfiltered loop (the card template's own nested query), and unioning the
  // two put every project on the site back into the grid. When anything on
  // the section is pinned, the pinned set *is* the section.
  const pinned = projectQueries.filter((query) => bricksArray(query.post__in)?.length)
  const activeQueries = pinned.length ? pinned : projectQueries

  for (const query of activeQueries) {
    // Real Bricks project cards scope the loop to project posts. Preserve those
    // post boundaries so the landing page does not flatten every project's
    // nested gallery into one visible image list.
    const postIn = bricksArray(query.post__in)
      ?.map((v) => Number(v))
      .filter((n) => !Number.isNaN(n))
    const scopedProjects = postIn
      ? postIn.map((id) => byId.get(id)).filter((p): p is WordPressProject => Boolean(p))
      : projects // no post__in on this query: it really does mean "all projects"
    const cap =
      typeof query.posts_per_page === 'string' || typeof query.posts_per_page === 'number'
        ? Number(query.posts_per_page)
        : undefined
    const limited = cap && !postIn ? scopedProjects.slice(0, cap) : scopedProjects

    for (const project of limited) {
      if (!result.some((item) => item.id === project.id)) result.push(project)
    }
  }
  return result
}

function dynamicProjectImages(section: NormalizedSection, projects: WordPressProject[]) {
  const seen = new Set<number>()
  return projectQueryProjects(section, projects).flatMap((project) =>
    projectGalleryIds(project).flatMap((sourceId) => {
      if (seen.has(sourceId)) return []
      seen.add(sourceId)
      return [{ sourceId, status: 'unresolved' as const }]
    }),
  )
}

function dynamicProjectCards(
  section: NormalizedSection,
  projects: WordPressProject[],
  mediaIds: Map<number | string, number>,
) {
  return projectQueryProjects(section, projects).flatMap((project) => {
    const title = clean(project.title)
    if (!title) return []
    return [
      {
        title,
        image: project.thumbnailId ? mediaIds.get(project.thumbnailId) : undefined,
        link: project.slug ? `/project/${project.slug}` : undefined,
        sourceId: project.id,
      },
    ]
  })
}

function mapGalleryItems(
  items: NormalizedGalleryItem[] | undefined,
  mediaIds: Map<number | string, number>,
) {
  const seen = new Set<number | string>()
  return (items || [])
    .map((item, index) => ({
      media: item.mediaId ? mediaIds.get(item.mediaId) : undefined,
      caption: undefined,
      alt: item.sourceUrl || item.dynamicSource || `Gallery image ${index + 1}`,
      sourceOrder: index,
      sourceAttachmentId: item.mediaId,
    }))
    .filter((item) => item.media || item.sourceAttachmentId)
    .filter((item) => {
      const key = item.sourceAttachmentId ?? item.media
      if (key === undefined) return true
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function mapSection(
  section: NormalizedSection,
  mediaIds: Map<number | string, number>,
  pagesById: Map<number, WordPressPage>,
  projects: WordPressProject[],
  faqRecords: Array<{
    id: number
    title: string
    content: string
    category?: string
    categorySlug?: string
  }>,
  source: WordPressSource,
): Record<string, unknown> | undefined {
  const data = dataOf(section)
  // WordPress explicitly marks some duplicate/template roots as hidden. They
  // are source diagnostics, not visible page sections, and must not be loaded
  // into the frontend as content.
  if (isHiddenSourceSection(section)) return undefined
  const heading = sectionHeading(section)
  const eyebrow = sectionEyebrow(section)
  const sourceBody = Array.isArray(data.body)
    ? data.body.map(clean).filter((value): value is string => Boolean(value))
    : []
  // Body text the section's own copy already accounts for — the kicker, and
  // any paragraph that belongs to a card rather than to the section — must
  // not be swept into the section description. On `wekxhi` that produced a
  // description made of the intro line plus all six service-card blurbs.
  const sectionBody = sourceBody.filter((value) => value !== eyebrow && value !== heading)
  const description = sectionBody.join('\n\n') || first([data.body])
  const images = section.images
  const primaryImage = data.primaryImage as NormalizedImage | undefined
  // A real `<image>` element beats whatever the normalizer picked as the
  // section's primary image, because that can be a decorative CSS
  // background — the bathroom page's image+text section rendered
  // `service-bg.png`, a background texture, instead of its photo `o-81.jpg`.
  //
  // With one exception: the brand logo. Every hero embeds it as a foreground
  // mark, so it is the only `<image>` element a hero has, while the hero's
  // actual photo is the section background. Treating the logo as content
  // made every hero render the logo instead of its photo.
  // The logo is excluded from every candidate, not just the first pass: the
  // remodeling-information hero has a video background and no photo at all,
  // so falling through to `images[0]` put the logo back.
  const refImage = [...sourceImages(section), primaryImage, ...images].find(
    (image): image is NormalizedImage => Boolean(image) && !isBrandLogo(image!),
  )
  const ref = refImage ? mediaRef(refImage, sourceImageMediaId(refImage, mediaIds)) : undefined
  const common = base(section)

  switch (section.type) {
    case 'hero': {
      // The looping background video (`_background.videoUrl`) is a real
      // field now, not a note in `sourceMetadata`. `sourceUrl` is the
      // WordPress origin; `asset` is filled once the file is imported.
      const heroVideoUrl = sourceVideoUrl(section)
      const heroVideoAsset = resolveVideoMediaId(heroVideoUrl)
      if (heroVideoUrl && !heroVideoAsset) unresolvedVideoUrls.add(heroVideoUrl)
      return {
        blockType: 'hero',
        ...common,
        eyebrow,
        heading,
        description,
        backgroundMedia: ref,
        backgroundVideo: heroVideoUrl
          ? { sourceUrl: heroVideoUrl, asset: heroVideoAsset, alt: 'Prime Design & Build' }
          : undefined,
        buttons: buttonData(section, pagesById),
        sourceMetadata: { ...common.sourceMetadata, backgroundVideoUrl: heroVideoUrl },
      }
    }
    case 'cta':
      return {
        blockType: 'cta',
        ...common,
        eyebrow,
        heading,
        description,
        media: ref,
        buttons: buttonData(section, pagesById),
      }
    case 'image-text': {
      // A row of photo cards ("Benefits of Siding") is not an image+text
      // section — it only types as one upstream. Two or more cards is the
      // discriminator; the genuine image+text sections on the other pages
      // have none.
      const benefits = benefitsContent(section, mediaIds)
      if (benefits.items.length >= 2) {
        return {
          blockType: 'benefit-cards',
          ...common,
          eyebrow,
          heading,
          description: undefined,
          items: benefits.items,
          decorativeMedia: benefits.decorativeMedia,
        }
      }
      return {
        blockType: 'image-text',
        ...common,
        eyebrow,
        heading,
        description: lexicalDocument(
          sectionBody.map((value) => ({ kind: 'paragraph' as const, value })),
        ),
        media: ref,
        buttons: buttonData(section, pagesById),
        alignment: 'left',
      }
    }
    case 'craftsmanship': {
      const content = craftsmanshipContent(section, mediaIds)
      // The kicker here is a `text-basic`, not a heading element, and the
      // section's title is authored as an untagged <heading>. Take the two
      // in source order rather than through the generic heading helpers.
      const nodes = treeNodes(section)
      const craftEyebrow = clean(
        nodes.find((node) => node.name === 'text-basic')?.settings.text,
      )
      const craftHeading = clean(nodes.find((node) => node.name === 'heading')?.settings.text)
      return {
        blockType: 'craftsmanship',
        ...common,
        eyebrow: craftEyebrow,
        heading: craftHeading,
        ...content,
      }
    }
    case 'video': {
      const video = section.videos[0]
      return {
        blockType: 'video',
        ...common,
        heading,
        description,
        source: video?.sourceUrl ? 'externalUrl' : 'media',
        externalUrl: video?.sourceUrl,
        controls: true,
        sourceVideoId: video?.sourceUrl,
      }
    }
    case 'gallery': {
      const projectCards = dynamicProjectCards(section, projects, mediaIds)
      if (projectCards.length) {
        // Project-loop card templates contain dynamic placeholders such as
        // `{post_title}` and `{post_content}`. They are not section copy and
        // must never be rendered literally above the project grid.
        const projectDescription =
          sourceBody
            .filter(
              (value) => !/\{(?:post_title|post_content|featured_image)(?::[^}]+)?\}/i.test(value),
            )
            .join('\n\n') || undefined
        // The kicker's icon ("Our Projects" sits beside `home.svg`). The
        // block has always had an `eyebrowIcon` field; nothing ever wrote to
        // it, so it read as empty on every page.
        const kickerSvg = treeNodes(section)
          .filter((node) => node.name === 'icon-box')
          .map((node) => {
            const icon = node.settings.icon as Record<string, unknown> | undefined
            return icon?.svg && typeof icon.svg === 'object'
              ? (icon.svg as Record<string, unknown>)
              : undefined
          })
          .find(Boolean)
        const kickerSvgId = typeof kickerSvg?.id === 'number' ? kickerSvg.id : undefined
        return {
          blockType: 'project-grid',
          ...common,
          eyebrow,
          eyebrowIcon: kickerSvg
            ? {
                iconMedia: kickerSvgId ? mediaIds.get(kickerSvgId) : undefined,
                iconLibrary: 'svg',
                iconName: typeof kickerSvg.filename === 'string' ? kickerSvg.filename : undefined,
                sourceSvgUrl: typeof kickerSvg.url === 'string' ? kickerSvg.url : undefined,
              }
            : undefined,
          heading,
          description: projectDescription,
          items: projectCards.map((project) => ({
            title: project.title,
            image: project.image
              ? {
                  asset: project.image,
                  alt: project.title,
                  sourceAttachmentId: projects.find((item) => item.id === project.sourceId)
                    ?.thumbnailId,
                }
              : undefined,
            link: project.link ? { url: project.link } : undefined,
          })),
        }
      }

      const groups = dynamicGalleryGroups(section, source, mediaIds)
      const resolvedGroups = groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.media),
        }))
        .filter((group) => group.items.length)
      if (resolvedGroups.length) {
        return {
          blockType: 'gallery',
          ...common,
          eyebrow,
          heading,
          description,
          items: [],
          groups: resolvedGroups,
          layout: undefined,
          lightbox: true,
          sourceGalleryType: 'wordpress-tabs-gallery',
        }
      }

      const items = mapGalleryItems(
        data.galleryItems as NormalizedGalleryItem[] | undefined,
        mediaIds,
      )
      const directImages = sourceImages(section)
        .map((image, index) => ({
          media: image.sourceId
            ? mediaIds.get(image.sourceId)
            : image.filename
              ? mediaIds.get(image.filename)
              : undefined,
          caption: undefined,
          alt: image.filename || `Gallery image ${index + 1}`,
          sourceOrder: index,
          sourceAttachmentId: image.sourceId,
        }))
        .filter((item) => item.media)
      // A curated HappyFiles folder (e.g. "Kitchens (GALLERY)") is a specific,
      // hand-picked set of photos for this exact gallery widget — prefer it
      // over the much broader, unscoped "every project on the site" fallback.
      const happyFilesImages = capped(
        dynamicHappyFilesImages(section, source)
          .map((image, index) => ({
            media: mediaIds.get(image.sourceId!),
            caption: undefined,
            alt: `Gallery image ${index + 1}`,
            sourceOrder: index,
            sourceAttachmentId: image.sourceId,
          }))
          .filter((item) => item.media),
        happyFilesMax(treeNodes(section)),
      )
      const dynamicImages = dynamicProjectImages(section, projects)
        .map((image, index) => ({
          media: mediaIds.get(image.sourceId!),
          caption: undefined,
          alt: `Project gallery image ${index + 1}`,
          sourceOrder: index,
          sourceAttachmentId: image.sourceId,
        }))
        .filter((item) => item.media)
      return {
        blockType: 'gallery',
        ...common,
        eyebrow,
        heading,
        description,
        // A HappyFiles widget is an explicit source selection. Prefer its
        // resolved folder contents over generic normalized image nodes from
        // the surrounding Bricks section, which may belong to another
        // element in that section.
        items: happyFilesImages.length
          ? happyFilesImages
          : items.length
            ? items
            : directImages.length
              ? directImages
              : dynamicImages,
        groups: [],
        layout: undefined,
        lightbox: true,
        sourceGalleryType: 'wordpress-gallery',
      }
    }
    case 'before-after': {
      const beforeAfterImages = sourceImages(section)
      return {
        blockType: 'before-after',
        ...common,
        heading,
        beforeLabel: 'Before',
        afterLabel: 'After',
        beforeMedia: sourceImageMediaId(beforeAfterImages[0], mediaIds),
        afterMedia: sourceImageMediaId(beforeAfterImages[1], mediaIds),
      }
    }
    case 'sub-services': {
      // Some sections typed `sub-services` are really a benefits card row:
      // the same staggered image + heading + copy columns closing with the
      // shared `circle-dots` graphic (kitchen's Custom / European / Shaker
      // Kitchen, "Benefits of Home Additions", and so on). The service grids
      // are distinguishable because every one of their cards links to a
      // service page; benefit cards never link anywhere.
      const tree = dataOf(section).sourceTree as BricksTreeNode | undefined
      if (tree) {
        const cards = photoCardRoots(tree)
        const anyLinked = cards.some((card) =>
          treeNodesFromNode(card).some(
            (node) => node.settings.link && typeof node.settings.link === 'object',
          ),
        )
        if (cards.length >= 2 && !anyLinked) {
          const benefits = benefitsContent(section, mediaIds)
          if (benefits.items.length >= 2) {
            return {
              blockType: 'benefit-cards',
              ...common,
              eyebrow,
              // The section's own heading, when it has one that is not just
              // the first card's title.
              heading: heading === benefits.items[0]?.title ? undefined : heading,
              description: undefined,
              items: benefits.items,
              decorativeMedia: benefits.decorativeMedia,
            }
          }
        }
      }
      const items = subServiceItems(section, mediaIds, pagesById)
      // Each card's blurb belongs to that card, not to the section. Without
      // this the section description became the intro line followed by all
      // six service blurbs run together.
      const cardCopy = new Set(
        items
          .map((item) => (item as Record<string, unknown>).description)
          .filter((value): value is string => typeof value === 'string'),
      )
      const intro = sectionBody.filter((value) => !cardCopy.has(value))
      return {
        blockType: 'sub-services',
        ...common,
        eyebrow,
        heading,
        description: intro.join('\n\n') || undefined,
        items,
      }
    }
    case 'prime-difference':
      return {
        blockType: 'prime-difference',
        ...common,
        eyebrow,
        heading,
        description,
        features: featureItems(section),
        comparisons: comparisonItems(section, mediaIds),
        videos: section.videos.map((video) => {
          // Prefer the imported Media document over the CDN hotlink. These
          // files are already in the Media collection but carry no
          // WordPress attachment id, so they only resolve by filename.
          const asset =
            (video.attachmentId ? mediaIds.get(video.attachmentId) : undefined) ??
            resolveVideoMediaId(video.sourceUrl)
          if (video.sourceUrl && !asset) unresolvedVideoUrls.add(video.sourceUrl)
          return {
            video: asset,
            externalUrl: video.sourceUrl,
            // The source's own poster wins; otherwise fall back to the
            // `<video>-poster.jpg` still that ships alongside every imported
            // video in the Media collection.
            poster:
              (video.poster?.sourceId ? mediaIds.get(video.poster.sourceId) : undefined) ??
              resolveVideoPoster(asset),
            caption: undefined,
            sourceVideoId: video.attachmentId ? String(video.attachmentId) : undefined,
          }
        }),
        media: ref,
      }
    case 'experience-difference':
      return {
        blockType: 'experience-difference',
        ...common,
        eyebrow,
        heading,
        description,
        features: featureItems(section),
        media: ref,
      }
    case 'service-areas': {
      const areaServiceSlug = serviceSlugForAreas(section, pagesById)
      const areas = treeNodes(section).flatMap((node) => {
        if (node.name !== 'icon-box') return []
        const label = clean(node.settings.content)
        // The section's own kicker is an icon-box too ("Our Service Areas").
        // It is the eyebrow, not a city, and was rendering as a chip in the
        // list of locations.
        if (label && label === eyebrow) return []
        const citySlug = label
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
        const url =
          areaServiceSlug && citySlug
            ? `/${areaServiceSlug}/${areaServiceSlug}-in-${citySlug}`
            : undefined
        return label ? [{ label, link: url ? { label, url, openInNewTab: false } : undefined }] : []
      })
      // The section closes with a state map and its caption ("California"
      // over `ca-cities.png`); both were dropped before this.
      const nodes = treeNodes(section)
      const regionHeading = nodes
        .filter((node) => headingTag(node) === 'h3')
        .map((node) => clean(node.settings.text))
        .find((value): value is string => Boolean(value))
      const mapNode = nodes.find((node) => node.name === 'image')
      const mapImage = mapNode ? imageFromTreeNode(mapNode) : undefined
      return {
        blockType: 'service-areas',
        ...common,
        eyebrow,
        heading,
        description,
        areas,
        regionHeading,
        mapMedia: mapImage
          ? mediaRef(mapImage, sourceImageMediaId(mapImage, mediaIds))
          : undefined,
      }
    }
    case 'repair-services':
      return {
        blockType: 'repair-services',
        ...common,
        heading: heading || 'Repair & Installation',
        description,
        categories: (
          (data.repairCategories as Array<Record<string, unknown>> | undefined) || []
        ).map((category) => ({
          media: (() => {
            const image = imageFromTreeNode(
              treeNodes(section).find((node) => node.id === category.sourceId) || {
                id: String(category.sourceId || ''),
                name: 'block',
                parent: 0,
                settings: {},
                children: [],
                raw: {},
              },
            )
            return image
              ? mediaRef(image, sourceImageMediaId(image, mediaIds))
              : undefined
          })(),
          title: clean(category.title) || 'Service',
          heading: clean(category.heading),
          description: clean(category.description) || clean(category.html),
          features: Array.isArray(category.features)
            ? category.features
                .map(clean)
                .filter((feature): feature is string => Boolean(feature))
                .map((text) => ({ text }))
            : htmlListItems(category.html).map((text) => ({ text })),
          sourceId: category.sourceId,
        })),
      }
    case 'luxury-cta':
      return {
        blockType: 'luxury-cta',
        ...common,
        eyebrow,
        heading,
        description,
        media: ref,
        buttons: buttonData(section, pagesById),
      }
    case 'find-us': {
      const contact = findUsData(section)
      return {
        blockType: 'find-us',
        ...common,
        eyebrow,
        heading,
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        mapUrl: contact.mapUrl,
      }
    }
    case 'faq': {
      const categoriesSource =
        (data.faq as { categories?: Array<Record<string, unknown>> } | undefined)?.categories || []
      return {
        blockType: 'faq',
        ...common,
        heading,
        description,
        categories: categoriesSource.map((category) => {
          const query = category.query as Record<string, unknown> | undefined
          const taxQuery = Array.isArray(query?.tax_query_advanced)
            ? (query!.tax_query_advanced[0] as Record<string, unknown> | undefined)
            : undefined
          const querySlug = typeof taxQuery?.terms === 'string' ? taxQuery.terms : undefined
          // A real query/taxonomy-slug link is reliable; matching by the
          // human-readable category title is a fallback for the older
          // tabs/accordion pages that have a title but no query.
          const matches = querySlug
            ? faqRecords.filter((faq) => faq.categorySlug === querySlug)
            : faqRecords.filter(
                (faq) =>
                  faq.category &&
                  clean(faq.category)?.toLowerCase() ===
                    clean(category.title as string)
                      ?.toLowerCase()
                      .replace(/ questions$/, ''),
              )
          return {
            title: clean(category.title as string) || 'Frequently Asked Questions',
            questions: matches
              .map((faq) => ({
                question: clean(faq.title),
                answer: clean(faq.content),
                sourceId: String(faq.id),
              }))
              .filter((faq) => faq.question && faq.answer),
            sourceId: category.sourceId,
          }
        }),
      }
    }
    case 'testimonials':
    case 'testimonial':
      return {
        blockType: 'landing-testimonials',
        ...common,
        eyebrow: sectionEyebrow(section),
        heading,
        description,
        providers: ((data.testimonials as Array<Record<string, unknown>> | undefined) || []).map(
          (provider) => {
            const name = clean(provider.provider) || 'Testimonials'
            const source = name.toLowerCase().includes('yelp') ? 'yelp' : 'google'
            const summary =
              source === 'yelp' ? website.reviewSummary.yelp : website.reviewSummary.google
            return {
              name,
              collectionId: provider.collectionId,
              reviewUrl: summary.url,
              rating: summary.rating,
              reviewCount: summary.count,
              reviews: sourceTestimonials
                .filter((review) => review.source === source)
                .map((review) => ({
                  reviewer: review.name,
                  rating: review.rating,
                  body: review.text,
                  date: review.date,
                  sourceId: `${review.source}:${review.name}:${review.date}`,
                })),
            }
          },
        ),
      }
    case 'booking':
    case 'contact-form':
    case 'form': {
      const integrations = (data.integrations as Array<Record<string, unknown>> | undefined) || []
      const integration = integrations[0]
      // These sections carry real copy above the form on most pages
      // ("Contact Info" / "Receive a Free Estimate" / the response-time
      // line). It was never imported, so the renderer fell through to the
      // homepage contact defaults and the page's own words were lost.
      //
      // `anchorId` is the Bricks `_cssId`: the hero and CTA buttons link to
      // `#contact_form`, which is this section's id, so without it those
      // buttons go nowhere.
      const sourceTree = data.sourceTree as BricksTreeNode | undefined
      const anchorId = clean(sourceTree?.settings?._cssId)
      return {
        blockType: section.type === 'booking' ? 'booking' : 'contact-form',
        ...common,
        eyebrow,
        heading,
        ...(section.type === 'booking' ? { anchorId } : { description }),
        provider: clean(integration?.provider),
        shortcode: clean(integration?.shortcode),
        sourceElementId: section.sourceId,
        integrationMetadata: integration?.metadata,
      }
    }
    case 'carousel': {
      const items = (data.mediaItems as NormalizedGalleryItem[] | undefined) || []
      const isVideo = items.some((item) => item.mediaType === 'video')
      const sourceItems = items.length
        ? items
        : sourceImages(section).map((image, index) => ({
            mediaId: image.sourceId,
            sourceId: image.sourceId || `image-${index}`,
            mediaType: 'image' as const,
          }))
      return {
        blockType: isVideo ? 'video-carousel' : 'gallery-carousel',
        ...common,
        items: sourceItems.map((item, index) => ({
          externalUrl: 'sourceUrl' in item ? item.sourceUrl : undefined,
          sourceId: item.sourceId,
          sourceOrder: index,
          media: item.mediaId ? mediaIds.get(item.mediaId) : undefined,
        })),
        settings: undefined,
      }
    }
    case 'utility':
      return undefined
    case 'content':
    case 'unsupported':
      // Keep an existing, already-rendered block shape for source sections
      // that do not yet have a specialized semantic mapper. The old importer
      // returned undefined here, which silently deleted source sections.
      // Provenance and extracted source text remain in sourceMetadata so the
      // block can be enriched later without another schema fork.
      return {
        blockType: 'image-text',
        ...common,
        eyebrow: sectionEyebrow(section),
        heading: heading || sourceBody[0] || `Source section ${section.order + 1}`,
        description: heading ? description : sourceBody.slice(1).join('\n\n') || description,
        media: ref,
        buttons: buttonData(section, pagesById),
        alignment: 'left',
      }
    default:
      return undefined
  }
}

const payload = await getPayload({ config: configPromise })
const source = await parseWordPressXmlFile(xmlPath)
const localFiles = await fileIndex(uploadsPath)
const attachmentMap = new Map(source.attachments.map((attachment) => [attachment.id, attachment]))
const mediaCache = new Map<string, number>()

// Video media, keyed by the slug of the source file's basename (see
// `videoKey`). Both the document's own filename and its recorded `sourceUrl`
// are indexed, because the hero video is addressed by its WordPress uploads
// URL in Bricks and by its CDN URL in the Media collection. Where the same
// asset exists at several qualities the largest wins — that is the closest
// equivalent of the single file WordPress serves.
const videoMediaByKey = new Map<string, { id: number; filesize: number }>()
/** Video media id -> its poster image id (see `posterByKey` below). */
const posterForVideoId = new Map<number, number>()
{
  const videos = await payload.find({
    collection: 'media',
    where: { mimeType: { like: 'video' } },
    limit: 1000,
    depth: 0,
  })
  // Every imported video has a companion still named `<video>-poster.<ext>`.
  // Nothing linked them, so the Prime Difference carousel showed a black
  // frame until the visitor pressed play.
  const posters = await payload.find({
    collection: 'media',
    where: { filename: { like: '-poster' } },
    limit: 1000,
    depth: 0,
  })
  const posterByKey = new Map<string, number>()
  for (const doc of posters.docs as unknown as Array<Record<string, unknown>>) {
    const filename = typeof doc.filename === 'string' ? doc.filename : ''
    const match = filename.match(/^(.*)-poster\.[a-z0-9]+$/i)
    if (match) posterByKey.set(videoKey(`${match[1]}.x`), Number(doc.id))
  }

  for (const doc of videos.docs as unknown as Array<Record<string, unknown>>) {
    const id = Number(doc.id)
    const filesize = typeof doc.filesize === 'number' ? doc.filesize : 0
    if (typeof doc.filename === 'string') {
      const poster = posterByKey.get(videoKey(doc.filename))
      if (poster) posterForVideoId.set(id, poster)
    }
    for (const candidate of [doc.sourceUrl, doc.filename]) {
      if (typeof candidate !== 'string' || !candidate) continue
      const key = videoKey(candidate)
      if (!key) continue
      const existing = videoMediaByKey.get(key)
      if (!existing || filesize > existing.filesize) videoMediaByKey.set(key, { id, filesize })
    }
  }
}
const resolveVideoMediaId = (url?: string) =>
  url ? videoMediaByKey.get(videoKey(url))?.id : undefined
const resolveVideoPoster = (assetId?: number) =>
  assetId === undefined ? undefined : posterForVideoId.get(assetId)
const unresolvedVideoUrls = new Set<string>()
const report: Array<{
  page: string
  sections: number
  media: number
  galleries: string[]
  unsupported: string[]
  status: string
}> = []

async function resolveMediaId(attachmentId: number | undefined, filename: string | undefined) {
  if (!attachmentId && !filename) return undefined
  const key = `${attachmentId || ''}:${filename || ''}`
  if (mediaCache.has(key)) return mediaCache.get(key)
  const found = attachmentId
    ? await payload.find({
        collection: 'media',
        where: { wordpressId: { equals: attachmentId } },
        limit: 1,
      })
    : await payload.find({
        collection: 'media',
        where: { filename: { equals: filename! } },
        limit: 1,
      })
  if (found.docs[0]) {
    const id = Number(found.docs[0].id)
    mediaCache.set(key, id)
    return id
  }

  // Last resort for image references that carry no attachment id: match the
  // original WordPress path recorded in `sourceUrl`.
  //
  // The media library renames files on upload collision, so the document
  // imported from `o-55.jpg` is stored as `o-93.jpg` and a filename lookup
  // finds nothing — which is why the kitchen page's Custom / European /
  // Shaker Kitchen cards and the bathroom page's Custom Bathtubs cards all
  // imported with no photo. `sourceUrl` still holds the original path, so it
  // is the only thing these references can be matched on.
  if (filename) {
    const bySourceUrl = await payload.find({
      collection: 'media',
      where: { sourceUrl: { like: `/${filename}` } },
      limit: 1,
    })
    if (bySourceUrl.docs[0]) {
      const id = Number(bySourceUrl.docs[0].id)
      mediaCache.set(key, id)
      return id
    }
  }

  const attachment = attachmentId ? attachmentMap.get(attachmentId) : undefined
  const name = filename || attachment?.filename
  const localPath = name ? localFiles.get(name.toLowerCase()) : undefined
  if (!localPath || !name) return undefined
  const data = await readFile(localPath)
  const created = await payload.create({
    collection: 'media',
    data: {
      alt: attachment?.title || name,
      wordpressId: attachmentId,
      sourceUrl: attachment?.url,
      sourcePath: localPath,
    },
    file: {
      data,
      mimetype: attachment?.mimeType || 'application/octet-stream',
      name,
      size: data.length,
    },
  })
  const id = Number(created.id)
  mediaCache.set(key, id)
  return id
}

for (const slug of targetSlugs) {
  const page = source.pages.find((item) => item.slug === slug)
  if (!page || page.status !== 'publish') {
    report.push({
      page: slug,
      sections: 0,
      media: 0,
      galleries: [],
      unsupported: ['missing or unpublished source page'],
      status: 'FAILED',
    })
    continue
  }
  if (!page.bricksSerialized) {
    report.push({
      page: slug,
      sections: 0,
      media: 0,
      galleries: [],
      unsupported: ['page has no Bricks source'],
      status: 'FAILED',
    })
    continue
  }
  const bricks = parseBricksSerialized(page.bricksSerialized)
  const normalized = normalizeBricksPage(page, bricks.roots)
  // A `video`/`carousel` section immediately following a `prime-difference`
  // section belongs inside it — the schema's videos field says as much
  // ("Ordered videos embedded in the WordPress Prime Difference section"),
  // but the source page renders them as separate adjacent Bricks sections.
  // Merge and drop the standalone section so it isn't also imported on its own.
  const mergedFollowOnIds = new Set<string>()
  normalized.forEach((section, index) => {
    if (section.type !== 'prime-difference') return
    const next = normalized[index + 1]
    if (!next) return
    // The media strip that follows Prime Difference is typed inconsistently
    // in the source: `carousel` on remodeling-information, `video` on the
    // kitchen page, and plain `utility` on the bathroom page. What actually
    // identifies it is that it carries videos and no copy of its own. Keying
    // on the type alone meant the bathroom page's five videos were reported
    // as an unsupported section and thrown away.
    const headings = dataOf(next).headings
    const hasOwnCopy = Array.isArray(headings) && headings.some((value) => clean(value))
    if (next.videos.length && !hasOwnCopy) {
      section.videos = next.videos
      mergedFollowOnIds.add(next.sourceId)
      return
    }
    // A `before-after` section directly after Prime Difference is the same
    // split: the siding and outdoor-hardscape pages fill this section's
    // media column with an `xbeforeafterimage` instead of a video slider.
    // Rendering it as its own section would both leave Prime Difference
    // with an empty column and repeat the comparison lower down the page.
    if (next.type === 'before-after') {
      dataOf(section).mergedBeforeAfter = next
      mergedFollowOnIds.add(next.sourceId)
    }
  })
  const mergedSections = normalized.filter((section) => !mergedFollowOnIds.has(section.sourceId))
  // Icon-box SVGs (the small mark beside a section kicker, e.g. `home.svg`
  // next to "Our Projects") are not `image` nodes, so they never reached
  // media resolution and `eyebrowIcon` stayed empty even though the files
  // were already imported into the Media collection.
  const iconSvgImages: NormalizedImage[] = mergedSections
    .flatMap((section) => treeNodes(section))
    .filter((node) => node.name === 'icon-box')
    .flatMap((node) => {
      const icon = node.settings.icon as Record<string, unknown> | undefined
      const svg = icon?.svg && typeof icon.svg === 'object' ? (icon.svg as Record<string, unknown>) : undefined
      if (!svg || typeof svg.id !== 'number') return []
      return [
        {
          sourceId: svg.id,
          filename: typeof svg.filename === 'string' ? svg.filename : undefined,
          url: typeof svg.url === 'string' ? svg.url : undefined,
          status: 'unresolved' as const,
        },
      ]
    })

  // Sections merged into another one are filtered out of `mergedSections`,
  // but their media still has to be resolved — the before/after pair now
  // lives inside Prime Difference, and leaving it out here means
  // `sourceImageMediaId` finds nothing and the comparison silently imports
  // empty.
  const mergedAwaySections = normalized.filter((section) =>
    mergedFollowOnIds.has(section.sourceId),
  )
  const allImages = [...mergedSections, ...mergedAwaySections].flatMap((section) => [
    ...section.images,
    ...sourceImages(section),
  ])
  const mediaIds = new Map<number | string, number>()
  const projectGalleryImages: NormalizedImage[] = mergedSections
    .filter((section) => section.type === 'gallery')
    .flatMap((section) => dynamicProjectImages(section, source.projects))
    .filter(
      (image, index, all) =>
        Boolean(image.sourceId) &&
        all.findIndex((candidate) => candidate.sourceId === image.sourceId) === index,
    )
  const happyFilesGalleryImages: NormalizedImage[] = normalized
    .filter((section) => section.type === 'gallery')
    .flatMap((section) => dynamicHappyFilesImages(section, source))
    .filter(
      (image, index, all) =>
        Boolean(image.sourceId) &&
        all.findIndex((candidate) => candidate.sourceId === image.sourceId) === index,
    )
  // Tab panes are a separate source-discovery path. Include their attachment
  // IDs before resolving media; otherwise the final grouped block can only
  // reference media that happened to be discovered elsewhere.
  const tabbedGalleryImages: NormalizedImage[] = mergedSections
    .filter((section) => section.type === 'gallery')
    .flatMap((section) => dynamicGalleryGroups(section, source, new Map()))
    .flatMap((group) => group.items)
    .map((item) => ({ sourceId: item.sourceAttachmentId, status: 'unresolved' as const }))
    .filter(
      (image, index, all) =>
        Boolean(image.sourceId) &&
        all.findIndex((candidate) => candidate.sourceId === image.sourceId) === index,
    )
  for (const image of [
    ...allImages,
    ...projectGalleryImages,
    ...happyFilesGalleryImages,
    ...tabbedGalleryImages,
    ...iconSvgImages,
  ]) {
    const id = await resolveMediaId(image.sourceId, image.filename)
    if (id && image.sourceId) mediaIds.set(image.sourceId, id)
    if (id && image.filename) mediaIds.set(image.filename, id)
  }
  const pagesById = new Map(source.pages.map((item) => [item.id, item]))
  // A few Bricks roots hold two unrelated sections (a services grid behind
  // an image+text intro; a contact form behind the "Find us" details), so a
  // source section can produce more than one block. Order follows the
  // source: the intro precedes its grid, the form follows the details.
  const sections = mergedSections.flatMap((section) => {
    const primary = mapSection(
      section,
      mediaIds,
      pagesById,
      source.projects,
      source.faqs,
      source,
    )
    if (!primary) return []

    if (primary.blockType === 'sub-services') {
      const intro = subServicesIntro(section, mediaIds, pagesById)
      const gridExcluded = (EXCLUDED_SERVICE_GRIDS[slug] || []).includes(section.sourceId)
      if (intro) {
        // The heading and body belong to the intro now; leaving them on the
        // grid too would print the same heading twice.
        return gridExcluded
          ? [intro]
          : [
              intro,
              { ...primary, eyebrow: undefined, heading: undefined, description: undefined },
            ]
      }
      if (gridExcluded) return []
    }

    if (primary.blockType === 'find-us') {
      const contact = findUsContactForm(section)
      if (contact) {
        // The "Contact Info" kicker belongs to the form, not the details.
        return [{ ...primary, eyebrow: undefined }, contact]
      }
    }

    return [primary]
  })
  const unsupported = mergedSections
    .filter(
      (section) => !mapSection(section, mediaIds, pagesById, source.projects, source.faqs, source),
    )
    .map((section) => `${section.order}:${section.type}:${section.sourceId}`)
  const heroSource = mergedSections.find((section) => section.type === 'hero')
  const heroData = heroSource
    ? mapSection(heroSource, mediaIds, pagesById, source.projects, source.faqs, source)
    : undefined
  const seoDescription = meta(page, 'rank_math_description')
  const existing = await payload.find({
    collection: 'landing-pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  // Fields that have no WordPress source and are authored in the admin must
  // survive a re-import. `booking.consultationLabel` is the case today: the
  // scheduler's subject line lives in LatePoint's own tables, which the WXR
  // export does not contain, so the value can only come from an editor. Left
  // unguarded, every re-run of this script would silently blank it.
  const preservedByBlock: Record<string, string[]> = { booking: ['consultationLabel'] }
  const previousSections = (existing.docs[0]?.sections || []) as Array<Record<string, unknown>>
  for (const section of sections) {
    const preserve = preservedByBlock[String(section.blockType)]
    if (!preserve) continue
    const previous = previousSections.find(
      (candidate) =>
        candidate.blockType === section.blockType && candidate.sourceId === section.sourceId,
    )
    if (!previous) continue
    for (const field of preserve) {
      if (previous[field] && !section[field]) section[field] = previous[field]
    }
  }

  const record = {
    title: page.title,
    slug,
    status: 'published',
    template: 'information',
    hero: heroData
      ? {
          eyebrow: sectionEyebrow(heroSource!),
          heading: heroData.heading,
          description: heroData.description,
          backgroundMedia: (heroData.backgroundMedia as Record<string, unknown> | undefined)?.asset,
          buttons: heroData.buttons,
        }
      : { heading: page.title },
    sections,
    sourceWordPressId: page.id,
    sourceSlug: page.slug,
    seo: {
      metaTitle: meta(page, 'rank_math_title') || page.title,
      metaDescription: seoDescription,
      noIndex: false,
    },
  }
  if (existing.docs[0]) {
    await payload.update({
      collection: 'landing-pages',
      id: existing.docs[0].id,
      data: record as never,
    })
  } else {
    await payload.create({ collection: 'landing-pages', data: record as never })
  }
  report.push({
    page: slug,
    sections: sections.length,
    media: mediaIds.size,
    galleries: sections
      .filter((section) => section.blockType === 'gallery')
      .flatMap((section) => {
        const groups = Array.isArray(section.groups) ? section.groups : []
        if (groups.length) {
          return groups.map((group) => {
            const value = group as Record<string, unknown>
            return `${String(value.label || 'Gallery')}: ${Array.isArray(value.items) ? value.items.length : 0}`
          })
        }
        return [
          `${String(section.heading || 'Gallery')}: ${Array.isArray(section.items) ? section.items.length : 0}`,
        ]
      }),
    unsupported,
    status: 'IMPORTED',
  })
}

console.table(
  report.map((row) => ({
    Page: row.page,
    Sections: row.sections,
    Media: row.media,
    Unsupported: row.unsupported.length,
    Status: row.status,
  })),
)
for (const row of report)
  if (row.galleries.length) console.log(`${row.page} galleries: ${row.galleries.join(', ')}`)
for (const row of report)
  if (row.unsupported.length)
    console.log(`${row.page} unsupported/skipped: ${row.unsupported.join(', ')}`)
if (unresolvedAcfTokens.size)
  console.log(`Unresolved ACF tokens: ${[...unresolvedAcfTokens].sort().join(', ')}`)
if (unresolvedDynamicTokens.size)
  console.log(
    `Stripped unresolved dynamic tags (content using these needs its own fix, not just cleanup): ${[...unresolvedDynamicTokens].sort().join(', ')}`,
  )
// Videos that stayed as off-site hotlinks because no Media document matched.
// The block still renders from `externalUrl`, but the migration is not
// finished for these until the file is imported (CLAUDE.md §7).
if (unresolvedVideoUrls.size)
  console.log(
    `Videos still hotlinked (no Media document matched): ${[...unresolvedVideoUrls].sort().join(', ')}`,
  )
await payload.destroy()
