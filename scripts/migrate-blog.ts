import 'dotenv/config'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const xmlPath =
  process.argv[2] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-28.xml'
const uploadsPath = process.argv[3]

// ---------------------------------------------------------------------------
// Lightweight XML field/meta helpers — matches the regex-based approach
// already used in transform-wordpress-service-locations.ts. Blog posts are
// plain HTML content, not Bricks page-builder data, so the heavier
// wordpress-migration/xmlParser + bricksParser pipeline (built for pages)
// isn't needed here.
// ---------------------------------------------------------------------------

const field = (item: string, tag: string) =>
  item
    .match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1]
    .replace(/^<!\[CDATA\[|\]\]>$/g, '')
    .trim()

const metaValue = (item: string, key: string) => {
  const matches = [
    ...item.matchAll(
      /<wp:postmeta>[\s\S]*?<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>[\s\S]*?<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>[\s\S]*?<\/wp:postmeta>/g,
    ),
  ]
  return matches.find((match) => match[1] === key)?.[2]?.trim()
}

const categoriesOf = (item: string) =>
  [...item.matchAll(/<category domain="category"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g)].map(
    (match) => match[1].trim(),
  )

const formatSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

type WordPressBlogPost = {
  id: number
  title: string
  slug: string
  date: string
  content: string
  categories: string[]
  thumbnailId?: number
  excerptFromRankMath?: string
  sourceUrl?: string
}

function parseBlogPosts(xml: string): WordPressBlogPost[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap((match) => {
    const item = match[1]
    if (field(item, 'wp:post_type') !== 'post' || field(item, 'wp:status') !== 'publish') return []
    const title = field(item, 'title')
    const id = Number(field(item, 'wp:post_id'))
    const content = field(item, 'content:encoded') || ''
    if (!title || !id || !content) return []
    const thumb = metaValue(item, '_thumbnail_id')
    return [
      {
        id,
        title,
        // Derived from the title, not the raw WP slug — several posts have
        // auto-generated slugs like "3647-2" with no relation to the title.
        slug: formatSlug(title),
        date: field(item, 'wp:post_date') || new Date().toISOString(),
        content,
        categories: categoriesOf(item),
        thumbnailId: thumb ? Number(thumb) : undefined,
        excerptFromRankMath: metaValue(item, 'rank_math_description'),
        sourceUrl: field(item, 'link'),
      },
    ]
  })
}

// ---------------------------------------------------------------------------
// HTML → Lexical conversion, scoped to what these 5 posts actually contain:
// h1 (WordPress leaves an empty one — dropped), h2/h3 headings (with a
// leading empty `<a id="...">` anchor stripped), paragraphs (WordPress's
// wpautop leaves body text as blank-line-separated text with no <p> tags),
// bold/italic/links inline, and <ul>/<ol> lists. This is not a general HTML
// parser — if a future post uses tables, embeds, or other markup, extend
// this rather than assume it's covered.
// ---------------------------------------------------------------------------

type LexicalTextNode = {
  type: 'text'
  text: string
  format: number
  detail: number
  mode: string
  style: string
  version: number
}
type LexicalLinkNode = {
  type: 'link'
  version: number
  fields: { url: string; newTab: boolean; linkType: 'custom' }
  children: LexicalTextNode[]
}
type LexicalBlockNode = { type: string; version: number; [key: string]: unknown }

const BOLD = 1
const ITALIC = 2

function textNode(text: string, format = 0): LexicalTextNode {
  return { type: 'text', text, format, detail: 0, mode: 'normal', style: '', version: 1 }
}

