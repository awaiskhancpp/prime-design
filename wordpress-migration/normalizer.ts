import { BricksTreeNode, NormalizedSection, NormalizedImage, NormalizedVideo, WordPressPage, NormalizedFaqCategory, NormalizedTestimonial, NormalizedGalleryItem, NormalizedIntegration } from './types'

const descendants = (node: BricksTreeNode): BricksTreeNode[] => [node, ...node.children.flatMap(descendants)]
const textValue = (node: BricksTreeNode) => {
  const settings = node.settings
  return [settings.text, settings.textBasic, settings.content, settings.heading, settings.title]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
}

const settingString = (node: BricksTreeNode, keys: string[]) =>
  keys.map((key) => node.settings[key]).find((value): value is string => typeof value === 'string' && value.trim().length > 0)

const mediaFromValue = (value: unknown): NormalizedImage[] => {
  const result: NormalizedImage[] = []
  const walk = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(walk)
    if (!value || typeof value !== 'object') return
    const object = value as Record<string, unknown>
    if (typeof object.id === 'number' && (typeof object.full === 'string' || typeof object.url === 'string' || typeof object.filename === 'string')) {
      result.push({ sourceId: object.id, filename: typeof object.filename === 'string' ? object.filename : undefined, url: typeof object.full === 'string' ? object.full : typeof object.url === 'string' ? object.url : undefined, status: 'unresolved' })
    }
    Object.values(object).forEach(walk)
  }
  walk(value)
  return result.filter((image, index, all) => all.findIndex((candidate) => candidate.sourceId === image.sourceId) === index)
}

const mediaFromNode = (node: BricksTreeNode): NormalizedImage[] => mediaFromValue(node.settings)

const blockedContentWrappers = new Set(['tabs-nested', 'xproaccordion', 'slider-nested', 'carousel', 'shortcode', 'xfluentform'])

const sectionContentNodes = (section: BricksTreeNode) => {
  const result: BricksTreeNode[] = []
  const walk = (node: BricksTreeNode, blocked: boolean) => {
    const nextBlocked = blocked || blockedContentWrappers.has(node.name)
    if (!nextBlocked) result.push(node)
    if (!nextBlocked) node.children.forEach((child) => walk(child, false))
  }
  section.children.forEach((child) => walk(child, false))
  return result
}

const primaryImageFromNode = (section: BricksTreeNode) => {
  const background = mediaFromValue(
    section.settings._background || section.settings._backgroundImage || section.settings.background,
  )[0]
  if (background) return background

  const directImage = sectionContentNodes(section).find((node) => node.name === 'image')
  return directImage ? mediaFromNode(directImage)[0] : mediaFromNode(section)[0]
}

const videoFromNode = (node: BricksTreeNode): NormalizedVideo[] => {
  const urls = descendants(node).flatMap((item) => {
    const values = Object.values(item.settings)
    return values.filter((value): value is string => typeof value === 'string' && /(?:youtube|youtu\.be|vimeo|\.mp4|\.webm|\.mov)/i.test(value))
  })
  return [...new Set(urls)].map((sourceUrl) => ({ sourceUrl, status: 'unresolved' as const }))
}

const cleanText = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()

const hiddenClass = (node: BricksTreeNode) => {
  const hidden = node.settings._hidden
  return hidden && typeof hidden === 'object' && typeof (hidden as Record<string, unknown>)._cssClasses === 'string'
    ? (hidden as Record<string, string>)._cssClasses
    : ''
}

