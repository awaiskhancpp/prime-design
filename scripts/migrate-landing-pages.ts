import 'dotenv/config'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { parseBricksSerialized } from '../wordpress-migration/bricksParser'
import { normalizeBricksPage } from '../wordpress-migration/normalizer'
import { parseWordPressXmlFile } from '../wordpress-migration/xmlParser'
import type { BricksTreeNode, NormalizedGalleryItem, NormalizedImage, NormalizedSection, WordPressPage } from '../wordpress-migration/types'

const xmlPath = process.argv[2] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-28.xml'
const uploadsPath = process.argv[3]
const targetSlugs = [
  'kitchen-remodeling-information',
  'bathroom-remodeling-information',
  'additions-remodeling-information',
  'home-remodeling-information',
  'outdoor-hardscape-outdoor-kitchen-information',
  'siding-installation-replacement-information',
  'comprehensive-home-repair-installation-services-in-silicon-valley',
]

const clean = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const result = value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
  return result || undefined
}

const first = (values: unknown[]) => values.map(clean).find((value): value is string => Boolean(value))
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
  try { await walk(directory) } catch { /* diagnostics are emitted when a reference cannot be resolved */ }
  return result
}

function sourceButtons(section: NormalizedSection, pagesById: Map<number, WordPressPage>) {
  const buttons: Array<Record<string, unknown>> = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const value = node as Record<string, unknown>
    if (value.name === 'button' && value.settings && typeof value.settings === 'object') {
      const settings = value.settings as Record<string, unknown>
      const link = settings.link && typeof settings.link === 'object' ? settings.link as Record<string, unknown> : undefined
      const postId = link && typeof link.postId === 'string' ? Number(link.postId) : undefined
      buttons.push({
        label: settings.text,
        href: typeof link?.url === 'string' ? link.url : postId && pagesById.get(postId) ? `/${pagesById.get(postId)?.slug}` : undefined,
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
    .filter((button, index, all) => all.findIndex((candidate) => candidate.label === button.label && candidate.href === button.href) === index)
    .map((button) => ({
      label: clean(button.label) || 'Learn more',
      url: typeof button.href === 'string' ? button.href : undefined,
      variant: 'primary',
      openInNewTab: false,
    }))
    .filter((button): button is { label: string; url: string; variant: string; openInNewTab: boolean } => Boolean(button.label && button.url))
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
  return {
    sourceId: section.sourceId,
    sourceElementType: section.sourceElement,
    sourceMetadata: {
      sourcePageSlug: data.sourcePageSlug,
      nestedElementIds: data.nestedElementIds,
      sourceOrder: section.order,
      classification: section.classification,
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
    if (node.name !== 'image' || !node.settings.image || typeof node.settings.image !== 'object') return []
    const image = node.settings.image as Record<string, unknown>
    return [{
      sourceId: typeof image.id === 'number' ? image.id : undefined,
      filename: typeof image.filename === 'string' ? image.filename : undefined,
      url: typeof image.full === 'string' ? image.full : typeof image.url === 'string' ? image.url : undefined,
      status: 'unresolved' as const,
    }]
  })
}

function sourceTextNodes(section: NormalizedSection, names = ['heading', 'text-basic', 'text']) {
  return treeNodes(section)
    .filter((node) => names.includes(node.name))
    .map((node) => clean(node.settings.text || node.settings.content || node.settings.heading || node.settings.title))
    .filter((value): value is string => Boolean(value))
}

function subServiceItems(section: NormalizedSection, mediaIds: Map<number | string, number>, pagesById: Map<number, WordPressPage>) {
  const nodes = treeNodes(section)
  const headings = nodes.filter((node) => node.name === 'heading' && clean(node.settings.text))
  const images = sourceImages(section).slice(1)
  return headings.slice(1).map((node, index) => {
    const headingIndex = nodes.indexOf(node)
    const description = nodes.slice(headingIndex + 1).find((candidate) => candidate.name === 'text-basic' && clean(candidate.settings.text))
    const image = images[index]
    const link = node.settings.link && typeof node.settings.link === 'object' ? node.settings.link as Record<string, unknown> : undefined
    const postId = typeof link?.postId === 'string' ? Number(link.postId) : undefined
    const sourcePage = postId ? pagesById.get(postId) : pagesByIdByTitle(pagesById, clean(node.settings.text))
    const url = typeof link?.url === 'string' ? link.url : sourcePage?.slug ? `/${sourcePage.slug}` : '#contact_form'
    const item: Record<string, unknown> = {
      title: clean(node.settings.text) || `Service ${index + 1}`,
      description: clean(description?.settings.text),
      media: image ? mediaRef(image, image.sourceId ? mediaIds.get(image.sourceId) : image.filename ? mediaIds.get(image.filename) : undefined) : undefined,
    }
    item.link = { label: 'Learn more', url, openInNewTab: false }
    return item
  })
}

function pagesByIdByTitle(pagesById: Map<number, WordPressPage>, title?: string) {
  if (!title) return undefined
  const normalized = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  return [...pagesById.values()].find((page) => page.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === normalized)
}

function serviceSlugForAreas(section: NormalizedSection, pagesById: Map<number, WordPressPage>) {
  const queryNode = treeNodes(section).find((node) => node.settings.query && typeof node.settings.query === 'object')
  const query = queryNode?.settings.query as Record<string, unknown> | undefined
  const parentId = typeof query?.post_parent === 'string' ? Number(query.post_parent) : undefined
  return parentId ? pagesById.get(parentId)?.slug : undefined
}

function featureItems(section: NormalizedSection) {
  const nodes = treeNodes(section)
  return nodes
    .filter((node) => node.name === 'icon-box' || node.name === 'list' || node.name === 'text-basic')
    .map((node) => clean(node.settings.content || node.settings.text))
    .filter((value): value is string => Boolean(value))
    .filter((value) => !/^why choose|^experience the|^the prime difference/i.test(value))
    .map((value) => ({ title: value, description: undefined }))
}

function mapGalleryItems(items: NormalizedGalleryItem[] | undefined, mediaIds: Map<number | string, number>) {
  return (items || []).map((item, index) => ({
    media: item.mediaId ? mediaIds.get(item.mediaId) : undefined,
    caption: undefined,
    alt: item.sourceUrl || item.dynamicSource || `Gallery image ${index + 1}`,
    sourceOrder: index,
    sourceAttachmentId: item.mediaId,
  })).filter((item) => item.media || item.sourceAttachmentId)
}

function mapSection(section: NormalizedSection, mediaIds: Map<number | string, number>, pagesById: Map<number, WordPressPage>): Record<string, unknown> | undefined {
  const data = dataOf(section)
  const heading = first([data.heading, ...(Array.isArray(data.headings) ? data.headings : [])])
  const description = first(Array.isArray(data.body) ? data.body : [data.body])
  const images = section.images
  const ref = images[0] ? mediaRef(images[0], images[0].sourceId ? mediaIds.get(images[0].sourceId) : undefined) : undefined
  const common = base(section)

  switch (section.type) {
    case 'hero':
      return { blockType: 'hero', ...common, eyebrow: undefined, heading: heading || 'Prime Design & Build', description, backgroundMedia: ref, buttons: buttonData(section, pagesById) }
    case 'cta':
      return { blockType: 'cta', ...common, eyebrow: undefined, heading: heading || 'Ready to get started?', description, media: ref, buttons: buttonData(section, pagesById) }
    case 'image-text':
      return { blockType: 'image-text', ...common, eyebrow: undefined, heading: heading || 'Prime Design & Build', description, media: ref, buttons: buttonData(section, pagesById), alignment: 'left' }
    case 'video': {
      const video = section.videos[0]
      return { blockType: 'video', ...common, heading, description, source: video?.sourceUrl ? 'externalUrl' : 'media', externalUrl: video?.sourceUrl, controls: true, sourceVideoId: video?.sourceUrl }
    }
    case 'gallery': {
      const items = mapGalleryItems(data.galleryItems as NormalizedGalleryItem[] | undefined, mediaIds)
      const directImages = sourceImages(section).map((image, index) => ({
        media: image.sourceId ? mediaIds.get(image.sourceId) : image.filename ? mediaIds.get(image.filename) : undefined,
        caption: undefined,
        alt: image.filename || `Gallery image ${index + 1}`,
        sourceOrder: index,
        sourceAttachmentId: image.sourceId,
      })).filter((item) => item.media)
      return { blockType: 'gallery', ...common, heading, description, items: items.length ? items : directImages, groups: [], layout: undefined, lightbox: true, sourceGalleryType: 'wordpress-gallery' }
    }
    case 'before-after':
      return { blockType: 'before-after', ...common, heading, beforeLabel: 'Before', afterLabel: 'After', beforeMedia: images[0]?.sourceId ? mediaIds.get(images[0].sourceId) : undefined, afterMedia: images[1]?.sourceId ? mediaIds.get(images[1].sourceId) : undefined }
    case 'sub-services':
      return { blockType: 'sub-services', ...common, eyebrow: undefined, heading: heading || 'Our Services', description, items: subServiceItems(section, mediaIds, pagesById) }
    case 'prime-difference':
      return { blockType: 'prime-difference', ...common, eyebrow: undefined, heading: heading || 'The Prime Difference', description, features: [], media: ref }
    case 'experience-difference':
      return { blockType: 'experience-difference', ...common, eyebrow: undefined, heading: heading || 'Experience the Prime Difference', description, features: [], media: ref }
    case 'service-areas': {
      const areaServiceSlug = serviceSlugForAreas(section, pagesById)
      const areas = treeNodes(section).flatMap((node) => {
        if (node.name !== 'icon-box') return []
        const label = clean(node.settings.content)
        const citySlug = label?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const url = areaServiceSlug && citySlug ? `/${areaServiceSlug}/${areaServiceSlug}-in-${citySlug}` : undefined
        return label ? [{ label, link: { label, url: url || '#contact_form', openInNewTab: false } }] : []
      })
      return { blockType: 'service-areas', ...common, eyebrow: undefined, heading: heading || 'Areas We Service', description, areas }
    }
    case 'repair-services':
      return { blockType: 'repair-services', ...common, heading: heading || 'Repair & Installation', description, categories: ((data.repairCategories as Array<Record<string, unknown>> | undefined) || []).map((category) => ({ title: clean(category.title) || 'Service', description: clean(category.html), features: [], sourceId: category.sourceId })) }
    case 'luxury-cta':
      return { blockType: 'luxury-cta', ...common, eyebrow: undefined, heading: heading || "Silicon Valley's Luxury Home Contractor", description, media: ref, buttons: buttonData(section, pagesById) }
    case 'find-us':
      return { blockType: 'find-us', ...common, heading: heading || 'Find us', phone: undefined, email: undefined, address: undefined, mapUrl: undefined }
    case 'faq':
      return { blockType: 'faq', ...common, heading, description, categories: ((data.faq as { categories?: Array<Record<string, unknown>> } | undefined)?.categories || []).map((category) => ({ title: clean(category.title) || 'Frequently Asked Questions', questions: [], sourceId: category.sourceId })) }
    case 'testimonials':
    case 'testimonial':
      return { blockType: 'testimonials', ...common, heading, providers: ((data.testimonials as Array<Record<string, unknown>> | undefined) || []).map((provider) => ({ name: clean(provider.provider) || 'Testimonials', shortcode: provider.shortcode, collectionId: provider.collectionId, reviews: [] })) }
    case 'booking':
    case 'contact-form':
    case 'form': {
      const integrations = (data.integrations as Array<Record<string, unknown>> | undefined) || []
      const integration = integrations[0]
      return { blockType: section.type === 'booking' ? 'booking' : 'contact-form', ...common, provider: clean(integration?.provider), shortcode: clean(integration?.shortcode), sourceElementId: section.sourceId, integrationMetadata: integration?.metadata }
    }
    case 'carousel': {
      const items = (data.mediaItems as NormalizedGalleryItem[] | undefined) || []
      const isVideo = items.some((item) => item.mediaType === 'video')
      return { blockType: isVideo ? 'video-carousel' : 'gallery-carousel', ...common, items: items.map((item, index) => ({ externalUrl: item.sourceUrl, sourceId: item.sourceId, sourceOrder: index, media: item.mediaId ? mediaIds.get(item.mediaId) : undefined })), settings: undefined }
    }
    case 'utility':
    case 'content':
    case 'unsupported':
      return undefined
    default:
      return undefined
  }
}

const payload = await getPayload({ config: configPromise })
const source = await parseWordPressXmlFile(xmlPath)
const localFiles = await fileIndex(uploadsPath)
const attachmentMap = new Map(source.attachments.map((attachment) => [attachment.id, attachment]))
const mediaCache = new Map<string, number>()
const report: Array<{ page: string; sections: number; media: number; unsupported: string[]; status: string }> = []

const outOfScope = await payload.find({ collection: 'landing-pages', where: { slug: { equals: 'remodeling-information' } }, limit: 1 })
if (outOfScope.docs[0] && Number(outOfScope.docs[0].sourceWordPressId) === 2820) {
  await payload.delete({ collection: 'landing-pages', id: outOfScope.docs[0].id })
  console.log('Removed the out-of-scope remodeling-information record created by this run.')
}

async function resolveMediaId(attachmentId: number | undefined, filename: string | undefined) {
  if (!attachmentId && !filename) return undefined
  const key = `${attachmentId || ''}:${filename || ''}`
  if (mediaCache.has(key)) return mediaCache.get(key)
  const found = attachmentId
    ? await payload.find({ collection: 'media', where: { wordpressId: { equals: attachmentId } }, limit: 1 })
    : await payload.find({ collection: 'media', where: { filename: { equals: filename! } }, limit: 1 })
  if (found.docs[0]) { const id = Number(found.docs[0].id); mediaCache.set(key, id); return id }
  const attachment = attachmentId ? attachmentMap.get(attachmentId) : undefined
  const name = filename || attachment?.filename
  const localPath = name ? localFiles.get(name.toLowerCase()) : undefined
  if (!localPath || !name) return undefined
  const data = await readFile(localPath)
  const created = await payload.create({
    collection: 'media',
    data: { alt: attachment?.title || name, wordpressId: attachmentId, sourceUrl: attachment?.url, sourcePath: localPath },
    file: { data, mimetype: attachment?.mimeType || 'application/octet-stream', name, size: data.length },
  })
  const id = Number(created.id)
  mediaCache.set(key, id)
  return id
}

for (const slug of targetSlugs) {
  const page = source.pages.find((item) => item.slug === slug)
  if (!page || page.status !== 'publish') { report.push({ page: slug, sections: 0, media: 0, unsupported: ['missing or unpublished source page'], status: 'FAILED' }); continue }
  if (!page.bricksSerialized) { report.push({ page: slug, sections: 0, media: 0, unsupported: ['page has no Bricks source'], status: 'FAILED' }); continue }
  const bricks = parseBricksSerialized(page.bricksSerialized)
  const normalized = normalizeBricksPage(page, bricks.roots)
  const allImages = normalized.flatMap((section) => section.images)
  const mediaIds = new Map<number | string, number>()
  for (const image of allImages) {
    const id = await resolveMediaId(image.sourceId, image.filename)
    if (id && image.sourceId) mediaIds.set(image.sourceId, id)
    if (id && image.filename) mediaIds.set(image.filename, id)
  }
  const pagesById = new Map(source.pages.map((item) => [item.id, item]))
  const sections = normalized.map((section) => mapSection(section, mediaIds, pagesById)).filter((section): section is Record<string, unknown> => Boolean(section))
  const unsupported = normalized.filter((section) => !mapSection(section, mediaIds, pagesById)).map((section) => `${section.order}:${section.type}:${section.sourceId}`)
  const heroSource = normalized.find((section) => section.type === 'hero')
  const heroData = heroSource ? mapSection(heroSource, mediaIds, pagesById) : undefined
  const seoDescription = meta(page, 'rank_math_description')
  const existing = await payload.find({ collection: 'landing-pages', where: { slug: { equals: slug } }, limit: 1 })
  const record = {
    title: page.title,
    slug,
    status: 'published',
    template: 'information',
    hero: heroData ? { eyebrow: undefined, heading: heroData.heading, description: heroData.description, backgroundMedia: (heroData.backgroundMedia as Record<string, unknown> | undefined)?.asset, buttons: heroData.buttons } : { heading: page.title },
    sections,
    sourceWordPressId: page.id,
    sourceSlug: page.slug,
    seo: { metaTitle: meta(page, 'rank_math_title') || page.title, metaDescription: seoDescription, noIndex: false },
  }
  if (existing.docs[0]) {
    await payload.delete({ collection: 'landing-pages', id: existing.docs[0].id })
  }
  await payload.create({ collection: 'landing-pages', data: record as never })
  report.push({ page: slug, sections: sections.length, media: mediaIds.size, unsupported, status: 'IMPORTED' })
}

console.table(report.map((row) => ({ Page: row.page, Sections: row.sections, Media: row.media, Unsupported: row.unsupported.length, Status: row.status })))
for (const row of report) if (row.unsupported.length) console.log(`${row.page} unsupported/skipped: ${row.unsupported.join(', ')}`)
await payload.destroy()
