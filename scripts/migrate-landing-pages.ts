import 'dotenv/config'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import website from '../website.json'
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

const xmlPath =
  process.argv[2] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-28.xml'
const uploadsPath = process.argv[3]
const targetSlugs = [
  'kitchen-remodeling-information',
  'bathroom-remodeling-information',
  'additions-remodeling-information',
  'home-remodeling-information',
  'outdoor-hardscape-outdoor-kitchen-information',
  'siding-installation-replacement-information',
  'comprehensive-home-repair-installation-services-in-silicon-valley',
  'remodeling-information',
]

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

const clean = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const result = replaceAcfTokens(value)
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
        filename: typeof image.filename === 'string' ? image.filename : undefined,
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
  const imageNode = node.name === 'image'
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
    filename: typeof image.filename === 'string' ? image.filename : undefined,
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
      const sourcePage = postId
        ? pagesById.get(postId)
        : pagesByIdByTitle(pagesById, title)
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

function findUsData(section: NormalizedSection) {
  const values: string[] = []
  const mapUrls: string[] = []

  for (const node of treeNodes(section)) {
    const settings = node.settings
    for (const value of [settings.text, settings.content, settings.title, settings.label]) {
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
    address: values.find((value) => /\b(?:ave|avenue|street|st\.?|road|rd\.?|blvd\.?)\b/i.test(value)),
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

function sectionEyebrow(section: NormalizedSection) {
  const nodes = treeNodes(section)
  const data = dataOf(section)
  const mainHeading = first([data.heading, ...(Array.isArray(data.headings) ? data.headings : [])])
  const mainHeadingIndex = mainHeading
    ? nodes.findIndex((node) => clean(node.settings.text) === mainHeading)
    : -1
  const precedingNodes = mainHeadingIndex >= 0 ? nodes.slice(0, mainHeadingIndex) : nodes

  if (section.type === 'prime-difference') {
    const projectCount = nodes
      .filter((node) => node.name === 'icon-box')
      .map((node) => headingFromMarkup(node.settings.content))
      .find((value) => value && /^over 350\+ projects/i.test(value))
    if (projectCount) return projectCount
  }

  const semanticHeading = precedingNodes.find((node) => {
    if (node.name !== 'heading') return false
    const tag = typeof node.settings.tag === 'string' ? node.settings.tag.toLowerCase() : ''
    return tag === 'h4' || tag === 'h5' || tag === 'h6'
  })
  const semanticHeadingText = clean(semanticHeading?.settings.text)
  if (semanticHeadingText) return semanticHeadingText

  if (section.type === 'luxury-cta') {
    const kicker = precedingNodes.find((node) => node.name === 'icon-box')
    const kickerText = headingFromMarkup(kicker?.settings.content)
    if (kickerText) return kickerText
  }

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

  return source.attachments
    .filter((attachment) => attachment.happyfilesCategorySlugs?.some((slug) => slugs.has(slug)))
    .map((attachment) => ({ sourceId: attachment.id, status: 'unresolved' as const }))
}

function dynamicProjectImages(section: NormalizedSection, projects: WordPressProject[]) {
  const projectQueries = treeNodes(section)
    .map((node) => node.settings.query)
    .filter(
      (query): query is Record<string, unknown> =>
        Boolean(query) && typeof query === 'object' && JSON.stringify(query).includes('project'),
    )
  if (projectQueries.length === 0) return []

  const byId = new Map(projects.map((project) => [project.id, project]))
  const seen = new Set<number>()
  const result: Array<{ sourceId: number; status: 'unresolved'; projectTitle?: string }> = []

  for (const query of projectQueries) {
    // Real Bricks project cards on this site scope each gallery to a specific,
    // hand-picked list of posts via `post__in` — ignoring that (as the old code
    // did) means every gallery section pulls in every project on the whole
    // site, which is why every page's gallery looked identical and huge.
    const postIn = Array.isArray(query.post__in)
      ? (query.post__in as unknown[]).map((v) => Number(v)).filter((n) => !Number.isNaN(n))
      : undefined
    const scopedProjects = postIn
      ? postIn.map((id) => byId.get(id)).filter((p): p is WordPressProject => Boolean(p))
      : projects // no post__in on this query: it really does mean "all projects"
    const cap =
      typeof query.posts_per_page === 'string' || typeof query.posts_per_page === 'number'
        ? Number(query.posts_per_page)
        : undefined
    const limited = cap && !postIn ? scopedProjects.slice(0, cap) : scopedProjects

    for (const project of limited) {
      for (const id of projectGalleryIds(project)) {
        if (seen.has(id)) continue
        seen.add(id)
        result.push({
          sourceId: id,
          status: 'unresolved',
          projectTitle: clean(project.title),
        })
      }
    }
  }
  return result
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
  faqRecords: Array<{ id: number; title: string; content: string; category?: string }>,
  source: WordPressSource,
): Record<string, unknown> | undefined {
  const data = dataOf(section)
  // WordPress explicitly marks some duplicate/template roots as hidden. They
  // are source diagnostics, not visible page sections, and must not be loaded
  // into the frontend as content.
  if (isHiddenSourceSection(section)) return undefined
  const heading = first([data.heading, ...(Array.isArray(data.headings) ? data.headings : [])])
  const sourceBody = Array.isArray(data.body)
    ? data.body.map(clean).filter((value): value is string => Boolean(value))
    : []
  const description = sourceBody.join('\n\n') || first([data.body])
  const images = section.images
  const primaryImage = data.primaryImage as NormalizedImage | undefined
  const refImage = primaryImage || images[0]
  const ref = refImage
    ? mediaRef(refImage, refImage.sourceId ? mediaIds.get(refImage.sourceId) : undefined)
    : undefined
  const common = base(section)

  switch (section.type) {
    case 'hero':
      return {
        blockType: 'hero',
        ...common,
        eyebrow: sectionEyebrow(section),
        heading: heading || 'Prime Design & Build',
        description,
        backgroundMedia: ref,
        buttons: buttonData(section, pagesById),
        sourceMetadata: { ...common.sourceMetadata, backgroundVideoUrl: sourceVideoUrl(section) },
      }
    case 'cta':
      return {
        blockType: 'cta',
        ...common,
        eyebrow: sectionEyebrow(section),
        heading: heading || 'Ready to get started?',
        description,
        media: ref,
        buttons: buttonData(section, pagesById),
      }
    case 'image-text':
      return {
        blockType: 'image-text',
        ...common,
        eyebrow: sectionEyebrow(section),
        heading: heading || 'Prime Design & Build',
        description,
        media: ref,
        buttons: buttonData(section, pagesById),
        alignment: 'left',
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
      const happyFilesImages = dynamicHappyFilesImages(section, source)
        .map((image, index) => ({
          media: mediaIds.get(image.sourceId!),
          caption: undefined,
          alt: `Gallery image ${index + 1}`,
          sourceOrder: index,
          sourceAttachmentId: image.sourceId,
        }))
        .filter((item) => item.media)
      const dynamicImages = dynamicProjectImages(section, projects)
        .map((image, index) => ({
          media: mediaIds.get(image.sourceId!),
          caption: image.projectTitle,
          alt: image.projectTitle || `Project gallery image ${index + 1}`,
          sourceOrder: index,
          sourceAttachmentId: image.sourceId,
        }))
        .filter((item) => item.media)
      return {
        blockType: 'gallery',
        ...common,
        heading,
        description,
        items: items.length
          ? items
          : directImages.length
            ? directImages
            : happyFilesImages.length
              ? happyFilesImages
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
    case 'sub-services':
      return {
        blockType: 'sub-services',
        ...common,
        eyebrow: sectionEyebrow(section),
        heading: heading || 'Our Services',
        description,
        items: subServiceItems(section, mediaIds, pagesById),
      }
    case 'prime-difference':
      return {
        blockType: 'prime-difference',
        ...common,
        eyebrow: sectionEyebrow(section),
        heading: heading || 'The Prime Difference',
        description,
        features: featureItems(section),
        videos: section.videos.map((video) => ({
          video: video.attachmentId ? mediaIds.get(video.attachmentId) : undefined,
          externalUrl: video.sourceUrl,
          poster: video.poster?.sourceId ? mediaIds.get(video.poster.sourceId) : undefined,
          sourceVideoId: video.sourceUrl,
        })),
        media: ref,
      }
    case 'experience-difference':
      return {
        blockType: 'experience-difference',
        ...common,
        eyebrow: sectionEyebrow(section),
        heading: heading || 'Experience the Prime Difference',
        description,
        features: featureItems(section),
        media: ref,
      }
    case 'service-areas': {
      const areaServiceSlug = serviceSlugForAreas(section, pagesById)
      const areas = treeNodes(section).flatMap((node) => {
        if (node.name !== 'icon-box') return []
        const label = clean(node.settings.content)
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
      return {
        blockType: 'service-areas',
        ...common,
        eyebrow: sectionEyebrow(section),
        heading: heading || 'Areas We Service',
        description,
        areas,
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
            return image ? mediaRef(image, image.sourceId ? mediaIds.get(image.sourceId) : undefined) : undefined
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
        eyebrow: sectionEyebrow(section),
        heading: heading || "Silicon Valley's Luxury Home Contractor",
        description,
        media: ref,
        buttons: buttonData(section, pagesById),
      }
    case 'find-us': {
      const contact = findUsData(section)
      return {
        blockType: 'find-us',
        ...common,
        heading: heading || 'Find us',
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        mapUrl: contact.mapUrl,
      }
    }
    case 'faq':
      return {
        blockType: 'faq',
        ...common,
        heading,
        description,
        categories: (
          (data.faq as { categories?: Array<Record<string, unknown>> } | undefined)?.categories ||
          []
        ).map((category) => ({
          title: clean(category.title) || 'Frequently Asked Questions',
          questions: faqRecords
            .filter(
              (faq) =>
                faq.category &&
                clean(faq.category)?.toLowerCase() ===
                  clean(category.title)
                    ?.toLowerCase()
                    .replace(/ questions$/, ''),
            )
            .map((faq) => ({
              question: clean(faq.title),
              answer: clean(faq.content),
              sourceId: String(faq.id),
            }))
            .filter((faq) => faq.question && faq.answer),
          sourceId: category.sourceId,
        })),
      }
    case 'testimonials':
    case 'testimonial':
      return {
        blockType: 'testimonials',
        ...common,
        heading,
        providers: ((data.testimonials as Array<Record<string, unknown>> | undefined) || []).map(
          (provider) => ({
            name: clean(provider.provider) || 'Testimonials',
            shortcode: provider.shortcode,
            collectionId: provider.collectionId,
            reviews: [],
          }),
        ),
      }
    case 'booking':
    case 'contact-form':
    case 'form': {
      const integrations = (data.integrations as Array<Record<string, unknown>> | undefined) || []
      const integration = integrations[0]
      return {
        blockType: section.type === 'booking' ? 'booking' : 'contact-form',
        ...common,
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
const report: Array<{
  page: string
  sections: number
  media: number
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
      unsupported: ['page has no Bricks source'],
      status: 'FAILED',
    })
    continue
  }
  const bricks = parseBricksSerialized(page.bricksSerialized)
  const normalized = normalizeBricksPage(page, bricks.roots)
  const allImages = normalized.flatMap((section) => [...section.images, ...sourceImages(section)])
  const mediaIds = new Map<number | string, number>()
  const projectGalleryImages: NormalizedImage[] = normalized
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
  for (const image of [...allImages, ...projectGalleryImages, ...happyFilesGalleryImages]) {
    const id = await resolveMediaId(image.sourceId, image.filename)
    if (id && image.sourceId) mediaIds.set(image.sourceId, id)
    if (id && image.filename) mediaIds.set(image.filename, id)
  }
  const pagesById = new Map(source.pages.map((item) => [item.id, item]))
  const sections = normalized
    .map((section) =>
      mapSection(section, mediaIds, pagesById, source.projects, source.faqs, source),
    )
    .filter((section): section is Record<string, unknown> => Boolean(section))
  const unsupported = normalized
    .filter(
      (section) => !mapSection(section, mediaIds, pagesById, source.projects, source.faqs, source),
    )
    .map((section) => `${section.order}:${section.type}:${section.sourceId}`)
  const heroSource = normalized.find((section) => section.type === 'hero')
  const heroData = heroSource
    ? mapSection(heroSource, mediaIds, pagesById, source.projects, source.faqs, source)
    : undefined
  const seoDescription = meta(page, 'rank_math_description')
  const existing = await payload.find({
    collection: 'landing-pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })
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
  if (row.unsupported.length)
    console.log(`${row.page} unsupported/skipped: ${row.unsupported.join(', ')}`)
if (unresolvedAcfTokens.size)
  console.log(`Unresolved ACF tokens: ${[...unresolvedAcfTokens].sort().join(', ')}`)
await payload.destroy()
