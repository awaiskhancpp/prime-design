import fs from 'node:fs/promises'
import { WordPressSource, WordPressPage, WordPressAttachment, XmlMeta } from './types'

const text = (xml: string, tag: string) => {
  const match = xml.match(new RegExp(`<(?:(?:wp|content):)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:(?:wp|content):)?${tag}>`, 'i'))
  return match ? decodeXml(match[1]) : ''
}

const decodeXml = (value: string) =>
  value
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code: string) =>
      String.fromCodePoint(code.toLowerCase().startsWith('x') ? parseInt(code.slice(1), 16) : Number(code)),
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
const numberOrUndefined = (value: string) => (value && Number.isFinite(Number(value)) ? Number(value) : undefined)

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
      } satisfies WordPressAttachment,
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
  for (const item of items(xml)) {
    const parsed = parseItem(item)
    if (parsed?.kind === 'page') pages.push(parsed.value)
    if (parsed?.kind === 'attachment') attachments.push(parsed.value)
  }
  return { pages, attachments, allItems: items(xml).length }
}

export async function parseWordPressXmlFile(path: string): Promise<WordPressSource> {
  return parseWordPressXml(await fs.readFile(path, 'utf8'))
}