/** Parse `<strong>/<b>`, `<em>/<i>`, and `<a href>` within one block's inner HTML. */
function parseInline(html: string): Array<LexicalTextNode | LexicalLinkNode> {
  const nodes: Array<LexicalTextNode | LexicalLinkNode> = []
  let remaining = html
  const tagPattern = /<(strong|b|em|i|a)(?:\s+href="([^"]*)")?[^>]*>([\s\S]*?)<\/\1>/i

  while (remaining.length) {
    const match = remaining.match(tagPattern)
    if (!match) {
      const plain = decodeEntities(remaining)
      if (plain) nodes.push(textNode(plain))
      break
    }
    const [full, tag, href, inner] = match
    const before = remaining.slice(0, match.index)
    if (before) {
      const plain = decodeEntities(before)
      if (plain) nodes.push(textNode(plain))
    }

    const lowerTag = tag.toLowerCase()
    if (lowerTag === 'a') {
      // Links can themselves contain bold/italic (seen in the real content),
      // so their children go through the same inline parser recursively.
      const children = parseInline(inner).filter(
        (node): node is LexicalTextNode => node.type === 'text',
      )
      nodes.push({
        type: 'link',
        version: 2,
        fields: { url: href || '#', newTab: false, linkType: 'custom' },
        children: children.length
          ? children
          : [textNode(decodeEntities(inner.replace(/<[^>]+>/g, '')))],
      })
    } else {
      const format = lowerTag === 'strong' || lowerTag === 'b' ? BOLD : ITALIC
      // Nested inline formatting (e.g. `<strong><em>...`) — merge formats
      // rather than recursing into a second pass, since these posts only
      // ever nest bold+italic together, not links inside bold/italic.
      const innerMatch = inner.match(/^<(strong|b|em|i)>([\s\S]*)<\/\1>$/i)
      if (innerMatch) {
        const nestedFormat = /strong|b/i.test(innerMatch[1]) ? BOLD : ITALIC
        nodes.push(
          textNode(decodeEntities(innerMatch[2].replace(/<[^>]+>/g, '')), format | nestedFormat),
        )
      } else {
        const plain = decodeEntities(inner.replace(/<[^>]+>/g, ''))
        if (plain) nodes.push(textNode(plain, format))
      }
    }
    remaining = remaining.slice(match.index! + full.length)
  }
  return nodes
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/\s+/g, ' ')
    .trim()
}

function paragraphNode(html: string): LexicalBlockNode | undefined {
  const children = parseInline(html)
  if (!children.length) return undefined
  return { type: 'paragraph', version: 1, format: '', indent: 0, direction: 'ltr', children }
}

function headingNode(tag: 'h2' | 'h3', html: string): LexicalBlockNode | undefined {
  // Real content has an empty `<a id="post-...">` anchor as the first child
  // of many h2s (used for in-page jump links on the old site) — not real
  // heading text.
  const withoutAnchor = html.replace(/<a[^>]*id="[^"]*"[^>]*>\s*<\/a>/gi, '')
  const children = parseInline(withoutAnchor)
  if (!children.length) return undefined
  return { type: 'heading', tag, version: 1, format: '', indent: 0, direction: 'ltr', children }
}

