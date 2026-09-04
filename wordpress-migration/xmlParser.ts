import fs from 'node:fs/promises'
import {
  WordPressSource,
  WordPressPage,
  WordPressAttachment,
  WordPressFaq,
  WordPressProject,
  WordPressTestimonial,
  XmlMeta,
} from './types'

const text = (xml: string, tag: string) => {
  const match = xml.match(
    new RegExp(
      `<(?:(?:wp|content):)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:(?:wp|content):)?${tag}>`,
      'i',
    ),
  )
  return match ? decodeXml(match[1]) : ''
}

const decodeXml = (value: string) =>
  value
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code: string) =>
      String.fromCodePoint(
        code.toLowerCase().startsWith('x') ? parseInt(code.slice(1), 16) : Number(code),
      ),
    )
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")

const items = (xml: string) => xml.match(/<item\b[\s\S]*?<\/item>/gi) || []

const postMeta = (item: string): XmlMeta[] => {
  const result: XmlMeta[] = []
  for (const match of item.matchAll(/<wp:postmeta\b[\s\S]*?<\/wp:postmeta>/gi)) {
    const value = match[0]
    result.push({ key: text(value, 'meta_key'), value: text(value, 'meta_value') })
  }
  return result
}

const metaValue = (meta: XmlMeta[], key: string) => meta.find((item) => item.key === key)?.value
const numberOrUndefined = (value: string) =>
  value && Number.isFinite(Number(value)) ? Number(value) : undefined
const categoryValue = (item: string) => {
  const match = item.match(/<category[^>]*domain=["']faq-category["'][^>]*>([\s\S]*?)<\/category>/i)
  return match ? decodeXml(match[1]).trim() : undefined
}

// A gallery widget references a HappyFiles folder by its numeric term_id
// (e.g. settings.ids = { 0: "8" }). That id only maps to a slug via the
// top-level <wp:term> definitions in the WXR header, not per-item — so we
// build that registry once, then tag every attachment with the folder
// slug(s) it belongs to via its own <category domain="happyfiles_category">
// tags, which do carry the slug (as `nicename`) directly.
const happyfilesCategorySlugs = (item: string): string[] => {
  const slugs = new Set<string>()
  for (const match of item.matchAll(
    /<category[^>]*domain=["']happyfiles_category["'][^>]*nicename=["']([^"']+)["'][^>]*>/gi,
  )) {
    slugs.add(decodeXml(match[1]).trim())
  }
  return [...slugs]
}

const happyfilesFolderRegistry = (xml: string): Record<string, string> => {
  const result: Record<string, string> = {}
  for (const match of xml.matchAll(/<wp:term>[\s\S]*?<\/wp:term>/gi)) {
    const block = match[0]
    if (!/<wp:term_taxonomy><!\[CDATA\[happyfiles_category\]\]><\/wp:term_taxonomy>/i.test(block))
      continue
    const id = block.match(/<wp:term_id>(\d+)<\/wp:term_id>/)?.[1]
    const slug = block.match(/<wp:term_slug><!\[CDATA\[([^\]]*)\]\]><\/wp:term_slug>/)?.[1]
    if (id && slug) result[id] = slug
  }
  return result
}

const parseItem = (item: string) => {
  const meta = postMeta(item)
  const type = text(item, 'post_type')
  const id = numberOrUndefined(text(item, 'post_id')) || 0
  if (type === 'attachment') {
    const url = text(item, 'attachment_url') || metaValue(meta, '_bricks_image_origin_url')
    const filename = url ? decodeURIComponent(url.split('/').pop() || '') : undefined
    return {
      kind: 'attachment' as const,
      value: {
        id,
        slug: text(item, 'post_name'),
        title: text(item, 'title'),
        filename,
        url,
        mimeType: text(item, 'post_mime_type') || undefined,
        meta,
        happyfilesCategorySlugs: happyfilesCategorySlugs(item),
      } satisfies WordPressAttachment,
    }
  }

  if (type === 'faq') {
    return {
      kind: 'faq' as const,
      value: {
        id,
        title: text(item, 'title'),
        content: text(item, 'encoded'),
        category: categoryValue(item),
        status: text(item, 'status') || undefined,
        meta,
      } satisfies WordPressFaq,
    }
  }

  if (type === 'project') {
    return {
      kind: 'project' as const,
      value: {
        id,
        slug: text(item, 'post_name'),
        title: text(item, 'title'),
        thumbnailId: numberOrUndefined(metaValue(meta, '_thumbnail_id') || ''),
        meta,
      } satisfies WordPressProject,
    }
  }

  if (type === 'testimonial') {
    return {
      kind: 'testimonial' as const,
      value: {
        id,
        title: text(item, 'title'),
        content: text(item, 'encoded'),
        status: text(item, 'status') || undefined,
        meta,
      } satisfies WordPressTestimonial,
    }
  }

  if (type !== 'page') return undefined
  return {
    kind: 'page' as const,
    value: {
      id,
      slug: text(item, 'post_name'),
      title: text(item, 'title'),
      status: text(item, 'status') || undefined,
      parentId: numberOrUndefined(text(item, 'post_parent')),
      content: text(item, 'encoded'),
      excerpt: text(item, 'excerpt'),
      thumbnailId: numberOrUndefined(metaValue(meta, '_thumbnail_id') || ''),
      meta,
      bricksSerialized: metaValue(meta, '_bricks_page_content_2'),
    } satisfies WordPressPage,
  }
}

export function parseWordPressXml(xml: string): WordPressSource {
  const pages: WordPressPage[] = []
  const attachments: WordPressAttachment[] = []
  const faqs: WordPressFaq[] = []
  const projects: WordPressProject[] = []
  const testimonials: WordPressTestimonial[] = []
  for (const item of items(xml)) {
    const parsed = parseItem(item)
    if (parsed?.kind === 'page') pages.push(parsed.value)
    if (parsed?.kind === 'attachment') attachments.push(parsed.value)
    if (parsed?.kind === 'faq') faqs.push(parsed.value)
    if (parsed?.kind === 'project') projects.push(parsed.value)
    if (parsed?.kind === 'testimonial') testimonials.push(parsed.value)
  }
  return {
    pages,
    attachments,
    faqs,
    projects,
    testimonials,
    allItems: items(xml).length,
    happyfilesFolders: happyfilesFolderRegistry(xml),
  }
}

export async function parseWordPressXmlFile(path: string): Promise<WordPressSource> {
  return parseWordPressXml(await fs.readFile(path, 'utf8'))
}