function faqFromNode(section: BricksTreeNode): NormalizedFaqCategory[] {
  const nodes = descendants(section)
  const titles = nodes.filter((node) => hiddenClass(node).includes('tab-title')).map((node) => ({
    sourceId: node.id,
    title: cleanText(nodes.find((child) => child.parent === node.id && child.name === 'text-basic')?.settings.text as string || textValue(node) || ''),
  })).filter((item) => item.title)
  const accordions = nodes.filter((node) => node.name === 'xproaccordion')
  const queries = nodes.filter((node) => node.settings.query).map((node) => node.settings.query as Record<string, unknown>)
  return titles.map((title, index) => {
    const accordion = accordions[index]
    const query = queries[index]
    return {
      sourceId: title.sourceId,
      title: title.title,
      query,
      questions: accordion ? [{
        sourceId: accordion.id,
        questionTemplate: '{post_title}',
        answerTemplate: '{post_content}',
      }] : [],
    }
  })
}

function testimonialsFromNode(section: BricksTreeNode): NormalizedTestimonial[] {
  const nodes = descendants(section)
  const titles = nodes.filter((node) => hiddenClass(node).includes('tab-title')).map((node) => {
    const child = nodes.find((candidate) => candidate.parent === node.id && candidate.name === 'text-basic')
    return { sourceId: node.id, title: cleanText(typeof child?.settings.text === 'string' ? child.settings.text : '') }
  }).filter((item) => item.title)
  const shortcodes = nodes.filter((node) => node.name === 'shortcode').map((node) => typeof node.settings.shortcode === 'string' ? node.settings.shortcode : undefined).filter((value): value is string => Boolean(value))
  return titles.map((title, index) => {
    const shortcode = shortcodes[index]
    const collectionId = shortcode?.match(/collection\s+id=["']([^"']+)/i)?.[1]
    return { sourceId: title.sourceId, provider: title.title.replace(/\s+rating$/i, ''), title: title.title, shortcode, collectionId }
  })
}

function galleryFromNode(section: BricksTreeNode): NormalizedGalleryItem[] {
  const nodes = descendants(section)
  const items: NormalizedGalleryItem[] = nodes.filter((node) => node.name === 'image').flatMap((node) => {
    const images = mediaFromNode(node)
    return images.map((image) => ({ sourceId: node.id, mediaId: image.sourceId, mediaType: 'image' as const, settings: node.settings }))
  })
  for (const node of nodes.filter((item) => item.name === 'image-gallery' || item.name === 'happyfiles-gallery')) {
    const settings = node.settings
    const dynamicSource = typeof (settings.items as Record<string, unknown> | undefined)?.useDynamicData === 'string'
      ? (settings.items as Record<string, string>).useDynamicData
      : undefined
    const galleryId = typeof (settings.ids as Record<string, unknown> | undefined)?.['0'] === 'string'
      ? (settings.ids as Record<string, string>)['0']
      : undefined
    items.push({ sourceId: node.id, dynamicSource, galleryId, mediaType: 'dynamic-gallery', settings })
  }
  return items
}

function mediaItemsFromNode(section: BricksTreeNode): NormalizedGalleryItem[] {
  const items = galleryFromNode(section)
  for (const node of descendants(section).filter((item) => item.name === 'video')) {
    const url = Object.values(node.settings).find((value): value is string => typeof value === 'string' && /(?:youtube|youtu\.be|vimeo|\.mp4|\.webm|\.mov)/i.test(value))
    if (url) items.push({ sourceId: node.id, mediaType: 'video', sourceUrl: url, settings: node.settings })
  }
  return items
}

function integrationsFromNode(section: BricksTreeNode): NormalizedIntegration[] {
  return descendants(section).filter((node) => node.name === 'shortcode' || node.name === 'xfluentform').flatMap((node) => {
    const shortcode = typeof node.settings.shortcode === 'string' ? node.settings.shortcode : undefined
    const match = shortcode?.match(/^\[\s*([\w-]+)([^\]]*)\]/)
    const provider = node.name === 'xfluentform' ? 'fluentform' : match?.[1] || 'shortcode'
    const id = shortcode?.match(/(?:id|selected_service|selected_agent)=["']?([\w-]+)/i)?.[1]
    return [{ sourceId: node.id, provider, shortcode, id, metadata: node.settings }]
  })
}

function listItemsFromNode(node: BricksTreeNode) {
  const items = node.settings.items
  if (!items || typeof items !== 'object') return []
  return Object.values(items as Record<string, unknown>)
    .map((item) => item && typeof item === 'object' ? (item as Record<string, unknown>).title : undefined)
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map(cleanText)
}

function repairCategories(section: BricksTreeNode): Array<{ sourceId: string; title: string; html: string; description?: string; features?: string[] }> {
  const container = section.children.find((node) => node.name === 'container')
  const groups = container?.children.filter((node) => {
    const nodes = descendants(node)
    return node.name === 'block' && nodes.some((child) => child.name === 'text-basic') && nodes.some((child) => child.name === 'image')
  }) || []
  const structured = groups.map((group) => {
    const nodes = descendants(group)
    const textNodes = nodes.filter((node) => node.name === 'text-basic')
    const title = cleanText(textNodes[0] ? textValue(textNodes[0]) || '' : '')
    const headingNode = nodes.find((node) => node.name === 'heading')
    const heading = cleanText(headingNode ? textValue(headingNode) || '' : '')
    const description = textNodes.slice(1).map((node) => cleanText(textValue(node) || '')).find((value) => value.length > 40)
    const features = nodes.filter((node) => node.name === 'list').flatMap(listItemsFromNode)
    return {
      sourceId: group.id,
      title,
      heading: heading || undefined,
      html: [description, features.length ? `<ul>${features.map((feature) => `<li>${feature}</li>`).join('')}</ul>` : ''].filter(Boolean).join('\n'),
      description: description || undefined,
      features: features.length ? features : undefined,
    }
  }).filter((category) => category.title && !/^repair & installation$/i.test(category.title))
  if (structured.length > 0) return structured

  const html = descendants(section).filter((node) => node.name === 'text' || node.name === 'text-basic' || node.name === 'code')
    .map((node) => node.name === 'code' && typeof node.settings.code === 'string' ? node.settings.code : textValue(node))
    .filter((value): value is string => Boolean(value)).join('\n')
  const matches = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)]
  const categories = matches.map((match, index) => {
    const start = match.index || 0
    const next = matches[index + 1]?.index ?? html.length
    const segment = html.slice(start, next).trim()
    const description = cleanText(segment.replace(match[0], '').replace(/<ul>[\s\S]*?<\/ul>/i, ''))
    const features = [...segment.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => cleanText(item[1])).filter(Boolean)
    return { sourceId: `${section.id}-repair-${index + 1}`, title: cleanText(match[1]), html: segment, description: description || undefined, features: features.length ? features : undefined }
  }).filter((category) => category.title && !/^why choose prime design/i.test(category.title))
  if (categories.length > 0) return categories
  return descendants(section).filter((node) => /heading|title/i.test(node.name)).map((node, index) => ({
    sourceId: `${section.id}-repair-${index + 1}`,
    title: cleanText(textValue(node) || ''),
    html: cleanText(textValue(node) || ''),
  })).filter((category) => category.title && !/^repair & installation$/i.test(category.title))
}

const utilityNames = new Set(['header', 'footer', 'nav-menu', 'menu'])
const supportedNames = new Set([
  'section', 'container', 'block', 'div', 'heading', 'text', 'text-basic', 'image', 'button', 'icon', 'icon-box', 'list',
  'video', 'image-gallery', 'happyfiles-gallery', 'xproaccordion', 'tabs-nested', 'slider-nested', 'carousel',
  'xbeforeafterimage', 'xfluentform', 'shortcode',
])

function classify(section: BricksTreeNode, allowHero: boolean, pageSlug: string): NormalizedSection['type'] {
  const names = descendants(section).map((node) => node.name)
  const text = descendants(section).map(textValue).filter((value): value is string => Boolean(value)).join(' ').replace(/<[^>]+>/g, ' ').toLowerCase()
  const heading = descendants(section).filter((node) => /heading|title/i.test(node.name)).map(textValue).filter((value): value is string => Boolean(value)).join(' ').replace(/<[^>]+>/g, ' ').toLowerCase()
  const imageCount = names.filter((name) => name === 'image').length
  const headingCount = names.filter((name) => /heading|title/i.test(name)).length

  const hiddenByCss = typeof section.settings._cssCustom === 'string' &&
    new RegExp(`#brxe-${section.id}\\s*\\{[^}]*display\\s*:\\s*none`, 'i').test(section.settings._cssCustom)
  if (section.settings._visibility === 'hidden' || section.settings._opacity === '0' || hiddenByCss) return 'utility'
  if (section.settings._position === 'absolute' || section.settings._position === 'fixed' || section.settings._position === 'sticky') return 'utility'
  if (pageSlug === 'comprehensive-home-repair-installation-services-in-silicon-valley' && (names.includes('code') || (names.includes('text') && text.includes('repair')))) return 'repair-services'
  if (heading.includes('find us')) return 'find-us'
  if (heading.includes('our happy') || heading.includes('happy customers') || (names.includes('tabs-nested') && names.includes('shortcode') && text.includes('rating'))) return 'testimonials'
  if (names.includes('xproaccordion') || (names.includes('tabs-nested') && text.includes('question'))) return 'faq'
  if (heading.includes('silicon valley') && heading.includes('luxury home contractor')) return 'luxury-cta'
  if ((heading.includes('experience the') && heading.includes('prime difference')) || heading.includes('why choose prime design')) return 'experience-difference'
  if (heading.includes('the prime difference')) return 'prime-difference'
  if (heading.includes('areas we service')) return 'service-areas'
  if (names.includes('shortcode') && !text.trim()) return 'booking'
  if (names.includes('xfluentform') || heading.includes('contact info') || heading.includes('get in touch')) return 'contact-form'
  if (heading.includes('witness the beauty') || heading.includes('enhancing your living space') || heading.includes('protecting') || heading.includes('elevating your outdoor living')) return 'image-text'
  if (names.some((name) => /beforeafter/i.test(name))) return 'before-after'
  if (names.some((name) => /carousel|slider/i.test(name))) return 'carousel'
  if (names.some((name) => /gallery/i.test(name))) return 'gallery'
  if (names.some((name) => name === 'video')) return 'video'
  const background = section.settings._background
  if (allowHero && (names.includes('hero') || (background && names.some((name) => /heading|text/i.test(name))))) return 'hero'
  if (imageCount >= 2 && headingCount >= 2 && (text.includes('choose') || text.includes('kitchen') || text.includes('bathroom') || text.includes('style') || text.includes('custom'))) return 'sub-services'
  if (names.some((name) => name === 'button') && names.some((name) => /heading|text/i.test(name))) return 'cta'
  if (names.some((name) => name === 'button')) return 'cta'
  if (names.some((name) => name === 'image') && names.some((name) => /heading|text/i.test(name))) return 'image-text'
  if (names.some((name) => /icon-box|list/i.test(name))) return 'content'
  if (names.some((name) => /testimonial|review/i.test(name))) return 'testimonial'
  if (names.some((name) => /heading|text/i.test(name))) return 'content'
  return 'unsupported'
}

function semanticClassification(section: BricksTreeNode, type: NormalizedSection['type']): {
  classification: NormalizedSection['classification']
  reason?: string
  required?: string
} {
  const nodes = descendants(section)
  const names = nodes.map((node) => node.name)
  const sticky = section.settings._position === 'absolute' || section.settings._position === 'fixed' || section.settings._position === 'sticky'

  if (type === 'utility' || sticky || names.some((name) => utilityNames.has(name))) {
    return { classification: 'utility' as const, reason: 'This root section is a sticky/navigation utility structure embedded in the Bricks export.', required: 'Preserve only if the landing-page shell explicitly owns this utility.' }
  }
  if (type === 'booking') {
    return { classification: 'partial' as const, reason: 'The section contains a shortcode-backed booking integration whose provider fields require runtime verification.', required: 'Verify the booking provider and preserve its configuration' }
  }
  if (type === 'unsupported') {
    return { classification: 'missing-schema' as const, reason: `No section normalizer matched Bricks elements: ${[...new Set(names)].join(', ')}.`, required: 'A dedicated Payload block and renderer' }
  }
  if (names.some((name) => ['tabs-nested', 'xproaccordion', 'slider-nested', 'carousel', 'xfluentform', 'shortcode'].includes(name))) {
    return { classification: 'partial' as const, reason: `The section is recognized, but contains third-party or nested Bricks elements: ${[...new Set(names.filter((name) => !supportedNames.has(name) || ['tabs-nested', 'xproaccordion', 'slider-nested', 'carousel', 'xfluentform', 'shortcode'].includes(name)))].join(', ')}.`, required: 'Verify nested data and renderer behavior before import' }
  }
  return { classification: 'supported' as const }
}

function sectionData(section: BricksTreeNode) {
  const nodes = sectionContentNodes(section)
  const headings = nodes.flatMap((node) => {
    const value = textValue(node)
    return value && /heading|title/i.test(node.name) ? [value] : []
  })
  const body = nodes.flatMap((node) => {
    const value = textValue(node)
    return value && /^(text|text-basic)$/i.test(node.name) ? [value] : []
  })
  const buttons = nodes.filter((node) => node.name === 'button').map((node) => ({
    label: settingString(node, ['text', 'label', '_text']) || '',
    href: settingString(node, ['link', 'url', '_link']) || undefined,
  }))
  return { heading: headings[0], headings, body, buttons }
}

export function normalizeBricksPage(page: WordPressPage, roots: BricksTreeNode[]): NormalizedSection[] {
  const sections: NormalizedSection[] = []
  let heroAssigned = false
  roots.filter((root) => root.name === 'section').forEach((section, index) => {
    const type = classify(section, !heroAssigned, page.slug)
    if (type === 'hero') heroAssigned = true
    const unsupportedElements = descendants(section)
      .filter((node) => !supportedNames.has(node.name))
      .map((node) => ({
        sourceElement: node.id,
        actualElement: node.name,
        classification: 'missing-schema' as const,
        reason: `Bricks element "${node.name}" has no normalization rule; its data was not silently discarded.`,
        required: `Add a normalizer/renderer for Bricks element "${node.name}"`,
      }))
    const images = mediaFromNode(section)
    const primaryImage = primaryImageFromNode(section)
    const videos = videoFromNode(section)
    const data = sectionData(section)
    const nestedData: Record<string, unknown> = {}
    if (type === 'faq') nestedData.faq = { categories: faqFromNode(section) }
    if (type === 'testimonials') nestedData.testimonials = testimonialsFromNode(section)
    if (type === 'gallery') nestedData.galleryItems = galleryFromNode(section)
    if (type === 'carousel') nestedData.mediaItems = mediaItemsFromNode(section)
    if (type === 'booking' || type === 'contact-form' || type === 'form') nestedData.integrations = integrationsFromNode(section)
    if (type === 'repair-services') nestedData.repairCategories = repairCategories(section)
    const semantic = semanticClassification(section, type)
    const sectionReason = unsupportedElements.length > 0
      ? `The section is recognized, but contains unnormalized Bricks elements: ${[...new Set(unsupportedElements.map((element) => element.actualElement))].join(', ')}.`
      : semantic.reason
    sections.push({
      type,
      order: index,
      sourceId: section.id,
      sourceElement: section.name,
      data: { ...data, ...nestedData, primaryImage, sourcePageSlug: page.slug, nestedElementIds: descendants(section).map((node) => node.id), sourceTree: section },
      images,
      videos,
      classification: unsupportedElements.length > 0 && semantic.classification === 'supported' ? 'partial' : semantic.classification,
      reason: sectionReason,
      required: semantic.required,
      unsupportedElements,
    })
  })
  return sections
}