function listNode(ordered: boolean, itemsHtml: string[]): LexicalBlockNode | undefined {
  const items = itemsHtml
    .map((itemHtml) => {
      const children = parseInline(itemHtml)
      if (!children.length) return undefined
      return {
        type: 'listitem',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        children,
        value: 1,
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
  if (!items.length) return undefined
  return {
    type: 'list',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    listType: ordered ? 'number' : 'bullet',
    tag: ordered ? 'ol' : 'ul',
    start: 1,
    children: items,
  }
}

/**
 * Converts WordPress `content:encoded` HTML to a Lexical document. Returns
 * the intro text (everything before the first h2 — this site's own design
 * shows that in a larger lead paragraph) separately from the rest, which
 * becomes the free-form richText body.
 */
function convertToLexical(rawHtml: string): { intro: string; content: object } {
  // Strip the empty `<h1></h1>` WordPress always leaves at the top.
  const html = rawHtml.replace(/<h1>\s*<\/h1>/i, '').trim()
  const firstH2Index = html.search(/<h2[\s>]/i)
  const introHtml = firstH2Index >= 0 ? html.slice(0, firstH2Index) : html
  const bodyHtml = firstH2Index >= 0 ? html.slice(firstH2Index) : ''

  const introText = introHtml
    .split(/\n\s*\n/)
    .map((block) => decodeEntities(block.replace(/<[^>]+>/g, ' ')))
    .filter(Boolean)
    .join('\n\n')

  const blockNodes: LexicalBlockNode[] = []
  // Split on block-level tags we recognize; everything between them that
  // isn't itself a recognized tag is wpautop-style blank-line-separated
  // paragraph text.
  const blockPattern = /<h([23])[^>]*>([\s\S]*?)<\/h\1>|<(ul|ol)>([\s\S]*?)<\/\3>/gi
  let cursor = 0
  let match: RegExpExecArray | null
  const pushParagraphs = (segment: string) => {
    for (const block of segment.split(/\n\s*\n/)) {
      const trimmed = block.trim()
      if (!trimmed) continue
      const node = paragraphNode(trimmed)
      if (node) blockNodes.push(node)
    }
  }

  while ((match = blockPattern.exec(bodyHtml))) {
    pushParagraphs(bodyHtml.slice(cursor, match.index))
    if (match[1]) {
      const node = headingNode(`h${match[1]}` as 'h2' | 'h3', match[2])
      if (node) blockNodes.push(node)
    } else if (match[3]) {
      const items = [...match[4].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => li[1])
      const node = listNode(match[3].toLowerCase() === 'ol', items)
      if (node) blockNodes.push(node)
    }
    cursor = blockPattern.lastIndex
  }
  pushParagraphs(bodyHtml.slice(cursor))

  return {
    intro: introText,
    content: {
      root: {
        type: 'root',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        children: blockNodes.length ? blockNodes : [paragraphNode(' ')],
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Media resolution — same shape as the other migration scripts: check for an
// already-imported record first, then a local upload, then download.
// ---------------------------------------------------------------------------

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
    /* no local uploads dir provided — attachments fall through to fetch */
  }
  return result
}

async function main() {
  const xml = await readFile(xmlPath, 'utf8')
  const posts = parseBlogPosts(xml)
  const localFiles = await fileIndex(uploadsPath)

  const attachments = new Map<number, { title: string; url: string }>()
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const item = match[1]
    if (field(item, 'wp:post_type') !== 'attachment') continue
    const id = Number(field(item, 'wp:post_id'))
    const url = field(item, 'wp:attachment_url')
    if (id && url) attachments.set(id, { title: field(item, 'title') || '', url })
  }

  const payload = await getPayload({ config: configPromise })
  const categoryIds = new Map<string, number>()
  const report: Array<{ title: string; slug: string; status: string }> = []

  for (const post of posts) {
    // Categories: find-or-create by name, matching the upsert pattern used
    // for services/locations elsewhere in this migration.
    const categoryRelIds: number[] = []
    for (const name of post.categories) {
      if (!categoryIds.has(name)) {
        const existing = await payload.find({
          collection: 'blog-categories',
          where: { name: { equals: name } },
          limit: 1,
        })
        const record =
          existing.docs[0] ||
          (await payload.create({
            collection: 'blog-categories',
            data: { name, status: 'published' },
            draft: true,
          }))
        categoryIds.set(name, Number(record.id))
      }
      categoryRelIds.push(categoryIds.get(name)!)
    }

    // Featured image — required by the schema, so a post with no resolvable
    // thumbnail is reported and skipped rather than given a fake one.
    let featuredImageId: number | undefined
    if (post.thumbnailId) {
      const attachment = attachments.get(post.thumbnailId)
      if (attachment) {
        const filename = decodeURIComponent(new URL(attachment.url).pathname.split('/').pop() || '')
        const existingMedia = await payload.find({
          collection: 'media',
          where: { filename: { equals: filename } },
          limit: 1,
        })
        if (existingMedia.docs[0]) {
          featuredImageId = Number(existingMedia.docs[0].id)
        } else {
          const localPath = filename ? localFiles.get(filename.toLowerCase()) : undefined
          const data = localPath
            ? await readFile(localPath)
            : await fetch(attachment.url).then((response) => {
                if (!response.ok) throw new Error(`Download failed: ${response.status}`)
                return response.arrayBuffer().then(Buffer.from)
              })
          const created = await payload.create({
            collection: 'media',
            data: { alt: attachment.title || post.title },
            file: {
              data,
              mimetype: 'image/jpeg',
              name: filename || `${post.slug}.jpg`,
              size: data.length,
            },
          })
          featuredImageId = Number(created.id)
        }
      }
    }
    if (!featuredImageId) {
      report.push({
        title: post.title,
        slug: post.slug,
        status: 'SKIPPED — no featured image resolved',
      })
      continue
    }

    const { intro, content } = convertToLexical(post.content)
    const record = {
      title: post.title,
      slug: post.slug,
      wordpressId: post.id,
      sourceUrl: post.sourceUrl,
      status: 'published' as const,
      publishedDate: new Date(post.date).toISOString(),
      excerpt: post.excerptFromRankMath?.slice(0, 300),
      featuredImage: featuredImageId,
      categories: categoryRelIds,
      intro,
      content,
      seo: post.excerptFromRankMath ? { metaDescription: post.excerptFromRankMath } : undefined,
    }

    const existing = await payload.find({
      collection: 'blog',
      where: { wordpressId: { equals: post.id } },
      limit: 1,
    })
    if (existing.docs[0]) {
      await payload.update({ collection: 'blog', id: existing.docs[0].id, data: record as never })
    } else {
      await payload.create({ collection: 'blog', data: record as never })
    }
    report.push({ title: post.title, slug: post.slug, status: 'IMPORTED' })
  }

  console.table(report)
  await payload.destroy()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
